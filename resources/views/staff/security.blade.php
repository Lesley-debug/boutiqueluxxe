<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <meta name="referrer" content="no-referrer">
    <title>Staff sign-in security | Boutique Luxxe</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}">
    <style>
        *{box-sizing:border-box}body{margin:0;background:#f7f5f0;color:#26251f;font:16px/1.55 system-ui,sans-serif}main{width:min(100% - 32px,600px);margin:40px auto;background:#fff;border:1px solid #e7e1d7;border-radius:16px;padding:clamp(20px,5vw,40px)}h1{font-size:1.65rem;line-height:1.2}h2{font-size:1.2rem}p{color:#57534a}label{display:block;margin:16px 0 6px;font-weight:600}input{width:100%;border:1px solid #aaa297;border-radius:8px;padding:12px;font:inherit}button,.button{display:inline-block;border:0;border-radius:8px;background:#29271f;color:#fff;padding:12px 18px;font:inherit;text-decoration:none;cursor:pointer;margin-top:18px;min-height:44px}.secondary{background:#f0ece4;color:#29271f}.error{padding:12px;background:#fff1f0;color:#9b1c13;border-radius:8px}.codes{font:15px/1.9 ui-monospace,monospace;overflow-wrap:anywhere;background:#f7f5f0;padding:16px;border-radius:8px;list-style:none}.key{display:block;overflow-wrap:anywhere;padding:12px;background:#f7f5f0;font:17px ui-monospace,monospace}img.qr{display:block;width:220px;max-width:100%;height:auto;margin:auto}details{border-top:1px solid #e7e1d7;margin-top:24px;padding-top:18px}summary{cursor:pointer;min-height:44px}a{color:#62502c}:focus-visible{outline:3px solid #a57d31;outline-offset:3px}
    </style>
</head>
<body><main>
    <p>BOUTIQUE LUXXE · STAFF</p>
    <h1>Secure your staff workspace</h1>
    @if ($errors->any())
        <div class="error" role="alert"><ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>
    @endif
    @if ($codes)
        <h2>Save your recovery codes now</h2>
        <p>Each code works once, together with your password. Store these somewhere private—not in chat or email. These codes will not be shown again on refresh.</p>
        <ul class="codes">@foreach ($codes as $code)<li>{{ $code }}</li>@endforeach</ul>
    @endif
    @if (! $enabled)
        <p>Two-factor authentication is required for every staff account. Use an authenticator app such as Google Authenticator, Microsoft Authenticator or 1Password.</p>
        @if ($secret)
            <h2>1. Add Boutique Luxxe to your authenticator</h2>
            <p>Scan this QR code with your authenticator app. Do not take or share a screenshot of this page.</p>
            <img class="qr" src="{{ $qr }}" alt="Private authenticator setup QR code">
            <p>Or choose “enter a setup key” in the app: account <strong>{{ auth('web')->user()->email }}</strong>, time-based, 6 digits, 30 seconds.</p>
            <code class="key">{{ $secret }}</code>
            <h2>2. Confirm setup</h2>
            <form method="post" action="{{ route('staff.security.complete') }}">
                @csrf
                <label for="password">Your current password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="1024">
                <label for="code">Six-digit app code</label><input id="code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required>
                <button type="submit">Enable two-factor authentication</button>
            </form>
            <form method="post" action="{{ route('staff.security.cancel') }}">@csrf<button class="secondary">Cancel this setup</button></form>
            <p>Setup expires after 10 minutes. Nothing is enabled until a valid app code is confirmed.</p>
        @else
            <form method="post" action="{{ route('staff.security.begin') }}">
                @csrf
                <label for="password">Your current password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="1024">
                <button type="submit">Set up authenticator app</button>
            </form>
        @endif
    @elseif (! $verified)
        <p>Verify this browser session before entering the staff workspace. Remembering your customer login does not skip this step.</p>
        <form method="post" action="{{ route('staff.security.challenge') }}">
            @csrf
            <label for="password">Your current password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="1024">
            <label for="code">Six-digit app code</label><input id="code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required>
            <button>Verify and enter workspace</button>
        </form>
        <details><summary>Use a recovery code instead</summary>
            <form method="post" action="{{ route('staff.security.challenge') }}">@csrf
                <label for="recovery-password">Your current password</label><input id="recovery-password" name="password" type="password" autocomplete="current-password" required maxlength="1024">
                <label for="recovery-code">Unused recovery code</label><input id="recovery-code" name="recovery_code" type="password" autocomplete="off" required maxlength="64" autocapitalize="none" spellcheck="false">
                <button>Use recovery code</button>
            </form>
        </details>
        <p>Codes cannot be reused. If you just completed setup or used an app code elsewhere, wait for the next app code. Five failed security attempts lock this account’s security forms for 15 minutes.</p>
    @else
        <p>Two-factor authentication is enabled and this session is verified. {{ $remaining }} unused recovery codes remain.</p>
        <a class="button" href="{{ url('/staff') }}">{{ $codes ? 'I saved my codes — enter workspace' : 'Return to staff workspace' }}</a>
        <details><summary>Replace recovery codes</summary>
            <p>This invalidates all old recovery codes and makes your other staff sessions verify again. You must enter your password and a fresh app code.</p>
            <form method="post" action="{{ route('staff.security.regenerate') }}">@csrf
                <label for="replace-password">Your current password</label><input id="replace-password" name="password" type="password" autocomplete="current-password" required maxlength="1024">
                <label for="replace-code">Fresh six-digit app code</label><input id="replace-code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required>
                <button>Replace all recovery codes</button>
            </form>
        </details>
    @endif
    <details><summary>Lost access or need help?</summary><p>Use an unused recovery code and your current password. If you have lost both the authenticator and recovery codes, contact the site operator for the audited server-console reset procedure. Password reset alone cannot turn off two-factor authentication. Staff cannot disable another account’s protection from the dashboard.</p></details>
    <form method="post" action="{{ route('logout') }}">@csrf<button class="secondary">Sign out</button></form>
</main></body>
</html>
