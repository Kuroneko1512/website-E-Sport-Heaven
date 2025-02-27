<?php

namespace App\Services\Product;

use App\Models\AttributeValue;
use App\Models\Product;
use App\Services\BaseService;


class ProductService extends BaseService
{
    public function __construct(Product $product)
    {
        parent::__construct($product);
    }
    public function getProductAll()
    {
        return $this->model->with([
            'variants.productAttributes.attributeValue:id,value', // Lấy giá trị thuộc tính
        ])->get();
    }
    public function getProduct($id)
    {
        return $this->model->with([
            'variants.productAttributes.attributeValue:id,value', // Lấy giá trị thuộc tính
        ])->findOrFail($id);
    }
    public function createProduct($data)
    {
        $isVariable = $data['product_type'] === 'variable';
        // Gọi service để tạo mới thuộc tính
        $product = $this->model->create($data);
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $imagePath = $data['image']->store('products', 'public');
            $product->update(['image' => $imagePath]);
        }
        if ($isVariable) {

            // Kiểm tra và tạo biến thể cho sản phẩm
            if (isset($data['variants']) && is_array($data['variants'])) {

                foreach ($data['variants'] as $variantData) {
                    // Tạo biến thể
                    $variant = $product->variants()->create([
                        'sku' => $variantData['sku'],
                        'price' => $variantData['price'],
                        'stock' => $variantData['stock'],
                    ]);

                    // Tạo thuộc tính cho biến thể
                    if (isset($variantData['attributes']) && is_array($variantData['attributes'])) {

                        foreach ($variantData['attributes'] as $attributeData) {
                            $variant->productAttributes()->create([
                                'variant_attribute_id' => $attributeData['attribute_id'],
                                'attribute_value_id' => $attributeData['attribute_value_id'],
                                'attribute_id' => $attributeData['attribute_id'],
                            ]);
                        }
                    }
                }
            }
        }
        return true;
    }
    public function updateProduct($data, $id)
    {
        $isVariable = $data['product_type'] === 'variable';

        // Cập nhật sản phẩm
        $product = $this->model->findOrFail($id); // Tìm sản phẩm trước khi cập nhật
        $product->update($data);

        if ($isVariable) {
            // Kiểm tra và cập nhật biến thể cho sản phẩm
            if (!empty($data['variants']) && is_array($data['variants'])) {
                foreach ($data['variants'] as $variantData) {
                    if (isset($variantData['id'])) {
                        // Cập nhật biến thể nếu đã tồn tại
                        $variant = $product->variants()->find($variantData['id']);
                        if ($variant) {
                            $variant->update([
                                'sku' => $variantData['sku'],
                                'price' => $variantData['price'],
                                'stock' => $variantData['stock'],
                            ]);
                        }
                    } else {
                        // Tạo biến thể mới nếu chưa có ID
                        $variant = $product->variants()->create([
                            'sku' => $variantData['sku'],
                            'price' => $variantData['price'],
                            'stock' => $variantData['stock'],
                        ]);
                    }

                    // Kiểm tra và cập nhật thuộc tính của biến thể
                    if (!empty($variantData['attributes']) && is_array($variantData['attributes'])) {
                        foreach ($variantData['attributes'] as $attributeData) {
                            // Lấy attribute_id từ attribute_values để đảm bảo dữ liệu chính xác
                            $attributeValue = AttributeValue::find($attributeData['attribute_value_id']);
                            if (!$attributeValue) {
                                throw new \Exception("Giá trị thuộc tính không hợp lệ.");
                            }

                            // Cập nhật hoặc tạo mới thuộc tính cho biến thể
                            $variant->attributes()->updateOrCreate(
                                ['attribute_value_id' => $attributeData['attribute_value_id']],
                                [
                                    'attribute_id' => $attributeValue->attribute_id,
                                    'product_variant_id' => $variant->id,
                                ]
                            );
                        }
                    }
                }
            }
        }

        return $product->fresh(); // Trả về dữ liệu mới nhất của sản phẩm
    }
}
