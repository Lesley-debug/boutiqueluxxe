<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>Your Boutique Luxxe password was changed</title>
</head>
<body style="margin:0;padding:0;background:#f3eee5;font-family:Arial,Helvetica,sans-serif;color:#171310;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f3eee5;">
    <tr><td align="center" style="padding:30px 14px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;background:#ffffff;border:1px solid #dfd4c2;border-radius:24px;overflow:hidden;box-shadow:0 20px 55px rgba(23,19,16,.12);">
            <tr><td align="center" style="background:#171310;padding:34px 24px 30px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:7px;color:#ffffff;text-transform:uppercase;">Boutique Luxxe</div>
                <div style="width:54px;height:2px;background:#b58a43;margin:19px auto 0;"></div>
            </td></tr>
            <tr><td style="padding:44px 38px 38px;">
                <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9b7435;font-weight:700;">Security notice</div>
                <h1 style="margin:13px 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.2;font-weight:500;">Your password was changed</h1>
                <p style="margin:0 0 14px;font-size:16px;line-height:1.75;color:#514c46;">Hello {{ $user->name ?: 'there' }},</p>
                <p style="margin:0;font-size:16px;line-height:1.75;color:#514c46;">The password for your Boutique Luxxe account was changed successfully. For your protection, you have been signed out and must sign in again with the new password.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;background:#f8f5ef;border:1px solid #e7dfd1;border-radius:16px;">
                    <tr><td style="padding:18px 20px;font-size:13px;line-height:1.7;color:#6f6961;">
                        <strong style="color:#171310;">Changed:</strong> {{ \Carbon\Carbon::parse($changedAt)->format('M j, Y \a\t g:i A T') }}<br>
                        @if($ipAddress)<strong style="color:#171310;">IP address:</strong> {{ $ipAddress }}@endif
                    </td></tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
                    <tr><td align="center"><a href="{{ route('login') }}" style="display:inline-block;background:#b58a43;color:#ffffff !important;text-decoration:none;border-radius:999px;padding:17px 34px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Sign in securely</a></td></tr>
                </table>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#514c46;">If you did not make this change, reset your password immediately and contact <a href="mailto:info@boutiqueluxxe.com" style="color:#9b7435;">info@boutiqueluxxe.com</a>.</p>
            </td></tr>
            <tr><td align="center" style="padding:24px;background:#faf8f4;border-top:1px solid #eee7dc;font-size:11px;color:#8a837a;">Boutique Luxxe account security</td></tr>
        </table>
    </td></tr>
</table>
</body>
</html>
