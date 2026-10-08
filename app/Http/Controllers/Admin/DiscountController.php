<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Filament\Resources\Discounts\DiscountResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
class DiscountController extends Controller
{
    private function handoff(Request $request, string $url) { return $request->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function index(Request $request) { Gate::authorize('viewAny',Discount::class); return $this->handoff($request,DiscountResource::getUrl('index',panel:'staff')); }
    public function create(Request $request) { Gate::authorize('create',Discount::class); return $this->handoff($request,DiscountResource::getUrl('create',panel:'staff')); }
    public function store(Request $request) { return $this->create($request); }
    public function show(Request $request, Discount $discount) { return $this->edit($request,$discount); }
    public function edit(Request $request, Discount $discount) { Gate::authorize('update',$discount); return $this->handoff($request,DiscountResource::getUrl('edit',['record'=>$discount],panel:'staff')); }
    public function update(Request $request, Discount $discount) { return $this->edit($request,$discount); }
    public function destroy(Request $request, Discount $discount) { return $this->edit($request,$discount); }
}
