<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        $this->ensureConfigured();
        $state = Str::random(40);
        $request->session()->put('google_oauth_state', $state);
        $redirectUri = config('services.google.redirect') ?: route('google.callback');

        $query = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'prompt' => 'select_account',
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?'.$query);
    }

    public function callback(Request $request, CartService $cartService): RedirectResponse
    {
        $this->ensureConfigured();
        $expectedState = (string) $request->session()->pull('google_oauth_state');
        $receivedState = (string) $request->query('state');

        abort_unless($expectedState !== '' && hash_equals($expectedState, $receivedState), 419);

        if ($request->filled('error') || ! $request->filled('code')) {
            return redirect('/login')->withErrors(['email' => 'Google sign-in was cancelled.']);
        }

        try {
            $redirectUri = config('services.google.redirect') ?: route('google.callback');
            $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'redirect_uri' => $redirectUri,
                'grant_type' => 'authorization_code',
                'code' => $request->string('code')->toString(),
            ])->throw()->json();

            $profile = Http::withToken($tokenResponse['access_token'])
                ->get('https://openidconnect.googleapis.com/v1/userinfo')
                ->throw()
                ->json();
        } catch (Throwable $exception) {
            report($exception);
            return redirect('/login')->withErrors(['email' => 'Google sign-in could not be completed. Please try again.']);
        }

        if (empty($profile['email']) || empty($profile['email_verified'])) {
            throw ValidationException::withMessages(['email' => 'Google did not provide a verified email address.']);
        }

        $user = User::firstOrCreate(
            ['email' => strtolower($profile['email'])],
            ['name' => $profile['name'] ?? $profile['email'], 'password' => Str::random(48)],
        );

        if (! $user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $guestSessionId = $request->session()->getId();

        Auth::login($user, true);
        $request->session()->regenerate();

        try {
            $cartService->mergeGuestCartIntoUser($guestSessionId, $user->id);
        } catch (Throwable $exception) {
            report($exception);
        }

        return redirect()->intended('/');
    }

    private function ensureConfigured(): void
    {
        abort_unless(
            config('services.google.client_id') && config('services.google.client_secret'),
            503,
            'Google sign-in is not configured yet.',
        );
    }
}
