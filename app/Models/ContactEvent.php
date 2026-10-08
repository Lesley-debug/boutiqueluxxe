<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ContactEvent extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['snapshot'=>'array','metadata'=>'array','email_attempts'=>'integer','email_claimed_at'=>'datetime','email_sent_at'=>'datetime'];
}
