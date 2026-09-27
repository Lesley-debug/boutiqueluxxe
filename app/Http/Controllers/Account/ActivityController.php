<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\UserActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Account/Activity', [
            'activities' => UserActivityLog::query()
                ->where('user_id', $request->user()->id)
                ->latest()
                ->paginate(20),
        ]);
    }
}
