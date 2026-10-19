<?php

namespace App\Support;

class Permissions
{
    public const MAP = [
        'super_admin' => ['*'],
        'manager' => [
            'dashboard.view',
            'products.manage',
            'orders.manage',
            'contacts.manage',
            'customers.view',
            'discounts.manage',
            'notifications.view',
        ],
        'support_staff' => [
            'dashboard.view',
            'orders.manage',
            'contacts.manage',
            'customers.view',
            'notifications.view',
        ],
    ];
}
