<?php

namespace App\Services\Order;

use Exception;
use Carbon\Carbon;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use App\Events\OrderCreate;
use Illuminate\Support\Str;
use App\Models\OrderHistory;
use App\Services\BaseService;
use App\Models\ProductVariant;
use App\Models\OrderUserReturn;
use App\Events\OrderStatusUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\Analytics\AnalyticsService;

class OrderService extends BaseService
{
    protected $analyticsService;
    public function __construct(Order $order)
    {
        parent::__construct($order);
        $this->analyticsService = app(AnalyticsService::class);
    }

    /**
     * Tạo đơn hàng mới
     *
     * @param array $data Dữ liệu đơn hàng
     * @return Order
     */
    public function createOrder($data)
    {
        // Kiểm tra xem có order_items không
        if (empty($data['order_items']) || !is_array($data['order_items'])) {
            throw new Exception('Đơn hàng phải có ít nhất một sản phẩm.');
        }

        // ✅ KIỂM TRA TỒN KHO VÀ TRẠNG THÁI SẢN PHẨM
        $stockCheck = $this->checkStockAvailability($data['order_items']);
        if ($stockCheck !== true) {
            Log::error('Kiểm tra tồn kho thất bại khi tạo đơn hàng.', [
                'error' => $stockCheck,
                'order_items' => $data['order_items']
            ]);
            throw new Exception($stockCheck); // Trả về thông báo lỗi cụ thể
        }

        DB::beginTransaction();
        try {
            // Tính toán giá trị đơn hàng trước khi tạo
            $calculatedValues = $this->calculateOrderValues($data);

            // Xử lý dữ liệu khách hàng và thêm các giá trị đã tính
            $orderData = $this->prepareOrderData($data);
            $orderData = array_merge($orderData, $calculatedValues);

            // Tạo đơn hàng mới với đầy đủ thông tin
            $order = $this->model->create($orderData);

            // Thêm order_items với thông tin đầy đủ
            $this->addOrderItems($order, $data['order_items']);

            // Ghi lịch sử đơn hàng
            $historyData = [];
            $historyData['status_to'] = $order->status;
            $historyData['notes'] = 'Đơn hàng mới được tạo';

            // Thêm metadata
            $historyData['metadata'] = [
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method ?? 'unknown',
                'items_count' => $order->orderItems->count()
            ];
            // Xác định người thực hiện
            if (isset($data['customer_id'])) {
                $historyData['customer_id'] = $data['customer_id'];
            } else {
                $historyData['actor_name'] = $data['customer_name'];
                $historyData['actor_email'] = $data['customer_email'];
            }

            Log::info('Tạo đơn hàng thành công', [
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'total_amount' => $order->total_amount
            ]);

            // Gọi phương thức createHistory
            OrderHistory::createHistory(
                $order->id,
                OrderHistory::ACTION_ORDER_CREATED,
                $historyData
            );

            DB::commit();

            // ✅ THÊM: Clear cache khi có đơn mới
            $this->analyticsService->clearDashboardCache();

            broadcast(new OrderCreate());
            return $order;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi tạo đơn hàng', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Kiểm tra tồn kho cho các sản phẩm trong đơn hàng
     *
     * @param array $orderItems Danh sách sản phẩm trong đơn hàng
     * @return bool|string True nếu đủ hàng, thông báo lỗi nếu không đủ
     */
    private function checkStockAvailability($orderItems)
    {
        foreach ($orderItems as $item) {
            $productId = $item['product_id'];
            $variantId = $item['product_variant_id'] ?? null;
            $quantity = $item['quantity'];

            // Kiểm tra số lượng hợp lệ
            if ($quantity <= 0) {
                return "Số lượng sản phẩm phải lớn hơn 0.";
            }

            // Kiểm tra tồn kho
            if ($variantId) {
                $variant = ProductVariant::find($variantId);
                if (!$variant) {
                    Log::error("Biến thể sản phẩm không tồn tại.", ['variant_id' => $variantId]);
                    return "Biến thể sản phẩm không tồn tại.";
                }

                // Lấy thông tin sản phẩm chính
                $product = Product::find($productId);
                if (!$product) {
                    Log::error("Sản phẩm không tồn tại.", ['product_id' => $productId]);
                    return "Sản phẩm không tồn tại.";
                }

                // Kiểm tra trạng thái sản phẩm chính
                if ($product->status !== 'active') {
                    Log::warning("Sản phẩm không còn hoạt động.", [
                        'product_id' => $productId,
                        'product_name' => $product->name,
                        'status' => $product->status
                    ]);
                    return "Sản phẩm '{$product->name}' hiện không còn được bán.";
                }

                // Kiểm tra tồn kho biến thể
                if ($variant->stock < $quantity) {
                    Log::error("Không đủ tồn kho cho biến thể.", [
                        'product_name' => $product->name,
                        'variant_sku' => $variant->sku,
                        'requested_quantity' => $quantity,
                        'available_stock' => $variant->stock
                    ]);
                    return "Sản phẩm '{$product->name}' (biến thể {$variant->sku}) chỉ còn {$variant->stock} sản phẩm trong kho.";
                }

            } else {
                // Sản phẩm đơn giản (không có biến thể)
                $product = Product::find($productId);
                if (!$product) {
                    Log::error("Sản phẩm không tồn tại.", ['product_id' => $productId]);
                    return "Sản phẩm không tồn tại.";
                }

                // Kiểm tra trạng thái sản phẩm
                if ($product->status !== 'active') {
                    Log::warning("Sản phẩm không còn hoạt động.", [
                        'product_id' => $productId,
                        'product_name' => $product->name,
                        'status' => $product->status
                    ]);
                    return "Sản phẩm '{$product->name}' hiện không còn được bán.";
                }

                // Kiểm tra tồn kho sản phẩm
                if ($product->stock < $quantity) {
                    Log::error("Không đủ tồn kho cho sản phẩm.", [
                        'product_name' => $product->name,
                        'requested_quantity' => $quantity,
                        'available_stock' => $product->stock
                    ]);
                    return "Sản phẩm '{$product->name}' chỉ còn {$product->stock} sản phẩm trong kho.";
                }
            }
        }

        Log::info("Kiểm tra tồn kho thành công cho tất cả sản phẩm.", [
            'total_items' => count($orderItems)
        ]);

        return true;
    }

    /**
     * Tính toán các giá trị của đơn hàng
     *
     * @param array $data Dữ liệu đơn hàng
     * @return array Các giá trị đã tính toán
     */
    private function calculateOrderValues($data)
    {
        // Tính subtotal từ các sản phẩm
        $subtotal = 0;
        foreach ($data['order_items'] as $item) {
            if ($item['discount'] == null) {
                $item['discount'] = 0;
            }
            $price = $item['price'] * (1 - ($item['discount'] / 100));
            $quantity = $item['quantity'];
            $subtotal += $price * $quantity;
        }

        // Tính toán giảm giá đơn hàng
        $orderDiscountAmount = 0;
        if (!empty($data['order_discount_type']) && !empty($data['order_discount_value'])) {
            if ($data['order_discount_type'] == Order::DISCOUNT_TYPE_PERCENTAGE) {
                $orderDiscountAmount = $subtotal * ($data['order_discount_value'] / 100);
            } else {
                $orderDiscountAmount = $data['order_discount_value'];
            }
            // Đảm bảo giảm giá không vượt quá subtotal
            $orderDiscountAmount = min($orderDiscountAmount, $subtotal);
        }

        // Tính toán giảm giá vận chuyển
        $shippingFee = $data['shipping_fee'] ?? 0;
        $shippingDiscountAmount = 0;

        if (!empty($data['shipping_discount_type']) && !empty($data['shipping_discount_value'])) {
            if ($data['shipping_discount_type'] == Order::DISCOUNT_TYPE_PERCENTAGE) {
                $shippingDiscountAmount = $shippingFee * ($data['shipping_discount_value'] / 100);
            } elseif ($data['shipping_discount_type'] == Order::DISCOUNT_TYPE_FREE) {
                $shippingDiscountAmount = $shippingFee;
            } else {
                $shippingDiscountAmount = $data['shipping_discount_value'];
            }
            // Đảm bảo giảm giá không vượt quá phí vận chuyển
            $shippingDiscountAmount = min($shippingDiscountAmount, $shippingFee);
        }

        // Tính tổng tiền cuối cùng
        $taxAmount = $data['tax_amount'] ?? 0;
        $totalAmount = $subtotal - $orderDiscountAmount + $shippingFee - $shippingDiscountAmount + $taxAmount;

        return [
            'subtotal' => $subtotal,
            'order_discount_amount' => $orderDiscountAmount,
            'shipping_discount_amount' => $shippingDiscountAmount,
            'total_amount' => $totalAmount
        ];
    }

    /**
     * Xử lý dữ liệu khách hàng trước khi tạo đơn hàng
     */
    private function prepareOrderData($data)
    {
        $orderData = [
            'customer_id' => $data['customer_id'] ?? null,
            'customer_name' => $data['customer_name'] ?? null,
            'customer_email' => $data['customer_email'] ?? null,
            'customer_phone' => $data['customer_phone'] ?? null,
            'shipping_address' => $data['shipping_address'] ?? null,
            'customer_note' => $data['customer_note'] ?? null,
            'admin_note' => $data['admin_note'] ?? null,
            'order_code' => $this->generateUniqueOrderCode(),
            'tax_amount' => $data['tax_amount'] ?? 0,

            // Trạng thái đơn hàng
            'status' => Order::STATUS_PENDING,
            'payment_status' => Order::PAYMENT_STATUS_UNPAID,

            // Thông tin thanh toán
            'payment_method' => $data['payment_method'] ?? null,
            'payment_transaction_id' => $data['payment_transaction_id'] ?? null,

            // Thông tin vận chuyển
            'shipping_method' => $data['shipping_method'] ?? null,
            'shipping_fee' => $data['shipping_fee'] ?? 0,
            'tracking_number' => $data['tracking_number'] ?? null,

            // Thông tin đơn hàng tại cửa hàng
            'is_store_pickup' => $data['is_store_pickup'] ?? false,

            // Thông tin mã giảm giá đơn hàng
            'order_coupon_code' => $data['order_coupon_code'] ?? null,
            'order_coupon_name' => $data['order_coupon_name'] ?? null,
            'order_discount_type' => $data['order_discount_type'] ?? null,
            'order_discount_value' => $data['order_discount_value'] ?? null,

            // Thông tin mã giảm giá vận chuyển
            'shipping_coupon_code' => $data['shipping_coupon_code'] ?? null,
            'shipping_coupon_name' => $data['shipping_coupon_name'] ?? null,
            'shipping_discount_type' => $data['shipping_discount_type'] ?? null,
            'shipping_discount_value' => $data['shipping_discount_value'] ?? null,
        ];

        // Thiết lập thời gian hết hạn thanh toán cho VNPay
        if (isset($data['payment_method']) && $data['payment_method'] === 'vnpay') {
            $expireMinutes = config('time.vnpay_payment_expire_minutes');
            $orderData['payment_expire_at'] = Carbon::now('Asia/Ho_Chi_Minh')->addMinutes($expireMinutes);
        }

        return $orderData;
    }

    /**
     * Thêm order items vào đơn hàng
     */
    private function addOrderItems($order, $orderItems)
    {
        foreach ($orderItems as $item) {
            if ($item['discount'] == null) {
                $item['discount'] = 0;
            }
            $price = $item['price'] * (1 - ($item['discount'] / 100));
            $quantity = $item['quantity'];
            $itemSubtotal = $price * $quantity;

            // Lấy thông tin sản phẩm để lưu "bản chụp"
            $product = Product::find($item['product_id']);
            $productVariant = null;
            $variantAttributes = null;
            $originalPrice = $product->price;

            if (!empty($item['product_variant_id'])) {
                $productVariant = ProductVariant::with('productAttributes.attribute', 'productAttributes.attributeValue')
                    ->find($item['product_variant_id']);
                $originalPrice = $productVariant->price;
                if ($productVariant) {
                    // Chuyển đổi thông tin thuộc tính biến thể thành JSON
                    $variantAttributes = [];
                    foreach ($productVariant->productAttributes as $attr) {
                        $variantAttributes[] = [
                            'attribute_id' => $attr->attribute->id,
                            'attribute_name' => $attr->attribute->name,
                            'value_id' => $attr->attributeValue->id,
                            'value_name' => $attr->attributeValue->value
                        ];
                    }
                }
            }

            // Tạo order item với thông tin "bản chụp"
            $order->orderItems()->create([
                'product_id' => $item['product_id'],
                'product_name' => $product ? $product->name : 'Unknown Product',
                'product_sku' => $product ? $product->sku : null,
                'product_type' => $product ? ($product->product_type === 'variable' ? OrderItem::PRODUCT_TYPE_VARIABLE : OrderItem::PRODUCT_TYPE_SIMPLE) : OrderItem::PRODUCT_TYPE_SIMPLE,
                'product_variant_id' => $item['product_variant_id'] ?? null,
                'variant_sku' => $productVariant ? $productVariant->sku : null,
                'variant_attributes' => $variantAttributes ? json_encode($variantAttributes) : null,
                'product_image' => $product ? $product->image : null,
                'quantity' => $quantity,
                'returned_quantity' => $quantity,
                'price' => $price,
                'original_price' => $originalPrice,
                'subtotal' => $itemSubtotal,
            ]);
        }
    }

    public function getOrderAll($paginate, $search = '')
    {
        $query = $this->model->with([
            'orderItems.product',
            'orderItems.productVariant'
        ])->orderBy('created_at', 'desc');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('order_code', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%") // nếu có trường này
                    ->orWhere('customer_phone', 'like', "%{$search}%"); // hoặc các trường phù hợp
            });
        }

        return $query->paginate($paginate);
    }


