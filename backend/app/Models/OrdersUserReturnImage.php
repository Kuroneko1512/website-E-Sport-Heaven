<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdersUserReturnImage extends Model
{
    use HasFactory;
    protected $fillable = [
        'return_id',
        'image_path',
    ];

    public function returnRequest()
    {
        return $this->belongsTo(OrderUserReturn::class, 'return_id');
    }
}
