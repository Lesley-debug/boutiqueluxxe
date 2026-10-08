<?php
namespace App\Services;
use App\Models\{HomepageContent,HeroSlide,AboutPage,JournalPost,Testimonial,User};
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\{DB,Gate,Validator};
use Illuminate\Validation\ValidationException;
final class StaffContentEditor
{
    public const COLUMNS=[
        HomepageContent::class=>['id','editorial_title','editorial_subtitle','editorial_cta_text','editorial_cta_url','editorial_image','editorial_video','watches_title','watches_subtitle','watches_cta_text','watches_cta_url','watches_image','watches_video','story_title','story_text','story_cta_text','story_image','created_at','updated_at'],
        HeroSlide::class=>['id','eyebrow','title','subtitle','primary_cta_text','primary_cta_url','secondary_cta_text','secondary_cta_url','image','active','sort_order','created_at','updated_at'],
        AboutPage::class=>['id','hero_title','hero_subtitle','hero_image','philosophy_title','philosophy_text','approach_title','approach_text','contact_title','contact_text','created_at','updated_at'],
        JournalPost::class=>['id','title','slug','excerpt','content','cover_image','status','published_at','created_at','updated_at'],
        Testimonial::class=>['id','customer_name','quote','rating','active','sort_order','created_at','updated_at'],
    ];
    public function fingerprint(Model $r): string
    {
        $columns=self::COLUMNS[$r::class] ?? null; if (! $columns) { foreach (self::COLUMNS as $class=>$fields) { if ($r instanceof $class) { $columns=$fields; break; } } }
        if (! $columns) { throw new \InvalidArgumentException('Unsupported content model.'); }
        $data=array_intersect_key($r->getRawOriginal(),array_flip($columns));
        foreach (['id','sort_order','rating'] as $k) { if (isset($data[$k])) { $data[$k]=(int)$data[$k]; } }
        if (isset($data['active'])) { $data['active']=(bool)$data['active']; } ksort($data); return hash('sha256',json_encode($data,JSON_THROW_ON_ERROR));
    }
    public function save(User $actor,string $class,array $data,?Model $record=null,string $prefix=''): Model
    {
        if (! isset(self::COLUMNS[$class]) || ($record && ! ($record instanceof $class))) { throw new \InvalidArgumentException('Unsupported content record.'); }
        Gate::forUser($actor)->authorize($record ? 'update' : 'create',$record ?? $class); $files=[];
        try { return DB::transaction(function () use ($class,$data,$record,&$files): Model {
            $r=$record ? $class::whereKey($record->id)->lockForUpdate()->firstOrFail() : new $class;
            $errorField=$class===Testimonial::class ? 'customer_name' : ($class===HomepageContent::class ? 'editorial_title' : ($class===AboutPage::class ? 'hero_title' : 'title'));
            if ($r->exists && (! is_string($data['expected_snapshot'] ?? null) || ! hash_equals($this->fingerprint($r),$data['expected_snapshot']))) { throw ValidationException::withMessages([$errorField=>'This content changed in another session. Reload before saving.']); }
            $text=fn (int $max,bool $required=false): array => [$required?'required':'nullable','string','max:'.$max];
            $rules=[]; $media=[];
            if ($class===HeroSlide::class) {
                $rules=['eyebrow'=>$text(100),'title'=>[...$text(255,true),'regex:/\S/u'],'subtitle'=>$text(500),'primary_cta_text'=>$text(50),'primary_cta_url'=>$text(255),'secondary_cta_text'=>$text(50),'secondary_cta_url'=>$text(255),'active'=>['required','boolean'],'sort_order'=>['required','integer','min:0','max:4294967295']]; $media=['image'=>['hero',4096,'image']];
            } elseif ($class===HomepageContent::class) {
                foreach (['editorial','watches'] as $section) { $rules[$section.'_title']=$text(255); $rules[$section.'_subtitle']=$text(1000); $rules[$section.'_cta_text']=$text(100); $rules[$section.'_cta_url']=$text(255); $media[$section.'_image']=['homepage',4096,'image']; $media[$section.'_video']=['homepage',10240,'video']; $rules['remove_'.$section.'_video']=['nullable','boolean']; }
                $rules+=['story_title'=>$text(255),'story_text'=>$text(10000),'story_cta_text'=>$text(100)]; $media['story_image']=['homepage',4096,'image'];
            } elseif ($class===AboutPage::class) {
                foreach (['hero','philosophy','approach','contact'] as $section) { $rules[$section.'_title']=[...$text(255,true),'regex:/\S/u']; $rules[$section.($section==='hero'?'_subtitle':'_text')]=$text(10000); } $media['hero_image']=['about',4096,'image'];
            } elseif ($class===JournalPost::class) {
                $rules=['title'=>[...$text(255,true),'regex:/\S/u'],'excerpt'=>$text(500),'content'=>[...$text(100000,true),'regex:/\S/u'],'status'=>['required','in:draft,published']]; $media['cover_image']=['journal',4096,'image'];
            } else {
                $rules=['customer_name'=>[...$text(255,true),'regex:/\S/u'],'quote'=>[...$text(1000,true),'regex:/\S/u'],'rating'=>['required','integer','min:1','max:5'],'active'=>['required','boolean'],'sort_order'=>['required','integer','min:0','max:4294967295']];
            }
            foreach ($media as $field=>[$dir,$max,$type]) { $rules['new_'.$field]=['nullable','file',...($type==='image'?['image','mimes:jpg,jpeg,png,webp']:['mimes:mp4,webm']),'max:'.$max]; }
            $v=Validator::make($data,$rules)->validate();
            // Validate the same detected MIME used by storage, with errors on the upload field.
            // Extension-oriented validation alone is not this storage boundary (including fake uploads).
            foreach ($media as $field=>[$dir,$max,$type]) {
                $upload=$v['new_'.$field] ?? null;
                if ($upload === null) { continue; }
                $allowed=$type==='image' ? ['image/jpeg','image/png','image/webp'] : ['video/mp4','video/webm'];
                if (! in_array($upload->getMimeType(),$allowed,true)) {
                    throw ValidationException::withMessages(['new_'.$field=>$type==='image' ? 'Upload a supported JPG, PNG or WebP image.' : 'Upload a supported MP4 or WebM video.']);
                }
            }
            foreach ($v as $field=>$value) {
                if (str_ends_with($field,'_cta_url') && $value !== null && $value !== '' && ! app(ContentSafety::class)->safeLink($value,true)) { throw ValidationException::withMessages([$field=>'Use a root-relative public store link such as /shop, /about or /collections/bags. External, private and script links are not accepted.']); }
            }
            if ($class===Testimonial::class && $v['active'] && (! $r->exists || ! $r->active || $r->customer_name!==$v['customer_name'] || $r->quote!==$v['quote'] || (int)$r->rating!==(int)$v['rating'])) {
                Validator::make($data,['confirm_authenticity'=>['accepted']])->validate();
            }
            foreach (['editorial_video','watches_video'] as $video) { if (! empty($v['remove_'.$video])) { if (! empty($v['new_'.$video])) { throw ValidationException::withMessages(['new_'.$video=>'Choose either a replacement video or use image instead, not both.']); } $r->$video=null; } unset($v['remove_'.$video]); }
            foreach ($media as $field=>[$dir,$max,$type]) {
                if (! empty($v['new_'.$field])) { $r->$field=app(ContentUpload::class)->store($v['new_'.$field],$dir); $files[]=$r->$field; }
                unset($v['new_'.$field]); // Never accept a submitted existing media path.
            }
            if ($class===HeroSlide::class && $v['active'] && ! $r->image) { throw ValidationException::withMessages(['new_image'=>'An active slide needs a photo. Save inactive until ready.']); }
            if ($class===JournalPost::class) {
                $v['content']=app(ContentSafety::class)->html($v['content']);
                if (preg_replace('/[\s\p{Z}\x{200B}]+/u','',html_entity_decode(strip_tags($v['content']),ENT_QUOTES|ENT_HTML5,'UTF-8'))==='') { throw ValidationException::withMessages(['content'=>'Add readable article text after unsafe markup is removed.']); }
                if (! $r->exists) { $r->slug=app(CatalogSlug::class)->unique(JournalPost::class,$v['title']); }
                if ($v['status']==='published' && ! $r->published_at) { $r->published_at=now(); }
                // Existing URL and original publication date survive rename, unpublish and republish.
            }
            $r->fill($v); $r->save(); return $r->fresh();
        }); } catch (\Throwable $e) {
            app(ContentUpload::class)->discard($files);
            if ($e instanceof ValidationException) { throw ValidationException::withMessages(collect($e->errors())->mapWithKeys(fn ($errors,$key)=>[$prefix.$key=>$errors])->all()); }
            if ($e instanceof QueryException && ((int)($e->errorInfo[1] ?? 0)===1062 || str_contains(strtolower($e->getMessage()),'unique constraint'))) { throw ValidationException::withMessages([$prefix.'title'=>'A duplicate article URL was encountered. Reload and save again.']); }
            throw $e;
        }
    }
}
