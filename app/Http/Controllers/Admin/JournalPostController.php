<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\JournalPost;
use App\Filament\Resources\Journal\JournalPostResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
class JournalPostController extends Controller
{
    private function handoff(Request $r,string $url) { return $r->header('X-Inertia') ? Inertia::location($url) : redirect()->to($url); }
    public function index(Request $r) { Gate::authorize('viewAny',JournalPost::class); return $this->handoff($r,JournalPostResource::getUrl('index',panel:'staff')); }
    public function create(Request $r) { Gate::authorize('create',JournalPost::class); return $this->handoff($r,JournalPostResource::getUrl('create',panel:'staff')); }
    public function store(Request $r) { return $this->create($r); }
    public function show(Request $r,JournalPost $journal) { return $this->edit($r,$journal); }
    public function edit(Request $r,JournalPost $journal) { Gate::authorize('update',$journal); return $this->handoff($r,JournalPostResource::getUrl('edit',['record'=>$journal],panel:'staff')); }
    public function update(Request $r,JournalPost $journal) { return $this->edit($r,$journal); }
    public function destroy(Request $r,JournalPost $journal) { return $this->edit($r,$journal); }
}
