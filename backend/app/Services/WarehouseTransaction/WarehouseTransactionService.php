<?php

namespace App\Services\WarehouseTransaction;

use Exception;
use Carbon\Carbon;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Support\Str;
use App\Models\ProductVariant;
use App\Models\WarehouseStock;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\WarehouseTransaction;
use App\Models\WarehouseTransactionItem;
use App\Services\WarehouseStock\WarehouseStockService;

class WarehouseTransactionService
{
    protected $transaction;
    protected $stockService;

    /**
     * Khởi tạo service
     *
     * @param WarehouseTransaction $transaction
     * @param WarehouseStockService $stockService
     */
    public function __construct(WarehouseTransaction $transaction, WarehouseStockService $stockService)
    {
        $this->transaction = $transaction;
        $this->stockService = $stockService;
    }

    /**
     * Lấy danh sách giao dịch có phân trang và lọc
     *
     * @param array $filters Các tham số lọc
     * @param int $perPage Số lượng kết quả mỗi trang
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getPaginatedTransactions($filters = [], $perPage = 15)
    {
        // Khởi tạo query với các quan hệ cần thiết
        $query = $this->transaction->with(['warehouse', 'destinationWarehouse', 'admin', 'items']);

        // Áp dụng các scope từ model
        if (!empty($filters['transaction_code'])) {
            // Sử dụng scope searchByCode để lọc theo mã giao dịch
            $query->searchByCode($filters['transaction_code']);
        }

        if (isset($filters['transaction_type'])) {
            // Sử dụng scope ofType để lọc theo loại giao dịch
            $query->ofType($filters['transaction_type']);
        }

        if (isset($filters['status'])) {
            // Sử dụng scope withStatus để lọc theo trạng thái
            $query->withStatus($filters['status']);
        }

        if (!empty($filters['reference_code'])) {
            // Sử dụng scope searchByReferenceCode để lọc theo mã tham chiếu
            $query->searchByReferenceCode($filters['reference_code']);
        }

        // Lọc theo khoảng thời gian sử dụng scope inDateRange
        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $query->inDateRange($filters['date_from'], $filters['date_to']);
        } elseif (!empty($filters['date_from'])) {
            // Nếu chỉ có date_from, lọc từ date_from đến hiện tại
            $query->whereDate('created_at', '>=', $filters['date_from']);
        } elseif (!empty($filters['date_to'])) {
            // Nếu chỉ có date_to, lọc từ đầu đến date_to
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Lọc theo kho (không có scope sẵn)
        if (!empty($filters['warehouse_id'])) {
            // Lọc các giao dịch có kho nguồn hoặc kho đích là warehouse_id
            $query->where(function ($q) use ($filters) {
                $q->where('warehouse_id', $filters['warehouse_id'])
                    ->orWhere('destination_warehouse_id', $filters['warehouse_id']);
            });
        }

        // Lọc theo loại tham chiếu (không có scope sẵn)
        if (isset($filters['reference_type'])) {
            $query->where('reference_type', $filters['reference_type']);
        }

        // Lọc theo admin (không có scope sẵn)
        if (!empty($filters['admin_id'])) {
            $query->where('admin_id', $filters['admin_id']);
        }

        // Sắp xếp kết quả
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Trả về kết quả đã phân trang
        return $query->paginate($perPage);
    }

    /**
     * Tạo mã giao dịch theo định dạng: [MÃ KHO]-[LOẠI GIAO DỊCH]-[YYMMDD]-[6 KÝ TỰ NGẪU NHIÊN]
     *
     * @param int $type Loại giao dịch
     * @param int $warehouseId ID kho
     * @return string
     */
    public function generateTransactionCode($type, $warehouseId)
    {
        // Lấy mã kho
        $warehouse = Warehouse::findOrFail($warehouseId);
        $warehouseCode = $warehouse->code;

        // Xác định mã loại giao dịch sử dụng match
        $typeCode = match ($type) {
            WarehouseTransaction::TYPE_STOCK_IN => 'IN',     // Nhập kho
            WarehouseTransaction::TYPE_STOCK_OUT => 'OUT',   // Xuất kho
            WarehouseTransaction::TYPE_TRANSFER => 'TRF',    // Chuyển kho
            WarehouseTransaction::TYPE_ADJUSTMENT => 'ADJ',  // Kiểm kê/Điều chỉnh
            default => throw new \InvalidArgumentException("Loại giao dịch không hợp lệ: {$type}")
        };

        // Lấy ngày hiện tại theo định dạng YYMMDD
        $date = Carbon::now()->format('ymd');

        // Tạo chuỗi ngẫu nhiên 6 ký tự
        $random = strtoupper(Str::random(6));

        // Kết hợp các thành phần để tạo mã giao dịch
        $transactionCode = "{$warehouseCode}-{$typeCode}-{$date}-{$random}";

        // Kiểm tra xem mã đã tồn tại chưa, nếu có thì tạo lại
        while ($this->transaction->where('transaction_code', $transactionCode)->exists()) {
            $random = strtoupper(Str::random(6));
            $transactionCode = "{$warehouseCode}-{$typeCode}-{$date}-{$random}";
        }

        return $transactionCode;
    }

