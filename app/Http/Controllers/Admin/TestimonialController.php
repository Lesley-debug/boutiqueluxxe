<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use App\Filament\Resources\Testimonials\TestimonialResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
class TestimonialController extends Controller
{
    private function handoff(Request $r,string $url) { return $r->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function index(Request $r) { Gate::authorize('viewAny',Testimonial::class); return $this->handoff($r,TestimonialResource::getUrl('index',panel:'staff')); }
    public function create(Request $r) { Gate::authorize('create',Testimonial::class); return $this->handoff($r,TestimonialResource::getUrl('create',panel:'staff')); }
    public function store(Request $r) { return $this->create($r); }
    public function show(Request $r,Testimonial $testimonial) { return $this->edit($r,$testimonial); }
    public function edit(Request $r,Testimonial $testimonial) { Gate::authorize('update',$testimonial); return $this->handoff($r,TestimonialResource::getUrl('edit',['record'=>$testimonial],panel:'staff')); }
    public function update(Request $r,Testimonial $testimonial) { return $this->edit($r,$testimonial); }
    public function destroy(Request $r,Testimonial $testimonial) { return $this->edit($r,$testimonial); }
}
