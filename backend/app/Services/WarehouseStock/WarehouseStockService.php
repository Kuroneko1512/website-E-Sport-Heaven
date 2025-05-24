<?php

namespace App\Services\WarehouseStock;

use App\Models\Order;
use Exception;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\ProductVariant;
use App\Models\WarehouseStock;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class WarehouseStockService
{
    protected $model;

    public function __construct(WarehouseStock $warehouseStock)
    {
        $this->model = $warehouseStock;
    }

    /**
     * Lấy danh sách tồn kho có phân trang và lọc
     *
     * @param array $filters Các bộ lọc
     * @param int $perPage Số lượng kết quả mỗi trang
     * @param string $sortBy Trường sắp xếp
     * @param string $sortOrder Thứ tự sắp xếp
     * @return LengthAwarePaginator
     */
    public function getPaginatedStocks($filters = [], $perPage = 15, $sortBy = 'created_at', $sortOrder = 'desc')
    {
        try {
            $query = $this->model->query();

            // Lọc theo kho
            if (isset($filters['warehouse_id']) && !empty($filters['warehouse_id'])) {
                $query->inWarehouse($filters['warehouse_id']);
            }

            // Lọc theo sản phẩm
            if (isset($filters['product_id']) && !empty($filters['product_id'])) {
                $query->ofProduct($filters['product_id']);
            }

            // Lọc theo biến thể
            if (isset($filters['product_variant_id']) && !empty($filters['product_variant_id'])) {
                $query->ofVariant($filters['product_variant_id']);
            }

            // Lọc theo tình trạng mặt hàng
            if (isset($filters['item_condition']) && !empty($filters['item_condition'])) {
                $query->withCondition($filters['item_condition']);
            }

            // Lọc theo trạng thái
            if (isset($filters['is_active']) && $filters['is_active'] !== null) {
                if ($filters['is_active']) {
                    $query->active();
                } else {
                    $query->where('is_active', false);
                }
            }

            // Lọc tồn kho thấp
            if (isset($filters['low_stock']) && $filters['low_stock']) {
                $query->lowStock();
            }

            // Tìm kiếm theo SKU
            if (isset($filters['sku']) && !empty($filters['sku'])) {
                $query->searchBySku($filters['sku']);
            }

            // Tìm kiếm theo vị trí
            if (isset($filters['location']) && !empty($filters['location'])) {
                $query->where('location', 'like', "%{$filters['location']}%");
            }

            // Sắp xếp
            $query->orderBy($sortBy, $sortOrder);

            // Phân trang với eager loading
            return $query->with(['warehouse', 'product', 'productVariant'])->paginate($perPage);
        } catch (Exception $e) {
            Log::error('Lỗi khi lấy danh sách tồn kho: ' . $e->getMessage(), [
                'filters' => $filters,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi lấy danh sách tồn kho: " . $e->getMessage());
        }
    }

    /**
     * Lấy thông tin tồn kho theo ID
     *
     * @param int $id ID tồn kho
     * @return WarehouseStock
     */
    public function getStockById($id)
    {
        try {
            // Kiểm tra cache trước
            $cacheKey = "warehouse_stock.{$id}";

            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            // Nếu không có trong cache, truy vấn database
            $stock = $this->model->with(['warehouse', 'product', 'productVariant'])->findOrFail($id);

            // Lưu vào cache trong 10 phút
            Cache::put($cacheKey, $stock, 600);

            return $stock;
        } catch (Exception $e) {
            Log::error('Không tìm thấy thông tin tồn kho: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Không tìm thấy thông tin tồn kho: " . $e->getMessage());
        }
    }

    /**
     * Lấy thông tin tồn kho theo kho và sản phẩm
     *
     * @param int $warehouseId ID kho
     * @param int $productId ID sản phẩm
     * @param int|null $variantId ID biến thể (nếu có)
     * @param int $condition Tình trạng mặt hàng
     * @return WarehouseStock|null
     */
    public function getStockByProduct($warehouseId, $productId, $variantId = null, $condition = WarehouseStock::CONDITION_NEW)
    {
        try {
            // Tạo cache key
            $cacheKey = "warehouse_stock.w{$warehouseId}.p{$productId}";
            if ($variantId) {
                $cacheKey .= ".v{$variantId}";
            }
            $cacheKey .= ".c{$condition}";

            // Kiểm tra cache
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            // Xây dựng query
            $query = $this->model->where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->where('item_condition', $condition);

            if ($variantId) {
                $query->where('product_variant_id', $variantId);
            } else {
                $query->whereNull('product_variant_id');
            }

            $stock = $query->first();

            // Lưu vào cache trong 10 phút
            if ($stock) {
                Cache::put($cacheKey, $stock, 600);
            }

            return $stock;
        } catch (Exception $e) {
            Log::error('Lỗi khi lấy thông tin tồn kho theo sản phẩm: ' . $e->getMessage(), [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'variant_id' => $variantId,
                'condition' => $condition,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi lấy thông tin tồn kho theo sản phẩm: " . $e->getMessage());
        }
    }

    /**
     * Lấy danh sách sản phẩm có tồn kho thấp
     *
     * @param int|null $warehouseId ID kho (nếu null thì lấy tất cả các kho)
     * @param int $limit Số lượng kết quả tối đa
     * @return Collection
     */
    public function getLowStockItems($warehouseId = null, $limit = 50)
    {
        try {
            $cacheKey = "warehouse_stock.low_stock";
            if ($warehouseId) {
                $cacheKey .= ".w{$warehouseId}";
            }
            $cacheKey .= ".l{$limit}";

            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $query = $this->model->lowStock();

            if ($warehouseId) {
                $query->inWarehouse($warehouseId);
            }

            $lowStockItems = $query->with(['warehouse', 'product', 'productVariant'])
                ->orderBy('quantity')
                ->limit($limit)
                ->get();

            Cache::put($cacheKey, $lowStockItems, 300); // Cache trong 5 phút

            return $lowStockItems;
        } catch (Exception $e) {
            Log::error('Lỗi khi lấy danh sách sản phẩm tồn kho thấp: ' . $e->getMessage(), [
                'warehouse_id' => $warehouseId,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi lấy danh sách sản phẩm tồn kho thấp: " . $e->getMessage());
        }
    }

    /**
     * Lấy danh sách tồn kho theo kho
     *
     * @param int $warehouseId ID kho
     * @param array $filters Các bộ lọc
     * @param int $perPage Số lượng kết quả mỗi trang
     * @return LengthAwarePaginator
     */
    public function getStocksByWarehouse($warehouseId, $filters = [], $perPage = 15)
    {
        $filters['warehouse_id'] = $warehouseId;
        return $this->getPaginatedStocks($filters, $perPage);
    }

    /**
     * Lấy danh sách tồn kho theo sản phẩm
     *
     * @param int $productId ID sản phẩm
     * @param array $filters Các bộ lọc
     * @param int $perPage Số lượng kết quả mỗi trang
     * @return LengthAwarePaginator
     */
    public function getStocksByProduct($productId, $filters = [], $perPage = 15)
    {
        $filters['product_id'] = $productId;
        return $this->getPaginatedStocks($filters, $perPage);
    }

    /**
     * Kiểm tra tồn kho có đủ không
     *
     * @param int $warehouseId ID kho
     * @param int $productId ID sản phẩm
     * @param int $quantity Số lượng cần kiểm tra
     * @param int|null $variantId ID biến thể (nếu có)
     * @param int $condition Tình trạng mặt hàng
     * @return bool
     */
    public function checkStockAvailability($warehouseId, $productId, $quantity, $variantId = null, $condition = WarehouseStock::CONDITION_NEW)
    {
        try {
            $stock = $this->getStockByProduct($warehouseId, $productId, $variantId, $condition);

            if (!$stock) {
                return false;
            }

            return ($stock->quantity - $stock->allocated_quantity) >= $quantity;
        } catch (Exception $e) {
            Log::error('Lỗi khi kiểm tra tồn kho: ' . $e->getMessage(), [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity' => $quantity,
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Xóa cache liên quan đến tồn kho
     *
     * @param int|null $warehouseId ID kho
     * @param int|null $productId ID sản phẩm
     * @param int|null $variantId ID biến thể
     * @return void
     */
    public function clearStockCache($warehouseId = null, $productId = null, $variantId = null)
    {
        // Xóa cache cho một sản phẩm cụ thể
        if ($warehouseId && $productId) {
            $cacheKey = "warehouse_stock.w{$warehouseId}.p{$productId}";
            if ($variantId) {
                $cacheKey .= ".v{$variantId}";
                Cache::forget($cacheKey . ".c" . WarehouseStock::CONDITION_NEW);
                Cache::forget($cacheKey . ".c" . WarehouseStock::CONDITION_USED_GOOD);
                Cache::forget($cacheKey . ".c" . WarehouseStock::CONDITION_MINOR_DEFECT);
                Cache::forget($cacheKey . ".c" . WarehouseStock::CONDITION_DEFECTIVE);
            } else {
                // Xóa tất cả cache liên quan đến sản phẩm này
                foreach (
                    [
                        WarehouseStock::CONDITION_NEW,
                        WarehouseStock::CONDITION_USED_GOOD,
                        WarehouseStock::CONDITION_MINOR_DEFECT,
                        WarehouseStock::CONDITION_DEFECTIVE
                    ] as $condition
                ) {
                    Cache::forget($cacheKey . ".c{$condition}");
                }
            }
        }

        // Xóa cache cho một kho cụ thể
        if ($warehouseId) {
            Cache::forget("warehouse_stock.low_stock.w{$warehouseId}");
        }

        // Xóa cache cho tất cả các kho
        Cache::forget("warehouse_stock.low_stock");

        // Xóa cache cho sản phẩm
        if ($productId) {
            // Có thể thêm các cache key khác liên quan đến sản phẩm
        }
    }

    /**
     * Tạo hoặc cập nhật tồn kho
     *
     * @param array $data Dữ liệu tồn kho
     * @return WarehouseStock
     */
    public function createOrUpdateStock(array $data)
    {
        try {
            DB::beginTransaction();

            // Kiểm tra kho có tồn tại không
            $warehouse = Warehouse::findOrFail($data['warehouse_id']);
            if (!$warehouse->is_active) {
                throw new Exception("Kho không hoạt động, không thể thêm/cập nhật tồn kho.");
            }

            // Kiểm tra sản phẩm có tồn tại không
            $product = Product::findOrFail($data['product_id']);

            // Kiểm tra biến thể nếu có
            if (!empty($data['product_variant_id'])) {
                $variant = ProductVariant::findOrFail($data['product_variant_id']);
                // Kiểm tra biến thể có thuộc sản phẩm không
                if ($variant->product_id != $data['product_id']) {
                    throw new Exception("Biến thể không thuộc sản phẩm này.");
                }
                $data['product_sku'] = $product->sku;
                $data['variant_sku'] = $variant->sku;
            } else {
                $data['product_sku'] = $product->sku;
                $data['variant_sku'] = null;
            }

            // Tìm tồn kho hiện có hoặc tạo mới
            $stock = $this->getStockByProduct(
                $data['warehouse_id'],
                $data['product_id'],
                $data['product_variant_id'] ?? null,
                $data['item_condition'] ?? WarehouseStock::CONDITION_NEW
            );

            if ($stock) {
                // Cập nhật tồn kho hiện có
                $stock->update($data);
            } else {
                // Tạo mới tồn kho
                $stock = $this->model->create($data);
            }

            // Xóa cache liên quan
            $this->clearStockCache($data['warehouse_id'], $data['product_id'], $data['product_variant_id'] ?? null);

            DB::commit();
            return $stock;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi tạo/cập nhật tồn kho: ' . $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi tạo/cập nhật tồn kho: " . $e->getMessage());
        }
    }

    /**
     * Tăng số lượng tồn kho
     *
     * @param int $warehouseId ID kho
     * @param int $productId ID sản phẩm
     * @param int $quantity Số lượng tăng
     * @param int|null $variantId ID biến thể (nếu có)
     * @param int $condition Tình trạng mặt hàng
     * @param string|null $notes Ghi chú
     * @return WarehouseStock
     */
    public function increaseStock($warehouseId, $productId, $quantity, $variantId = null, $condition = WarehouseStock::CONDITION_NEW, $notes = null)
    {
        try {
            DB::beginTransaction();

            // Tìm tồn kho hiện có hoặc tạo mới
            $stock = $this->getStockByProduct($warehouseId, $productId, $variantId, $condition);

            if (!$stock) {
                // Tạo mới tồn kho
                $stockData = [
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,
                    'product_variant_id' => $variantId,
                    'item_condition' => $condition,
                    'quantity' => $quantity
                ];

                // Lấy thông tin sản phẩm và biến thể để lưu SKU
                $product = Product::findOrFail($productId);
                $stockData['product_sku'] = $product->sku;

                if ($variantId) {
                    $variant = ProductVariant::findOrFail($variantId);
                    $stockData['variant_sku'] = $variant->sku;
                }

                $stock = $this->model->create($stockData);
            } else {
                // Tăng số lượng tồn kho hiện có
                $stock->quantity += $quantity;
                $stock->save();
            }

            // Đồng bộ với bảng sản phẩm
            $this->syncProductStock($productId, $variantId);

            // Xóa cache liên quan
            $this->clearStockCache($warehouseId, $productId, $variantId);

            // Ghi log
            Log::info('Tăng số lượng tồn kho', [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'notes' => $notes
            ]);

            DB::commit();
            return $stock;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi tăng số lượng tồn kho: ' . $e->getMessage(), [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi tăng số lượng tồn kho: " . $e->getMessage());
        }
    }

    /**
     * Giảm số lượng tồn kho
     *
     * @param int $warehouseId ID kho
     * @param int $productId ID sản phẩm
     * @param int $quantity Số lượng giảm
     * @param int|null $variantId ID biến thể (nếu có)
     * @param int $condition Tình trạng mặt hàng
     * @param string|null $notes Ghi chú
     * @return WarehouseStock
     */
    public function decreaseStock($warehouseId, $productId, $quantity, $variantId = null, $condition = WarehouseStock::CONDITION_NEW, $notes = null)
    {
        try {
            DB::beginTransaction();

            // Tìm tồn kho hiện có
            $stock = $this->getStockByProduct($warehouseId, $productId, $variantId, $condition);

            if (!$stock) {
                throw new Exception("Không tìm thấy tồn kho cho sản phẩm này.");
            }

            // Kiểm tra số lượng tồn kho khả dụng đủ không
            $availableQuantity = $stock->quantity - $stock->allocated_quantity;
            if ($availableQuantity < $quantity) {
                throw new Exception("Số lượng tồn kho khả dụng không đủ. Khả dụng: {$availableQuantity}, Yêu cầu: {$quantity}");
            }

            // Giảm số lượng tồn kho
            $stock->quantity -= $quantity;
            $stock->save();

            // Đồng bộ với bảng sản phẩm
            $this->syncProductStock($productId, $variantId);

            // Xóa cache liên quan
            $this->clearStockCache($warehouseId, $productId, $variantId);

            // Ghi log
            Log::info('Giảm số lượng tồn kho', [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'notes' => $notes
            ]);

            DB::commit();
            return $stock;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi giảm số lượng tồn kho: ' . $e->getMessage(), [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi giảm số lượng tồn kho: " . $e->getMessage());
        }
    }

    /**
     * Điều chỉnh số lượng tồn kho (kiểm kê)
     *
     * @param int $warehouseId ID kho
     * @param int $productId ID sản phẩm
     * @param int $newQuantity Số lượng mới
     * @param int|null $variantId ID biến thể (nếu có)
     * @param int $condition Tình trạng mặt hàng
     * @param string|null $notes Ghi chú
     * @return WarehouseStock
     */
    public function adjustStock($warehouseId, $productId, $newQuantity, $variantId = null, $condition = WarehouseStock::CONDITION_NEW, $notes = null)
    {
        try {
            DB::beginTransaction();

            // Tìm tồn kho hiện có hoặc tạo mới
            $stock = $this->getStockByProduct($warehouseId, $productId, $variantId, $condition);

            if (!$stock) {
                // Tạo mới tồn kho
                $stockData = [
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,
                    'product_variant_id' => $variantId,
                    'item_condition' => $condition,
                    'quantity' => $newQuantity
                ];

                // Lấy thông tin sản phẩm và biến thể để lưu SKU
                $product = Product::findOrFail($productId);
                $stockData['product_sku'] = $product->sku;

                if ($variantId) {
                    $variant = ProductVariant::findOrFail($variantId);
                    $stockData['variant_sku'] = $variant->sku;
                }

                $stock = $this->model->create($stockData);
            } else {
                // Lưu số lượng cũ để ghi log
                $oldQuantity = $stock->quantity;

                // Cập nhật số lượng tồn kho
                $stock->quantity = $newQuantity;
                $stock->save();

                // Ghi log điều chỉnh
                Log::info('Điều chỉnh số lượng tồn kho', [
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,
                    'product_variant_id' => $variantId,
                    'old_quantity' => $oldQuantity,
                    'new_quantity' => $newQuantity,
                    'difference' => $newQuantity - $oldQuantity,
                    'notes' => $notes
                ]);
            }

            // Đồng bộ với bảng sản phẩm
            $this->syncProductStock($productId, $variantId);

            // Xóa cache liên quan
            $this->clearStockCache($warehouseId, $productId, $variantId);

            DB::commit();
            return $stock;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi điều chỉnh số lượng tồn kho: ' . $e->getMessage(), [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'new_quantity' => $newQuantity,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi điều chỉnh số lượng tồn kho: " . $e->getMessage());
        }
    }

    /**
     * Chuyển tồn kho giữa các kho
     *
     * @param int $sourceWarehouseId ID kho nguồn
     * @param int $destinationWarehouseId ID kho đích
     * @param int $productId ID sản phẩm
     * @param int $quantity Số lượng chuyển
     * @param int|null $variantId ID biến thể (nếu có)
     * @param int $condition Tình trạng mặt hàng
     * @param string|null $notes Ghi chú
     * @return array Mảng chứa tồn kho nguồn và đích
     */
    public function transferStock($sourceWarehouseId, $destinationWarehouseId, $productId, $quantity, $variantId = null, $condition = WarehouseStock::CONDITION_NEW, $notes = null)
    {
        try {
            DB::beginTransaction();

            // Kiểm tra kho nguồn và kho đích có tồn tại và đang hoạt động không
            $sourceWarehouse = Warehouse::findOrFail($sourceWarehouseId);
            $destinationWarehouse = Warehouse::findOrFail($destinationWarehouseId);

            if (!$sourceWarehouse->is_active) {
                throw new Exception("Kho nguồn không hoạt động.");
            }

            if (!$destinationWarehouse->is_active) {
                throw new Exception("Kho đích không hoạt động.");
            }

            // Tìm tồn kho nguồn
            $sourceStock = $this->getStockByProduct($sourceWarehouseId, $productId, $variantId, $condition);
            if (!$sourceStock) {
                throw new Exception("Không tìm thấy tồn kho nguồn cho sản phẩm này.");
            }

            // Kiểm tra số lượng tồn kho khả dụng đủ không
            $availableQuantity = $sourceStock->quantity - $sourceStock->allocated_quantity;
            if ($availableQuantity < $quantity) {
                throw new Exception("Số lượng tồn kho khả dụng không đủ. Khả dụng: {$availableQuantity}, Yêu cầu: {$quantity}");
            }

            // Giảm số lượng ở kho nguồn
            $sourceStock->quantity -= $quantity;
            $sourceStock->save();

            // Tìm hoặc tạo tồn kho đích
            $destinationStock = $this->getStockByProduct($destinationWarehouseId, $productId, $variantId, $condition);
            if (!$destinationStock) {
                // Tạo mới tồn kho đích
                $stockData = [
                    'warehouse_id' => $destinationWarehouseId,
                    'product_id' => $productId,
                    'product_variant_id' => $variantId,
                    'item_condition' => $condition,
                    'quantity' => $quantity
                ];

                // Lấy thông tin sản phẩm và biến thể để lưu SKU
                $product = Product::findOrFail($productId);
                $stockData['product_sku'] = $product->sku;

                if ($variantId) {
                    $variant = ProductVariant::findOrFail($variantId);
                    $stockData['variant_sku'] = $variant->sku;
                }

                $destinationStock = $this->model->create($stockData);
            } else {
                // Tăng số lượng tồn kho đích
                $destinationStock->quantity += $quantity;
                $destinationStock->save();
            }

            // Đồng bộ với bảng sản phẩm
            $this->syncProductStock($productId, $variantId);

            // Xóa cache liên quan
            $this->clearStockCache($sourceWarehouseId, $productId, $variantId);
            $this->clearStockCache($destinationWarehouseId, $productId, $variantId);

            // Ghi log
            Log::info('Chuyển tồn kho giữa các kho', [
                'source_warehouse_id' => $sourceWarehouseId,
                'destination_warehouse_id' => $destinationWarehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'notes' => $notes
            ]);

            DB::commit();
            return [
                'source_stock' => $sourceStock,
                'destination_stock' => $destinationStock
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi chuyển tồn kho giữa các kho: ' . $e->getMessage(), [
                'source_warehouse_id' => $sourceWarehouseId,
                'destination_warehouse_id' => $destinationWarehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi chuyển tồn kho giữa các kho: " . $e->getMessage());
        }
    }

    /**
     * Đồng bộ số lượng từ kho sang bảng sản phẩm
     *
     * @param int $productId ID sản phẩm
     * @param int|null $variantId ID biến thể (nếu có)
     * @param bool $forceUpdate Buộc cập nhật ngay cả khi không thay đổi
     * @return bool
     */
    public function syncProductStock($productId, $variantId = null, $forceUpdate = false)
    {
        try {
            DB::beginTransaction();

            if ($variantId) {
                // Đồng bộ tồn kho cho biến thể
                $variant = ProductVariant::findOrFail($variantId);

                // Tính tổng tồn kho mới cho biến thể
                $newVariantStock = $this->model
                    ->where('product_id', $productId)
                    ->where('product_variant_id', $variantId)
                    ->where('item_condition', WarehouseStock::CONDITION_NEW) // Chỉ tính sản phẩm mới
                    ->where('is_active', true) // Chỉ tính kho đang hoạt động
                    ->sum(DB::raw('quantity - allocated_quantity'));

                // Chỉ cập nhật nếu có thay đổi hoặc buộc cập nhật
                if ($forceUpdate || $variant->stock != $newVariantStock) {
                    $variant->stock = $newVariantStock;
                    $variant->save();

                    Log::info('Đã đồng bộ tồn kho biến thể', [
                        'product_id' => $productId,
                        'variant_id' => $variantId,
                        'new_stock' => $newVariantStock
                    ]);

                    // Đồng bộ tổng tồn kho cho sản phẩm (tổng của tất cả biến thể)
                    $product = Product::findOrFail($productId);
                    $totalProductStock = ProductVariant::where('product_id', $productId)->sum('stock');

                    if ($forceUpdate || $product->stock != $totalProductStock) {
                        $product->stock = $totalProductStock;
                        $product->save();

                        Log::info('Đã đồng bộ tổng tồn kho sản phẩm (từ biến thể)', [
                            'product_id' => $productId,
                            'new_stock' => $totalProductStock
                        ]);
                    }
                }
            } else {
                // Đồng bộ tồn kho cho sản phẩm đơn giản
                $product = Product::findOrFail($productId);

                // Tính tổng tồn kho mới cho sản phẩm
                $newProductStock = $this->model
                    ->where('product_id', $productId)
                    ->whereNull('product_variant_id')
                    ->where('item_condition', WarehouseStock::CONDITION_NEW) // Chỉ tính sản phẩm mới
                    ->where('is_active', true) // Chỉ tính kho đang hoạt động
                    ->sum(DB::raw('quantity - allocated_quantity'));

                // Chỉ cập nhật nếu có thay đổi hoặc buộc cập nhật
                if ($forceUpdate || $product->stock != $newProductStock) {
                    $product->stock = $newProductStock;
                    $product->save();

                    Log::info('Đã đồng bộ tồn kho sản phẩm', [
                        'product_id' => $productId,
                        'new_stock' => $newProductStock
                    ]);
                }
            }

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi đồng bộ tồn kho: ' . $e->getMessage(), [
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi đồng bộ tồn kho: " . $e->getMessage());
        }
    }

    /**
     * Cập nhật vị trí trong kho
     *
     * @param int $stockId ID tồn kho
     * @param string $location Vị trí mới
     * @return WarehouseStock
     */
    public function updateStockLocation($stockId, $location)
    {
        try {
            $stock = $this->getStockById($stockId);
            $stock->location = $location;
            $stock->save();

            // Xóa cache
            $this->clearStockCache($stock->warehouse_id, $stock->product_id, $stock->product_variant_id);

            return $stock;
        } catch (Exception $e) {
            Log::error('Lỗi khi cập nhật vị trí tồn kho: ' . $e->getMessage(), [
                'stock_id' => $stockId,
                'location' => $location,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi cập nhật vị trí tồn kho: " . $e->getMessage());
        }
    }

    /**
     * Cập nhật mức tồn kho tối thiểu và tối đa
     *
     * @param int $stockId ID tồn kho
     * @param int $minQuantity Số lượng tối thiểu
     * @param int|null $maxQuantity Số lượng tối đa
     * @return WarehouseStock
     */
    public function updateStockLimits($stockId, $minQuantity, $maxQuantity = null)
    {
        try {
            $stock = $this->getStockById($stockId);
            $stock->min_quantity = $minQuantity;
            $stock->max_quantity = $maxQuantity;
            $stock->save();

            // Xóa cache
            $this->clearStockCache($stock->warehouse_id, $stock->product_id, $stock->product_variant_id);

            return $stock;
        } catch (Exception $e) {
            Log::error('Lỗi khi cập nhật giới hạn tồn kho: ' . $e->getMessage(), [
                'stock_id' => $stockId,
                'min_quantity' => $minQuantity,
                'max_quantity' => $maxQuantity,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi cập nhật giới hạn tồn kho: " . $e->getMessage());
        }
    }

    /**
     * Cập nhật trạng thái hoạt động
     *
     * @param int $stockId ID tồn kho
     * @param bool $isActive Trạng thái hoạt động
     * @return WarehouseStock
     */
    public function updateStockStatus($stockId, $isActive)
    {
        try {
            $stock = $this->getStockById($stockId);
            $stock->is_active = $isActive;
            $stock->save();

            // Xóa cache
            $this->clearStockCache($stock->warehouse_id, $stock->product_id, $stock->product_variant_id);

            // Đồng bộ với bảng sản phẩm nếu trạng thái thay đổi
            $this->syncProductStock($stock->product_id, $stock->product_variant_id);

            return $stock;
        } catch (Exception $e) {
            Log::error('Lỗi khi cập nhật trạng thái tồn kho: ' . $e->getMessage(), [
                'stock_id' => $stockId,
                'is_active' => $isActive,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi cập nhật trạng thái tồn kho: " . $e->getMessage());
        }
    }

    /**
     * Cập nhật tình trạng mặt hàng
     *
     * @param int $stockId ID tồn kho
     * @param int $condition Tình trạng mặt hàng mới
     * @return WarehouseStock
     */
    public function updateItemCondition($stockId, $condition)
    {
        try {
            $stock = $this->getStockById($stockId);

            // Lưu tình trạng cũ để xử lý đồng bộ
            $oldCondition = $stock->item_condition;

            // Cập nhật tình trạng mới
            $stock->item_condition = $condition;
            $stock->save();

            // Xóa cache
            $this->clearStockCache($stock->warehouse_id, $stock->product_id, $stock->product_variant_id);

            // Đồng bộ với bảng sản phẩm nếu thay đổi từ/đến tình trạng mới
            if ($oldCondition == WarehouseStock::CONDITION_NEW || $condition == WarehouseStock::CONDITION_NEW) {
                $this->syncProductStock($stock->product_id, $stock->product_variant_id);
            }

            return $stock;
        } catch (Exception $e) {
            Log::error('Lỗi khi cập nhật tình trạng mặt hàng: ' . $e->getMessage(), [
                'stock_id' => $stockId,
                'condition' => $condition,
                'trace' => $e->getTraceAsString()
            ]);
            throw new Exception("Lỗi khi cập nhật tình trạng mặt hàng: " . $e->getMessage());
        }
    }

    /**
     * Phân bổ số lượng sản phẩm cho đơn hàng mới (không giảm số lượng thực tế)
     *
     * @param int $warehouseId ID kho
     * @param int $productId ID sản phẩm
     * @param int $quantity Số lượng cần phân bổ
     * @param int|null $variantId ID biến thể (nếu có)
     * @param string|null $notes Ghi chú
     * @param string|null $orderCode Mã đơn hàng
     * @return bool
     */
    public function allocateStock(
        $warehouseId,
        $productId,
        $quantity,
        $variantId = null,
        $notes = null,
        $orderCode = null
    ) {
        try {
            DB::beginTransaction();

            // Tìm tồn kho hiện có
            $stock = WarehouseStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->where(function ($query) use ($variantId) {
                    if ($variantId) {
                        $query->where('product_variant_id', $variantId);
                    } else {
                        $query->whereNull('product_variant_id');
                    }
                })
                ->first();

            if (!$stock) {
                throw new Exception("Không tìm thấy tồn kho cho sản phẩm này.");
            }

            // Tính toán số lượng khả dụng
            $availableQuantity = $stock->quantity - $stock->allocated_quantity;

            // Kiểm tra số lượng tồn kho đủ không
            if ($availableQuantity < $quantity) {
                throw new Exception("Số lượng tồn kho không đủ. Khả dụng: {$availableQuantity}, Yêu cầu: {$quantity}");
            }

            // Tăng số lượng đã phân bổ
            $stock->allocated_quantity += $quantity;
            $stock->save();

            // Đồng bộ với bảng sản phẩm
            $this->syncProductStock($productId, $variantId);

            // Ghi log
            Log::info('Phân bổ tồn kho', [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'order_code' => $orderCode,
                'notes' => $notes
            ]);

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi phân bổ tồn kho: ' . $e->getMessage(), [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity
            ]);
            throw $e;
        }
    }

    /**
     * Hoàn tất phân bổ, giảm số lượng thực tế trong kho
     *
     * @param int $warehouseId ID kho
     * @param int $productId ID sản phẩm
     * @param int $quantity Số lượng
     * @param int|null $variantId ID biến thể (nếu có)
     * @param string|null $notes Ghi chú
     * @param string|null $orderCode Mã đơn hàng
     * @return bool
     */
    public function completeAllocation(
        $warehouseId,
        $productId,
        $quantity,
        $variantId = null,
        $notes = null,
        $orderCode = null
    ) {
        try {
            DB::beginTransaction();

            // Tìm tồn kho hiện có
            $stock = WarehouseStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->where(function ($query) use ($variantId) {
                    if ($variantId) {
                        $query->where('product_variant_id', $variantId);
                    } else {
                        $query->whereNull('product_variant_id');
                    }
                })
                ->first();

            if (!$stock) {
                throw new Exception("Không tìm thấy tồn kho cho sản phẩm này.");
            }

            // Kiểm tra số lượng đã phân bổ
            if ($stock->allocated_quantity < $quantity) {
                throw new Exception("Số lượng đã phân bổ không đủ. Hiện có: {$stock->allocated_quantity}, Yêu cầu: {$quantity}");
            }

            // Kiểm tra số lượng tồn kho
            if ($stock->quantity < $quantity) {
                throw new Exception("Số lượng tồn kho không đủ. Hiện có: {$stock->quantity}, Yêu cầu: {$quantity}");
            }

            // Giảm số lượng tồn kho và đã phân bổ
            $stock->quantity -= $quantity;
            $stock->allocated_quantity -= $quantity;
            $stock->save();

            // Đồng bộ với bảng sản phẩm
            $this->syncProductStock($productId, $variantId);

            // Ghi log
            Log::info('Hoàn tất phân bổ tồn kho', [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'order_code' => $orderCode,
                'notes' => $notes
            ]);

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi hoàn tất phân bổ tồn kho: ' . $e->getMessage(), [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity
            ]);
            throw $e;
        }
    }

    /**
     * Hủy phân bổ tồn kho
     *
     * @param int $warehouseId ID kho
     * @param int $productId ID sản phẩm
     * @param int $quantity Số lượng
     * @param int|null $variantId ID biến thể (nếu có)
     * @param string|null $notes Ghi chú
     * @param string|null $orderCode Mã đơn hàng
     * @return bool
     */
    public function cancelAllocation(
        $warehouseId,
        $productId,
        $quantity,
        $variantId = null,
        $notes = null,
        $orderCode = null
    ) {
        try {
            DB::beginTransaction();

            // Tìm tồn kho hiện có
            $stock = WarehouseStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->where(function ($query) use ($variantId) {
                    if ($variantId) {
                        $query->where('product_variant_id', $variantId);
                    } else {
                        $query->whereNull('product_variant_id');
                    }
                })
                ->first();

            if (!$stock) {
                throw new Exception("Không tìm thấy tồn kho cho sản phẩm này.");
            }

            // Kiểm tra số lượng đã phân bổ
            if ($stock->allocated_quantity < $quantity) {
                throw new Exception("Số lượng đã phân bổ không đủ. Hiện có: {$stock->allocated_quantity}, Yêu cầu: {$quantity}");
            }

            // Giảm số lượng đã phân bổ
            $stock->allocated_quantity -= $quantity;
            $stock->save();

            // Đồng bộ với bảng sản phẩm
            $this->syncProductStock($productId, $variantId);

            // Ghi log
            Log::info('Hủy phân bổ tồn kho', [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'order_code' => $orderCode,
                'notes' => $notes
            ]);

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi hủy phân bổ tồn kho: ' . $e->getMessage(), [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity
            ]);
            throw $e;
        }
    }

    /**
     * Xử lý tồn kho theo trạng thái đơn hàng
     *
     * @param Order $order Đơn hàng
     * @param string $action Hành động (allocate, complete, cancel)
     * @param int|null $warehouseId ID kho (nếu null, sẽ lấy kho mặc định)
     * @return bool
     */
    public function processOrderStock($order, $action, $warehouseId = null)
    {
        try {
            // Lấy kho mặc định nếu không chỉ định
            if (!$warehouseId) {
                $warehouse = Warehouse::where('is_active', true)
                    ->where('type', Warehouse::TYPE_SALES)
                    ->first();

                if (!$warehouse) {
                    throw new Exception("Không tìm thấy kho mặc định.");
                }

                $warehouseId = $warehouse->id;
            }

            // Lấy danh sách các sản phẩm trong đơn hàng
            $orderItems = $order->orderItems;

            if ($orderItems->isEmpty()) {
                throw new Exception("Đơn hàng không có sản phẩm nào.");
            }

            DB::beginTransaction();

            foreach ($orderItems as $item) {
                switch ($action) {
                    case 'allocate':
                        // Phân bổ số lượng cho đơn hàng mới
                        $this->allocateStock(
                            $warehouseId,
                            $item->product_id,
                            $item->quantity,
                            $item->product_variant_id,
                            "Phân bổ cho đơn hàng #{$order->order_code}",
                            $order->order_code
                        );
                        break;

                    case 'complete':
                        // Hoàn tất phân bổ, giảm số lượng thực tế
                        $this->completeAllocation(
                            $warehouseId,
                            $item->product_id,
                            $item->quantity,
                            $item->product_variant_id,
                            "Xuất kho cho đơn hàng #{$order->order_code}",
                            $order->order_code
                        );
                        break;

                    case 'cancel':
                        // Hủy phân bổ
                        $this->cancelAllocation(
                            $warehouseId,
                            $item->product_id,
                            $item->quantity,
                            $item->product_variant_id,
                            "Hủy phân bổ cho đơn hàng #{$order->order_code}",
                            $order->order_code
                        );
                        break;

                    default:
                        throw new Exception("Hành động không hợp lệ: {$action}");
                }
            }

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi xử lý tồn kho theo đơn hàng: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'action' => $action
            ]);
            throw $e;
        }
    }

    /**
     * Lấy số lượng khả dụng (quantity - allocated_quantity)
     *
     * @param int $warehouseId ID kho
     * @param int $productId ID sản phẩm
     * @param int|null $variantId ID biến thể (nếu có)
     * @return int
     */
    public function getAvailableQuantity($warehouseId, $productId, $variantId = null)
    {
        $stock = WarehouseStock::where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->where(function ($query) use ($variantId) {
                if ($variantId) {
                    $query->where('product_variant_id', $variantId);
                } else {
                    $query->whereNull('product_variant_id');
                }
            })
            ->first();

        if (!$stock) {
            return 0;
        }

        return max(0, $stock->quantity - $stock->allocated_quantity);
    }
}
