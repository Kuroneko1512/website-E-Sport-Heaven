<?php 
namespace App\Services\Category;

use App\Models\Category;
use App\Services\BaseService;


class CategoryService extends BaseService {
    public function __construct(Category $category){
        parent::__construct($category);
    }
    public function getCategories($paginate = 5){
        return $this->getAll($paginate);
    }
   
}