    public function getOrderById($id)
    {
        $order =  $this->model->with([
            'orderItems.product',
            'orderItems.productVariant.productAttributes.attribute',
            'orderItems.productVariant.productAttributes.attributeValue'
        ])->findOrFail($id);
        $order->history = $this->getOrderHistory($order->id);

        return $order;
    }

    /**
     * Update order status
     * Cập nhật trạng thái đơn hàng
     *
     * @param int $id Order ID
     * @param int $status New status
     * @param int|null $adminId Admin ID (if applicable)
     * @param int|null $customerId Customer ID (if applicable)
     * @param string|null $notes Notes
     * @param bool $isSystem System update
     * @return array
     */
    public function updateStatus($id, $status, $adminId = null, $customerId = null, $notes = null, $isSystem = false)
    {
        $order = $this->model->find($id);
        if (!$order) {
            Log::error('Order not found');
            return [
                'success' => false,
                'message' => 'Order not found',
                'code' => 404
            ]; // Không tìm thấy đơn hàng
        }

        $oldStatus = $order->status;

        // Determine roles for status transition check
        // Xác định vai trò để kiểm tra chuyển trạng thái
        $isAdmin = !is_null($adminId);
        $isCustomer = !is_null($customerId);

        // Check if status transition is valid
        // Kiểm tra tính hợp lệ của việc chuyển trạng thái
        if (!$this->isValidStatusTransition($oldStatus, $status, $isAdmin, $isCustomer, $isSystem)) {
            return [
                'success' => false,
                'message' => 'Cannot transition from status ' .
                    Order::$statusLabels[$oldStatus] . ' to ' .
                    Order::$statusLabels[$status], // Không thể chuyển từ trạng thái X sang Y
                'code' => 400
            ];
        }
        // Check permission to update status
        // Kiểm tra quyền cập nhật trạng thái
        $permissionCheckResult = $this->checkUpdateStatusPermission($adminId, $customerId, $isSystem, $status);
        if (!$permissionCheckResult['success']) {
            return $permissionCheckResult;
        }

        // Process status update and special cases
        // Xử lý cập nhật trạng thái và các trường hợp đặc biệt
        $this->processStatusUpdate($order, $status, $oldStatus, $adminId, $customerId, $notes);

        // Create order status history
        // Tạo lịch sử cập nhật trạng thái đơn hàng
        $historyData = [
            'status_from' => $oldStatus,
            'status_to' => $status,
            'notes' => $notes ?? 'Cập nhật trạng thái đơn hàng ' .
                Order::$statusLabels[$oldStatus] . ' sang ' .
                Order::$statusLabels[$status] // Cập nhật trạng thái đơn hàng
        ];

        // Identify the actor
        // Xác định người thực hiện
        if ($adminId) {
            $historyData['admin_id'] = $adminId;
        } elseif ($customerId) {
            $historyData['customer_id'] = $customerId;
        } elseif ($isSystem) {
            $historyData['actor_type'] = OrderHistory::ACTOR_TYPE_SYSTEM;
        }

        $this->addOrderHistory($order->id, OrderHistory::ACTION_STATUS_UPDATED, $historyData);

        // ✅ THÊM: Clear cache khi cập nhật status
        $this->analyticsService->clearDashboardCache();

        broadcast(new OrderStatusUpdated());

        return [
            'success' => true,
            'message' => 'Order status updated successfully', // Cập nhật trạng thái đơn hàng thành công
            'data' => $order,
            'code' => 200
        ];
    }

