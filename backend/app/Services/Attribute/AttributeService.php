<?php 
namespace App\Services\Attribute;

use App\Models\Attribute;
use App\Services\BaseService;


class AttributeService extends BaseService {
    public function __construct(Attribute $attribute){
        parent::__construct($attribute);
    }
    public function getAttributes($paginate = 5){
        return  $this -> model-> withCount('attributeValues')->paginate($paginate);
    }
    public function getAttributesForId($data){
        $attributeIds = $data;
        if (empty($attributeIds) || !is_array($attributeIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Danh sách attribute_ids không hợp lệ.'
            ], 400);
        }
        $attributes = Attribute::whereIn('id', $attributeIds)
        ->with('attributeValues:id,attribute_id,value') // Chỉ lấy các trường cần thiết
        ->get()
        ->map(function ($attribute) {
            return [
                'id' => $attribute->id,
                'name' => $attribute->name,
                'values' => $attribute->attributeValues->map(function ($value) {
                    return [
                        'id' => $value->id,
                        'value' => $value->value
                    ];
                })
            ];
        });

    return $attributes;
}
   
}