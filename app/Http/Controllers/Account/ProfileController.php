<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\UserActivityLog;
use App\Notifications\PasswordChangedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        return Inertia::render('Account/Profile', [
            'user' => $request->user(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,'.$request->user()->id],
        ]);

        $request->user()->update($data);

        try {
            UserActivityLog::log(
                (int) $request->user()->id,
                UserActivityLog::TYPE_PROFILE_UPDATED,
                'Updated account profile',
            );
        } catch (\Throwable $exception) {
            report($exception);
        }

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $user = $request->user();
        $currentSessionId = $request->session()->getId();
        $changedAt = now();

        $user->forceFill([
            'password' => Hash::make($data['password']),
            'remember_token' => Str::random(60),
        ])->save();

        try {
            UserActivityLog::log(
                (int) $user->id,
                UserActivityLog::TYPE_PASSWORD_CHANGED,
                'Changed account password',
                ['changed_at' => $changedAt->toIso8601String()],
                $request->ip(),
                $request->userAgent(),
            );
        } catch (\Throwable $exception) {
            report($exception);
        }

        try {
            $user->notify(new PasswordChangedNotification(
                $changedAt->toIso8601String(),
                $request->ip(),
            ));
        } catch (\Throwable $exception) {
            report($exception);
        }

        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->where('id', '!=', $currentSessionId)
                ->delete();
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')
            ->with('passwordChanged', true)
            ->with('status', 'Your password was changed successfully. Please sign in again.');
    }
}