    /**
     * Check permission to update status
     * Kiểm tra quyền cập nhật trạng thái
     *
     * @param int|null $adminId Admin ID
     * @param int|null $customerId Customer ID
     * @param bool $isSystem System update
     * @param int $status New status
     * @return array
     */
    private function checkUpdateStatusPermission($adminId, $customerId, $isSystem, $status)
    {
        // Define allowed statuses for each role
        // Định nghĩa các trạng thái được phép cho từng vai trò
        $allowedStatusMap = [
            'admin' => [
                Order::STATUS_PENDING,
                Order::STATUS_CONFIRMED,
                Order::STATUS_PREPARING,
                Order::STATUS_READY_TO_SHIP,
                Order::STATUS_SHIPPING,
                Order::STATUS_DELIVERED,
                Order::STATUS_CANCELLED,
                Order::STATUS_RETURN_PROCESSING,
                Order::STATUS_RETURN_COMPLETED,
                Order::STATUS_RETURN_REJECTED,
                Order::STATUS_RETURN_TO_SHOP
            ],
            'customer' => [
                Order::STATUS_CANCELLED,
                Order::STATUS_COMPLETED,
                Order::STATUS_RETURN_REQUESTED
            ],
            'system' => [
                Order::STATUS_SHIPPING,
                Order::STATUS_DELIVERED,
                Order::STATUS_COMPLETED,
                Order::STATUS_RETURN_TO_SHOP
            ],
            'guest' => [
                Order::STATUS_CANCELLED,
                Order::STATUS_COMPLETED,
                Order::STATUS_RETURN_REQUESTED
            ]
        ];

        // Determine the role
        // Xác định vai trò
        $role = null;
        if ($adminId) {
            $role = 'admin';
        } elseif ($customerId) {
            $role = 'customer';
        } elseif ($isSystem) {
            $role = 'system';
        } else {
            $role = 'guest';
        }

        // Check if role is valid and status is allowed
        // Kiểm tra vai trò hợp lệ và trạng thái được phép
        if (!$role || !in_array($status, $allowedStatusMap[$role] ?? [])) {
            $messageMap = [
                'admin' => 'Admin does not have permission to update to this status', // Admin không có quyền cập nhật đến trạng thái này
                'customer' => 'Customer does not have permission to update to this status', // Khách hàng không có quyền cập nhật đến trạng thái này
                'system' => 'System does not have permission to update to this status', // Hệ thống không có quyền cập nhật đến trạng thái này
                'guest' => 'Guest does not have permission to update to this status', // Thêm thông báo cho khách không đăng nhập
                'unknown' => 'Unable to identify status update source' // Không xác định được nguồn cập nhật trạng thái
            ];

            return [
                'success' => false,
                'message' => $messageMap[$role] ?? $messageMap['unknown'],
                'code' => $role ? 403 : 400
            ];
        }

        return ['success' => true];
    }

