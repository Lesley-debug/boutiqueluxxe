<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Inertia\Inertia;

class NewsletterController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Newsletter/Index', [
            'subscribers' => NewsletterSubscriber::whereNull('unsubscribed_at')->latest()->paginate(50),
            'total' => NewsletterSubscriber::whereNull('unsubscribed_at')->count(),
        ]);
    }
}
