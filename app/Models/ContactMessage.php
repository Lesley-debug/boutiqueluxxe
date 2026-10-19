<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class ContactMessage extends Model
{
    protected $fillable = ['name','email','subject','message','status'];
    protected $casts = ['workflow_version'=>'integer'];
    public function events(): HasMany { return $this->hasMany(ContactEvent::class); }
}
