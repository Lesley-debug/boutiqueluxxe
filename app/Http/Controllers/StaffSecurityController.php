<?php

namespace App\Http\Controllers;

use App\Services\StaffMfa;
use Filament\Facades\Filament;
use Illuminate\Http\Request;

final class StaffSecurityController extends Controller
{
    public function show(Request $request, StaffMfa $mfa)
    {
        $user = $mfa->current($request);
        $enabled = (bool) $user->getAppAuthenticationSecret();
        $secret = $enabled ? null : $mfa->pending($request, $user);
        $qr = null;
        if ($secret) {
            Filament::setCurrentPanel('staff');
            $qr = $mfa->provider()->generateQrCodeDataUri($secret);
        }
        return response()->view('staff.security', [
            'enabled' => $enabled, 'verified' => $mfa->passed($request, $user),
            'secret' => $secret, 'qr' => $qr, 'codes' => $mfa->takeCodes($request, $user),
            'remaining' => count($user->getAppAuthenticationRecoveryCodes() ?? []),
        ])->header('Referrer-Policy', 'no-referrer');
    }

    public function begin(Request $request, StaffMfa $mfa)
    {
        $v = $request->validate(['password' => ['required', 'string', 'max:1024']]);
        $mfa->begin($request, $v['password']);
        return redirect()->route('staff.security.show');
    }

    public function complete(Request $request, StaffMfa $mfa)
    {
        $v = $request->validate([
            'password' => ['required', 'string', 'max:1024'],
            'code' => ['required', 'string', 'regex:/\A[0-9]{6}\z/'],
        ]);
        $mfa->complete($request, $v['password'], $v['code']);
        return redirect()->route('staff.security.show');
    }

    public function challenge(Request $request, StaffMfa $mfa)
    {
        $v = $this->credentials($request);
        $mfa->challenge($request, $v['password'], $v['code'] ?? null, $v['recovery_code'] ?? null);
        return redirect('/staff');
    }

    public function regenerate(Request $request, StaffMfa $mfa)
    {
        $v = $this->credentials($request);
        $mfa->challenge($request, $v['password'], $v['code'] ?? null, $v['recovery_code'] ?? null, true);
        return redirect()->route('staff.security.show');
    }

    public function cancel(Request $request, StaffMfa $mfa)
    {
        $mfa->current($request);
        $request->session()->forget(StaffMfa::PENDING);
        return redirect()->route('staff.security.show');
    }

    private function credentials(Request $request): array
    {
        return $request->validate([
            'password' => ['required', 'string', 'max:1024'],
            'code' => ['nullable', 'required_without:recovery_code', 'prohibits:recovery_code', 'string', 'regex:/\A[0-9]{6}\z/'],
            'recovery_code' => ['nullable', 'required_without:code', 'prohibits:code', 'string', 'max:64'],
        ]);
    }
}