    /**
     * Kiểm tra tính hợp lệ của danh sách sản phẩm trong giao dịch kho
     *
     * @param array $items Danh sách sản phẩm cần kiểm tra
     * @param int $transactionType Loại giao dịch (1: Nhập kho, 2: Xuất kho, 3: Chuyển kho, 4: Kiểm kê)
     * @param int|null $warehouseId ID kho nguồn (bắt buộc đối với xuất kho và chuyển kho)
     * @return bool Trả về true nếu danh sách sản phẩm hợp lệ
     * @throws \InvalidArgumentException Nếu danh sách sản phẩm không hợp lệ
     */
    public function validateItems(array $items, int $transactionType, ?int $warehouseId = null): bool
    {
        // Kiểm tra danh sách sản phẩm có rỗng không
        if (empty($items)) {
            throw new \InvalidArgumentException('Danh sách sản phẩm không được để trống.');
        }

        // Kiểm tra warehouseId đối với giao dịch xuất kho và chuyển kho
        if (in_array($transactionType, [
            WarehouseTransaction::TYPE_STOCK_OUT,
            WarehouseTransaction::TYPE_TRANSFER
        ]) && !$warehouseId) {
            throw new \InvalidArgumentException('Cần chỉ định kho nguồn cho giao dịch xuất kho hoặc chuyển kho.');
        }

        // Kiểm tra từng sản phẩm trong danh sách
        foreach ($items as $index => $item) {
            $itemNumber = $index + 1;

            // Kiểm tra các trường bắt buộc
            if (empty($item['product_id'])) {
                throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: ID sản phẩm không được để trống.");
            }

            if (!isset($item['quantity'])) {
                throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Số lượng không được để trống.");
            }

            // Kiểm tra số lượng phải là số dương
            if ($item['quantity'] <= 0) {
                throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Số lượng phải là số dương.");
            }

            // Kiểm tra sản phẩm có tồn tại không
            $product = Product::find($item['product_id']);
            if (!$product) {
                throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Sản phẩm không tồn tại.");
            }

            // Kiểm tra biến thể (nếu có)
            if (!empty($item['product_variant_id'])) {
                $variant = ProductVariant::find($item['product_variant_id']);

                if (!$variant) {
                    throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Biến thể không tồn tại.");
                }

                if ($variant->product_id != $product->id) {
                    throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Biến thể không thuộc sản phẩm này.");
                }
            }

            // Kiểm tra tồn kho đối với giao dịch xuất kho và chuyển kho
            if (in_array($transactionType, [
                WarehouseTransaction::TYPE_STOCK_OUT,
                WarehouseTransaction::TYPE_TRANSFER
            ]) && $warehouseId) {
                $this->validateStockAvailability($item, $warehouseId, $itemNumber);
            }
        }

        return true;
    }

