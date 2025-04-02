<?php 
namespace App\Services;

use App\Models\Review;
use App\Services\BaseService;


class ReviewService extends BaseService {
    public function __construct(Review $review){
        parent::__construct($review);
    }
    
    public function getReviews($paginate = 10){
        return $this->getAll($paginate);
    }
   
}