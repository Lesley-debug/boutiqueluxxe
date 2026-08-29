<?php

return [
    'international' => [
        ['method' => 'PayPal', 'detail' => 'yourboutique@paypal.com'], // TODO: replace with real PayPal email
        ['method' => 'Zelle', 'detail' => 'yourboutique@email.com'], // TODO: replace with real Zelle email/phone
        ['method' => 'Bank Transfer (International)', 'detail' => 'Bank: TODO | Account Name: TODO | IBAN/SWIFT: TODO'],
    ],
    'cameroon' => [
        ['method' => 'MTN Mobile Money', 'detail' => '6XX XXX XXX'], // TODO: replace with real MTN MoMo number
        ['method' => 'Orange Money', 'detail' => '6XX XXX XXX'], // TODO: replace with real Orange Money number
        ['method' => 'Bank Transfer (Local)', 'detail' => 'Bank: TODO | Account Name: TODO | Account Number: TODO'],
    ],
];
