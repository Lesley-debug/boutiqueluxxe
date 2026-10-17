<?php
namespace App\Services;
use App\Models\{User,Order,ProductVariant};
use App\Support\StaffWorkspaceAccess;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\Relations\MorphMany;
final class StaffInbox
{
    public function actor(?User $user): User { abort_unless(StaffWorkspaceAccess::allows($user,'notifications.view'),403); return $user->fresh(); }
    public function query(?User $user): MorphMany { return $this->actor($user)->notifications(); }
    public function markRead(?User $user,string $id): bool
    {
        Validator::make(['id'=>$id],['id'=>['required','uuid']])->validate();
        $q=$this->query($user); $q->whereKey($id)->firstOrFail();
        return (bool)$this->query($user)->whereKey($id)->whereNull('read_at')->update(['read_at'=>now(),'updated_at'=>now()]);
    }
    public function presentation(?User $user,DatabaseNotification $notification): array
    {
        $actor=$this->actor($user); abort_unless($notification->notifiable_id==$actor->id && $notification->notifiable_type===$actor->getMorphClass(),403);
        $data=is_array($notification->data)?$notification->data:[];
        $type=is_string($data['type'] ?? null)?$data['type']:'other';
        $fallback=['new_order'=>'New order received','low_stock'=>'Low stock alert','order_placed'=>'Order placed','order_status_updated'=>'Order status updated','welcome'=>'Welcome notification'][$type] ?? 'Notification';
        $title=is_string($data['title'] ?? null)?mb_substr($data['title'],0,160):$fallback;
        $message=is_string($data['message'] ?? null)?mb_substr($data['message'],0,4000):'No message text stored.';
        $url=null;
        // Never render arbitrary stored URLs, signed login links, HTML or raw metadata.
        $id=$data['order_id'] ?? null;
        if ($type==='new_order' && (is_int($id) || (is_string($id) && ctype_digit($id))) && (int)$id>0 && $actor->hasPermission('orders.manage') && Order::whereKey((int)$id)->exists()) { $url=\App\Filament\Resources\Orders\OrderResource::getUrl('view',['record'=>(int)$id],panel:'staff'); }
        $id=$data['variant_id'] ?? null;
        if ($type==='low_stock' && (is_int($id) || (is_string($id) && ctype_digit($id))) && (int)$id>0 && $actor->hasPermission('products.manage')) { $productId=ProductVariant::whereKey((int)$id)->value('product_id'); if ($productId) { $url=\App\Filament\Resources\Products\ProductResource::getUrl('edit',['record'=>$productId],panel:'staff'); } }
        return compact('title','message','url');
    }
}