    /**
     * Process status update and special cases
     * Xử lý cập nhật trạng thái và các trường hợp đặc biệt
     *
     * @param Order $order Order to update
     * @param int $status New status
     * @param int $oldStatus Old status
     * @param int|null $adminId Admin ID (if applicable)
     * @param int|null $customerId Customer ID (if applicable)
     * @param string|null $notes Notes
     * @return void
     */
    private function processStatusUpdate($order, $status, $oldStatus, $adminId = null, $customerId = null, $notes = null)
    {
        // Update order status
        // Cập nhật trạng thái của đơn hàng
        $order->status = $status;

        // Special handling for shipping status
        // Xử lý đặc biệt cho trạng thái vận chuyển
        if ($status == Order::STATUS_SHIPPING) {
            // Create tracking_number if not exists
            // Tạo tracking_number nếu chưa có
            if (empty($order->tracking_number)) {
                $order->tracking_number = $this->generateTrackingNumber();
            }
        }

        // Special handling for cancelled status
        // Xử lý các trường hợp đặc biệt khi hủy đơn
        if ($status == Order::STATUS_CANCELLED) {

            // Set cancelled_by based on who cancelled the order
            // Đặt cancelled_by dựa trên người hủy đơn
            if ($adminId) {
                $order->cancelled_by = $adminId;
                $order->cancel_reason = $notes ?? 'Order cancelled'; // Đơn hàng bị hủy
            } elseif ($customerId) {
                // Store customer ID in metadata or another field if needed
                // Lưu customer ID vào metadata hoặc trường khác nếu cần
                $order->cancelled_by = $customerId;
                $order->cancel_reason = 'Order cancelled by customer'; // Đơn hàng bị hủy
            }
        }

        if ($status == Order::STATUS_DELIVERED) {
            $this->updatePaymentStatus(
                $order->order_code,
                Order::PAYMENT_STATUS_PAID,
                null,
                $adminId
            );
        }
        // Increment delivery attempts if status is RETURN_TO_SHOP
        // Tăng số lần giao hàng thất bại nếu trạng thái là RETURN_TO_SHOP
        if ($status == Order::STATUS_RETURN_TO_SHOP) {
            $order->delivery_attempts = ($order->delivery_attempts ?? 0) + 1;
        }

        $order->save();

        // Sau khi đã lưu đơn hàng với trạng thái mới, thực hiện các thao tác bổ sung
        if ($status == Order::STATUS_CANCELLED) {
            // Return stock for cancelled orders
            // Nếu đơn hàng bị hủy, hoàn trả lại stock
            $this->returnStockForOrder($order->order_code);
            // Nếu đơn hàng đã thanh toán online, cập nhật trạng thái thanh toán
            if (
                $order->payment_status == Order::PAYMENT_STATUS_PAID &&
                $order->payment_method == 'vnpay'
            ) {

                // Cập nhật trạng thái thanh toán sang "hoàn tiền toàn bộ"
                $this->updatePaymentStatus(
                    $order->order_code,
                    Order::PAYMENT_STATUS_FULLY_REFUNDED,
                    $order->payment_transaction_id,
                    $adminId,
                    'Đơn hàng bị hủy, cần hoàn tiền cho khách hàng'
                );

                // Ghi log để admin xử lý hoàn tiền thủ công
                Log::info("Đơn hàng #{$order->order_code} đã bị hủy và cần được hoàn tiền. Số tiền: {$order->total_amount}");
            }
        }
    }

    public function deleteOrder($orderCode)
    {
        // Tìm và xóa đơn hàng dựa trên order_code
        $order =  $this->model->where('order_code', $orderCode)->first();

        if ($order) {
            // Xóa tất cả order_items liên quan (nếu có)
            $order->orderItems()->delete();

            // Xóa đơn hàng
            $order->delete();
        }
    }

