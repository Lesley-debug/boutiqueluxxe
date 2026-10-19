<?php

return [
    // Mandatory for staff; no deployment environment switch to silently disable it.
    'staff_mfa_required' => true,
    'email_verification_required' => (bool) env('EMAIL_VERIFICATION_REQUIRED', false),
];
