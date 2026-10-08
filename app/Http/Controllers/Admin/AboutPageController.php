<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\AboutPage;
use App\Filament\Resources\About\AboutPageResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
class AboutPageController extends Controller
{
    public function edit(Request $r) { Gate::authorize('viewAny',AboutPage::class); $url=AboutPageResource::getUrl('index',panel:'staff'); return $r->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function update(Request $r) { return $this->edit($r); }
}
