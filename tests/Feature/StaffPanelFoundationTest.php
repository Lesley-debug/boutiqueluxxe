<?php

namespace Tests\Feature;

use App\Filament\Widgets\StaffQuickLinks;
use App\Http\Middleware\EnsureStaffPanelAccess;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\StaffDashboardSummary;
use App\Support\StaffPanelRequest;
use Filament\Facades\Filament;
use Filament\Panel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class StaffPanelFoundationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['auth_features.email_verification_required' => true]);
    }

    private function staff(string $role = 'manager'): User
    {
        return User::factory()->create(['is_admin' => true, 'role' => $role]);
    }

    public function test_staff_panel_is_registered_without_replacing_admin_routes(): void
    {
        $panel = Filament::getPanel('staff');
        $this->assertSame('staff', $panel->getPath());
        $this->assertSame('web', $panel->getAuthGuard());
        $this->assertSame(url('/admin'), route('admin.dashboard'));
        $this->assertContains(EnsureStaffPanelAccess::class, $panel->getAuthMiddleware());
        $this->assertTrue($panel->isAuthorizationStrict());
        $this->assertFalse($panel->hasRegistration());
    }

    public function test_guest_is_redirected_to_the_existing_login_flow(): void
    {
        $this->get('/staff')->assertRedirect(url('/staff/login'));
        $this->get('/staff/login')->assertRedirect(route('login'));
    }

    public function test_customers_cannot_access_staff_even_in_local_environment(): void
    {
        config(['app.env' => 'local', 'app.debug' => false]);
        $customer = User::factory()->create(['is_admin' => false, 'role' => null]);
        $this->assertFalse($customer->canAccessPanel(Filament::getPanel('staff')));
        $this->actingAs($customer)->get('/staff')->assertForbidden();
    }

    public function test_known_staff_roles_can_access_only_the_staff_panel(): void
    {
        foreach (['super_admin', 'manager', 'support_staff'] as $role) {
            $user = $this->staff($role);
            $this->assertTrue($user->canAccessPanel(Filament::getPanel('staff')));
            $this->assertFalse($user->canAccessPanel(Panel::make()->id('unexpected')));
        }
    }

    public function test_admin_flag_and_role_permissions_are_both_required(): void
    {
        $user = User::factory()->create(['is_admin' => false, 'role' => 'super_admin']);
        $this->assertFalse($user->canAccessStaffPanel());
        $user = User::factory()->create(['is_admin' => true, 'role' => 'unknown']);
        $this->assertFalse($user->canAccessStaffPanel());
    }

    public function test_staff_email_verification_respects_existing_feature_setting(): void
    {
        $user = User::factory()->unverified()->create(['is_admin' => true, 'role' => 'manager']);
        $this->assertFalse($user->canAccessStaffPanel());
        config(['auth_features.email_verification_required' => false]);
        $this->assertTrue($user->canAccessStaffPanel());
    }

    public function test_verified_staff_dashboard_is_html_private_and_not_indexable(): void
    {
        $this->withoutVite();
        $response = $this->actingAs($this->staff())->get('/staff');
        $response->assertOk()->assertSee('Store overview')->assertSee('Manage your store');
        $response->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        $this->assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));
        $this->assertFalse($response->headers->has('X-Inertia'));
        $response->assertDontSee('data-page="app"', false);
        $response->assertDontSee('smartsuppchat.com', false);
    }

    public function test_staff_errors_do_not_use_the_storefront_inertia_error_page(): void
    {
        config(['app.debug' => false]);
        $response = $this->actingAs(User::factory()->create(['is_admin' => false]))->get('/staff');
        $response->assertForbidden();
        $this->assertFalse($response->headers->has('X-Inertia'));
        $response->assertDontSee('data-page="app"', false);
        $response->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }

    public function test_livewire_hashed_routes_and_header_are_excluded_from_inertia(): void
    {
        foreach (['/staff', '/staff/login', '/livewire-a1b2/update', '/livewire/update'] as $path) {
            $this->assertTrue(StaffPanelRequest::matches(Request::create($path)));
        }
        $request = Request::create('/custom-update');
        $request->headers->set('X-Livewire', 'true');
        $this->assertTrue(StaffPanelRequest::matches($request));
        $this->assertFalse(StaffPanelRequest::matches(Request::create('/shop')));
    }

    public function test_summary_separates_unpaid_order_value_from_marked_paid_value(): void
    {
        $this->travelTo(now()->startOfMonth()->addDays(3));
        $this->order(['total' => '100.00', 'payment_status' => 'pending']);
        $this->order(['total' => '60.00', 'payment_status' => 'paid', 'status' => 'delivered']);
        $this->order(['total' => '500.00', 'payment_status' => 'paid', 'status' => 'cancelled']);
        $this->order(['total' => '900.00', 'payment_status' => 'paid', 'created_at' => now()->subMonth()]);
        $summary = app(StaffDashboardSummary::class)->forUser($this->staff());
        $this->assertSame(160.0, (float) $summary['order_value_this_month']);
        $this->assertSame(60.0, (float) $summary['marked_paid_order_value_this_month']);
        $this->assertSame(2, $summary['pending_orders']);
    }

    public function test_low_stock_only_counts_variants_of_active_products(): void
    {
        $category = Category::create(['name' => 'Bags', 'slug' => 'bags']);
        foreach (['active', 'draft', 'archived'] as $status) {
            $product = Product::create(['category_id' => $category->id, 'name' => $status, 'slug' => $status, 'base_price' => 100, 'status' => $status]);
            ProductVariant::create(['product_id' => $product->id, 'sku' => $status, 'stock_quantity' => 3]);
        }
        $summary = app(StaffDashboardSummary::class)->forUser($this->staff());
        $this->assertSame(1, $summary['low_stock_variants']);
    }

    public function test_support_staff_does_not_receive_inventory_counts_or_product_links(): void
    {
        $user = $this->staff('support_staff');
        $this->actingAs($user);
        $summary = app(StaffDashboardSummary::class)->forUser($user);
        $this->assertArrayNotHasKey('low_stock_variants', $summary);
        $labels = array_column(app(StaffQuickLinks::class)->links(), 'label');
        $this->assertContains('Orders', $labels);
        $this->assertNotContains('Products', $labels);
        $this->assertNotContains('Admin team', $labels);
    }

    public function test_demotion_is_checked_again_even_when_an_old_user_instance_is_passed(): void
    {
        $user = $this->staff();
        User::query()->whereKey($user->id)->update(['is_admin' => false]);
        $this->expectException(HttpException::class);
        app(StaffDashboardSummary::class)->forUser($user);
    }

    public function test_persistent_staff_middleware_rejects_a_demoted_user(): void
    {
        $user = $this->staff();
        $request = Request::create('/staff');
        $request->setUserResolver(fn () => $user);
        User::query()->whereKey($user->id)->update(['is_admin' => false]);
        $this->expectException(HttpException::class);
        app(EnsureStaffPanelAccess::class)->handle($request, fn () => response('must not reach'));
    }

    private function order(array $overrides = []): Order
    {
        return Order::forceCreate(array_merge([
            'order_number' => 'TEST-'.Str::upper(Str::random(12)),
            'customer_name' => 'Test Customer',
            'customer_email' => 'customer@example.test',
            'subtotal' => '100.00',
            'total' => '100.00',
            'status' => 'pending',
            'payment_status' => 'pending',
        ], $overrides));
    }
}
