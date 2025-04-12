<?php

namespace App\Http\Controllers\Api\Category\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\Category\CategoryService;

class AdminCategoryController extends Controller
{
    // Khai báo service xử lý logic nghiệp vụ liên quan đến Danh mục
    protected $categoryService;
    // Constructor để khởi tạo service
    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }
}
