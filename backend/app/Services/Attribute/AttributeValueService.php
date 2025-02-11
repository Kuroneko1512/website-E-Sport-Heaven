<?php 
namespace App\Services\Attribute;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Services\BaseService;


class AttributeValueService extends BaseService {
    // Constructor nhận vào đối tượng Attribute và gọi constructor của lớp cha (BaseService)
    public function __construct(AttributeValue $attributeVale){
        parent::__construct($attributeVale);// Gọi constructor của BaseService với đối tượng Attribute
    }
    // Phương thức lấy tất cả thuộc tính với phân trang
    // Nếu không truyền $paginate, mặc định sẽ phân trang 10 bản ghi
    public function getAttributeValues($attribute_id,$paginate = 10){
         // Gọi phương thức getAll trong lớp BaseService để lấy danh sách thuộc tính, với phân trang
        return Attribute::findOrFail($attribute_id)->attributeValues()->paginate($paginate);
    }
}