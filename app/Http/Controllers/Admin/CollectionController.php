<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Filament\Resources\Collections\CollectionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
class CollectionController extends Controller
{
    private function handoff(Request $request, string $url) { return $request->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function index(Request $request) { Gate::authorize('viewAny',Collection::class); return $this->handoff($request,CollectionResource::getUrl('index',panel:'staff')); }
    public function create(Request $request) { Gate::authorize('create',Collection::class); return $this->handoff($request,CollectionResource::getUrl('create',panel:'staff')); }
    public function store(Request $request) { return $this->create($request); }
    public function show(Request $request, Collection $collection) { return $this->edit($request,$collection); }
    public function edit(Request $request, Collection $collection) { Gate::authorize('update',$collection); return $this->handoff($request,CollectionResource::getUrl('edit',['record'=>$collection],panel:'staff')); }
    public function update(Request $request, Collection $collection) { return $this->edit($request,$collection); }
    public function destroy(Request $request, Collection $collection) { return $this->edit($request,$collection); }
}
