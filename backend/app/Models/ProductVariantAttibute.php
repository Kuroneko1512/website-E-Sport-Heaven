<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariantAttibute extends Model
{
    use HasFactory;
    protected $fillable = [
        'product_variant_id',
        'attribute_value_id',
        'attribute_id'
    ];

    public function variantAttribute()
    {
        return $this->belongsTo(Attribute::class, 'variant_attribute_id');
    }

    public function attributeValue()
    {
        return $this->belongsTo(AttributeValue::class, 'attribute_value_id');
    }
    public function attribute()
    {
        return $this->hasOneThrough(Attribute::class, AttributeValue::class, 'id', 'id', 'attribute_value_id', 'attribute_id');
    }
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
