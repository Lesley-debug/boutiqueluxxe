<?php
namespace App\Console\Commands;
use App\Services\StaffContentEditor;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
class CheckContentSchema extends Command
{
    protected $signature='content:check-schema';
    protected $description='Read-only content editor prerequisites; no migrations or data changes';
    public function handle(): int
    {
        $bad=false;
        foreach (StaffContentEditor::COLUMNS as $class=>$columns) {
            $table=(new $class)->getTable();
            if (! Schema::hasTable($table)) { $this->error('Missing content table: '.$table); $bad=true; continue; }
            foreach ($columns as $column) { if (! Schema::hasColumn($table,$column)) { $this->error('Missing content column: '.$table.'.'.$column); $bad=true; } }
        }
        if (! class_exists(\DOMDocument::class)) { $this->error('PHP DOM extension is required for journal sanitization.'); $bad=true; }
        if ($bad) { $this->warn('Stop. Review migration status and backups; do not reset or migrate:fresh.'); return self::FAILURE; }
        $this->info('Content schema and DOM prerequisites are present. No database changes made.'); return self::SUCCESS;
    }
}
