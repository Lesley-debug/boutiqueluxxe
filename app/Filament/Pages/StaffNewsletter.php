<?php
namespace App\Filament\Pages;
use App\Models\NewsletterSubscriber;
use App\Support\StaffWorkspaceAccess;
use BackedEnum;
use UnitEnum;
use Filament\Pages\Page;
use Livewire\WithPagination;
class StaffNewsletter extends Page
{
    use WithPagination;
    protected static ?string $slug='newsletter';
    protected static ?string $navigationLabel='Newsletter subscribers';
    protected static ?string $title='Newsletter subscribers';
    protected static string | UnitEnum | null $navigationGroup='Content';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-envelope';
    protected string $view='filament.pages.staff-newsletter';
    public string $status='subscribed';
    public string $search='';
    public static function canAccess(): bool { return StaffWorkspaceAccess::allows(auth('web')->user(),'products.manage'); }
    public function mount(): void { abort_unless(static::canAccess(),403); }
    public function hydrate(): void { abort_unless(static::canAccess(),403); }
    public function updatedStatus(): void { $this->resetPage('subscribersPage'); }
    public function updatedSearch(): void { $this->resetPage('subscribersPage'); }
    protected function getViewData(): array
    {
        abort_unless(static::canAccess(),403); abort_unless(in_array($this->status,['subscribed','unsubscribed','all'],true),422);
        $q=NewsletterSubscriber::query();
        if ($this->status==='subscribed') { $q->whereNull('unsubscribed_at'); } elseif ($this->status==='unsubscribed') { $q->whereNotNull('unsubscribed_at'); }
        if ($this->search!=='') { $q->where('email','like','%'.mb_substr($this->search,0,120).'%'); }
        $subscribers=$q->orderByDesc('id')->paginate(20,['id','email','created_at','unsubscribed_at'],'subscribersPage');
        $subscribedCount=NewsletterSubscriber::whereNull('unsubscribed_at')->count(); $unsubscribedCount=NewsletterSubscriber::whereNotNull('unsubscribed_at')->count();
        return compact('subscribers','subscribedCount','unsubscribedCount');
    }
}
