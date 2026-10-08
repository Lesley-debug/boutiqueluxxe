<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Filament\Resources\Categories\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
class CategoryController extends Controller
{
    private function handoff(Request $request, string $url) { return $request->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function index(Request $request) { Gate::authorize('viewAny',Category::class); return $this->handoff($request,CategoryResource::getUrl('index',panel:'staff')); }
    public function create(Request $request) { Gate::authorize('create',Category::class); return $this->handoff($request,CategoryResource::getUrl('create',panel:'staff')); }
    public function store(Request $request) { return $this->create($request); }
    public function show(Request $request, Category $category) { return $this->edit($request,$category); }
    public function edit(Request $request, Category $category) { Gate::authorize('update',$category); return $this->handoff($request,CategoryResource::getUrl('edit',['record'=>$category],panel:'staff')); }
    public function update(Request $request, Category $category) { return $this->edit($request,$category); }
    public function destroy(Request $request, Category $category) { return $this->edit($request,$category); }
}
