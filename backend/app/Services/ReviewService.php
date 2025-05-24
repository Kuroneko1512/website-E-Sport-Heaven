<?php 
namespace App\Services;

use App\Models\Review;
use App\Services\BaseService;


class ReviewService extends BaseService {
    public function __construct(Review $review){
        parent::__construct($review);
    }
    
    public function getReviews($paginate = 10){
        return Review::join('users', 'users.id', '=', 'reviews.user_id')
             ->join('products', 'products.id', '=', 'reviews.product_id')
             ->select('users.id', 'users.name as user_name', 'products.name as product_name', 'reviews.*')
             ->paginate($paginate);
    }

    public function getByProduct($id){
        return Review::where('product_id', $id)
                ->join('users', 'users.id', '=', 'reviews.user_id')
                ->get(['users.name as full_name', 'reviews.*']);
    }
   
}