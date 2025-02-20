<?php

namespace App\Services\Product;

use App\Models\AttributeValue;
use App\Models\Product;
use App\Services\BaseService;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Service class for handling Product operations
 * Lớp Service xử lý các thao tác liên quan đến sản phẩm
 */
class ProductService extends BaseService
{
    /**
     * Constructor
     * Khởi tạo service với model Product
     * 
     * @param Product $product The Product model instance / Instance của model Product
     */
    public function __construct(Product $product)
    {
        parent::__construct($product);
    }

    /**
     * Process additional data after product creation
     * Xử lý dữ liệu bổ sung sau khi tạo sản phẩm
     * 
     * @param Product $product The created product / Sản phẩm đã được tạo
     * @param array $data Original data used to create the product / Dữ liệu gốc được sử dụng để tạo sản phẩm
     */
    protected function afterCreate(Model $product, array $data): void
    {
        if ($data['product_type'] === 'variable' && isset($data['variants'])) {
            $this->createVariants($product, $data['variants']);
        }
    }

    /**
     * Process additional data after product update
     * Xử lý dữ liệu bổ sung sau khi cập nhật sản phẩm
     * 
     * @param Product $product The updated product / Sản phẩm đã được cập nhật
     * @param array $data Original data used to update the product / Dữ liệu gốc được sử dụng để cập nhật sản phẩm
     */
    protected function afterUpdate(Model $product, array $data): void
    {
        if ($data['product_type'] === 'variable' && isset($data['variants'])) {
            $this->updateVariants($product, $data['variants']);
        }
    }

