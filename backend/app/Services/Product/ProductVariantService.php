<?php 
namespace App\Services\Product;

use App\Models\ProductVariant;
use App\Services\BaseService;


class ProductVariantService extends BaseService {
    public function __construct(ProductVariant $productVariant){
        parent::__construct($productVariant);
    }
   
}