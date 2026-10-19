<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Filament\Pages\BulkPricing;
use Illuminate\Http\Request;
use Inertia\Inertia;
class BulkPricingController extends Controller
{
    public function edit(Request $request) { abort_unless(BulkPricing::canAccess(),403); $url=BulkPricing::getUrl(panel:'staff'); return $request->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    // Old forms must not replay prices through an unguarded endpoint.
    public function update(Request $request) { return $this->edit($request); }
}