    /**
     * Apply filters to the query
     * Áp dụng các bộ lọc vào truy vấn
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query The query builder instance / Instance của query builder
     * @param array $filters Array of filter parameters / Mảng các tham số lọc
     */
    protected function applyFilters($query, array $filters): void
    {
        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('sku', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (isset($filters['product_type'])) {
            $query->where('product_type', $filters['product_type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }
    }

    /**
     * Apply default ordering to the query
     * Áp dụng sắp xếp mặc định vào truy vấn
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query The query builder instance / Instance của query builder
     */
    protected function defaultOrder($query): void
    {
        $query->orderBy('created_at', 'desc');
    }

    /**
     * Get all products with their variants and attributes
     * Lấy tất cả sản phẩm với các biến thể và thuộc tính
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getProductAll()
    {
        return $this->getAll([], [
            'category',
            'variants',
            'variants.productAttributes.attributeValue:id,value'
        ]);
    }

    /**
     * Get a specific product with its variants and attributes
     * Lấy một sản phẩm cụ thể với các biến thể và thuộc tính
     * 
     * @param int $id Product ID / ID của sản phẩm
     * @return Product
     */
    public function getProduct($id)
    {
        return $this->find($id, [
            'category',
            'variants',
            'variants.productAttributes.attributeValue:id,value'
        ]);
    }

    /**
     * Create variants for a variable product
     * Tạo các biến thể cho sản phẩm có nhiều phiên bản
     * 
     * @param Product $product The product to create variants for / Sản phẩm cần tạo biến thể
     * @param array $variants Array of variant data / Mảng dữ liệu biến thể
     * @throws Exception If variant creation fails / Nếu tạo biến thể thất bại
     */
    protected function createVariants(Product $product, array $variants): void
    {
        // Use transaction to ensure data consistency
        // Sử dụng transaction để đảm bảo tính nhất quán của dữ liệu
        DB::beginTransaction();
        try {
            foreach ($variants as $variantData) {
                // Create variant with all price fields
                $variant = $product->variants()->create([
                    'sku' => $variantData['sku'],
                    'regular_price' => $variantData['regular_price'],
                    'sale_price' => $variantData['sale_price'] ?? null,
                    'stock' => $variantData['stock'],
                    'image' => $variantData['image'] ?? null
                ]);

                // Create variant attributes in batch
                if (isset($variantData['attributes']) && is_array($variantData['attributes'])) {
                    $attributeRecords = array_map(function ($attr) use ($variant) {
                        return [
                            'variant_id' => $variant->id,
                            'attribute_id' => $attr['attribute_id'],
                            'attribute_value_id' => $attr['attribute_value_id'],
                            'created_at' => now(),
                            'updated_at' => now()
                        ];
                    }, $variantData['attributes']);

                    // Batch insert attributes for better performance
                    DB::table('product_attributes')->insert($attributeRecords);
                }
            }
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update variants for a variable product
     * Cập nhật các biến thể cho sản phẩm có nhiều phiên bản
     * 
     * @param Product $product The product to update variants for / Sản phẩm cần cập nhật biến thể
     * @param array $variants Array of variant data / Mảng dữ liệu biến thể
     * @throws Exception If variant update fails / Nếu cập nhật biến thể thất bại
     */
    protected function updateVariants(Product $product, array $variants): void
    {
        DB::beginTransaction();
        try {
            foreach ($variants as $variantData) {
                if (isset($variantData['id'])) {
                    // Update existing variant
                    $variant = $product->variants()->find($variantData['id']);
                    if ($variant) {
                        // Update variant details
                        $variant->update([
                            'sku' => $variantData['sku'],
                            'regular_price' => $variantData['regular_price'],
                            'sale_price' => $variantData['sale_price'] ?? null,
                            'stock' => $variantData['stock'],
                            'image' => $variantData['image'] ?? $variant->image
                        ]);

                        // Update variant attributes if provided
                        if (!empty($variantData['attributes'])) {
                            // Delete old attributes
                            $variant->productAttributes()->delete();

                            // Create new attributes in batch
                            $attributeRecords = array_map(function ($attr) use ($variant) {
                                return [
                                    'variant_id' => $variant->id,
                                    'attribute_id' => $attr['attribute_id'],
                                    'attribute_value_id' => $attr['attribute_value_id'],
                                    'created_at' => now(),
                                    'updated_at' => now()
                                ];
                            }, $variantData['attributes']);

                            // Batch insert new attributes
                            DB::table('product_attributes')->insert($attributeRecords);
                        }
                    } else {
                        throw new Exception("Variant not found: {$variantData['id']}");
                    }
                } else {
                    // Create new variant
                    $this->createVariants($product, [$variantData]);
                }
            }
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Generate and validate variant combinations from selected attributes
     * Tạo và xác thực các tổ hợp biến thể từ thuộc tính được chọn
     * 
     * @param array $selectedValues Array of selected attribute values / Mảng giá trị thuộc tính được chọn
     * @param float $defaultPrice Default regular price / Giá mặc định
     * @param int $defaultStock Default stock quantity / Số lượng tồn kho mặc định
     * @param array $customVariants Custom variant data (optional) / Dữ liệu tùy chỉnh cho từng biến thể (tùy chọn)
     * @return array Array of valid variant combinations / Mảng các tổ hợp biến thể hợp lệ
     * @throws Exception If invalid combinations found / Nếu tìm thấy tổ hợp không hợp lệ
     */
    public function generateVariantCombinations(
        array $selectedValues,
        float $defaultPrice,
        int $defaultStock,
        array $customVariants = []
    ): array {
        $attributeGroups = [];

        // Group attribute values by attribute
        // Nhóm các giá trị theo thuộc tính
        foreach ($selectedValues as $value) {
            $attributeId = $value['attribute_id'];
            if (!isset($attributeGroups[$attributeId])) {
                $attributeGroups[$attributeId] = [];
            }
            $attributeGroups[$attributeId][] = [
                'attribute_id' => $attributeId,
                'attribute_value_id' => $value['id'],
                'value' => $value['value'] // For SKU generation
            ];
        }

        // Generate all possible combinations using Cartesian product
        // Tạo tất cả các tổ hợp có thể bằng tích Descartes
        $combinations = $this->cartesianProduct(array_values($attributeGroups));

        // Validate combinations before creating variants
        // Xác thực các tổ hợp trước khi tạo biến thể
        $this->validateCombinations($combinations);

        // Create variant data with default or custom values
        // Tạo dữ liệu biến thể với giá trị mặc định hoặc tùy chỉnh
        return array_map(function ($combo) use ($defaultPrice, $defaultStock, $customVariants) {
            // Generate a unique key for the combination to match with custom data
            // Tạo khóa duy nhất cho tổ hợp để khớp với dữ liệu tùy chỉnh
            $key = $this->generateCombinationKey($combo);

            // Get custom data if available
            // Lấy dữ liệu tùy chỉnh nếu có
            $customData = $customVariants[$key] ?? [];

            return [
                'sku' => $this->generateSku($combo),
                'regular_price' => $customData['regular_price'] ?? $defaultPrice,
                'sale_price' => $customData['sale_price'] ?? null,
                'stock' => $customData['stock'] ?? $defaultStock,
                'image' => $customData['image'] ?? null,
                'attributes' => $combo
            ];
        }, $combinations);
    }

    /**
     * Generate unique key for attribute combination
     * Tạo khóa duy nhất cho tổ hợp thuộc tính
     * 
     * @param array $combo Attribute combination / Tổ hợp thuộc tính
     * @return string Unique key / Khóa duy nhất
     */
    private function generateCombinationKey(array $combo): string
    {
        // Sort by attribute_id to ensure consistent key generation
        // Sắp xếp theo attribute_id để đảm bảo tạo khóa nhất quán
        usort($combo, function ($a, $b) {
            return $a['attribute_id'] <=> $b['attribute_id'];
        });

        return implode(':', array_map(function ($attr) {
            return $attr['attribute_id'] . '-' . $attr['attribute_value_id'];
        }, $combo));
    }

    /**
     * Validate combinations for duplicates and invalid attributes
     * Xác thực các tổ hợp về trùng lặp và thuộc tính không hợp lệ
     * 
     * @param array $combinations Array of combinations to validate / Mảng các tổ hợp cần xác thực
     * @throws Exception If validation fails / Nếu xác thực thất bại
     */
    private function validateCombinations(array $combinations): void
    {
        $seenCombinations = [];

        foreach ($combinations as $combo) {
            // Sort by attribute_id to ensure consistent key generation
            // Sắp xếp theo attribute_id để đảm bảo tạo khóa nhất quán
            usort($combo, function ($a, $b) {
                return $a['attribute_id'] <=> $b['attribute_id'];
            });

            // Generate unique key for the combination
            // Tạo khóa duy nhất cho tổ hợp
            $key = implode(':', array_map(function ($attr) {
                return $attr['attribute_id'] . '-' . $attr['attribute_value_id'];
            }, $combo));

            // Check for duplicates
            // Kiểm tra trùng lặp
            if (isset($seenCombinations[$key])) {
                throw new Exception("Duplicate attribute combination found");
            }
            $seenCombinations[$key] = true;

            // Validate each attribute value exists and belongs to the correct attribute
            // Xác thực mỗi giá trị thuộc tính tồn tại và thuộc về thuộc tính đúng
            foreach ($combo as $attr) {
                $exists = AttributeValue::where([
                    'id' => $attr['attribute_value_id'],
                    'attribute_id' => $attr['attribute_id']
                ])->exists();

                if (!$exists) {
                    throw new Exception("Invalid attribute value: {$attr['value']} for attribute ID: {$attr['attribute_id']}");
                }
            }
        }
    }

    /**
     * Generate unique SKU from attributes
     * Tạo mã SKU duy nhất từ thuộc tính
     * 
     * @param array $attributes Attribute combination / Tổ hợp thuộc tính
     * @return string Generated SKU / Mã SKU được tạo
     */
    private function generateSku(array $attributes): string
    {
        // Sort by attribute_id for consistent SKU generation
        // Sắp xếp theo attribute_id để tạo SKU nhất quán
        usort($attributes, function ($a, $b) {
            return $a['attribute_id'] <=> $b['attribute_id'];
        });

        $parts = array_map(function ($attr) {
            return substr($attr['value'], 0, 3);
        }, $attributes);

        $baseSku = strtoupper(implode('-', $parts));
        $uniqueSku = $baseSku . '-' . uniqid();

        // Ensure SKU is unique
        // Đảm bảo SKU là duy nhất
        while ($this->model->variants()->where('sku', $uniqueSku)->exists()) {
            $uniqueSku = $baseSku . '-' . uniqid();
        }

        return $uniqueSku;
    }

    /**
     * Generate Cartesian product of attribute arrays
     * Tạo tích Descartes của các mảng thuộc tính
     * 
     * @param array $arrays Arrays to combine / Các mảng cần kết hợp
     * @return array Combined arrays / Các mảng đã kết hợp
     */
    private function cartesianProduct(array $arrays): array
    {
        $result = [[]];
        foreach ($arrays as $property => $values) {
            $append = [];
            foreach ($result as $product) {
                foreach ($values as $item) {
                    $product[] = $item;
                    $append[] = $product;
                }
            }
            $result = $append;
        }
        return $result;
    }

    /**
     * Update bulk prices for variants
     * Cập nhật giá hàng loạt cho các biến thể
     * 
     * @param Product $product Product to update / Sản phẩm cần cập nhật
     * @param float $regularPrice New regular price / Giá thường mới
     * @param float|null $salePrice Optional sale price / Giá khuyến mãi (tùy chọn)
     */
    public function updateBulkPrices(Product $product, float $regularPrice, ?float $salePrice = null): void
    {
        $product->variants()->update([
            'regular_price' => $regularPrice,
            'sale_price' => $salePrice
        ]);
    }

    /**
     * Update bulk stock for variants
     * Cập nhật số lượng tồn kho hàng loạt cho các biến thể
     * 
     * @param Product $product Product to update / Sản phẩm cần cập nhật
     * @param int $stock New stock quantity / Số lượng tồn kho mới
     */
    public function updateBulkStock(Product $product, int $stock): void
    {
        $product->variants()->update(['stock' => $stock]);
    }
}
