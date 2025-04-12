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
        ])
            ->orderBy('created_at', 'DESC') // Sắp xếp theo thời gian mới nhất
            ->paginate($paginate);
    }
    public function getProductFiterAll($filters = [], $paginate = 12)
    {
        // Sắp xếp theo thời gian mới nhất
        $query = $this->model->with(['variants.productAttributes.attributeValue:id,value'])
            ->orderBy('created_at', 'DESC');

        // Lọc theo danh mục sản phẩm
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Lọc theo khoảng giá
        if (!empty($filters['min_price']) && !empty($filters['max_price'])) {
            $query->whereBetween('price', [$filters['min_price'], $filters['max_price']]);
            // return $query;
        }
        // Lọc theo thuộc tính sản phẩm
        if (!empty($filters['attributes'])) {
            $query->whereHas('variants.productAttributes.attributeValue', function ($q) use ($filters) {
                $q->whereIn('value', $filters['attributes']);
            });
        }
        return $query->paginate($paginate);
    }
    public function searchProduct($keyword, $paginate = 12)
    {
        return $this->model
            ->with(['variants.productAttributes.attributeValue:id,value'])
            ->where('name', 'LIKE', '%' . $keyword . '%')
            ->orWhereHas('variants.productAttributes.attributeValue', function ($query) use ($keyword) {
                $query->where('value', 'LIKE', '%' . $keyword . '%');
            })
            ->orderBy('created_at', 'DESC')
            ->paginate($paginate);
    }
    public function getProduct($id)
    {
        return $this->model->with([
            'variants.productAttributes.attributeValue:id,value', // Lấy giá trị thuộc tính
            'selectedAttributes', // Lấy attributes từ Product
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
        $product->update([
            'name' => $data['name'],
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
            // Lưu các thuộc tính đã chọn cho sản phẩm
            foreach ($data['selected_attributes'] as $attributeId) {
                $product->selectedAttributes()->create(['attribute_id' => $attributeId]);
            }

            // Lấy danh sách các thuộc tính bắt buộc từ sản phẩm
            $requiredAttributes = $product->selectedAttributes->pluck('attribute_id')->toArray();

            // Kiểm tra và cập nhật hoặc tạo mới biến thể cho sản phẩm
            if (!empty($data['variants']) && is_array($data['variants'])) {
                foreach ($data['variants'] as $variantData) {
                    // Kiểm tra xem biến thể có ID không (cập nhật nếu có ID, tạo mới nếu không có ID)
                    if (isset($variantData['id'])) {
                        // Cập nhật biến thể nếu đã tồn tại
                        $variant = $product->variants()->find($variantData['id']);
                        if ($variant) {
                            $variant->update([
                                'price' => $variantData['price'],
                                'stock' => $variantData['stock'],
                                'discount_percent' => $variantData['discount_percent'] ?? null,
                                'discount_start' => $variantData['discount_start'] ?? null,
                                'discount_end' => $variantData['discount_end'] ?? null,
                            ]);
                        }
                    } else {
                        // Tạo mới biến thể nếu không có ID
                        $variant = $product->variants()->create([
                            'sku' => $variantData['sku'] ?? $this->generateSKU($data['name'], $variantData['attributes']),
                            'price' => $variantData['price'],
                            'stock' => $variantData['stock'],
                            'discount_percent' => $variantData['discount_percent'] ?? null,
                            'discount_start' => $variantData['discount_start'] ?? null,
                            'discount_end' => $variantData['discount_end'] ?? null,
                        ]);
                        if (!empty($variantData['attributes']) && is_array($variantData['attributes'])) {
                            foreach ($variantData['attributes'] as $attributeData) {
                                // Lấy attribute_value_id và attribute_id từ dữ liệu gửi đến
                                $attributeValue = AttributeValue::find($attributeData['attribute_value_id']);
                                if (!$attributeValue) {
                                    throw new \Exception("Giá trị thuộc tính không hợp lệ.");
                                }
                                $exists = $variant->productAttributes()->where([
                                    'product_variant_id' => $variant->id,
                                    'attribute_id' => $attributeData['attribute_id'],
                                    'attribute_value_id' => $attributeData['attribute_value_id'],
                                ])->exists();

                                if ($exists) {
                                    // Nếu tồn tại thì bỏ qua hoặc xử lý khác nếu muốn
                                    continue;
                                }
                                //  Cập nhật hoặc tạo mới thuộc tính cho biến thể
                                $variant->productAttributes()->updateOrCreate(
                                    [
                                        'product_variant_id' => $variant->id,
                                        'attribute_id' => $attributeData['attribute_id'],
                                    ],
                                    [
                                        'attribute_value_id' => $attributeData['attribute_value_id'],
                                    ]
                                );
                            }
                        }
                    }

                    // Kiểm tra và cập nhật hoặc tạo mới các thuộc tính của biến thể

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
    public function getPriceRange()
    {
        $minPrice = $this->model->min('price');
        $maxPrice = $this->model->max('price');

        // Nếu có sản phẩm biến thể, kiểm tra cả giá của biến thể
        $variantMinPrice = DB::table('product_variants')->min('price');
        $variantMaxPrice = DB::table('product_variants')->max('price');

        // Lấy giá thấp nhất và cao nhất giữa sản phẩm thường và biến thể
        $finalMinPrice = min(
            is_null($minPrice) ? PHP_FLOAT_MAX : $minPrice,
            is_null($variantMinPrice) ? PHP_FLOAT_MAX : $variantMinPrice
        );

        $finalMaxPrice = max(
            is_null($maxPrice) ? 0 : $maxPrice,
            is_null($variantMaxPrice) ? 0 : $variantMaxPrice
        );

        // Nếu không có sản phẩm nào, trả về giá trị mặc định
        if ($finalMinPrice === PHP_FLOAT_MAX) {
            $finalMinPrice = 0;
        }
        if ($finalMaxPrice === 0) {
            $finalMaxPrice = 10000000; // 10 triệu VND
        }

        return [
            'min_price' => (int)$finalMinPrice,
            'max_price' => (int)$finalMaxPrice
        ];
    }
    private function generateSKU($productName, $attributes = [])
    {
        // Chuyển tên sản phẩm thành slug
        $slug = Str::slug($productName);

        // Nếu có thuộc tính (biến thể), nối chúng lại
        if (!empty($attributes)) {
            // Lấy danh sách các giá trị thuộc tính
            $attrValues = [];
            foreach ($attributes as $attr) {
                // Lấy giá trị của attribute_value từ database
                $attributeValue = AttributeValue::find($attr['attribute_value_id']);
                if ($attributeValue) {
                    // Sử dụng giá trị thay vì ID
                    $attrValues[] = Str::slug($attributeValue->value);
                }
            }

            // Sắp xếp các giá trị để đảm bảo tính nhất quán
            sort($attrValues);

            // Nối các giá trị thuộc tính
            $attrPart = implode('-', $attrValues);
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
