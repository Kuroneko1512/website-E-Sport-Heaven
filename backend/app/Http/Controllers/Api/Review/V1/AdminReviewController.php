<?php

namespace App\Http\Controllers\Api\Review\V1;

use Illuminate\Http\Request;
use App\Services\ReviewService;
use App\Http\Controllers\Controller;

class AdminReviewController extends Controller
{
    // Khai báo service xử lý logic nghiệp vụ liên quan đến Đánh giá
    protected $reviewService;
    // Constructor để khởi tạo service
    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }
}