    /**
     * Cập nhật trạng thái thanh toán
     *
     * @param string $orderCode Mã đơn hàng
     * @param int $status Trạng thái thanh toán mới (từ Order::PAYMENT_STATUS_*)
     * @param string|null $transactionId Mã giao dịch thanh toán
     * @param int|null $adminId ID của admin thực hiện (nếu có)
     * @param string|null $notes Ghi chú khi cập nhật trạng thái thanh toán
     * @return bool
     */
    public function updatePaymentStatus($orderCode, $status, $transactionId = null, $adminId = null, $notes = null)
    {
        $order = $this->model->where('order_code', $orderCode)->first();

        if (!$order) {
            return false;
        }

        $oldStatus = $order->payment_status;

        // Kiểm tra trạng thái thanh toán hợp lệ
        if (!in_array($status, [
            Order::PAYMENT_STATUS_UNPAID,
            Order::PAYMENT_STATUS_PAID,
            Order::PAYMENT_STATUS_PARTIALLY_REFUNDED,
            Order::PAYMENT_STATUS_FULLY_REFUNDED,
            Order::PAYMENT_STATUS_FAILED,
            Order::PAYMENT_STATUS_EXPIRED
        ])) {
            return false;
        }

        // Cập nhật trạng thái thanh toán
        $order->payment_status = $status;

        // Cập nhật mã giao dịch nếu có
        if ($transactionId) {
            $order->payment_transaction_id = $transactionId;
        }

        // Nếu đã thanh toán, cập nhật thời gian thanh toán
        if ($status == Order::PAYMENT_STATUS_PAID && !$order->paid_at) {
            $order->paid_at = now();
        }

        $order->save();

        // Tạo lịch sử đơn hàng
        $historyData = [
            'admin_id' => $adminId,
            'notes' => $notes ?? 'Cập nhật trạng thái thanh toán từ ' .
                Order::$paymentStatusLabels[$oldStatus] . ' sang ' .
                Order::$paymentStatusLabels[$status],
            'metadata' => [
                'payment_transaction_id' => $transactionId,
                'old_payment_status' => $oldStatus,
                'new_payment_status' => $status
            ]
        ];

        $this->addOrderHistory($order->id, OrderHistory::ACTION_PAYMENT_UPDATED, $historyData);

        return true;
    }


    /**
     * Lấy đơn hàng theo mã order_code
     *
     * @param string $orderCode Mã đơn hàng
     * @return Order|null
     */
    public function getOrderByCode($orderCode)
    {
        $order = $this->model
            ->with([
                'orderItems.product',  // Load thông tin sản phẩm
                'orderItems.productVariant' // Load thông tin biến thể (nếu có)
            ])
            ->where('order_code', $orderCode)
            ->firstOrFail();
        $order->history = $this->getOrderHistory($order->id);

        return $order;
    }

    public function getOrderReturn($paginate = 10)
    {
        return OrderUserReturn::whereHas('order', function ($query) {
            $query->whereIn('status', [
                Order::STATUS_RETURN_REQUESTED,
                Order::STATUS_RETURN_PROCESSING,
                Order::STATUS_RETURN_COMPLETED,
                Order::STATUS_RETURN_REJECTED
            ]);
        })->with('order') // nếu bạn vẫn muốn load thông tin order liên quan
            ->orderBy('id', 'desc')
            ->paginate($paginate);
    }

    public function getOrderUserReturn($orderId)
    {
        $return = OrderUserReturn::with([
            'images',                                        // ảnh trả hàng
            'order.orderItems.product',                      // sản phẩm
            'order.orderItems.productVariant.productAttributes.attribute',
            'order.orderItems.productVariant.productAttributes.attributeValue'
        ])
            ->where('order_id', $orderId)
            ->firstOrFail();                                    // hoặc ->first() nếu không muốn ném 404

        // Gắn thêm trường order_status để tương thích API cũ
        $return->order_status = $return->order->status ?? null;

        return $return;
    }


    public function generateUniqueOrderCode()
    {
        do {
            // Tạo mã order code ngẫu nhiên
            $order_code = substr(str_replace('-', '', base_convert(Str::uuid()->getHex(), 16, 36)), 0, 10);

            // Kiểm tra sự tồn tại trong cơ sở dữ liệu (tránh trùng lặp)
            $orderExists = Order::where('order_code', $order_code)->exists();
        } while ($orderExists);  // Lặp lại nếu mã bị trùng

        return $order_code;  // Trả về mã duy nhất
    }
    public function updateStockForOrder($orderCode)
    {
        $order = Order::where('order_code', $orderCode)->first();
        if (!$order) {
            return false;  // Trả về false nếu không tìm thấy đơn hàng
        }
        // Lấy danh sách các sản phẩm và số lượng từ bảng order_items
        $orderItems = OrderItem::where('order_id', $order->id)->get();

        foreach ($orderItems as $item) {
            // Nếu có product_variant_id, giảm stock trong bảng product_variants
            if ($item->product_variant_id) {
                ProductVariant::where('id', $item->product_variant_id)->decrement('stock', $item->quantity);
            }
            // Nếu không có product_variant_id, giảm stock trong bảng products
            else {
                Product::where('id', $item->product_id)->decrement('stock', $item->quantity);
            }
        }
        return true;  // Trả về true nếu đã cập nhật stock thành công
    }

    /**
     * Hoàn trả tồn kho khi hủy đơn hàng
     *
     * @param string $orderCode Mã đơn hàng
     * @return bool
     */
    public function returnStockForOrder($orderCode)
    {
        // Log::info("returnStockForOrder được gọi với orderCode: {$orderCode}");

        $order = $this->model->where('order_code', $orderCode)->first();

        if (!$order) {
            Log::error("Không tìm thấy đơn hàng với orderCode: {$orderCode}");
            return false;
        }

        // Log::info("Đơn hàng tìm thấy: ID={$order->id}, status={$order->status}");

        // Chỉ hoàn trả stock nếu đơn hàng bị hủy hoặc đang xử lý hoàn trả
        if (!in_array($order->status, [Order::STATUS_CANCELLED, Order::STATUS_RETURN_PROCESSING])) {
            Log::warning("Đơn hàng không ở trạng thái hủy hoặc đang xử lý hoàn trả");
            return false;
        }

        // Lấy danh sách các sản phẩm và số lượng từ bảng order_items
        $orderItems = OrderItem::where('order_id', $order->id)->get();
        // Log::info("Số lượng sản phẩm trong đơn hàng: " . $orderItems->count());

        foreach ($orderItems as $item) {
            // Số lượng cần hoàn trả (số lượng đặt - số lượng đã hoàn trả)
            $quantityToReturn = $item->quantity;
            // Log::info("Item ID={$item->id}: quantity={$item->quantity}, returned_quantity={$item->returned_quantity}, quantityToReturn={$quantityToReturn}");

            if ($quantityToReturn <= 0) {
                continue; // Bỏ qua nếu đã hoàn trả hết
            }

            // Cập nhật stock và returned_quantity
            try {
                if ($item->product_variant_id) {
                    ProductVariant::where('id', $item->product_variant_id)->increment('stock', $quantityToReturn);
                    // Log::info("Đã cập nhật stock cho variant ID={$item->product_variant_id} (+{$quantityToReturn})");
                } else {
                    Product::where('id', $item->product_id)->increment('stock', $quantityToReturn);
                    // Log::info("Đã cập nhật stock cho product ID={$item->product_id} (+{$quantityToReturn})");
                }

                $item->returned_quantity = $item->quantity;
                $item->return_status = OrderItem::RETURN_STATUS_RETURNED;
                $item->save();

                // Log::info("Đã cập nhật returned_quantity={$item->returned_quantity} cho item ID={$item->id}");
            } catch (Exception $e) {
                Log::error("Lỗi khi cập nhật: " . $e->getMessage());
            }
        }

        // Tạo lịch sử đơn hàng
        $historyData = [
            'notes' => 'Hoàn trả tồn kho do đơn hàng bị hủy hoặc hoàn trả',
            'metadata' => [
                'order_status' => $order->status,
                'items_returned' => $orderItems->count()
            ]
        ];

        $this->addOrderHistory($order->id, OrderHistory::ACTION_ORDER_CANCELLED, $historyData);
        // Log::info("returnStockForOrder hoàn thành");
        return true;
    }

