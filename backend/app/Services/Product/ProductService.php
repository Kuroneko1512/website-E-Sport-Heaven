<?php

namespace App\Services\Product;

use App\Events\ProductCreated;
use App\Events\ProductUpdate;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\BaseService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProductService extends BaseService
{
    public function __construct(Product $product)
    {
        parent::__construct($product);
    }

    /**
     * Lấy danh sách tất cả sản phẩm với phân trang và tìm kiếm
     *
     * @param int $paginate Số sản phẩm mỗi trang
     * @param string $searchName Tìm kiếm theo tên sản phẩm
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getProductAll($paginate = 15, $searchName = '')
    {
        $query = $this->model->with([
            'variants.productAttributes.attributeValue:id,value',
        ]);

        // Tìm kiếm theo tên sản phẩm
        if (!empty($searchName)) {
            $query->where('name', 'LIKE', "%{$searchName}%");
        }

        return $query->orderBy('created_at', 'DESC') // Sắp xếp theo thời gian mới nhất
            ->paginate($paginate);
    }

    public function getProductFiterAll($filters = [], $paginate = 12)
    {
        // Sắp xếp theo thời gian mới nhất
        $query = $this->model->with(['variants.productAttributes.attributeValue:id,value'])
            ->orderBy('created_at', 'DESC');

        // Lọc theo danh mục sản phẩm
        if (!empty($filters['category_id'])) {
            $categoryIds = explode(',', $filters['category_id']);
            $query->whereIn('category_id', $categoryIds);
        }


        // Lọc theo giá sau giảm giá
        if (!empty($filters['min_price']) || !empty($filters['max_price'])) {
            $min = $filters['min_price'];
            $max = $filters['max_price'] ?? PHP_INT_MAX;

            $query->where(function ($q) use ($min, $max) {
                // Sản phẩm đơn giản (simple)
                $q->where('product_type', 'simple')
                    ->whereRaw('CASE
                WHEN discount_percent IS NOT NULL AND
                     (discount_start IS NULL OR discount_start <= NOW()) AND
                     (discount_end IS NULL OR discount_end >= NOW())
                THEN price * (1 - discount_percent/100)
                ELSE price
              END BETWEEN ? AND ?', [$min, $max]);

                // Sản phẩm biến thể (variable)
                $q->orWhereHas('variants', function ($variantQuery) use ($min, $max) {
                    $variantQuery->whereRaw('CASE
                  WHEN discount_percent IS NOT NULL AND
                       (discount_start IS NULL OR discount_start <= NOW()) AND
                       (discount_end IS NULL OR discount_end >= NOW())
                  THEN price * (1 - discount_percent/100)
                  ELSE price
                END BETWEEN ? AND ?', [$min, $max]);
                });
            });
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
            'variants.productAttributes.attributeValue:id,value',
        ])->findOrFail(id: $id);
    }

    public function getProductById($id)
    {
        $products = $this->model->with([
            'category',
            'variants.productAttributes.attributeValue',
        ])->findOrFail($id);
        return $products;
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
        broadcast(new ProductCreated());
        return true;
    }

    /**
     * Cập nhật thông tin sản phẩm
     *
     * @param array $data Dữ liệu cập nhật
     * @param int $id ID của sản phẩm
     * @return \App\Models\Product
     */
    public function updateProduct($data, $id)
    {
        Log::info('🔵 Backend - Dữ liệu nhận được:', [$data]);
        Log::info('🔵 Backend - Product ID:', [$id]);
        // ✅ KIỂM TRA delete_variant_id
        if (isset($data['delete_variant_id'])) {
            Log::info('🔵 Backend - delete_variant_id có tồn tại: ' . json_encode($data['delete_variant_id']));
        } else {
            Log::info('🔵 Backend - delete_variant_id KHÔNG tồn tại trong request');
        }


        $isVariable = $data['product_type'] === 'variable';
        // Cập nhật sản phẩm
        $product = $this->model->findOrFail($id);
        $product->update([
            'name' => $data['name'],
            'price' => $isVariable ? null : $data['price'],
            'stock' => $isVariable ? null : $data['stock'],
            'discount_percent' => $data['discount_percent'] ?? null,
            'discount_start' => $data['discount_start'] ?? null,
            'discount_end' => $data['discount_end'] ?? null,
            'description' => $data['description'] ?? null,
            'product_type' => $data['product_type'],
            'status' => $data['status'] ?? $product->status,
            'category_id' => $data['category_id'] ?? null
        ]);

        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $imagePath = $data['image']->store('products', 'public');
            $product->update(['image' => $imagePath]);
        }

        if ($isVariable) {
            // Xóa variant nếu có yêu cầu xóa
            if (isset($data['delete_variant_id']) && is_array($data['delete_variant_id'])) {
                Log::info('🟢 Backend - Bắt đầu xóa variants:', [$data['delete_variant_id']]);
                foreach ($data['delete_variant_id'] as $variantId) {
                    Log::info('🟢 Backend - Đang xóa variant ID:', [$variantId]);
                    $variant = $product->variants()->find($variantId);
                    if ($variant) {
                        Log::info('🟢 Backend - Tìm thấy variant, đang xóa...');
                        // Xóa các product attributes của variant trước
                        $variant->productAttributes()->delete();
                        // Sau đó xóa variant
                        $variant->delete();
                        Log::info('🟢 Backend - Đã xóa variant thành công');
                    } else {
                        Log::warning('⚠️ Backend - Không tìm thấy variant ID:', [$variantId]);
                    }
                }
            } else {
                Log::info('🔵 Backend - Không có delete_variant_id hoặc không phải array');
            }

            // Nếu không có variants trong request, xóa tất cả variants hiện có
            if (empty($data['variants'])) {
                $product->variants()->each(function ($variant) {
                    $variant->productAttributes()->delete();
                    $variant->delete();
                });
            } else {
                // Cập nhật hoặc tạo mới biến thể cho sản phẩm
                foreach ($data['variants'] as $variantData) {
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

                            // Cập nhật thuộc tính của biến thể
                            if (!empty($variantData['attributes'])) {
                                foreach ($variantData['attributes'] as $attributeData) {
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

                        // Thêm thuộc tính cho biến thể mới
                        if (!empty($variantData['attributes'])) {
                            foreach ($variantData['attributes'] as $attributeData) {
                                $variant->productAttributes()->create([
                                    'attribute_id' => $attributeData['attribute_id'],
                                    'attribute_value_id' => $attributeData['attribute_value_id'],
                                ]);
                            }
                        }
                    }
                }
            }
        }
        broadcast(new ProductUpdate());
        return $product->fresh();
    }

    /**
     * Cập nhật trạng thái sản phẩm
     *
     * @param int $id ID của sản phẩm
     * @param string $status Trạng thái mới ('active' hoặc 'inactive')
     * @return \App\Models\Product
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function updateProductStatus($id, $status)
    {
        // Kiểm tra trạng thái hợp lệ
        if (!in_array($status, ['active', 'inactive'])) {
            throw new \InvalidArgumentException("Trạng thái không hợp lệ. Chỉ chấp nhận 'active' hoặc 'inactive'.");
        }

        // Tìm sản phẩm theo ID
        $product = $this->model->findOrFail($id);

        // Cập nhật trạng thái
        $product->update([
            'status' => $status
        ]);

        return $product->fresh();
    }

    public function getProductRandom($limit = 4)
    {
        return $this->model->with([
            'variants.productAttributes.attributeValue:id,value',
        ])
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }
    public function getBestSellingOrder($limit = 8)
    {
        $topProductIds = OrderItem::join('orders',  'order_items.order_id',  '=', 'orders.id')
            ->where('orders.status', 6)                          // đơn hàng đã hoàn tất
            ->groupBy('order_items.product_id')
            ->select('order_items.product_id', DB::raw('SUM(order_items.quantity) AS total_quantity'))
            ->orderByDesc('total_quantity')
            ->limit($limit)
            ->pluck('order_items.product_id');

        $products = Product::with([
            // Giống đoạn bạn đang dùng:
            'variants.productAttributes.attributeValue:id,value'
        ])
            ->whereIn('id', $topProductIds)                         // Chỉ các SP bán chạy
            ->orderByRaw('FIELD(id,' . $topProductIds->implode(',') . ')') // Giữ đúng thứ tự “bán chạy nhất”
            ->get();
        return $products;
    }
    public function getProductNew($paginate = 8)
    {
        return $this->model->with([
            'variants.productAttributes.attributeValue:id,value',
        ])
            ->orderBy('created_at', 'DESC')
            ->latest() // Sắp xếp theo thời gian mới nhất
            ->paginate($paginate);
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
