<?php

namespace Tests\Unit;

use App\Models\Discount;
use PHPUnit\Framework\TestCase;

class DiscountTest extends TestCase
{
    public function test_percentage_discount_is_capped_at_the_subtotal(): void
    {
        $discount = new Discount([
            'type' => 'percentage',
            'value' => 150,
        ]);

        $this->assertSame(10000.0, $discount->calculateDiscountAmount(10000));
    }

    public function test_fixed_discount_is_capped_at_the_subtotal(): void
    {
        $discount = new Discount([
            'type' => 'fixed',
            'value' => 15000,
        ]);

        $this->assertSame(10000.0, $discount->calculateDiscountAmount(10000));
    }

    public function test_negative_discount_values_cannot_increase_the_total(): void
    {
        $discount = new Discount([
            'type' => 'fixed',
            'value' => -500,
        ]);

        $this->assertSame(0.0, $discount->calculateDiscountAmount(10000));
    }
}
