<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Filament\Pages\StaffNotifications;
use App\Services\StaffInbox;
use Illuminate\Http\Request;
use Inertia\Inertia;
class NotificationController extends Controller
{
    public function index(Request $request) { abort_unless(StaffNotifications::canAccess(),403); $url=StaffNotifications::getUrl(panel:'staff'); return $request->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function markAsRead(Request $request,string $id) { app(StaffInbox::class)->query($request->user())->whereKey($id)->firstOrFail(); return $this->index($request); }
    public function markAllAsRead(Request $request) { return $this->index($request); }
}
