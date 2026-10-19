<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\HomepageContent;
use App\Filament\Resources\Homepage\HomepageContentResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
class HomepageContentController extends Controller
{
    public function edit(Request $r) { Gate::authorize('viewAny',HomepageContent::class); $url=HomepageContentResource::getUrl('index',panel:'staff'); return $r->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function update(Request $r) { return $this->edit($r); }
}
