<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
class CheckStaffPrerequisites extends Command
{
    protected $signature='staff:check-prerequisites';
    protected $description='Read-only check of staff access/audit and database session prerequisites';
    public function handle(): int
    {
        $missing=[];
        foreach (['users'=>['id','name','email','role','is_admin','email_verified_at','remember_token','updated_at'],'user_activity_logs'=>['id','user_id','activity_type','description','metadata','ip_address','user_agent','created_at','updated_at'],config('session.table','sessions')=>['id','user_id','payload','last_activity']] as $table=>$columns) {
            if (! Schema::hasTable($table)) { $missing[]='Missing table: '.$table; continue; }
            foreach ($columns as $column) { if (! Schema::hasColumn($table,$column)) { $missing[]='Missing column: '.$table.'.'.$column; } }
        }
        if (config('session.driver')!=='database' || (config('session.connection') ?: config('database.default'))!==config('database.default')) { $missing[]='Database sessions must use the application database for atomic revocation.'; }
        if ($missing) { foreach ($missing as $error) { $this->error($error); } $this->warn('No changes made. Review configuration/schema; do not reset or blindly migrate.'); return self::FAILURE; }
        $this->info('Staff/audit/database-session prerequisites present. No database changes made.'); return self::SUCCESS;
    }
}
