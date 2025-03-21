<?php

namespace App\Services\Product;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Product;
use App\Services\BaseService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductService extends BaseService
{
    public function __construct(Product $product)
    {
        parent::__construct($product);
    }
    public function getProductAll($paginate = 10)
    {
        return $this->model->with([
            'variants.productAttributes.attributeValue:id,value',
        ])->paginate($paginate);
    }
    public function getProduct($id)
    {
        // return $this->model->with([
        //     'variants.productAttributes.attributeValue:id,value', // Lấy giá trị thuộc tính
        // ])->findOrFail($id);
        return $this->model->with([
            'variants.productAttributes.attributeValue:id,value', // Lấy giá trị thuộc tính
        ])->findOrFail($id);
    }
    public function getProductForDetail($id)
    {
        $products = $this->model->with([
            'category',
            'variants.productAttributes',
            'reviews'
        ])->findOrFail($id);
        return $products;
    }
    public function handelAttribteForDetail($products)
    {
        $attributes = [];
        foreach ($products as $product) {
            foreach ($product->variants as $variant) {
                foreach ($variant->attributes as $attribute) {
                    $attributeName = $attribute->attribute->name;
                    $attributeValue = $attribute->attributeValue->value;

                    if (!isset($attributes[$attributeName])) {
                        $attributes[$attributeName] = [];
                    }

                    if (!in_array($attributeValue, $attributes[$attributeName])) {
                        $attributes[$attributeName][] = $attributeValue;
                    }
                }
            }
        }
        return $attributes;
    }
    public function createProduct($data)
    {
        $isVariable = $data['product_type'] === 'variable';
        // Gọi service để tạo mới thuộc tính
        $productSku = $data['sku'] ?? $this->generateSKU($data['name']);

        // Tạo sản phẩm
        $product = $this->model->create([
            'name' => $data['name'],
            'sku' => $productSku,
            'price' => $isVariable ? null : $data['price'],
            'stock' => $isVariable ? null : $data['stock'],
            'discount_percent' => $data['discount_percent'] ?? null,
            'discount_start' => $data['discount_start'] ?? null,
            'discount_end' => $data['discount_end'] ?? null,
            'description' => $data['description'] ?? null,
            'product_type' => $data['product_type'],
            'status' => 'active', // Sản phẩm sẽ là bản nháp ban đầu
            'category_id' => $data['category_id'] ?? null
        ]);
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $imagePath = $data['image']->store('products', 'public');
            $product->update(['image' => $imagePath]);
        }
        if ($isVariable) {
            $this->handelVariant($isVariable, $product, $data);
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
    private function handelVariant($isVariable, $product, $data)
    {
        foreach ($data['selected_attributes'] as $attributeId) {
            $product->selectedAttributes()->create(['attribute_id' => $attributeId]);
        }

        $requiredAttributes = $product->selectedAttributes->pluck('attribute_id')->toArray();

        foreach ($data['variants'] as $variantData) {
            $variantAttributeIds = collect($variantData['attributes'])->pluck('attribute_id')->toArray();
            if (array_diff($requiredAttributes, $variantAttributeIds)) {
                return response()->json([
                    'message' => 'Biến thể thiếu một hoặc nhiều thuộc tính bắt buộc!',
                    'missing_attributes' => array_diff($requiredAttributes, $variantAttributeIds)
                ], 422);
            }

            // Tự động tạo SKU nếu chưa có
            $variantSku = $variantData['sku'] ?? $this->generateSKU($data['name'], $variantData['attributes']);
            $variantImage = null;
            if (isset($variantData['image'])) {
                $variantImage = $variantData['image']->store('variants', 'public');
            }

            // Lưu biến thể
            $variant = $product->variants()->create([
                'sku' => $variantSku,
                'price' => $variantData['price'],
                'discount_percent' => $variantData['discount_percent'] ?? null,
                'discount_start' => $variantData['discount_start'] ?? null,
                'discount_end' => $variantData['discount_end'] ?? null,
                'stock' => $variantData['stock'],
                'image' => $variantImage,
            ]);

            // Lưu thuộc tính của biến thể
            foreach ($variantData['attributes'] as $attributeData) {
                $variant->productAttributes()->create([
                    'attribute_id' => $attributeData['attribute_id'],
                    'attribute_value_id' => $attributeData['attribute_value_id'],
                ]);
            }
        }
    }
    private function generateSKU($productName, $attributes = [])
    {
        // Chuyển tên sản phẩm thành slug
        $slug = Str::slug($productName);

        // Nếu có thuộc tính (biến thể), nối chúng lại
        if (!empty($attributes)) {
            $attrPart = collect($attributes)->map(fn($attr) => $attr['attribute_value_id'])->implode('-');
            $sku = strtoupper($slug . '-' . $attrPart);
        } else {
            $sku = strtoupper($slug);
        }

        // Đảm bảo SKU là duy nhất
        $originalSKU = $sku;
        $count = 1;
        while (
            DB::table('product_variants')->where('sku', $sku)->exists() ||
            DB::table('products')->where('sku', $sku)->exists()
        ) {
            $sku = $originalSKU . '-' . $count;
            $count++;
        }

        return $sku;
    }
}
