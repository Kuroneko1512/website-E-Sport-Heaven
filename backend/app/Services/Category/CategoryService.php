<?php
namespace App\Services\Category;

use App\Models\Category;
use App\Services\BaseService;


class CategoryService extends BaseService {
    public function __construct(Category $category){
        parent::__construct($category);
    }
    public function getCategories($paginate = 15){
        return $this->model->withCount(['products', 'subcategories'])->paginate(15);
    }

    public function getAllCategories(){
        return $this->model->withCount(['products', 'subcategories'])->get();
    }
}
