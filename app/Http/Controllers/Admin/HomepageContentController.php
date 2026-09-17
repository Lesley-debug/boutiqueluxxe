<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomepageContentController extends Controller
{
    public function edit()
    {
        return Inertia::render('Admin/Homepage/Edit', [
            'content' => HomepageContent::current(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'editorial_title'    => ['nullable', 'string', 'max:255'],
            'editorial_subtitle' => ['nullable', 'string', 'max:1000'],
            'editorial_cta_text' => ['nullable', 'string', 'max:100'],
            'editorial_cta_url'  => ['nullable', 'string', 'max:255'],
            'editorial_image'    => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'editorial_video'    => ['nullable', 'mimes:mp4,webm', 'max:51200'],

            'watches_title'    => ['nullable', 'string', 'max:255'],
            'watches_subtitle' => ['nullable', 'string', 'max:1000'],
            'watches_cta_text' => ['nullable', 'string', 'max:100'],
            'watches_cta_url'  => ['nullable', 'string', 'max:255'],
            'watches_image'    => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'watches_video'    => ['nullable', 'mimes:mp4,webm', 'max:51200'],

            'story_title'    => ['nullable', 'string', 'max:255'],
            'story_text'     => ['nullable', 'string'],
            'story_cta_text' => ['nullable', 'string', 'max:100'],
            'story_image'    => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
        ]);

        $content = HomepageContent::current();

        foreach (['editorial_image', 'editorial_video', 'watches_image', 'watches_video', 'story_image'] as $field) {
            if ($request->hasFile($field)) {
                if ($content->$field) {
                    Storage::disk('public')->delete($content->$field);
                }
                $data[$field] = $request->file($field)->store('homepage', 'public');
            }
        }

        $content->update($data);

        return back()->with('success', 'Homepage content updated.');
    }
}