    /**
     * Kiểm tra tồn kho có đủ để xuất không và áp dụng nguyên tắc FIFO
     *
     * @param array $item Thông tin sản phẩm cần kiểm tra
     * @param int $warehouseId ID kho nguồn
     * @param int $itemNumber Số thứ tự sản phẩm trong danh sách
     * @return array Danh sách các lô hàng sẽ xuất theo nguyên tắc FIFO
     * @throws \InvalidArgumentException Nếu tồn kho không đủ
     */
    private function validateStockAvailability(array $item, int $warehouseId, int $itemNumber): array
    {
        // Xác định điều kiện tìm kiếm tồn kho cơ bản
        $conditions = [
            'warehouse_id' => $warehouseId,
            'product_id' => $item['product_id'],
            'is_active' => true
        ];

        // Thêm điều kiện biến thể nếu có
        if (!empty($item['product_variant_id'])) {
            $conditions['product_variant_id'] = $item['product_variant_id'];
        } else {
            $conditions['product_variant_id'] = null;
        }

        // Thêm điều kiện tình trạng sản phẩm nếu có
        if (isset($item['item_condition'])) {
            $conditions['item_condition'] = $item['item_condition'];
        }

        // Thêm điều kiện vị trí trong kho nếu có
        if (!empty($item['location'])) {
            $conditions['location'] = $item['location'];
        }

        // Thêm điều kiện lô hàng nếu có
        if (!empty($item['batch_number'])) {
            $conditions['batch_number'] = $item['batch_number'];
        }

        // Lấy tất cả các lô hàng thỏa mãn điều kiện, sắp xếp theo nguyên tắc FIFO
        $stockItems = WarehouseStock::where($conditions)
            ->orderBy('created_at', 'asc')  // Sắp xếp theo thời gian nhập kho (FIFO)
            ->get();

        // Nếu không tìm thấy tồn kho
        if ($stockItems->isEmpty()) {
            $errorMessage = "Sản phẩm #{$itemNumber}: Không có tồn kho";

            // Thêm thông tin chi tiết về điều kiện tìm kiếm
            if (isset($conditions['item_condition'])) {
                $conditionName = WarehouseStock::$conditionLabels[$conditions['item_condition']] ?? 'Unknown';
                $errorMessage .= " với tình trạng '{$conditionName}'";
            }

            if (!empty($item['location'])) {
                $errorMessage .= " tại vị trí '{$item['location']}'";
            }

            if (!empty($item['batch_number'])) {
                $errorMessage .= " thuộc lô '{$item['batch_number']}'";
            }

            $errorMessage .= " trong kho này.";
            throw new \InvalidArgumentException($errorMessage);
        }

        // Tính tổng số lượng tồn kho hiện có
        $totalAvailable = $stockItems->sum('quantity');

        // Nếu tổng tồn kho không đủ
        if ($totalAvailable < $item['quantity']) {
            throw new \InvalidArgumentException(
                "Sản phẩm #{$itemNumber}: Tồn kho không đủ. Hiện có {$totalAvailable}, cần {$item['quantity']}."
            );
        }

        // Áp dụng nguyên tắc FIFO để xác định các lô hàng sẽ xuất
        $remainingQuantity = $item['quantity'];
        $stocksToUse = [];

        foreach ($stockItems as $stock) {
            if ($remainingQuantity <= 0) break;

            $quantityToUse = min($stock->quantity, $remainingQuantity);
            $remainingQuantity -= $quantityToUse;

            $stocksToUse[] = [
                'stock_id' => $stock->id,
                'quantity' => $quantityToUse,
                'batch_number' => $stock->batch_number,
                'location' => $stock->location,
                'created_at' => $stock->created_at
            ];
        }

        return $stocksToUse;
    }

