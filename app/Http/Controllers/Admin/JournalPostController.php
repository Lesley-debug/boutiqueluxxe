<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JournalPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JournalPostController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Journal/Index', [
            'posts' => JournalPost::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Journal/Form');
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('journal', 'public');
        }

        if ($data['status'] === 'published') {
            $data['published_at'] = now();
        }

        JournalPost::create($data);

        return redirect()->route('admin.journal.index')->with('success', 'Post created.');
    }

    public function edit(JournalPost $journal)
    {
        return Inertia::render('Admin/Journal/Form', ['post' => $journal]);
    }

    public function update(Request $request, JournalPost $journal)
    {
        $data = $this->validated($request, $journal->id);

        if ($request->hasFile('cover_image')) {
            if ($journal->cover_image) {
                Storage::disk('public')->delete($journal->cover_image);
            }
            $data['cover_image'] = $request->file('cover_image')->store('journal', 'public');
        }

        if ($data['status'] === 'published' && $journal->status !== 'published') {
            $data['published_at'] = now();
        }

        $journal->update($data);

        return redirect()->route('admin.journal.index')->with('success', 'Post updated.');
    }

    public function destroy(JournalPost $journal)
    {
        if ($journal->cover_image) {
            Storage::disk('public')->delete($journal->cover_image);
        }
        $journal->delete();

        return redirect()->route('admin.journal.index')->with('success', 'Post deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:journal_posts,slug' . ($ignoreId ? ",{$ignoreId}" : '')],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'status' => ['required', 'in:draft,published'],
        ]);
    }
}
