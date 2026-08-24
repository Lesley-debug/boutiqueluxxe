<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::orderBy('name')->get(['id', 'name', 'email', 'is_admin', 'role']),
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['role' => 'You cannot change your own role.']);
        }

        $data = $request->validate([
            'role' => ['nullable', 'in:super_admin,manager,support_staff'],
        ]);

        $user->update([
            'role' => $data['role'],
            'is_admin' => $data['role'] !== null,
        ]);

        return back()->with('success', 'Role updated.');
    }
}