    /**
     * Tạo giao dịch nhập kho mới
     *
     * @param int $warehouseId ID kho nhập hàng
     * @param array $items Danh sách sản phẩm nhập kho
     * @param array $data Thông tin bổ sung của giao dịch
     * @return WarehouseTransaction
     * @throws \Exception
     */
    public function createStockInTransaction($warehouseId, array $items, array $data = [])
    {
        DB::beginTransaction();

        try {
            // Kiểm tra kho có tồn tại và đang hoạt động
            $warehouse = Warehouse::where('id', $warehouseId)
                ->where('is_active', true)
                ->firstOrFail();

            // Kiểm tra tính hợp lệ của danh sách sản phẩm
            $this->validateItems($items, WarehouseTransaction::TYPE_STOCK_IN, $warehouseId);

            // Tạo mã giao dịch
            $transactionCode = $this->generateTransactionCode(WarehouseTransaction::TYPE_STOCK_IN, $warehouseId);

            // Lấy thông tin admin đang thực hiện giao dịch
            $admin = auth()->user();
            $adminName = $admin ? ($admin->first_name . ' ' . $admin->last_name) : 'System';
            $adminId = $admin ? $admin->id : null;

            // Tạo giao dịch mới
            $transaction = new WarehouseTransaction([
                'transaction_code' => $transactionCode,
                'warehouse_id' => $warehouseId,
                'warehouse_name' => $warehouse->name,
                'transaction_type' => WarehouseTransaction::TYPE_STOCK_IN,
                'reference_type' => $data['reference_type'] ?? WarehouseTransaction::REF_TYPE_IMPORT,
                'reference_code' => $data['reference_code'] ?? null,
                'admin_id' => $adminId,
                'admin_name' => $adminName,
                'notes' => $data['notes'] ?? null,
                'status' => WarehouseTransaction::STATUS_DRAFT,
                'metadata' => isset($data['metadata']) ? json_encode($data['metadata']) : null
            ]);

            $transaction->save();

            // Thêm các sản phẩm vào giao dịch
            foreach ($items as $item) {
                $product = Product::find($item['product_id']);
                $variant = !empty($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                $transactionItem = new WarehouseTransactionItem([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'product_sku' => $product->sku,
                    'product_name' => $product->name,
                    'product_variant_id' => $variant ? $variant->id : null,
                    'variant_sku' => $variant ? $variant->sku : null,
                    'variant_attributes' => $variant ? json_encode($variant->attributes) : null,
                    'product_image' => $product->image,
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'] ?? 0,
                    'total_cost' => ($item['unit_cost'] ?? 0) * $item['quantity'],
                    'item_condition' => $item['item_condition'] ?? WarehouseStock::CONDITION_NEW,
                    'notes' => $item['notes'] ?? null,
                    'location' => $item['location'] ?? null,
                    'batch_number' => $item['batch_number'] ?? null
                ]);

                $transactionItem->save();
            }

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Xử lý nhập kho khi hoàn thành giao dịch
     *
     * @param WarehouseTransaction $transaction Giao dịch nhập kho
     * @return void
     * @throws \Exception
     */
    private function processStockIn(WarehouseTransaction $transaction)
    {
        // Kiểm tra loại giao dịch
        if ($transaction->transaction_type !== WarehouseTransaction::TYPE_STOCK_IN) {
            throw new \InvalidArgumentException('Giao dịch không phải là giao dịch nhập kho.');
        }

        // Lấy danh sách sản phẩm trong giao dịch
        $transactionItems = $transaction->items;

        foreach ($transactionItems as $item) {
            // Tìm tồn kho hiện có hoặc tạo mới
            $stock = WarehouseStock::firstOrNew([
                'warehouse_id' => $transaction->warehouse_id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'item_condition' => $item->item_condition,
                'batch_number' => $item->batch_number,
                'location' => $item->location
            ]);

            // Nếu là bản ghi mới, cập nhật thông tin
            if (!$stock->exists) {
                $stock->product_sku = $item->product_sku;
                $stock->variant_sku = $item->variant_sku;
                $stock->quantity = 0;
                $stock->is_active = true;
                $stock->min_quantity = 0;
                $stock->max_quantity = null;
            }

            // Cập nhật số lượng
            $stock->quantity += $item->quantity;

            // Lưu bản ghi tồn kho
            $stock->save();

            // Cập nhật tổng tồn kho của sản phẩm (tùy chọn)
            if ($item->product_variant_id) {
                // Cập nhật tồn kho cho biến thể
                $variant = ProductVariant::find($item->product_variant_id);
                if ($variant) {
                    $variant->stock += $item->quantity;
                    $variant->save();
                }
            } else {
                // Cập nhật tồn kho cho sản phẩm
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->stock += $item->quantity;
                    $product->save();
                }
            }
        }
    }

    /**
     * Tạo giao dịch xuất kho mới
     *
     * @param int $warehouseId ID kho xuất hàng
     * @param array $items Danh sách sản phẩm xuất kho
     * @param array $data Thông tin bổ sung của giao dịch
     * @return WarehouseTransaction
     * @throws Exception
     */
    public function createStockOutTransaction($warehouseId, array $items, array $data = [])
    {
        DB::beginTransaction();

        try {
            // Kiểm tra kho có tồn tại và đang hoạt động
            $warehouse = Warehouse::where('id', $warehouseId)
                ->where('is_active', true)
                ->firstOrFail();

            // Kiểm tra tính hợp lệ của danh sách sản phẩm
            $this->validateItems($items, WarehouseTransaction::TYPE_STOCK_OUT, $warehouseId);

            // Tạo mã giao dịch
            $transactionCode = $this->generateTransactionCode(WarehouseTransaction::TYPE_STOCK_OUT, $warehouseId);

            // Lấy thông tin admin đang thực hiện giao dịch
            $admin = auth()->user();
            $adminName = $admin ? ($admin->first_name . ' ' . $admin->last_name) : 'System';
            $adminId = $admin ? $admin->id : null;

            // Tạo giao dịch mới
            $transaction = new WarehouseTransaction([
                'transaction_code' => $transactionCode,
                'warehouse_id' => $warehouseId,
                'warehouse_name' => $warehouse->name,
                'transaction_type' => WarehouseTransaction::TYPE_STOCK_OUT,
                'reference_type' => $data['reference_type'] ?? WarehouseTransaction::REF_TYPE_ORDER,
                'reference_code' => $data['reference_code'] ?? null,
                'admin_id' => $adminId,
                'admin_name' => $adminName,
                'notes' => $data['notes'] ?? null,
                'status' => WarehouseTransaction::STATUS_DRAFT,
                'metadata' => isset($data['metadata']) ? json_encode($data['metadata']) : null
            ]);

            $transaction->save();

            // Thêm các sản phẩm vào giao dịch
            foreach ($items as $index => $item) {
                $product = Product::find($item['product_id']);
                $variant = !empty($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                // Áp dụng FIFO để xác định các lô hàng sẽ xuất
                $fifoItems = $this->validateStockAvailability($item, $warehouseId, $index + 1);

                // Tạo một mục giao dịch cho mỗi lô hàng FIFO
                foreach ($fifoItems as $fifoItem) {
                    $transactionItem = new WarehouseTransactionItem([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'product_sku' => $product->sku,
                        'product_name' => $product->name,
                        'product_variant_id' => $variant ? $variant->id : null,
                        'variant_sku' => $variant ? $variant->sku : null,
                        'variant_attributes' => $variant ? json_encode($variant->attributes) : null,
                        'product_image' => $product->image,
                        'quantity' => $fifoItem['quantity'],
                        'unit_cost' => $fifoItem['unit_cost'] ?? 0,
                        'total_cost' => ($fifoItem['unit_cost'] ?? 0) * $fifoItem['quantity'],
                        'item_condition' => $item['item_condition'] ?? WarehouseStock::CONDITION_NEW,
                        'notes' => $item['notes'] ?? null,
                        'location' => $fifoItem['location'],
                        'batch_number' => $fifoItem['batch_number'],
                        // Lưu ID của bản ghi tồn kho để dễ dàng cập nhật sau này
                        'stock_id' => $fifoItem['stock_id'] ?? null
                    ]);

                    $transactionItem->save();
                }
            }

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Xử lý xuất kho khi hoàn thành giao dịch
     *
     * @param WarehouseTransaction $transaction Giao dịch xuất kho
     * @return void
     * @throws Exception
     */
    private function processStockOut(WarehouseTransaction $transaction)
    {
        // Kiểm tra loại giao dịch
        if ($transaction->transaction_type !== WarehouseTransaction::TYPE_STOCK_OUT) {
            throw new \InvalidArgumentException('Giao dịch không phải là giao dịch xuất kho.');
        }

        // Lấy danh sách sản phẩm trong giao dịch
        $transactionItems = $transaction->items;

        foreach ($transactionItems as $item) {
            // Tìm bản ghi tồn kho tương ứng
            $stockQuery = WarehouseStock::where([
                'warehouse_id' => $transaction->warehouse_id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'item_condition' => $item->item_condition
            ]);

            // Nếu có thông tin lô hàng, thêm điều kiện
            if ($item->batch_number) {
                $stockQuery->where('batch_number', $item->batch_number);
            }

            // Nếu có thông tin vị trí, thêm điều kiện
            if ($item->location) {
                $stockQuery->where('location', $item->location);
            }

            // Nếu có stock_id, sử dụng nó để tìm chính xác bản ghi tồn kho
            if ($item->stock_id) {
                $stockQuery->where('id', $item->stock_id);
            }

            $stock = $stockQuery->first();

            if (!$stock) {
                throw new \InvalidArgumentException("Không tìm thấy tồn kho cho sản phẩm {$item->product_name} với các điều kiện đã chỉ định.");
            }

            // Kiểm tra lại tồn kho có đủ không
            if ($stock->quantity < $item->quantity) {
                throw new \InvalidArgumentException("Tồn kho không đủ cho sản phẩm {$item->product_name}. Hiện có {$stock->quantity}, cần {$item->quantity}.");
            }

            // Cập nhật số lượng tồn kho
            $stock->quantity -= $item->quantity;

            // Nếu tồn kho về 0, có thể đánh dấu là không hoạt động (tùy chọn)
            if ($stock->quantity == 0) {
                $stock->is_active = false;
            }

            $stock->save();

            // Cập nhật tổng tồn kho của sản phẩm (tùy chọn)
            if ($item->product_variant_id) {
                // Cập nhật tồn kho cho biến thể
                $variant = ProductVariant::find($item->product_variant_id);
                if ($variant) {
                    $variant->stock -= $item->quantity;
                    $variant->save();
                }
            } else {
                // Cập nhật tồn kho cho sản phẩm
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->stock -= $item->quantity;
                    $product->save();
                }
            }
        }
    }

    /**
     * Tạo giao dịch chuyển kho mới
     *
     * @param int $sourceWarehouseId ID kho nguồn
     * @param int $destinationWarehouseId ID kho đích
     * @param array $items Danh sách sản phẩm cần chuyển
     * @param array $data Thông tin bổ sung của giao dịch
     * @return WarehouseTransaction
     * @throws \Exception
     */
    public function createStockTransferTransaction($sourceWarehouseId, $destinationWarehouseId, array $items, array $data = [])
    {
        DB::beginTransaction();

        try {
            // Kiểm tra kho nguồn và kho đích có tồn tại và đang hoạt động
            $sourceWarehouse = Warehouse::where('id', $sourceWarehouseId)
                ->where('is_active', true)
                ->firstOrFail();

            $destinationWarehouse = Warehouse::where('id', $destinationWarehouseId)
                ->where('is_active', true)
                ->firstOrFail();

            // Kiểm tra kho nguồn và kho đích không được trùng nhau
            if ($sourceWarehouseId == $destinationWarehouseId) {
                throw new \InvalidArgumentException('Kho nguồn và kho đích không được trùng nhau.');
            }

            // Kiểm tra tính hợp lệ của danh sách sản phẩm
            $this->validateTransferItems($items, $sourceWarehouseId);

            // Tạo mã giao dịch
            $transactionCode = $this->generateTransactionCode(WarehouseTransaction::TYPE_TRANSFER, $sourceWarehouseId);

            // Lấy thông tin admin đang thực hiện giao dịch
            $admin = auth()->user();
            $adminName = $admin ? ($admin->first_name . ' ' . $admin->last_name) : 'System';
            $adminId = $admin ? $admin->id : null;

            // Tạo giao dịch mới
            $transaction = new WarehouseTransaction([
                'transaction_code' => $transactionCode,
                'warehouse_id' => $sourceWarehouseId,
                'warehouse_name' => $sourceWarehouse->name,
                'destination_warehouse_id' => $destinationWarehouseId,
                'destination_warehouse_name' => $destinationWarehouse->name,
                'transaction_type' => WarehouseTransaction::TYPE_TRANSFER,
                'reference_type' => $data['reference_type'] ?? WarehouseTransaction::REF_TYPE_OTHER,
                'reference_code' => $data['reference_code'] ?? null,
                'admin_id' => $adminId,
                'admin_name' => $adminName,
                'notes' => $data['notes'] ?? null,
                'status' => WarehouseTransaction::STATUS_DRAFT,
                'metadata' => isset($data['metadata']) ? json_encode($data['metadata']) : null
            ]);

            $transaction->save();

            // Thêm các sản phẩm vào giao dịch
            foreach ($items as $item) {
                $product = Product::find($item['product_id']);
                $variant = !empty($item['product_variant_id']) ? ProductVariant::find($item['product_variant_id']) : null;

                // Tìm bản ghi tồn kho hiện tại ở kho nguồn
                $stockQuery = WarehouseStock::where([
                    'warehouse_id' => $sourceWarehouseId,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'],
                    'item_condition' => $item['item_condition'] ?? WarehouseStock::CONDITION_NEW
                ]);

                // Nếu có thông tin lô hàng, thêm điều kiện
                if (!empty($item['batch_number'])) {
                    $stockQuery->where('batch_number', $item['batch_number']);
                }

                // Nếu có thông tin vị trí, thêm điều kiện
                if (!empty($item['location'])) {
                    $stockQuery->where('location', $item['location']);
                }

                $sourceStock = $stockQuery->first();

                if (!$sourceStock) {
                    throw new \InvalidArgumentException("Không tìm thấy tồn kho cho sản phẩm {$product->name} tại kho nguồn.");
                }

                // Kiểm tra số lượng tồn kho có đủ không
                if ($sourceStock->quantity < $item['quantity']) {
                    throw new \InvalidArgumentException("Tồn kho không đủ cho sản phẩm {$product->name}. Hiện có {$sourceStock->quantity}, cần chuyển {$item['quantity']}.");
                }

                // Tạo mục giao dịch
                $transactionItem = new WarehouseTransactionItem([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'product_sku' => $product->sku,
                    'product_name' => $product->name,
                    'product_variant_id' => $variant ? $variant->id : null,
                    'variant_sku' => $variant ? $variant->sku : null,
                    'variant_attributes' => $variant ? json_encode($variant->attributes) : null,
                    'product_image' => $product->image,
                    'quantity' => $item['quantity'],
                    'unit_cost' => $sourceStock->unit_cost,
                    'total_cost' => $sourceStock->unit_cost * $item['quantity'],
                    'item_condition' => $item['item_condition'] ?? WarehouseStock::CONDITION_NEW,
                    'notes' => $item['notes'] ?? null,
                    'location' => $item['location'] ?? null,
                    'batch_number' => $item['batch_number'] ?? null,
                    'expiry_date' => $item['expiry_date'] ?? null
                ]);

                // Thêm thông tin chuyển kho vào metadata
                $metadata = [
                    'source_location' => $item['location'] ?? null,
                    'destination_location' => $item['destination_location'] ?? null,
                    'source_stock_id' => $sourceStock->id
                ];

                $transactionItem->metadata = json_encode($metadata);
                $transactionItem->save();
            }

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Kiểm tra tính hợp lệ của danh sách sản phẩm chuyển kho
     *
     * @param array $items Danh sách sản phẩm cần chuyển
     * @param int $sourceWarehouseId ID kho nguồn
     * @return void
     * @throws \InvalidArgumentException
     */
    private function validateTransferItems(array $items, $sourceWarehouseId)
    {
        if (empty($items)) {
            throw new \InvalidArgumentException('Danh sách sản phẩm không được để trống.');
        }

        foreach ($items as $index => $item) {
            $itemNumber = $index + 1;

            // Kiểm tra các trường bắt buộc
            if (empty($item['product_id'])) {
                throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: ID sản phẩm là bắt buộc.");
            }

            // Kiểm tra sản phẩm có tồn tại không
            $product = Product::find($item['product_id']);
            if (!$product) {
                throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Sản phẩm không tồn tại.");
            }

            // Kiểm tra biến thể nếu có
            if (!empty($item['product_variant_id'])) {
                $variant = ProductVariant::find($item['product_variant_id']);
                if (!$variant) {
                    throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Biến thể không tồn tại.");
                }

                if ($variant->product_id != $item['product_id']) {
                    throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Biến thể không thuộc sản phẩm này.");
                }
            }

            // Kiểm tra số lượng chuyển
            if (empty($item['quantity']) || $item['quantity'] <= 0) {
                throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Số lượng chuyển phải lớn hơn 0.");
            }

            // Kiểm tra tồn kho có đủ không
            $stockQuery = WarehouseStock::where([
                'warehouse_id' => $sourceWarehouseId,
                'product_id' => $item['product_id'],
                'product_variant_id' => $item['product_variant_id'],
                'item_condition' => $item['item_condition'] ?? WarehouseStock::CONDITION_NEW
            ]);

            if (!empty($item['batch_number'])) {
                $stockQuery->where('batch_number', $item['batch_number']);
            }

            if (!empty($item['location'])) {
                $stockQuery->where('location', $item['location']);
            }

            $stock = $stockQuery->first();

            if (!$stock) {
                throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Không tìm thấy tồn kho tại kho nguồn với các điều kiện đã chỉ định.");
            }

            if ($stock->quantity < $item['quantity']) {
                throw new \InvalidArgumentException("Sản phẩm #{$itemNumber}: Tồn kho không đủ. Hiện có {$stock->quantity}, cần chuyển {$item['quantity']}.");
            }
        }
    }

    /**
     * Xử lý chuyển kho khi hoàn thành giao dịch
     *
     * @param WarehouseTransaction $transaction Giao dịch chuyển kho
     * @throws \Exception
     */
    private function processStockTransfer(WarehouseTransaction $transaction)
    {
        // Kiểm tra loại giao dịch
        if ($transaction->transaction_type !== WarehouseTransaction::TYPE_TRANSFER) {
            throw new \InvalidArgumentException('Giao dịch không phải là giao dịch chuyển kho.');
        }

        // Lấy danh sách sản phẩm trong giao dịch
        $transactionItems = $transaction->items;

        foreach ($transactionItems as $item) {
            // Lấy thông tin từ metadata
            $metadata = json_decode($item->metadata, true) ?? [];
            $destinationLocation = $metadata['destination_location'] ?? null;

            // Tìm bản ghi tồn kho tại kho nguồn
            $sourceStockQuery = WarehouseStock::where([
                'warehouse_id' => $transaction->warehouse_id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'item_condition' => $item->item_condition
            ]);

            if ($item->batch_number) {
                $sourceStockQuery->where('batch_number', $item->batch_number);
            }

            if ($item->location) {
                $sourceStockQuery->where('location', $item->location);
            }

            $sourceStock = $sourceStockQuery->first();

            if (!$sourceStock) {
                throw new \InvalidArgumentException("Không tìm thấy tồn kho nguồn cho sản phẩm {$item->product_name}.");
            }

            // Kiểm tra lại số lượng tồn kho có đủ không
            if ($sourceStock->quantity < $item->quantity) {
                throw new \InvalidArgumentException("Tồn kho không đủ cho sản phẩm {$item->product_name}. Hiện có {$sourceStock->quantity}, cần chuyển {$item->quantity}.");
            }

            // Giảm số lượng tại kho nguồn
            $sourceStock->quantity -= $item->quantity;
            $sourceStock->save();

            // Tìm hoặc tạo bản ghi tồn kho tại kho đích
            $destinationStockQuery = WarehouseStock::where([
                'warehouse_id' => $transaction->destination_warehouse_id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'item_condition' => $item->item_condition
            ]);

            if ($item->batch_number) {
                $destinationStockQuery->where('batch_number', $item->batch_number);
            }

            // Nếu có vị trí đích, thêm điều kiện
            if ($destinationLocation) {
                $destinationStockQuery->where('location', $destinationLocation);
            }

            $destinationStock = $destinationStockQuery->first();

            // Nếu không tìm thấy, tạo mới
            if (!$destinationStock) {
                $destinationStock = new WarehouseStock([
                    'warehouse_id' => $transaction->destination_warehouse_id,
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_sku' => $item->product_sku,
                    'variant_sku' => $item->variant_sku,
                    'quantity' => 0,
                    'item_condition' => $item->item_condition,
                    'location' => $destinationLocation,
                    'batch_number' => $item->batch_number,
                    'unit_cost' => $item->unit_cost,
                    'expiry_date' => $item->expiry_date,
                    'is_active' => true
                ]);
            }

            // Tăng số lượng tại kho đích
            $destinationStock->quantity += $item->quantity;
            $destinationStock->save();
        }
    }

    /**
     * Hoàn thành giao dịch kho
     *
     * @param int $transactionId ID của giao dịch cần hoàn thành
     * @return WarehouseTransaction Giao dịch đã hoàn thành
     * @throws \Exception
     */
    public function completeTransaction($transactionId)
    {
        DB::beginTransaction();

        try {
            // Tìm giao dịch
            $transaction = WarehouseTransaction::findOrFail($transactionId);

            // Kiểm tra trạng thái giao dịch
            if ($transaction->status !== WarehouseTransaction::STATUS_DRAFT) {
                throw new \InvalidArgumentException('Chỉ có thể hoàn thành giao dịch ở trạng thái nháp.');
            }

            // Kiểm tra giao dịch có sản phẩm không
            if ($transaction->items()->count() === 0) {
                throw new \InvalidArgumentException('Giao dịch không có sản phẩm nào.');
            }

            // Xử lý dựa trên loại giao dịch
            switch ($transaction->transaction_type) {
                case WarehouseTransaction::TYPE_STOCK_IN:
                    $this->processStockIn($transaction);
                    break;

                case WarehouseTransaction::TYPE_STOCK_OUT:
                    $this->processStockOut($transaction);
                    break;

                case WarehouseTransaction::TYPE_TRANSFER:
                    $this->processStockTransfer($transaction);
                    break;

                case WarehouseTransaction::TYPE_ADJUSTMENT:
                    // $this->processStockAdjustment($transaction);
                    break;

                default:
                    throw new \InvalidArgumentException('Loại giao dịch không hợp lệ.');
            }

            // Cập nhật trạng thái giao dịch
            $transaction->status = WarehouseTransaction::STATUS_COMPLETED;
            $transaction->completed_at = now();
            $transaction->save();

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Hủy giao dịch kho
     *
     * @param int $transactionId ID của giao dịch cần hủy
     * @param string $cancelReason Lý do hủy giao dịch
     * @return WarehouseTransaction Giao dịch đã hủy
     * @throws \Exception
     */
    public function cancelTransaction($transactionId, $cancelReason)
    {
        DB::beginTransaction();

        try {
            // Tìm giao dịch
            $transaction = WarehouseTransaction::findOrFail($transactionId);

            // Kiểm tra trạng thái giao dịch
            if ($transaction->status !== WarehouseTransaction::STATUS_DRAFT) {
                throw new \InvalidArgumentException('Chỉ có thể hủy giao dịch ở trạng thái nháp.');
            }

            // Kiểm tra lý do hủy
            if (empty($cancelReason)) {
                throw new \InvalidArgumentException('Phải cung cấp lý do hủy giao dịch.');
            }

            // Cập nhật trạng thái giao dịch
            $transaction->status = WarehouseTransaction::STATUS_CANCELLED;
            $transaction->cancelled_at = now();
            $transaction->cancel_reason = $cancelReason;
            $transaction->save();

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
