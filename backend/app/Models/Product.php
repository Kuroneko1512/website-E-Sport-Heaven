<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'price',
        'sku',
        'description',
        'image',
        'product_type',
        'status',
        'category_id',
    ];
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
