<?php

namespace App\Services\Order;

use App\Models\OrderUserReturn;
use Exception;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Support\Str;
use App\Models\OrderHistory;
use App\Services\BaseService;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderService extends BaseService
{
    public function __construct(Order $order)
    {
        parent::__construct($order);
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

        // Thêm kiểm tra tồn kho ở đây
        $stockCheck = $this->checkStockAvailability($data['order_items']);
        if ($stockCheck !== true) {
            throw new Exception('Sô lượng sản phẩm trong kho không đủ');
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
            // Thêm thông tin trạng thái và ghi chú
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

            Log::info($historyData);

            // Gọi phương thức createHistory
            OrderHistory::createHistory(
                $order->id,
                OrderHistory::ACTION_ORDER_CREATED,
                $historyData
            );

            DB::commit();

            return $order;
        } catch (Exception $e) {
            DB::rollBack();
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

            // Kiểm tra tồn kho
            if ($variantId) {
                $variant = ProductVariant::find($variantId);
                if (!$variant) {
                    Log::error("Biến thể sản phẩm không tồn tại.");
                    return "Biến thể sản phẩm không tồn tại.";
                }
                if ($variant->stock < $quantity) {
                    $product = Product::find($productId);
                    $productName = $product ? $product->name : 'Sản phẩm';
                    Log::error("Sản phẩm '{$productName}' (biến thể {$variant->sku}) chỉ còn {$variant->stock} sản phẩm trong kho.");
                    return "Sản phẩm '{$productName}' (biến thể {$variant->sku}) chỉ còn {$variant->stock} sản phẩm trong kho.";
                }
            } else {
                $product = Product::find($productId);
                if (!$product) {
                    Log::error("Sản phẩm không tồn tại.");
                    return "Sản phẩm không tồn tại.";
                }
                if ($product->stock < $quantity) {
                    Log::error("Sản phẩm '{$product->name}' chỉ còn {$product->stock} sản phẩm trong kho.");
                    return "Sản phẩm '{$product->name}' chỉ còn {$product->stock} sản phẩm trong kho.";
                }
            }
        }

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

    public function getOrderAll($paginate = 10)
    {
        return $this->model->with([
            'orderItems.product',
            'orderItems.productVariant'
        ])->orderBy('id', 'desc')->paginate($paginate);
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
        }

        $this->addOrderHistory($order->id, OrderHistory::ACTION_STATUS_UPDATED, $historyData);


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

        // Tìm kiếm theo mã đơn hàng
        if (!empty($searchParams['order_code'])) {
            $query->where('order_code', 'like', '%' . $searchParams['order_code'] . '%');
        }

        // Tìm kiếm theo tên sản phẩm
        if (!empty($searchParams['product_name'])) {
            $productName = $searchParams['product_name'];
            $query->whereHas('orderItems.product', function ($q) use ($productName) {
                $q->where('name', 'like', '%' . $productName . '%');
            });
        }

        // Sắp xếp theo thời gian tạo, mới nhất lên đầu
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Lấy danh sách đơn hàng của người dùng hiện tại
     *
     * @param \App\Models\User $user Người dùng hiện tại
     * @return \Illuminate\Database\Eloquent\Collection |\Illuminate\Pagination\LengthAwarePaginator
     */
    public function getOrdersByUser($user, $searchParams = [], $perPage = 10)
    {
        // Kiểm tra xem user có phải là customer không
        if ($user->account_type !== 'customer' || !$user->customer) {
            return collect(); // Trả về collection rỗng nếu không phải customer
        }

        return $this->getOrdersByCustomerId($user->customer->id, $searchParams, $perPage);
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
                Order::STATUS_PREPARING
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

            // Từ đã giao hàng (5) khách hàng có thể xác nhận hoàn thành hoặc yêu cầu đổi/trả
            Order::STATUS_DELIVERED => [
                Order::STATUS_COMPLETED,
                Order::STATUS_RETURN_REQUESTED
            ],

            // Từ hoàn thành (6) khách hàng có thể yêu cầu đổi/trả (trong thời hạn)
            Order::STATUS_COMPLETED => [
                Order::STATUS_RETURN_REQUESTED
            ],

            // Từ đã từ chối đổi trả (14) khách hàng có thể tạo yêu cầu mới (trong thời hạn)
            Order::STATUS_RETURN_REJECTED => [
                Order::STATUS_RETURN_REQUESTED
            ]
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
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Tự động chuyển trạng thái đơn hàng từ DELIVERED sang COMPLETED sau một khoảng thời gian
     * 
     * @param int $daysToAutoComplete Số ngày sau khi giao hàng để tự động chuyển sang hoàn thành
     * @return int Số đơn hàng đã được cập nhật
     */
    public function autoCompleteDeliveredOrders($daysToAutoComplete = null)
    {
        $daysToAutoComplete = $daysToAutoComplete ?? config('time.order_auto_complete_days', 3);
        // Tìm các đơn hàng đã giao nhưng chưa hoàn thành và đã qua thời gian quy định
        $cutoffDate = now()->subDays($daysToAutoComplete);

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
                'Đơn hàng được tự động chuyển sang trạng thái hoàn thành sau ' . $daysToAutoComplete . ' ngày giao hàng',
                true // isSystem = true
            );

            if ($result['success']) {
                $count++;
                Log::info("Đơn hàng #{$order->order_code} đã được tự động chuyển sang trạng thái hoàn thành");
            } else {
                Log::error("Không thể tự động cập nhật trạng thái đơn hàng #{$order->order_code}: " . $result['message']);
            }
        }

        return $count;
    }
}
