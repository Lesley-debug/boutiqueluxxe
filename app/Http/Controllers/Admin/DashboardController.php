<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Filament\Pages\StaffDashboard;
use App\Support\StaffWorkspaceAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;
class DashboardController extends Controller
{
    public function index(Request $request) { abort_unless(StaffWorkspaceAccess::allows($request->user(),'dashboard.view'),403); $url=StaffDashboard::getUrl(panel:'staff'); return $request->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
}
