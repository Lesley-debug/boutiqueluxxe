<?php

namespace App\Console\Commands;

use App\Models\OrderWorkflowEvent;
use App\Services\OrderUpdateDelivery;
use Illuminate\Console\Command;

class SendPendingOrderUpdates extends Command
{
    protected $signature = 'orders:send-pending-updates {--limit=25 : Maximum pending notices to inspect}';
    protected $description = 'Submit pending order notices; never automatically retry failed or interrupted sends';

    public function handle(OrderUpdateDelivery $delivery): int
    {
        $events = OrderWorkflowEvent::where('email_status', 'pending')->orderBy('id')->limit(max(1, min(100, (int) $this->option('limit'))))->get();
        foreach ($events as $event) {
            try { $delivery->send($event->id); }
            catch (\Throwable $exception) { report($exception); $this->warn('One notice needs staff review.'); }
        }
        $this->info('Pending notices inspected. Check order history for mail submission results.');
        return self::SUCCESS;
    }
}
