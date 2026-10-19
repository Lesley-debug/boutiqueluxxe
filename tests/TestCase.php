<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Existing business regression fixtures are not enrolled staff sessions.
        // StaffMfaTest explicitly enables mandatory mode and tests HTTP boundaries.
        config(['auth_features.staff_mfa_required' => false]);
    }
}
