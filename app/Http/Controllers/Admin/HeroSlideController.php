<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use App\Filament\Resources\HeroSlides\HeroSlideResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
class HeroSlideController extends Controller
{
    private function handoff(Request $r,string $url) { return $r->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function index(Request $r) { Gate::authorize('viewAny',HeroSlide::class); return $this->handoff($r,HeroSlideResource::getUrl('index',panel:'staff')); }
    public function create(Request $r) { Gate::authorize('create',HeroSlide::class); return $this->handoff($r,HeroSlideResource::getUrl('create',panel:'staff')); }
    public function store(Request $r) { return $this->create($r); }
    public function show(Request $r,HeroSlide $heroSlide) { return $this->edit($r,$heroSlide); }
    public function edit(Request $r,HeroSlide $heroSlide) { Gate::authorize('update',$heroSlide); return $this->handoff($r,HeroSlideResource::getUrl('edit',['record'=>$heroSlide],panel:'staff')); }
    public function update(Request $r,HeroSlide $heroSlide) { return $this->edit($r,$heroSlide); }
    public function destroy(Request $r,HeroSlide $heroSlide) { return $this->edit($r,$heroSlide); }
}
