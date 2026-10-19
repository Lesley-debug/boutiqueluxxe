<?php
namespace App\Services;
final class ContentSafety
{
    public function safeLink(string $value, bool $internalOnly = false): bool
    {
        $value=trim($value); if ($value==='') { return false; }
        $decoded=$value; for ($i=0;$i<3;$i++) { $decoded=rawurldecode($decoded); }
        if (preg_match('/[\x00-\x20\x7F\\\\]/',$decoded)) { return false; }
        if (str_starts_with($decoded,'/') && ! str_starts_with($decoded,'//')) {
            if (! $internalOnly) { return true; }
            $path=parse_url($decoded,PHP_URL_PATH);
            return is_string($path) && (in_array($path,['/','/shop','/categories','/collections','/about','/contact','/faqs','/journal','/testimonials','/privacy-policy','/cookie-policy'],true) || preg_match('~^/(products|collections|journal)/[a-zA-Z0-9_-]+$~',$path));
        }
        if ($internalOnly) { return false; }
        if (preg_match('~^https?://~i',$value) && filter_var($value,FILTER_VALIDATE_URL)) { return true; }
        return str_starts_with(strtolower($value),'mailto:') && filter_var(substr($value,7),FILTER_VALIDATE_EMAIL) !== false;
    }
    public function html(string $html): string
    {
        if (! class_exists(\DOMDocument::class)) { throw new \RuntimeException('PHP DOM extension is required for safe journal editing.'); }
        $dom=new \DOMDocument('1.0','UTF-8'); $previous=libxml_use_internal_errors(true);
        try { $dom->loadHTML('<?xml encoding="UTF-8" ?><html><body>'.$html.'</body></html>',LIBXML_NONET); }
        finally { libxml_clear_errors(); libxml_use_internal_errors($previous); }
        $body=$dom->getElementsByTagName('body')->item(0); if (! $body) { return ''; }
        $this->clean($body); $output=''; foreach ($body->childNodes as $node) { $output.=$dom->saveHTML($node); } return $output;
    }
    private function clean(\DOMNode $parent): void
    {
        $allowed=['p','br','h2','h3','h4','ul','ol','li','blockquote','strong','em','b','i','a','code','pre'];
        $drop=['script','style','iframe','object','embed','svg','math','form','input','button','textarea','select','link','meta','img','video','audio','source','template'];
        foreach (iterator_to_array($parent->childNodes) as $node) {
            if ($node instanceof \DOMElement) {
                $tag=strtolower($node->tagName); if (in_array($tag,$drop,true)) { $parent->removeChild($node); continue; }
                $this->clean($node);
                if (! in_array($tag,$allowed,true)) { while ($node->firstChild) { $parent->insertBefore($node->firstChild,$node); } $parent->removeChild($node); continue; }
                $href=$tag==='a' ? $node->getAttribute('href') : '';
                foreach (iterator_to_array($node->attributes) as $attribute) { $node->removeAttribute($attribute->name); }
                if ($tag==='a' && $this->safeLink($href)) { $node->setAttribute('href',trim($href)); $node->setAttribute('rel','noopener noreferrer nofollow'); }
            } elseif ($node instanceof \DOMComment || $node instanceof \DOMProcessingInstruction) { $parent->removeChild($node); }
        }
    }
}
