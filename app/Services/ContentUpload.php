<?php
namespace App\Services;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
final class ContentUpload
{
    public function store(UploadedFile $file,string $directory): string
    {
        $ext=match ($file->getMimeType()) {'image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','video/mp4'=>'mp4','video/webm'=>'webm',default=>throw new \RuntimeException('Unsupported content media format.')};
        $path=$file->storeAs($directory,Str::uuid().'.'.$ext,'public');
        if (! is_string($path) || $path==='') { throw new \RuntimeException('Content media could not be stored.'); } return $path;
    }
    public function discard(array $paths): void { foreach ($paths as $p) { try { Storage::disk('public')->delete($p); } catch (\Throwable $e) { report($e); } } }
}
