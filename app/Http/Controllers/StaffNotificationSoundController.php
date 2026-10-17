<?php
namespace App\Http\Controllers;
use App\Services\StaffInbox;
use Carbon\CarbonImmutable;
use Illuminate\Http\{Request,JsonResponse};
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\ValidationException;
class StaffNotificationSoundController extends Controller
{
    public function __invoke(Request $request,StaffInbox $inbox): JsonResponse
    {
        $actor=$inbox->actor($request->user());
        $input=$request->validate(['cursor'=>['nullable','string','max:2048']]);
        $now=now()->toImmutable(); $cursor=$input['cursor'] ?? null; $baseline=! $cursor;
        $q=$inbox->query($actor)->select(['id','created_at','read_at']);
        if (! $baseline) {
            try { $state=json_decode(Crypt::decryptString($cursor),true,512,JSON_THROW_ON_ERROR); }
            catch (\Throwable $e) { throw ValidationException::withMessages(['cursor'=>'Refresh the sound baseline.']); }
            if (! is_array($state) || ($state['v'] ?? null)!==1 || ($state['user'] ?? null)!==(string)$actor->id || ! is_int($state['at'] ?? null) || $state['at']<$now->timestamp-90 || $state['at']>$now->timestamp+5) { throw ValidationException::withMessages(['cursor'=>'Refresh the sound baseline.']); }
            // One-second overlap handles timestamps stored with whole-second precision.
            $q->where('created_at','>=',CarbonImmutable::createFromTimestampUTC($state['at'])->setTimezone(config('app.timezone','UTC'))->subSecond());
        }
        // Include READ rows too: marking alerts read must never pull older unread IDs into the baseline.
        $rows=$q->orderByDesc('created_at')->orderByDesc('id')->limit(101)->get();
        $overflow=$rows->count()>100;
        $items=$rows->take(100)->map(fn ($n)=>['id'=>(string)$n->id,'unread'=>$n->read_at===null])->values()->all();
        $next=Crypt::encryptString(json_encode(['v'=>1,'user'=>(string)$actor->id,'at'=>$now->timestamp],JSON_THROW_ON_ERROR));
        return response()->json(['user'=>(string)$actor->id,'baseline'=>$baseline,'overflow'=>$overflow,'items'=>$items,'cursor'=>$next])->header('Cache-Control','no-store, private, max-age=0')->header('X-Robots-Tag','noindex, nofollow, noarchive');
    }
}
