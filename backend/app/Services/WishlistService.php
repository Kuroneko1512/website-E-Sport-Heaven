<?php 
namespace App\Services;

use App\Models\Wishlist;
use App\Services\BaseService;


class WishlistService extends BaseService {
    public function __construct(Review $review){
        parent::__construct($review);
    }
    
    public function getWishlists($userId, $paginate = 10){
        $query = $this->model->query();
        $query->where('user_id', $userId);
        return $query->paginate($paginate);
    }

    public function getItemWishlist($userId, $productId){
        return Wishlist::where('product_id', $productId)->where('user_id', $userId)->first();
    }
   
}