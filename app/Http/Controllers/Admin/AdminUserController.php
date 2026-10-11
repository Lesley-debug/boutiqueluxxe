<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Filament\Resources\Team\StaffUserResource;
use App\Models\User;
use App\Support\StaffTeamAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;
class AdminUserController extends Controller
{
    public function index(Request $request) { StaffTeamAccess::authorize($request->user()); $url=StaffUserResource::getUrl('index',panel:'staff'); return $request->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function updateRole(Request $request,User $user) { StaffTeamAccess::authorize($request->user()); abort_unless(in_array($user->role,StaffTeamAccess::ROLES,true),403); return $this->index($request); }
}
