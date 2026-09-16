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
        // Debug: Log incoming request data
        \Log::info('Homepage update request', [
            'all_data' => $request->all(),
            'has_files' => $request->hasFile('editorial_image'),
        ]);

        $data = $request->validate([
            'editorial_title' => ['nullable', 'string', 'max:255'],
            'editorial_subtitle' => ['nullable', 'string', 'max:1000'],
            'editorial_cta_text' => ['nullable', 'string', 'max:100'],
            'editorial_cta_url' => ['nullable', 'string', 'max:255'],
            'editorial_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],

            'watches_title' => ['nullable', 'string', 'max:255'],
            'watches_subtitle' => ['nullable', 'string', 'max:1000'],
            'watches_cta_text' => ['nullable', 'string', 'max:100'],
            'watches_cta_url' => ['nullable', 'string', 'max:255'],
            'watches_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],

            'story_title' => ['nullable', 'string', 'max:255'],
            'story_text' => ['nullable', 'string'],
            'story_cta_text' => ['nullable', 'string', 'max:100'],
            'story_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
        ]);

        \Log::info('Validated data', ['data' => $data]);

        $content = HomepageContent::current();

        // Only update text fields, handle images separately
        $textFields = [
            'editorial_title', 'editorial_subtitle', 'editorial_cta_text', 'editorial_cta_url',
            'watches_title', 'watches_subtitle', 'watches_cta_text', 'watches_cta_url',
            'story_title', 'story_text', 'story_cta_text',
        ];

        foreach ($textFields as $field) {
            if (array_key_exists($field, $data)) {
                $content->$field = $data[$field];
                \Log::info("Setting $field", ['value' => $data[$field]]);
            }
        }

        // Handle image uploads
        foreach (['editorial_image', 'watches_image', 'story_image'] as $field) {
            if ($request->hasFile($field)) {
                // Delete old image if exists
                if ($content->$field) {
                    Storage::disk('public')->delete($content->$field);
                }
                // Store new image
                $content->$field = $request->file($field)->store('homepage', 'public');
                \Log::info("Uploaded $field", ['path' => $content->$field]);
            }
        }

        $saved = $content->save();
        \Log::info('Save result', ['saved' => $saved, 'content' => $content->toArray()]);

        return redirect()->back()->with('success', 'Homepage content updated.');
    }
}
