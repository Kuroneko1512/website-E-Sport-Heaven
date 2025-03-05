<?php

namespace App\Http\Resources\ProductDetails;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'price' => $this->price,
            'discount' => $this->discount_percentage,
            'final_price' => $this->price - ($this->price * $this->discount_percentage / 100),
            'stock' => $this->stock,
            'image' => $this->image,
            'attributes' => json_decode($this->attributes), // Lưu thuộc tính dưới dạng JSON
        ];
    }
}
