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
                ->join('products', 'products.id', '=', 'wishlists.product_id')
                ->get(['products.id as id', 'products.name as name', 'products.price as price']);

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