    /**
     * Lấy danh sách đơn hàng của một khách hàng với tìm kiếm và phân trang
     *
     * @param int $customerId ID của khách hàng
     * @param array $searchParams Các tham số tìm kiếm
     * @param int $perPage Số lượng kết quả mỗi trang
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getOrdersByCustomerId($customerId, $searchParams = [], $perPage = 10)
    {
        $query = $this->model->with([
            'orderItems.product',
            'orderItems.productVariant.productAttributes.attribute',
            'orderItems.productVariant.productAttributes.attributeValue'
        ])
            ->where('customer_id', $customerId);

        // Tìm kiếm theo từ khoá (có thể là mã đơn hàng hoặc tên sản phẩm)
        if (!empty($searchParams['keyword'])) {
            $keyword = $searchParams['keyword'];

            // Tìm theo mã đơn hàng
            $ordersByCode = $this->model->where('customer_id', $customerId)
                ->where('order_code', 'like', '%' . $keyword . '%')
                ->pluck('id');

            // Tìm theo tên sản phẩm
            $ordersByProduct = $this->model->where('customer_id', $customerId)
                ->whereHas('orderItems.product', function ($q) use ($keyword) {
                    $q->where('name', 'like', '%' . $keyword . '%');
                })
                ->pluck('id');

            // Kết hợp kết quả
            $allOrderIds = $ordersByCode->merge($ordersByProduct)->unique();

            if ($allOrderIds->isNotEmpty()) {
                $query->whereIn('id', $allOrderIds);
            } else {
                // Nếu không tìm thấy kết quả nào, trả về kết quả rỗng
                $query->where('id', 0);
            }
        }


        // Lọc theo nhóm status
        if (!empty($searchParams['status_group'])) {
            $statusGroup = $searchParams['status_group'];

            // Nếu là nhóm status đã định nghĩa
            if (isset(Order::$statusGroups[$statusGroup])) {
                $groupStatusValues  = Order::$statusGroups[$statusGroup];

                // Nếu statuses không phải null (trường hợp 'all')
                if ($groupStatusValues  !== null) {
                    $query->whereIn('status', $groupStatusValues);
                }
            }
        }

        // Sắp xếp theo thời gian tạo, mới nhất lên đầu
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Đếm số lượng đơn hàng theo nhóm status, có tính đến điều kiện tìm kiếm
     *
     * @param int $customerId ID của khách hàng
     * @param array $searchParams Các tham số tìm kiếm
     * @return array
     */
    public function countOrdersByStatusGroups($customerId, $searchParams = [])
    {
        $result = [];

        // Lấy danh sách ID đơn hàng phù hợp với điều kiện tìm kiếm
        $filteredOrderIds = null;

        // Nếu có từ khóa tìm kiếm, lọc các đơn hàng phù hợp
        if (!empty($searchParams['keyword'])) {
            $keyword = $searchParams['keyword'];

            // Tìm theo mã đơn hàng
            $ordersByCode = $this->model->where('customer_id', $customerId)
                ->where('order_code', 'like', '%' . $keyword . '%')
                ->pluck('id');

            // Tìm theo tên sản phẩm
            $ordersByProduct = $this->model->where('customer_id', $customerId)
                ->whereHas('orderItems.product', function ($q) use ($keyword) {
                    $q->where('name', 'like', '%' . $keyword . '%');
                })
                ->pluck('id');

            // Kết hợp kết quả
            $filteredOrderIds = $ordersByCode->merge($ordersByProduct)->unique()->toArray();

            // Nếu không có kết quả nào, trả về tất cả 0
            if (empty($filteredOrderIds)) {
                foreach (Order::$statusGroups as $groupName => $statuses) {
                    $result[$groupName] = 0;
                }
                return $result;
            }
        }

        // Đếm tổng số đơn hàng (có tính đến điều kiện tìm kiếm)
        $baseQuery = $this->model->where('customer_id', $customerId);

        // Nếu có danh sách ID đã lọc, chỉ đếm những đơn hàng trong danh sách đó
        if ($filteredOrderIds !== null) {
            $baseQuery->whereIn('id', $filteredOrderIds);
        }

        $result['all'] = $baseQuery->count();

        // Đếm theo từng nhóm status
        foreach (Order::$statusGroups as $groupName => $statuses) {
            if ($groupName === 'all') continue; // Bỏ qua nhóm 'all' vì đã đếm ở trên

            $query = $this->model->where('customer_id', $customerId);

            // Nếu có danh sách ID đã lọc, chỉ đếm những đơn hàng trong danh sách đó
            if ($filteredOrderIds !== null) {
                $query->whereIn('id', $filteredOrderIds);
            }

            if ($statuses === null) {
                $result[$groupName] = $result['all'];
            } else {
                $result[$groupName] = $query->whereIn('status', $statuses)->count();
            }
        }

        return $result;
    }

