<?php 
namespace App\Services\Attribute;

use App\Models\Attribute;
use App\Services\BaseService;


class AttributeService extends BaseService {
    public function __construct(Attribute $attribute){
        parent::__construct($attribute);
    }
    public function getAttributes($paginate = 5){
        return $this->getAll($paginate);
    }
   
}