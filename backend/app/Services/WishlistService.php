<?php 
namespace App\Services;

use App\Models\Wishlist;
use App\Services\BaseService;


class WishlistService extends BaseService {
    public function __construct(Wishlist $review){
        parent::__construct($review);
    }
    
    public function getWishlists($userId){
        return Wishlist::where('user_id', $userId)
            ->with([
                'product.category',
                'product.variants.productAttributes.attributeValue',
            ])
            ->get()
            ->map(function ($wishlist) {
                $product = $wishlist->product;
                if (!$product) {
                    return null;
                }
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => $product->price,
                    'stock' => $product->stock,
                    'discount_percent' => $product->discount_percent,
                    'discount_start' => $product->discount_start,
                    'discount_end' => $product->discount_end,
                    'description' => $product->description,
                    'image' => $product->image,
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->name,
                    ] : null,
                    'status' => $product->status,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'variants' => $product->variants->map(function ($variant) {
                        return [
                            'id' => $variant->id,
                            'sku' => $variant->sku,
                            'price' => $variant->price,
                            'stock' => $variant->stock,
                            'image' => $variant->image,
                            'discount_percent' => $variant->discount_percent,
                            'discount_start' => $variant->discount_start,
                            'discount_end' => $variant->discount_end,
                            'attributes' => $variant->productAttributes->map(function ($attr) {
                                return [
                                    'attribute_id' => $attr->attribute_id,
                                    'attribute_value_id' => $attr->attribute_value_id,
                                    'value' => $attr->attributeValue ? $attr->attributeValue->value : null,
                                ];
                            }),
                        ];
                    }),
                ];
            })
            ->filter();
    }

    public function getItemWishlist($userId, $productId){
        return Wishlist::where('product_id', $productId)->where('user_id', $userId)->first();
    }

    public function getItemsWishlist($userId, array $productIds){
        $wishlists = Wishlist::where('user_id', $userId)
            ->whereIn('product_id', $productIds)
            ->get(['product_id'])
            ->pluck('product_id')
            ->toArray();

        // Return an associative array mapping product_id to true/false
        $result = [];
        foreach ($productIds as $id) {
            $result[$id] = in_array($id, $wishlists);
        }
        return $result;
    }
   
}
