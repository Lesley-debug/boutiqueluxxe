<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Verify your Boutique Luxxe account</title>
</head>
<body style="margin:0;padding:0;background:#f3eee5;font-family:Arial,Helvetica,sans-serif;color:#171310;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f3eee5;margin:0;padding:0;">
    <tr>
        <td align="center" style="padding:30px 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;background:#ffffff;border:1px solid #dfd4c2;border-radius:24px;overflow:hidden;box-shadow:0 20px 55px rgba(23,19,16,.12);">
                <tr>
                    <td align="center" style="background:#171310;padding:34px 24px 30px;">
                        <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;letter-spacing:7px;color:#ffffff;text-transform:uppercase;">Boutique Luxxe</div>
                        <div style="width:54px;height:2px;background:#b58a43;margin:19px auto 0;"></div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:44px 38px 38px;">
                        <div style="font-size:11px;line-height:1.4;letter-spacing:3px;text-transform:uppercase;color:#9b7435;font-weight:700;">Account security</div>
                        <h1 style="margin:13px 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.18;font-weight:500;color:#171310;">Confirm your email</h1>
                        <p style="margin:0 0 14px;font-size:16px;line-height:1.75;color:#514c46;">Hello {{ $user->name ?: 'there' }},</p>
                        <p style="margin:0;font-size:16px;line-height:1.75;color:#514c46;">Welcome to Boutique Luxxe. Confirm your email address to protect your account and unlock your personal dashboard.</p>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:32px 0 28px;">
                            <tr>
                                <td align="center">
                                    <a href="{{ $verificationUrl }}" style="display:inline-block;background-color:#b58a43;color:#ffffff !important;text-decoration:none;border:1px solid #b58a43;border-radius:999px;padding:17px 34px;font-size:12px;line-height:1;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;box-shadow:0 10px 24px rgba(181,138,67,.28);">Verify my email</a>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f8f5ef;border:1px solid #e7dfd1;border-radius:16px;">
                            <tr>
                                <td style="padding:18px 20px;font-size:13px;line-height:1.65;color:#6f6961;">
                                    For your security, this link expires in <strong style="color:#171310;">{{ $expiresIn }} minutes</strong>. If you did not create this account, you can safely ignore this email.
                                </td>
                            </tr>
                        </table>

                        <p style="margin:27px 0 8px;font-size:12px;line-height:1.65;color:#8a837a;">If the button does not open, copy and paste this secure link into your browser:</p>
                        <p style="margin:0;word-break:break-all;font-size:11px;line-height:1.6;color:#9b7435;"><a href="{{ $verificationUrl }}" style="color:#9b7435;text-decoration:underline;">{{ $verificationUrl }}</a></p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:25px 28px;background:#faf8f4;border-top:1px solid #eee7dc;font-size:11px;line-height:1.7;color:#8a837a;">
                        Curated luxury, delivered with care.<br>
                        <a href="https://boutiqueluxxe.com" style="color:#9b7435;text-decoration:none;">boutiqueluxxe.com</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