    /**
     * Lấy danh sách đơn hàng của người dùng hiện tại
     *
     * @param \App\Models\User $user Người dùng hiện tại
     * @return \Illuminate\Support\Collection |\Illuminate\Pagination\LengthAwarePaginator
     */
    public function getOrdersByUser($user, $searchParams = [], $perPage = 10)
    {
        // Kiểm tra xem user có phải là customer không
        if ($user->account_type !== 'customer' || !$user->customer) {
            return collect(); // Trả về collection rỗng nếu không phải customer
        }

        // Lấy dữ liệu phân trang
        $paginatedOrders = $this->getOrdersByCustomerId($user->customer->id, $searchParams, $perPage);

        // Thêm lịch sử cho mỗi đơn hàng
        $paginatedOrders->getCollection()->transform(function ($order) {
            $order->history = $this->getOrderHistory($order->id);
            return $order;
        });

        return $paginatedOrders;
    }

    /**
     * Thêm lịch sử đơn hàng
     *
     * @param int $orderId ID đơn hàng
     * @param int $actionType Loại hành động (từ OrderHistory::ACTION_*)
     * @param array $data Dữ liệu bổ sung
     * @return OrderHistory
     */
    private function addOrderHistory($orderId, $actionType, $data = [])
    {
        return OrderHistory::createHistory($orderId, $actionType, $data);
    }

    /**
     * Tạo mã vận đơn ngẫu nhiên
     *
     * @return string
     */
    protected function generateTrackingNumber()
    {
        do {
            // Tạo mã vận đơn ngẫu nhiên
            $prefix = 'TN';
            $timestamp = date('YmHi');
            $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
            $trackingNumber = $prefix . $timestamp . $random;

            // Kiểm tra sự tồn tại trong cơ sở dữ liệu (tránh trùng lặp)
            $exists = $this->model->where('tracking_number', $trackingNumber)->exists();
        } while ($exists);

        return $trackingNumber;
    }

    /**
     * Kiểm tra tính hợp lệ của việc chuyển trạng thái
     *
     * @param int $oldStatus Trạng thái cũ
     * @param int $newStatus Trạng thái mới
     * @param bool $isAdmin Người thực hiện có phải là admin
     * @param bool $isCustomer Người thực hiện có phải là khách hàng
     * @return bool
     */
    protected function isValidStatusTransition($oldStatus, $newStatus, $isAdmin = false, $isCustomer = false, $isSystem = false)
    {

        // Định nghĩa các chuyển trạng thái hợp lệ cho Admin
        $adminValidTransitions = [
            // Từ đang xử lý (0) có thể chuyển sang đã xác nhận (1) hoặc đã hủy (10)
            Order::STATUS_PENDING => [
                Order::STATUS_CONFIRMED,
                Order::STATUS_CANCELLED
            ],

            // Từ đã xác nhận (1) có thể chuyển sang đang chuẩn bị hàng (2)
            Order::STATUS_CONFIRMED => [
                Order::STATUS_PREPARING,
                Order::STATUS_CANCELLED
            ],

            // Từ đang chuẩn bị hàng (2) chỉ có thể chuyển sang sẵn sàng giao hàng (3)
            Order::STATUS_PREPARING => [
                Order::STATUS_READY_TO_SHIP
            ],

            // Từ sẵn sàng giao hàng (3) chỉ có thể chuyển sang đang giao hàng (4)
            Order::STATUS_READY_TO_SHIP => [
                Order::STATUS_SHIPPING
            ],

            // Từ đang giao hàng (4) có thể chuyển sang đã giao hàng (5) hoặc hoàn về cửa hàng (11)
            Order::STATUS_SHIPPING => [
                Order::STATUS_DELIVERED,
                Order::STATUS_RETURN_TO_SHOP
            ],

            // // Từ đã giao hàng (5) admin không thể chuyển sang trạng thái nào
            // Order::STATUS_DELIVERED => [],

            // // Từ hoàn thành (6) admin không thể chuyển sang trạng thái nào
            // Order::STATUS_COMPLETED => [],

            // Từ đã yêu cầu đổi/trả (7) admin có thể chuyển sang đang xử lý đổi/trả (8) hoặc từ chối đổi trả (14)
            Order::STATUS_RETURN_REQUESTED => [
                Order::STATUS_RETURN_PROCESSING,
                Order::STATUS_RETURN_REJECTED
            ],

            // Từ đang xử lý đổi/trả (8) admin có thể chuyển sang đã hoàn thành đổi/trả (9)
            Order::STATUS_RETURN_PROCESSING => [
                Order::STATUS_RETURN_COMPLETED
            ],

            // // Từ đã hoàn thành đổi/trả (9) không thể chuyển sang trạng thái nào
            // Order::STATUS_RETURN_COMPLETED => [],

            // // Từ đã hủy (10) không thể chuyển sang trạng thái nào
            // Order::STATUS_CANCELLED => [],

            // Từ hoàn về cửa hàng (11) có thể chuyển sang đang giao hàng (4) hoặc đã hủy (10)
            Order::STATUS_RETURN_TO_SHOP => [
                Order::STATUS_SHIPPING,
                Order::STATUS_CANCELLED
            ],

            // // Từ đã từ chối đổi trả (14) admin không thể chuyển sang trạng thái nào
            // Order::STATUS_RETURN_REJECTED => []
        ];

        // Định nghĩa các chuyển trạng thái hợp lệ cho Khách hàng
        $customerValidTransitions = [
            // Từ đang xử lý (0) khách hàng có thể hủy đơn (trong thời gian cho phép)
            Order::STATUS_PENDING => [
                Order::STATUS_CANCELLED
            ],

            // Từ đã xác nhận (1) khách hàng có thể hủy đơn (trong thời gian cho phép)
            Order::STATUS_CONFIRMED => [
                Order::STATUS_CANCELLED
            ],

            // Từ đã giao hàng (5) khách hàng có thể xác nhận hoàn thành hoặc yêu cầu đổi/trả
            Order::STATUS_DELIVERED => [
                Order::STATUS_COMPLETED,
                Order::STATUS_RETURN_REQUESTED
            ],

            // // Từ hoàn thành (6) khách hàng có thể yêu cầu đổi/trả (trong thời hạn)
            // Order::STATUS_COMPLETED => [
            //     Order::STATUS_RETURN_REQUESTED
            // ],

            // // Từ đã từ chối đổi trả (14) khách hàng có thể tạo yêu cầu mới (trong thời hạn)
            // Order::STATUS_RETURN_REJECTED => [
            //     Order::STATUS_RETURN_REQUESTED
            // ]
        ];

        // Định nghĩa các chuyển trạng thái hợp lệ cho System
        $systemValidTransitions = [
            // Từ đã giao hàng (5) hệ thống có thể tự động chuyển sang hoàn thành (6)
            Order::STATUS_DELIVERED => [
                Order::STATUS_COMPLETED
            ],
            // Có thể thêm các trạng thái khác mà hệ thống được phép chuyển đổi
            Order::STATUS_SHIPPING => [
                Order::STATUS_DELIVERED,
                Order::STATUS_RETURN_TO_SHOP
            ],
            Order::STATUS_COMPLETED => [
                Order::STATUS_RETURN_REQUESTED
            ],
            Order::STATUS_RETURN_TO_SHOP => [
                Order::STATUS_SHIPPING,
                Order::STATUS_CANCELLED
            ]
        ];

        // Kiểm tra quyền chuyển trạng thái dựa trên vai trò
        if ($isAdmin) {
            return in_array($newStatus, $adminValidTransitions[$oldStatus] ?? []);
        } elseif ($isCustomer) {
            return in_array($newStatus, $customerValidTransitions[$oldStatus] ?? []);
        } elseif ($isSystem) {
            return in_array($newStatus, $systemValidTransitions[$oldStatus] ?? []);
        }

        // Mặc định không cho phép chuyển trạng thái nếu không xác định vai trò
        return false;
    }

