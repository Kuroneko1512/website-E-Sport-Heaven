<?php

namespace App\Http\Resources\ProductDetails;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'name' => $this->name,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'discount' => [
                'percent' => (float) $this->discount_percent,
                'start' => $this->discount_start,
                'end' => $this->discount_end,
            ],
            'image' => $this->image,
            'description' => $this->description,
            'product_type' => $this->product_type,
            'status' => $this->status,
            'category' => [
                'id' => $this->category->id ?? null,
                'name' => $this->category->name ?? null,
            ],
            'variants' => $this->variants->map(fn ($variant) => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'price' => (float) $variant->price,
                'stock' => $variant->stock,
                'image' => $variant->image,
                'attributes' => $variant->productAttributes->map(fn ($attr) => [
                    'attribute_id' => $attr->attribute_id,
                    'value_id' => $attr->attribute_value_id,
                ]),

            ]),
            'used_attributes' => $this->variants
                ->flatMap(fn ($variant) => $variant->productAttributes->pluck('attribute_id'))
                ->unique()
                ->values(),
            'reviews' => [],
        ];
    }

    private function getRatingDetails()
    {
        $ratings = $this->reviews->groupBy('rating')->map->count();
        return [
            'average' => round($this->reviews->avg('rating'), 1),
            'breakdown' => [
                '5_stars' => $ratings[5] ?? 0,
                '4_stars' => $ratings[4] ?? 0,
                '3_stars' => $ratings[3] ?? 0,
                '2_stars' => $ratings[2] ?? 0,
                '1_star'  => $ratings[1] ?? 0,
            ]
        ];
    }
}
