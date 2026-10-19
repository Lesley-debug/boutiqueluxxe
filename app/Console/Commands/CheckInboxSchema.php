<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
class CheckInboxSchema extends Command
{
    protected $signature='staff:check-inbox-schema';
    protected $description='Read-only check of existing notification and newsletter columns';
    public function handle(): int
    {
        $missing=[];
        foreach (['notifications'=>['id','type','notifiable_type','notifiable_id','data','read_at','created_at','updated_at'],'newsletter_subscribers'=>['id','email','unsubscribed_at','created_at','updated_at']] as $table=>$columns) {
            if (! Schema::hasTable($table)) { $missing[]=$table; continue; }
            foreach ($columns as $column) { if (! Schema::hasColumn($table,$column)) { $missing[]=$table.'.'.$column; } }
        }
        if ($missing) { $this->error('Missing existing schema: '.implode(', ',$missing)); $this->warn('No changes made. Review migration history; do not reset the database.'); return self::FAILURE; }
        $this->info('Notification/newsletter schema present. No database changes made.'); return self::SUCCESS;
    }
}
