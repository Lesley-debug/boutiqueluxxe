<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Filament\Pages\Customers;
use Illuminate\Http\Request;
use Inertia\Inertia;
class CustomerController extends Controller
{
    private function handoff(Request $request,array $params=[]) { abort_unless(Customers::canAccess(),403); $url=Customers::getUrl($params,panel:'staff'); return $request->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function index(Request $request) { return $this->handoff($request); }
    public function show(Request $request,string $email) { return $this->handoff($request,['email'=>$email]); }
}
