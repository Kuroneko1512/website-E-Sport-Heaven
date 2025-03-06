<?php

namespace App\Services\Order;

use App\Models\Order;
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
            'orderItems.productVariant'
        ])->findOrFail($id);
    }

    public function updateStatus($id, $status)
    {
        $order = $this->model->find($id);
        if (!$order) {
            return ['success' => false, 'message' => 'Order not found'];
        }

        $order->status = $status;
        $order->save();

        return [
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $order
        ];
    }

    /**
     * Lấy đơn hàng theo mã order_code
     */
    public function getOrderByCode($orderCode)
    {
        return $this->model->with('orderItems')->where('order_code', $orderCode)->firstOrFail();
    }
    /**
     * Xử lý dữ liệu khách hàng trước khi tạo đơn hàng
     */
    private function prepareOrderData($data)
    {
        // Nếu có `customer_id`, xóa thông tin khách hàng
        if (!empty($data['customer_id'])) {
            $data['customer_name'] = null;
            $data['customer_email'] = null;
            $data['customer_phone'] = null;
            $data['shipping_address'] = null;
        }

        return [
            'customer_id' => $data['customer_id'] ?? null,
            'customer_name' => $data['customer_name'] ?? null,
            'customer_email' => $data['customer_email'] ?? null,
            'customer_phone' => $data['customer_phone'] ?? null,
            'shipping_address' => $data['shipping_address'] ?? null,
            'total_amount' => 0,
            'order_code' => $this->generateOrderCode(),
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
    public function generateOrderCode()
    {
        return substr(str_replace('-', '', base_convert(Str::uuid()->getHex(), 16, 36)), 0, 10);
    }
}