    /**
     * Lấy lịch sử đơn hàng theo ID
     *
     * @param int $orderId ID của đơn hàng
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getOrderHistory($orderId)
    {
        return OrderHistory::where('order_id', $orderId)
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * Tự động chuyển trạng thái đơn hàng từ DELIVERED sang COMPLETED sau một khoảng thời gian
     *
     * @param int|null $time Thời gian sau khi giao hàng để tự động chuyển sang hoàn thành
     * @param string $unit Đơn vị thời gian (minutes, hours, days)
     * @return int Số đơn hàng đã được cập nhật
     */
    public function autoCompleteDeliveredOrders($time = null, $unit = 'minutes')
    {
        $configKey = 'time.order_auto_complete_' . $unit;
        $value = $time ?? config($configKey);

        switch ($unit) {
            case 'days':
                $timeInMinutes = $value * 24 * 60;
                $timeDisplay = $value . ' ngày';
                break;
            case 'hours':
                $timeInMinutes = $value * 60;
                $timeDisplay = $value . ' giờ';
                break;
            case 'minutes':
            default:
                $timeInMinutes = $value;
                $timeDisplay = $value . ' phút';
                break;
        }

        // Tìm các đơn hàng đã giao nhưng chưa hoàn thành và đã qua thời gian quy định
        $cutoffDate = now()->subMinutes($timeInMinutes);

        $orders = $this->model
            ->where('status', Order::STATUS_DELIVERED)
            ->where('updated_at', '<=', $cutoffDate)
            ->get();

        $count = 0;

        foreach ($orders as $order) {
            // Cập nhật trạng thái đơn hàng
            $result = $this->updateStatus(
                $order->id,
                Order::STATUS_COMPLETED,
                null,
                null,
                'Đơn hàng được tự động chuyển sang trạng thái hoàn thành sau ' . $timeDisplay,
                true // isSystem = true
            );

            if ($result['success']) {
                $count++;
                Log::info("Đơn hàng #{$order->order_code} đã được tự động chuyển sang trạng thái hoàn thành sau {$timeDisplay}");
            } else {
                Log::error("Không thể tự động cập nhật trạng thái đơn hàng #{$order->order_code}: " . $result['message']);
            }
        }

        return $count;
    }

    /**
     * Hủy các đơn hàng đã hết hạn thanh toán
     *
     * @return array Thông tin về số lượng đơn hàng đã hủy
     */
    public function cancelExpiredOrders()
    {
        try {
            DB::beginTransaction();

            // Tìm các đơn hàng đã quá hạn thanh toán
            // 1. Phương thức thanh toán là VNPay
            // 2. Trạng thái thanh toán là chưa thanh toán
            // 3. Thời gian hết hạn thanh toán đã qua
            $expiredOrders = Order::where('payment_method', 'vnpay')
                ->where('payment_status', Order::PAYMENT_STATUS_UNPAID)
                ->where('payment_expire_at', '<', Carbon::now())
                ->where('status', Order::STATUS_PENDING)
                ->get();

            $count = $expiredOrders->count();
            $cancelledOrders = [];

            foreach ($expiredOrders as $order) {
                // Lưu thông tin đơn hàng vào log trước khi cập nhật trạng thái
                Log::info('Cancelling expired order', [
                    'order_id' => $order->id,
                    'order_code' => $order->order_code,
                    'customer_name' => $order->customer_name,
                    'payment_expire_at' => $order->payment_expire_at,
                    'total_amount' => $order->total_amount
                ]);

                // Cập nhật trạng thái đơn hàng thành đã hủy và trạng thái thanh toán thành hết hạn
                $order->status = Order::STATUS_CANCELLED;
                $order->payment_status = Order::PAYMENT_STATUS_EXPIRED;
                $order->cancel_reason = 'Hết hạn thanh toán';
                // $order->cancelled_at = Carbon::now();
                $order->save();

                // Tạo lịch sử đơn hàng
                OrderHistory::createHistory(
                    $order->id,
                    OrderHistory::ACTION_ORDER_CANCELLED,
                    [
                        'status_from' => Order::STATUS_PENDING,
                        'status_to' => Order::STATUS_CANCELLED,
                        'notes' => 'Đơn hàng bị hủy do hết hạn thanh toán',
                        'metadata' => [
                            'payment_expire_at' => $order->payment_expire_at,
                            'cancelled_at' => Carbon::now(),
                        ]
                    ]
                );

                $cancelledOrders[] = [
                    'order_code' => $order->order_code,
                    'customer_name' => $order->customer_name,
                    'payment_expire_at' => $order->payment_expire_at,
                ];
            }

            DB::commit();

            return [
                'success' => true,
                'count' => $count,
                'cancelled_orders' => $cancelledOrders
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error while cancelling expired orders: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
                'count' => 0,
                'cancelled_orders' => []
            ];
        }
    }
}
