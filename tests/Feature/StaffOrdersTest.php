<?php

namespace Tests\Feature;

use App\Filament\Resources\Orders\OrderResource;
use App\Filament\Resources\Orders\Pages\ViewOrder;
use App\Mail\OrderPaymentRecordedMail;
use App\Mail\OrderStatusUpdatedMail;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderWorkflowEvent;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\OrderUpdateDelivery;
use App\Services\StaffOrderWorkflow;
use Filament\Facades\Filament;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use RuntimeException;
use Tests\TestCase;

class StaffOrdersTest extends TestCase
{
    use RefreshDatabase;

    private User $staff;
    private ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'auth_features.email_verification_required' => true,
            // Laravel 13's test transaction manager can run after-commit callbacks
            // when the workflow transaction completes. Hold automatic submission
            // in queue-state tests; explicit send/drain calls test delivery itself.
            'orders.auto_submit_updates' => false,
        ]);
        Mail::fake();
        $this->staff = User::factory()->create(['is_admin' => true, 'role' => 'manager']);
        $category = Category::create(['name' => 'Bags', 'slug' => 'bags', 'status' => 'active']);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Bag', 'slug' => 'bag', 'base_price' => 100, 'status' => 'active']);
        $this->variant = ProductVariant::create(['product_id' => $product->id, 'sku' => 'ORDER-SKU', 'stock_quantity' => 6]);
        Filament::setCurrentPanel(Filament::getPanel('staff'));
    }

    private function order(array $overrides = []): Order
    {
        $order = Order::create(array_replace([
            'status' => 'pending', 'payment_status' => 'pending', 'fulfillment_method' => 'delivery',
            'customer_name' => 'Test Customer', 'customer_email' => 'customer@example.test',
            'shipping_address' => 'Test street', 'city' => 'Douala', 'subtotal' => 200, 'shipping_cost' => 0, 'total' => 200,
        ], $overrides));
        // Six units remain after two units were reserved by checkout.
        $order->items()->create(['product_variant_id' => $this->variant->id, 'product_name' => 'Bag at checkout', 'sku' => $this->variant->sku, 'quantity' => 2, 'unit_price' => 100, 'line_total' => 200]);
        return $order;
    }

    private function invalid(callable $action): ValidationException
    {
        try { $action(); } catch (ValidationException $exception) { return $exception; }
        $this->fail('Expected validation failure.');
    }

    public function test_order_list_and_read_only_detail_render_for_manager_and_support(): void
    {
        $order = $this->order();
        $this->assertContains(OrderResource::class, Filament::getPanel('staff')->getResources());
        foreach (['manager', 'support_staff', 'super_admin'] as $role) {
            $actor = User::factory()->create(['is_admin' => true, 'role' => $role]);
            $this->actingAs($actor)->get('/staff/orders')->assertOk()->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
            $this->get('/staff/orders/'.$order->id)->assertOk()->assertSee('Bag at checkout')->assertSee('Customer &amp; delivery', false);
        }
        $this->assertFalse(OrderResource::canCreate());
        $this->assertFalse(Gate::forUser($this->staff)->allows('delete', $order));
        $this->assertArrayNotHasKey('edit', OrderResource::getPages());
    }

    public function test_customer_and_demoted_staff_cannot_access_or_mutate_orders(): void
    {
        $order = $this->order(); $customer = User::factory()->create();
        $this->actingAs($customer)->get('/staff/orders')->assertForbidden();
        $old = clone $this->staff; $this->staff->update(['is_admin' => false]);
        $this->assertFalse(Gate::forUser($old)->allows('update', $order));
        $this->expectException(AuthorizationException::class);
        app(StaffOrderWorkflow::class)->changeStatus($old, $order, 'cancelled', 'pending', 'Cancel');
    }

    public function test_delivery_progress_requires_forward_transitions(): void
    {
        $order = $this->order(); $workflow = app(StaffOrderWorkflow::class);
        $this->invalid(fn () => $workflow->changeStatus($this->staff, $order, 'delivered', 'pending'));
        $workflow->changeStatus($this->staff, $order, 'processing', 'pending');
        $workflow->changeStatus($this->staff, $order, 'shipped', 'processing');
        $workflow->changeStatus($this->staff, $order, 'delivered', 'shipped');
        $this->assertSame('delivered', $order->fresh()->status);
        $this->assertDatabaseCount('order_workflow_events', 3);
        $this->assertSame(6, $this->variant->fresh()->stock_quantity);
    }

    public function test_pickup_is_collected_without_a_shipping_step(): void
    {
        $order = $this->order(['fulfillment_method' => 'pickup']); $workflow = app(StaffOrderWorkflow::class);
        $workflow->changeStatus($this->staff, $order, 'processing', 'pending');
        $this->invalid(fn () => $workflow->changeStatus($this->staff, $order, 'shipped', 'processing'));
        $workflow->changeStatus($this->staff, $order, 'delivered', 'processing');
        $this->assertSame('delivered', $order->fresh()->status);
    }

    public function test_cancellation_restores_reserved_stock_once_and_preserves_snapshots(): void
    {
        $order = $this->order(); $workflow = app(StaffOrderWorkflow::class);
        $event = $workflow->changeStatus($this->staff, $order, 'cancelled', 'pending', 'Customer cancelled');
        $this->assertSame(8, $this->variant->fresh()->stock_quantity);
        $this->assertNotNull($order->fresh()->stock_released_at);
        $this->assertSame(2, $event->metadata['restored_units']);
        $this->assertNull($workflow->changeStatus($this->staff, $order, 'cancelled', 'pending', 'Repeat click'));
        $this->assertSame(8, $this->variant->fresh()->stock_quantity);
        $this->assertDatabaseCount('order_workflow_events', 1);
        $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'product_name' => 'Bag at checkout', 'quantity' => 2]);
    }

    public function test_legacy_cancelled_order_is_not_restocked_or_reopened(): void
    {
        $order = $this->order(['status' => 'cancelled']); $workflow = app(StaffOrderWorkflow::class);
        $this->assertNull($workflow->changeStatus($this->staff, $order, 'cancelled', 'cancelled', 'Legacy'));
        $this->invalid(fn () => $workflow->changeStatus($this->staff, $order, 'processing', 'cancelled'));
        $this->assertSame(6, $this->variant->fresh()->stock_quantity);
        $this->assertDatabaseCount('order_workflow_events', 0);
    }

    public function test_paid_shipped_and_delivered_orders_cannot_be_cancelled_here(): void
    {
        foreach ([['payment_status' => 'paid'], ['status' => 'shipped'], ['status' => 'delivered']] as $values) {
            $order = $this->order($values);
            $this->invalid(fn () => app(StaffOrderWorkflow::class)->changeStatus($this->staff, $order, 'cancelled', $order->status, 'Cancel'));
            $this->assertNull($order->fresh()->stock_released_at);
        }
        $this->assertSame(6, $this->variant->fresh()->stock_quantity);
    }

    public function test_stale_status_action_rolls_back_without_inventory_changes(): void
    {
        $order = $this->order(); $workflow = app(StaffOrderWorkflow::class);
        $workflow->changeStatus($this->staff, $order, 'processing', 'pending');
        $this->invalid(fn () => $workflow->changeStatus($this->staff, $order, 'cancelled', 'pending', 'Stale cancellation'));
        $this->assertSame('processing', $order->fresh()->status);
        $this->assertSame(6, $this->variant->fresh()->stock_quantity);
        $this->assertDatabaseCount('order_workflow_events', 1);
    }

    public function test_missing_historical_variant_is_reported_without_inventing_inventory(): void
    {
        $order = $this->order(); $order->items()->update(['product_variant_id' => null]);
        $event = app(StaffOrderWorkflow::class)->changeStatus($this->staff, $order, 'cancelled', 'pending', 'Legacy missing variant');
        $this->assertCount(1, $event->metadata['missing_item_ids']);
        $this->assertSame(0, $event->metadata['restored_units']);
        $this->assertSame(6, $this->variant->fresh()->stock_quantity);
    }

    public function test_invalid_line_quantity_rolls_back_cancellation(): void
    {
        $order = $this->order(); $order->items()->update(['quantity' => 0]);
        $this->invalid(fn () => app(StaffOrderWorkflow::class)->changeStatus($this->staff, $order, 'cancelled', 'pending', 'Cancel'));
        $this->assertSame('pending', $order->fresh()->status);
        $this->assertSame(6, $this->variant->fresh()->stock_quantity);
        $this->assertDatabaseCount('order_workflow_events', 0);
    }

    public function test_manual_payment_change_is_audited_separate_from_progress_and_reference(): void
    {
        $order = $this->order(['payment_reference' => 'CUSTOMER-UNVERIFIED']); $workflow = app(StaffOrderWorkflow::class);
        $event = $workflow->recordPayment($this->staff, $order, 'paid', 'pending', 'Receipt checked with bank');
        $this->assertSame('paid', $order->fresh()->payment_status);
        $this->assertSame('pending', $order->fresh()->status);
        $this->assertSame('CUSTOMER-UNVERIFIED', $order->fresh()->payment_reference);
        $this->assertSame('payment', $event->kind);
        $this->assertNull($workflow->recordPayment($this->staff, $order, 'paid', 'pending', 'Repeat click'));
        $this->assertDatabaseCount('order_workflow_events', 1);
        $workflow->recordPayment($this->staff, $order, 'pending', 'paid', 'Correct mistaken receipt record');
        $this->assertSame('pending', $order->fresh()->payment_status);
    }

    public function test_stale_payment_and_cancelled_payment_changes_are_rejected(): void
    {
        $order = $this->order(['payment_status' => 'paid']);
        $this->invalid(fn () => app(StaffOrderWorkflow::class)->recordPayment($this->staff, $order, 'pending', 'pending', 'Correction'));
        $order->update(['status' => 'cancelled']);
        $this->invalid(fn () => app(StaffOrderWorkflow::class)->recordPayment($this->staff, $order, 'pending', 'paid', 'Correction'));
        $this->assertSame('paid', $order->fresh()->payment_status);
    }

    public function test_private_notes_are_audited_and_never_emailed(): void
    {
        $order = $this->order();
        $event = app(StaffOrderWorkflow::class)->addNote($this->staff, $order, 'PRIVATE-STAFF-ONLY');
        $this->assertSame('not_requested', $event->email_status);
        $this->assertArrayNotHasKey('note', $event->snapshot);
        $this->assertFalse(app(OrderUpdateDelivery::class)->send($event->id));
        Mail::assertNothingSent();
    }

    public function test_status_notice_uses_immutable_snapshot_and_cannot_be_sent_twice(): void
    {
        $order = $this->order();
        $event = app(StaffOrderWorkflow::class)->changeStatus($this->staff, $order, 'processing', 'pending', 'PRIVATE-STAFF-ONLY');
        $order->update(['status' => 'shipped']);
        $delivery = app(OrderUpdateDelivery::class);
        $this->assertTrue($delivery->send($event->id));
        $this->assertFalse($delivery->send($event->id));
        Mail::assertSent(OrderStatusUpdatedMail::class, function ($mail): bool {
            $this->assertSame('processing', $mail->order->status);
            $this->assertStringNotContainsString('PRIVATE-STAFF-ONLY', $mail->render());
            return true;
        });
        Mail::assertSent(OrderStatusUpdatedMail::class, 1);
        $this->assertSame('sent', $event->fresh()->email_status);
    }

    public function test_payment_notice_does_not_disclose_private_evidence(): void
    {
        $order = $this->order();
        $event = app(StaffOrderWorkflow::class)->recordPayment($this->staff, $order, 'paid', 'pending', 'PRIVATE-BANK-DETAILS');
        $this->assertTrue(app(OrderUpdateDelivery::class)->send($event->id));
        Mail::assertSent(OrderPaymentRecordedMail::class, function ($mail): bool {
            $this->assertSame('paid', $mail->order->payment_status);
            $this->assertStringNotContainsString('PRIVATE-BANK-DETAILS', $mail->render());
            return true;
        });
    }

    public function test_mail_failure_preserves_committed_order_and_records_attempt(): void
    {
        $order = $this->order();
        $event = app(StaffOrderWorkflow::class)->changeStatus($this->staff, $order, 'cancelled', 'pending', 'Cancel');
        Mail::swap(new class {
            public function to($address): object { return new class { public function send($mail): never { throw new RuntimeException('Simulated SMTP failure'); } }; }
        });
        $this->assertFalse(app(OrderUpdateDelivery::class)->send($event->id));
        $this->assertSame('failed', $event->fresh()->email_status);
        $this->assertSame(1, $event->fresh()->email_attempts);
        $this->assertSame('cancelled', $order->fresh()->status);
        $this->assertSame(8, $this->variant->fresh()->stock_quantity);
    }

    public function test_notices_are_submitted_in_order_and_older_failed_notice_cannot_follow_newer_sent(): void
    {
        $order = $this->order(); $workflow = app(StaffOrderWorkflow::class); $delivery = app(OrderUpdateDelivery::class);
        $first = $workflow->changeStatus($this->staff, $order, 'processing', 'pending');
        $second = $workflow->changeStatus($this->staff, $order, 'shipped', 'processing');
        $this->assertFalse($delivery->send($second->id));
        $delivery->drain($order->id);
        $this->assertSame('sent', $first->fresh()->email_status);
        $this->assertSame('sent', $second->fresh()->email_status);
        $first->update(['email_status' => 'failed']);
        $this->invalid(fn () => $delivery->retry($this->staff, $order, $first->id));
        Mail::assertSent(OrderStatusUpdatedMail::class, 2);
    }

    public function test_notice_retry_cannot_target_another_order(): void
    {
        $own = $this->order(); $other = $this->order();
        $event = app(StaffOrderWorkflow::class)->changeStatus($this->staff, $other, 'processing', 'pending');
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
        app(OrderUpdateDelivery::class)->retry($this->staff, $own, $event->id);
    }

    public function test_interrupted_send_requires_age_confirmation_and_audit_note(): void
    {
        $order = $this->order();
        $event = app(StaffOrderWorkflow::class)->changeStatus($this->staff, $order, 'processing', 'pending');
        $event->update(['email_status' => 'sending', 'email_claimed_at' => now()]);
        $delivery = app(OrderUpdateDelivery::class);
        $this->invalid(fn () => $delivery->recoverInterrupted($this->staff, $order, $event->id, 'Checked logs'));
        $event->update(['email_claimed_at' => now()->subMinutes(11)]);
        $delivery->recoverInterrupted($this->staff, $order, $event->id, 'Process stopped; checked logs');
        $this->assertSame('failed', $event->fresh()->email_status);
        $this->assertSame($this->staff->id, $event->fresh()->metadata['send_recovery']['actor_id']);
        Mail::assertNothingSent();
    }

    public function test_legacy_admin_links_handoff_and_old_mutations_do_not_bypass_workflow(): void
    {
        $order = $this->order(); $url = OrderResource::getUrl('view', ['record' => $order], panel: 'staff');
        $this->actingAs($this->staff)->get('/admin/orders/'.$order->id)->assertRedirect($url);
        $this->withHeader('X-Inertia', 'true')->get('/admin/orders/'.$order->id)->assertStatus(409)->assertHeader('X-Inertia-Location', $url);
        $this->patch('/admin/orders/'.$order->id.'/status', ['status' => 'cancelled'])->assertStatus(409)->assertHeader('X-Inertia-Location', $url);
        $this->patch('/admin/orders/'.$order->id.'/payment', ['payment_status' => 'paid'])->assertStatus(409);
        $this->assertSame('pending', $order->fresh()->status);
        $this->assertSame('pending', $order->fresh()->payment_status);
        $this->assertDatabaseCount('order_workflow_events', 0);
    }

    public function test_livewire_status_and_private_note_actions_use_the_workflow(): void
    {
        $order = $this->order(); $this->actingAs($this->staff);
        Livewire::test(ViewOrder::class, ['record' => $order->id])
            ->callAction('changeStatus', data: ['status' => 'processing', 'expected_status' => 'pending', 'note' => 'Confirmed with customer'])
            ->assertHasNoActionErrors();
        $this->assertSame('processing', $order->fresh()->status);
        Livewire::test(ViewOrder::class, ['record' => $order->id])
            ->callAction('addNote', data: ['note' => 'Private follow-up'])
            ->assertHasNoActionErrors();
        $this->assertDatabaseHas('order_workflow_events', ['order_id' => $order->id, 'kind' => 'note', 'note' => 'Private follow-up']);
    }

    public function test_pending_notice_command_sends_pending_but_does_not_retry_failed(): void
    {
        $order = $this->order(); $event = app(StaffOrderWorkflow::class)->changeStatus($this->staff, $order, 'processing', 'pending');
        $this->artisan('orders:send-pending-updates')->assertSuccessful();
        $this->assertSame('sent', $event->fresh()->email_status);
        $event->update(['email_status' => 'failed']);
        $this->artisan('orders:send-pending-updates')->assertSuccessful();
        Mail::assertSent(OrderStatusUpdatedMail::class, 1);
    }

    public function test_enabled_auto_submission_sends_after_workflow_commit_without_a_second_send(): void
    {
        config(['orders.auto_submit_updates' => true]);
        $order = $this->order();
        $event = app(StaffOrderWorkflow::class)->changeStatus($this->staff, $order, 'processing', 'pending');

        $this->assertSame('processing', $order->fresh()->status);
        $this->assertSame('sent', $event->fresh()->email_status);
        $this->assertFalse(app(OrderUpdateDelivery::class)->send($event->id));
        Mail::assertSent(OrderStatusUpdatedMail::class, 1);
    }

    public function test_legacy_order_handoff_survives_stale_inertia_asset_versions(): void
    {
        $order = $this->order();
        $this->actingAs($this->staff)
            ->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => 'deliberately-stale'])
            ->get('/admin/orders/'.$order->id)
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', OrderResource::getUrl('view', ['record' => $order], panel: 'staff'));

        $this->get('/admin/orders')
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', OrderResource::getUrl('index', panel: 'staff'));
        $this->assertDatabaseCount('order_workflow_events', 0);
        Mail::assertNothingSent();
    }
}
