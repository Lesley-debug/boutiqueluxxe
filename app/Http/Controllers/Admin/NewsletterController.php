<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Filament\Pages\StaffNewsletter;
use Illuminate\Http\Request;
use Inertia\Inertia;
class NewsletterController extends Controller
{
    public function index(Request $request) { abort_unless(StaffNewsletter::canAccess(),403); $url=StaffNewsletter::getUrl(panel:'staff'); return $request->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
}
