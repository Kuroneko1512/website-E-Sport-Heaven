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
   
}