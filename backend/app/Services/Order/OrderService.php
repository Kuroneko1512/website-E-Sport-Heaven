<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\BaseService;
use Illuminate\Support\Str;

class OrderService extends BaseService
{
    public function __construct(Order $order)
    {
        parent::__construct($order);
    }
    public function createOrder($data)
    {
        // Kiểm tra xem có order_items không
        if (empty($data['order_items']) || !is_array($data['order_items'])) {
            throw new \Exception('Đơn hàng phải có ít nhất một sản phẩm.');
        }

        // Xử lý dữ liệu khách hàng
        $orderData = $this->prepareOrderData($data);

        // Tạo đơn hàng mới
        $order = $this->model->create($orderData);

        // Thêm order_items và cập nhật tổng tiền
        $totalAmount = $this->addOrderItems($order, $data['order_items']);
        $order->update(['total_amount' => $totalAmount]);

        return $order;
    }
    public function getOrderAll()
    {
        return $this->model->with([
            'orderItems.product',
            'orderItems.productVariant'
        ])->get();
    }


    public function getOrderById($id)
    {
        return $this->model->with([
            'orderItems.product',
            'orderItems.productVariant.productAttributes.attribute',
            'orderItems.productVariant.productAttributes.attributeValue'
        ])->findOrFail($id);
    }

    public function updateStatus($id, $status)
    {
        $order = $this->model->find($id);

        if (!$order) {
            return ['success' => false, 'message' => 'Order not found'];
        }

        // Cập nhật trạng thái của đơn hàng
        $order->status = $status;
        $order->save();

        // Nếu status được cập nhật là "đã hủy", hoàn trả lại stock
        if ($status === 'đã hủy') {
            $this->returnStockForOrder($order->order_code);
        }

        return [
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $order
        ];
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
    public function updatePaymentStatus($orderCode, $status)
    {
        // Tìm đơn hàng theo order_code và cập nhật trạng thái thanh toán
        return $this->model->where('order_code', $orderCode)->update(['payment-status' => $status]);
    }


    /**
     * Lấy đơn hàng theo mã order_code
     */
    public function getOrderByCode($orderCode)
    {
        return $this->model
            ->with([
                'orderItems.product',  // Load thông tin sản phẩm
                'orderItems.productVariant' // Load thông tin biến thể (nếu có)
            ])
            ->where('order_code', $orderCode)
            ->firstOrFail();
    }
    /**
     * Xử lý dữ liệu khách hàng trước khi tạo đơn hàng
     */
    private function prepareOrderData($data)
    {
        // // Nếu có `customer_id`, xóa thông tin khách hàng
        // if (!empty($data['customer_id'])) {
        //     $data['customer_name'] = null;
        //     $data['customer_email'] = null;
        //     $data['customer_phone'] = null;
        //     $data['shipping_address'] = null;
        // }
        return [
            'customer_id' => $data['customer_id'] ?? null,
            'customer_name' => $data['customer_name'] ?? null,
            'customer_email' => $data['customer_email'] ?? null,
            'customer_phone' => $data['customer_phone'] ?? null,
            'shipping_address' => $data['shipping_address'] ?? null,
            'total_amount' => 0,
            'order_code' => $this->generateUniqueOrderCode(),
            'status' => 'đang xử lý',
        ];
    }

    /**
     * Thêm order items vào đơn hàng và tính tổng tiền
     */
    private function addOrderItems($order, $orderItems)
    {
        $totalAmount = 0;

        foreach ($orderItems as $item) {
            $subtotal = $item['price'] * $item['quantity'];
            $totalAmount += $subtotal;

            $order->orderItems()->create([
                'product_id' => $item['product_id'],
                'product_variant_id' => $item['product_variant_id'] ?? null,
                'quantity' => $item['quantity'],
                'price' => $item['price'],

            ]);
        }

        return $totalAmount;
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

    public function returnStockForOrder($orderCode)
    {
        $order = Order::where('order_code', $orderCode)->first();

        if (!$order) {
            return false;  // Trả về false nếu không tìm thấy đơn hàng
        }

        // Lấy danh sách các sản phẩm và số lượng từ bảng order_items
        $orderItems = OrderItem::where('order_id', $order->id)->get();

        foreach ($orderItems as $item) {
            // Nếu có product_variant_id, cộng lại stock trong bảng product_variants
            if ($item->product_variant_id) {
                ProductVariant::where('id', $item->product_variant_id)->increment('stock', $item->quantity);
            }
            // Nếu không có product_variant_id, cộng lại stock trong bảng products
            else {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }
        }

        return true;  // Trả về true nếu hoàn trả stock thành công
    }

    /**
     * Lấy danh sách đơn hàng của một khách hàng
     * 
     * @param int $customerId ID của khách hàng
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getOrdersByCustomerId($customerId)
    {
        return $this->model->with([
            'orderItems.product',
            'orderItems.productVariant.productAttributes.attribute',
            'orderItems.productVariant.productAttributes.attributeValue'
        ])
            ->where('customer_id', $customerId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Lấy danh sách đơn hàng của người dùng hiện tại
     * 
     * @param \App\Models\User $user Người dùng hiện tại
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getOrdersByUser($user)
    {
        // Kiểm tra xem user có phải là customer không
        if ($user->account_type !== 'customer' || !$user->customer) {
            return collect(); // Trả về collection rỗng nếu không phải customer
        }

        return $this->getOrdersByCustomerId($user->customer->id);
    }
}
