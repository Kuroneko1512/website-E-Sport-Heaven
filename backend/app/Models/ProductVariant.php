<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;
    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'stock',
        'image',
    ];
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function productAttributes()
    {
        return $this->hasMany(ProductVariantAttribute::class, 'product_variant_id');
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'product_variant_attributes', 'product_variant_id', 'attribute_id')
            ->withPivot('attribute_value_id');
    }
}
