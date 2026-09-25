<?php

namespace App\Support;

final class Money
{
    public static function format(int|float|string|null $amount): string
    {
        return config('commerce.symbol', '$').number_format(
            (float) ($amount ?? 0),
            2,
            '.',
            ',',
        );
    }

    public static function currency(): string
    {
        return (string) config('commerce.currency', 'USD');
    }
}
