<?php
namespace App\Console\Commands;
use App\Models\ContactEvent;
use App\Services\ContactDelivery;
use Illuminate\Console\Command;
class SendPendingContactMessages extends Command
{
    protected $signature = 'contacts:send-pending {--limit=25}';
    protected $description = 'Submit pending contact notifications/replies; never retry failed or interrupted attempts automatically';
    public function handle(ContactDelivery $delivery): int
    {
        $ids=ContactEvent::where('email_status','pending')->oldest('id')->limit(max(1,min(100,(int)$this->option('limit'))))->pluck('id');
        foreach ($ids as $id) { try { $delivery->send((int)$id); } catch (\Throwable $e) { report($e); $this->warn('A contact submission needs staff review.'); } }
        return self::SUCCESS;
    }
}
