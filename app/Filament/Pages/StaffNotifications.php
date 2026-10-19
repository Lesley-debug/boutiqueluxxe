<?php
namespace App\Filament\Pages;
use App\Services\StaffInbox;
use App\Support\StaffWorkspaceAccess;
use BackedEnum;
use UnitEnum;
use Filament\Pages\Page;
use Filament\Notifications\Notification;
use Livewire\WithPagination;
class StaffNotifications extends Page
{
    use WithPagination;
    protected static ?string $slug='notifications';
    protected static ?string $navigationLabel='My notifications';
    protected static ?string $title='My notifications';
    protected static string | UnitEnum | null $navigationGroup='Administration';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-bell';
    protected string $view='filament.pages.staff-notifications';
    public string $status='unread';
    public static function canAccess(): bool { return StaffWorkspaceAccess::allows(auth('web')->user(),'notifications.view'); }
    public function mount(): void { abort_unless(static::canAccess(),403); }
    public function hydrate(): void { abort_unless(static::canAccess(),403); }
    public function updatedStatus(): void { $this->resetPage('notificationsPage'); }
    public function markRead(string $id): void { $changed=app(StaffInbox::class)->markRead(auth('web')->user(),$id); Notification::make()->title($changed?'Notification marked read':'Notification was already read')->success()->send(); }
    protected function getViewData(): array
    {
        abort_unless(static::canAccess(),403); abort_unless(in_array($this->status,['unread','read','all'],true),422);
        $inbox=app(StaffInbox::class); $actor=auth('web')->user(); $q=$inbox->query($actor);
        if ($this->status==='unread') { $q->whereNull('read_at'); } elseif ($this->status==='read') { $q->whereNotNull('read_at'); }
        $notifications=$q->orderByDesc('created_at')->orderByDesc('id')->paginate(15,['*'],'notificationsPage');
        $cards=$notifications->getCollection()->mapWithKeys(fn ($n)=>[$n->id=>$inbox->presentation($actor,$n)])->all();
        $unreadCount=$inbox->query($actor)->whereNull('read_at')->count(); return compact('notifications','cards','unreadCount');
    }
}
