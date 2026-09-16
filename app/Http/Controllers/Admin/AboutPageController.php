<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AboutPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AboutPageController extends Controller
{
    public function edit()
    {
        return Inertia::render('Admin/AboutPage/Edit', [
            'aboutPage' => AboutPage::current(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'hero_title' => ['required', 'string', 'max:255'],
            'hero_subtitle' => ['nullable', 'string', 'max:1000'],
            'hero_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'philosophy_title' => ['required', 'string', 'max:255'],
            'philosophy_text' => ['nullable', 'string'],
            'approach_title' => ['required', 'string', 'max:255'],
            'approach_text' => ['nullable', 'string'],
            'contact_title' => ['required', 'string', 'max:255'],
            'contact_text' => ['nullable', 'string'],
        ]);

        $aboutPage = AboutPage::current();

        if ($request->hasFile('hero_image')) {
            if ($aboutPage->hero_image) {
                Storage::disk('public')->delete($aboutPage->hero_image);
            }
            $data['hero_image'] = $request->file('hero_image')->store('about', 'public');
        }

        $aboutPage->update($data);

        return back()->with('success', 'About page updated.');
    }
}
