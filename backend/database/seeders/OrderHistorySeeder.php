<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderHistory;
use App\Models\Product;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrderHistorySeeder extends Seeder
{
    private $faker;

    // Danh sách địa chỉ mẫu Việt Nam
    private $sampleAddresses = [
        "123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
        "456 Lê Lợi, Quận 1, TP.Hồ Chí Minh",
        "789 Trần Phú, Hải Châu, Đà Nẵng",
        "321 Hoàng Diệu, Hải An, Hải Phòng",
        "654 Nguyễn Huệ, Ninh Kiều, Cần Thơ",
        "987 Lý Thường Kiệt, Thanh Khê, Đà Nẵng",
        "147 Điện Biên Phủ, Ba Đình, Hà Nội",
        "258 Võ Văn Tần, Quận 3, TP.Hồ Chí Minh",
        "369 Hùng Vương, Thành phố Huế, Thừa Thiên Huế",
        "741 Nguyễn Văn Linh, Long Xuyên, An Giang",
        "852 Lê Duẩn, Đống Đa, Hà Nội",
        "963 Pasteur, Quận 1, TP.Hồ Chí Minh",
        "159 Trường Chinh, Thanh Xuân, Hà Nội",
        "357 Cách Mạng Tháng 8, Quận 10, TP.Hồ Chí Minh",
        "486 Nguyễn Thái Học, Ba Đình, Hà Nội"
    ];

    public function __construct()
    {
        $this->faker = Faker::create('vi_VN');
    }

    public function run()
    {
        Log::info('=== BẮT ĐẦU TẠO 180 ĐƠN HÀNG ===');
        // Tạo 180 đơn hàng trong 1 năm (15 đơn/tháng)
        $totalOrders = 180;
        $completedOrders = 126; // 70% hoàn thành
        $cancelledOrders = 54;  // 30% hủy

        $startDate = Carbon::now()->subYear();
        $endDate = Carbon::now();

        // Log thông tin bắt đầu
        Log::info('=== BẮT ĐẦU TẠO DỮ LIỆU ĐƠN HÀNG ===', [
            'total_orders' => $totalOrders,
            'completed_orders' => $completedOrders,
            'cancelled_orders' => $cancelledOrders,
            'date_range' => [
                'from' => $startDate->format('Y-m-d'),
                'to' => $endDate->format('Y-m-d')
            ]
        ]);

        // Lấy danh sách sản phẩm có sẵn
        $products = $this->getAvailableProducts();

        if ($products->isEmpty()) {
            Log::error('KHÔNG CÓ SẢN PHẨM NÀO TRONG DATABASE', [
                'message' => 'Vui lòng chạy ProductSeeder trước khi chạy OrderHistorySeeder'
            ]);
            return;
        }

        Log::info('Tìm thấy sản phẩm có sẵn', [
            'product_count' => $products->count(),
            'sample_products' => $products->take(3)->pluck('name', 'id')->toArray()
        ]);

        DB::beginTransaction();

        try {
            // Tạo đơn hàng hoàn thành
            Log::info('Bắt đầu tạo đơn hàng hoàn thành', ['count' => $completedOrders]);
            for ($i = 0; $i < $completedOrders; $i++) {
                $this->createCompletedOrder($products, $startDate, $endDate, $i + 1, $completedOrders);

                // Log progress mỗi 25 đơn
                if (($i + 1) % 25 == 0) {
                    Log::info('Tiến độ tạo đơn hàng hoàn thành', [
                        'completed' => $i + 1,
                        'total' => $completedOrders,
                        'percentage' => round(($i + 1) / $completedOrders * 100, 1) . '%'
                    ]);
                }
            }

            // Tạo đơn hàng hủy
            Log::info('Bắt đầu tạo đơn hàng hủy', ['count' => $cancelledOrders]);
            for ($i = 0; $i < $cancelledOrders; $i++) {
                $this->createCancelledOrder($products, $startDate, $endDate, $i + 1, $cancelledOrders);

                // Log progress mỗi 15 đơn
                if (($i + 1) % 15 == 0) {
                    Log::info('Tiến độ tạo đơn hàng hủy', [
                        'completed' => $i + 1,
                        'total' => $cancelledOrders,
                        'percentage' => round(($i + 1) / $cancelledOrders * 100, 1) . '%'
                    ]);
                }
            }

            DB::commit();

            // Log kết quả thành công
            Log::info('=== TẠO DỮ LIỆU THÀNH CÔNG ===', [
                'total_orders_created' => $totalOrders,
                'completed_orders' => $completedOrders,
                'cancelled_orders' => $cancelledOrders,
                'total_order_items' => OrderItem::count(),
                'total_order_histories' => OrderHistory::count(),
                'execution_time' => 'Hoàn thành'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('LỖI KHI TẠO DỮ LIỆU ĐƠN HÀNG', [
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    private function getAvailableProducts()
    {
        $products = Product::where('status', 'active')
            ->where('product_type', 'simple')
            ->where('stock', '>', 0)
            ->whereNotNull('price')
            ->where('price', '>', 0)
            ->get();

        Log::info('Truy vấn sản phẩm có sẵn', [
            'total_found' => $products->count(),
            'criteria' => [
                'status' => 'active',
                'product_type' => 'simple',
                'stock' => '> 0',
                'price' => '> 0'
            ]
        ]);

        return $products;
    }

    private function createCompletedOrder($products, $startDate, $endDate, $current, $total)
    {
        // Tạo thời gian đơn hàng
        $orderDate = $this->faker->dateTimeBetween($startDate, $endDate->copy()->subDays(15));
        $orderDate = Carbon::instance($orderDate);

        // Tạo đơn hàng
        $order = $this->createBaseOrder($products, $orderDate, Order::STATUS_COMPLETED);

        // Cập nhật thông tin đơn hàng hoàn thành
        $order->update([
            'status' => Order::STATUS_COMPLETED,  // ← SỬA: Thêm status
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'paid_at' => $orderDate->copy()->addMinutes(rand(60, 300)),
            'tracking_number' => $this->generateTrackingNumber(),
        ]);

        // Tạo lịch sử hoàn thành
        $this->createCompletedOrderHistory($order, $orderDate);

        // Log chi tiết đơn hàng được tạo
        if ($current % 50 == 0 || $current <= 5) {
            Log::info('Tạo đơn hàng hoàn thành', [
                'order_code' => $order->order_code,
                'customer_name' => $order->customer_name,
                'total_amount' => $order->total_amount,
                'order_date' => $orderDate->format('Y-m-d H:i:s'),
                'progress' => "{$current}/{$total}"
            ]);
        }
    }

    private function createCancelledOrder($products, $startDate, $endDate, $current, $total)
    {
        // Tạo thời gian đơn hàng
        $orderDate = $this->faker->dateTimeBetween($startDate, $endDate);
        $orderDate = Carbon::instance($orderDate);

        // Tạo đơn hàng
        $order = $this->createBaseOrder($products, $orderDate, Order::STATUS_CANCELLED);

        // Cập nhật thông tin đơn hàng hủy
        $cancelTime = $orderDate->copy()->addMinutes(rand(30, 1440));
        $order->update([
            'status' => Order::STATUS_CANCELLED,
            'payment_status' => Order::PAYMENT_STATUS_UNPAID,
            'cancel_reason' => 'Order cancelled',
            'cancelled_by' => 1,
            'updated_at' => $cancelTime,
        ]);

        // Tạo lịch sử hủy
        $this->createCancelledOrderHistory($order, $orderDate, $cancelTime);

        // Log chi tiết đơn hàng được tạo
        if ($current % 20 == 0 || $current <= 3) {
            Log::info('Tạo đơn hàng hủy', [
                'order_code' => $order->order_code,
                'customer_name' => $order->customer_name,
                'total_amount' => $order->total_amount,
                'order_date' => $orderDate->format('Y-m-d H:i:s'),
                'cancel_time' => $cancelTime->format('Y-m-d H:i:s'),
                'progress' => "{$current}/{$total}"
            ]);
        }
    }

    private function createBaseOrder($products, $orderDate, $finalStatus)
    {
        // Chọn 1-2 sản phẩm ngẫu nhiên
        $selectedProducts = $this->selectRandomProducts($products, rand(1, 2));

        // Tính subtotal
        $subtotal = 0;
        foreach ($selectedProducts as $productData) {
            $subtotal += $productData['price'] * $productData['quantity'];
        }

        // Tính phí ship
        $shippingFee = $this->calculateShippingFee($subtotal);  // ← SỬA: Thêm phí ship

        // Tính tổng tiền cuối cùng
        $totalAmount = $subtotal + $shippingFee;  // ← SỬA: Cộng phí ship

        // Tạo đơn hàng
        $order = Order::create([
            'customer_id' => null, // Guest order
            'customer_name' => $this->faker->name,
            'customer_email' => $this->faker->email,
            'customer_phone' => $this->generateVietnamesePhone(),
            'shipping_address' => $this->faker->randomElement($this->sampleAddresses),
            'customer_note' => null,
            'admin_note' => null,
            'order_code' => $this->generateUniqueOrderCode(),
            'subtotal' => $subtotal,           // ← SỬA: Thêm subtotal
            'shipping_fee' => $shippingFee,    // ← SỬA: Thêm shipping_fee
            'total_amount' => $totalAmount,
            'status' => Order::STATUS_PENDING, // Bắt đầu từ PENDING
            'is_store_pickup' => false,
            'cancel_reason' => null,
            'cancelled_by' => null,
            'refunded_amount' => 0,
            'payment_status' => Order::PAYMENT_STATUS_UNPAID,
            'payment_method' => 'cod',
            'payment_transaction_id' => null,
            'paid_at' => null,
            'payment_expire_at' => null,
            'shipping_method' => 'standard',
            'tracking_number' => null,
            'order_coupon_code' => null,
            'order_coupon_name' => null,
            'order_discount_type' => null,
            'order_discount_value' => null,
            'order_discount_amount' => 0,
            'shipping_coupon_code' => null,
            'shipping_coupon_name' => null,
            'shipping_discount_type' => null,
            'shipping_discount_value' => null,
            'shipping_discount_amount' => 0,
            'created_at' => $orderDate,
            'updated_at' => $orderDate,
        ]);

        // Tạo order items
        $this->createOrderItems($order, $selectedProducts);

        return $order;
    }

    private function selectRandomProducts($products, $count)
    {
        $selectedProducts = [];
        $availableProducts = $products->shuffle()->take($count);

        foreach ($availableProducts as $product) {
            $quantity = rand(1, 3);
            $price = $this->calculateProductPrice($product);

            $selectedProducts[] = [
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price' => $price,
                'product' => $product
            ];
        }

        return $selectedProducts;
    }

    private function calculateProductPrice($product)
    {
        $price = $product->price;

        // Áp dụng discount nếu có
        if (
            $product->discount_percent &&
            (!$product->discount_start || $product->discount_start <= now()) &&
            (!$product->discount_end || $product->discount_end >= now())
        ) {
            $price = $price * (1 - $product->discount_percent / 100);
        }

        return $price;
    }

    private function createOrderItems($order, $selectedProducts)
    {
        foreach ($selectedProducts as $item) {
            $product = $item['product'];

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'product_type' => OrderItem::PRODUCT_TYPE_SIMPLE,
                'product_variant_id' => null,
                'variant_sku' => null,
                'variant_attributes' => null,
                'product_image' => $product->image,
                'quantity' => $item['quantity'],
                'returned_quantity' => 0,
                'return_status' => OrderItem::RETURN_STATUS_NOT_RETURNED,
                'return_reason' => null,
                'refunded_amount' => 0,
                'price' => $item['price'],
                'original_price' => $product->price,
                'subtotal' => $item['price'] * $item['quantity'],
                'created_at' => $order->created_at,
                'updated_at' => $order->created_at,
            ]);
        }
    }

    private function createCompletedOrderHistory($order, $orderDate)
    {
        $currentDate = $orderDate->copy();

        // 1. Tạo đơn hàng (giống response mẫu)
        OrderHistory::create([
            'order_id' => $order->id,
            'actor_type' => OrderHistory::ACTOR_TYPE_SYSTEM,
            'admin_id' => null,
            'customer_id' => null,
            'actor_name' => 'System',
            'actor_email' => null,
            'actor_role' => null,
            'status_from' => null,
            'status_to' => '0',
            'order_status' => null,
            'action_type' => OrderHistory::ACTION_ORDER_CREATED,
            'notes' => 'Đơn hàng mới được tạo',
            'metadata' => [
                'items_count' => $order->orderItems->count(),
                'total_amount' => $order->total_amount . '.00',
                'payment_method' => 'cod'
            ],
            'created_at' => $currentDate,
            'updated_at' => $currentDate,
        ]);

        // 2. Xác nhận đơn hàng
        $currentDate->addMinutes(rand(60, 300));
        OrderHistory::create([
            'order_id' => $order->id,
            'actor_type' => OrderHistory::ACTOR_TYPE_ADMIN,
            'admin_id' => 1,
            'customer_id' => null,
            'actor_name' => 'Super Admin',
            'actor_email' => 'superadmin@example.com',
            'actor_role' => 'super-admin',
            'status_from' => '0',
            'status_to' => '1',
            'order_status' => null,
            'action_type' => OrderHistory::ACTION_STATUS_UPDATED,
            'notes' => 'Cập nhật trạng thái đơn hàng Đang xử lý sang Đã xác nhận',
            'metadata' => null,
            'created_at' => $currentDate,
            'updated_at' => $currentDate,
        ]);

        // 3. Chuẩn bị hàng
        $currentDate->addMinutes(rand(30, 120));
        OrderHistory::create([
            'order_id' => $order->id,
            'actor_type' => OrderHistory::ACTOR_TYPE_ADMIN,
            'admin_id' => 1,
            'customer_id' => null,
            'actor_name' => 'Super Admin',
            'actor_email' => 'superadmin@example.com',
            'actor_role' => 'super-admin',
            'status_from' => '1',
            'status_to' => '2',
            'order_status' => null,
            'action_type' => OrderHistory::ACTION_STATUS_UPDATED,
            'notes' => 'Cập nhật trạng thái đơn hàng Đã xác nhận sang Đang chuẩn bị hàng',
            'metadata' => null,
            'created_at' => $currentDate,
            'updated_at' => $currentDate,
        ]);

        // 4. Sẵn sàng giao hàng
        $currentDate->addMinutes(rand(60, 240));
        OrderHistory::create([
            'order_id' => $order->id,
            'actor_type' => OrderHistory::ACTOR_TYPE_ADMIN,
            'admin_id' => 1,
            'customer_id' => null,
            'actor_name' => 'Super Admin',
            'actor_email' => 'superadmin@example.com',
            'actor_role' => 'super-admin',
            'status_from' => '2',
            'status_to' => '3',
            'order_status' => null,
            'action_type' => OrderHistory::ACTION_STATUS_UPDATED,
            'notes' => 'Cập nhật trạng thái đơn hàng Đang chuẩn bị hàng sang Sẵn sàng giao hàng',
            'metadata' => null,
            'created_at' => $currentDate,
            'updated_at' => $currentDate,
        ]);

        // 5. Đang giao hàng
        $currentDate->addMinutes(rand(30, 180));
        OrderHistory::create([
            'order_id' => $order->id,
            'actor_type' => OrderHistory::ACTOR_TYPE_ADMIN,
            'admin_id' => 1,
            'customer_id' => null,
            'actor_name' => 'Super Admin',
            'actor_email' => 'superadmin@example.com',
            'actor_role' => 'super-admin',
            'status_from' => '3',
            'status_to' => '4',
            'order_status' => null,
            'action_type' => OrderHistory::ACTION_STATUS_UPDATED,
            'notes' => 'Cập nhật trạng thái đơn hàng Sẵn sàng giao hàng sang Đang giao hàng',
            'metadata' => null,
            'created_at' => $currentDate,
            'updated_at' => $currentDate,
        ]);

        // 6. Đã giao hàng + Cập nhật thanh toán
        $currentDate->addMinutes(rand(60, 480)); // 1-8 tiếng giao hàng

        // Cập nhật thanh toán
        OrderHistory::create([
            'order_id' => $order->id,
            'actor_type' => OrderHistory::ACTOR_TYPE_ADMIN,
            'admin_id' => 1,
            'customer_id' => null,
            'actor_name' => 'Super Admin',
            'actor_email' => 'superadmin@example.com',
            'actor_role' => 'super-admin',
            'status_from' => null,
            'status_to' => null,
            'order_status' => null,
            'action_type' => OrderHistory::ACTION_PAYMENT_UPDATED,
            'notes' => 'Cập nhật trạng thái thanh toán từ Chưa thanh toán sang Đã thanh toán',
            'metadata' => [
                'payment_transaction_id' => null,
                'old_payment_status' => 0,
                'new_payment_status' => 1
            ],
            'created_at' => $currentDate,
            'updated_at' => $currentDate,
        ]);

        // Cập nhật trạng thái đã giao hàng
        OrderHistory::create([
            'order_id' => $order->id,
            'actor_type' => OrderHistory::ACTOR_TYPE_ADMIN,
            'admin_id' => 1,
            'customer_id' => null,
            'actor_name' => 'Super Admin',
            'actor_email' => 'superadmin@example.com',
            'actor_role' => 'super-admin',
            'status_from' => '4',
            'status_to' => '5',
            'order_status' => null,
            'action_type' => OrderHistory::ACTION_STATUS_UPDATED,
            'notes' => 'Cập nhật trạng thái đơn hàng Đang giao hàng sang Đã giao hàng',
            'metadata' => null,
            'created_at' => $currentDate,
            'updated_at' => $currentDate,
        ]);

        // 7. Tự động hoàn thành (giống response mẫu)
        $currentDate->addMinutes(rand(180, 1440)); // 3 tiếng - 1 ngày sau
        OrderHistory::create([
            'order_id' => $order->id,
            'actor_type' => OrderHistory::ACTOR_TYPE_SYSTEM,
            'admin_id' => null,
            'customer_id' => null,
            'actor_name' => 'System',
            'actor_email' => null,
            'actor_role' => null,
            'status_from' => '5',
            'status_to' => '6',
            'order_status' => 'Hoàn thành',
            'action_type' => OrderHistory::ACTION_STATUS_UPDATED,
            'notes' => 'Đơn hàng được tự động chuyển sang trạng thái hoàn thành sau 3 phút',
            'metadata' => null,
            'created_at' => $currentDate,
            'updated_at' => $currentDate,
        ]);

        // Cập nhật thời gian cuối cùng cho order
        $order->update(['updated_at' => $currentDate]);
    }

    private function createCancelledOrderHistory($order, $orderDate, $cancelTime)
    {
        // 1. Tạo đơn hàng (giống response mẫu)
        OrderHistory::create([
            'order_id' => $order->id,
            'actor_type' => OrderHistory::ACTOR_TYPE_SYSTEM,
            'admin_id' => null,
            'customer_id' => null,
            'actor_name' => 'System',
            'actor_email' => null,
            'actor_role' => null,
            'status_from' => null,
            'status_to' => '0',
            'order_status' => null,
            'action_type' => OrderHistory::ACTION_ORDER_CREATED,
            'notes' => 'Đơn hàng mới được tạo',
            'metadata' => [
                'items_count' => $order->orderItems->count(),
                'total_amount' => $order->total_amount . '.00',
                'payment_method' => 'cod'
            ],
            'created_at' => $orderDate,
            'updated_at' => $orderDate,
        ]);

        // 2. Hủy đơn hàng (giống response mẫu)
        OrderHistory::create([
            'order_id' => $order->id,
            'actor_type' => OrderHistory::ACTOR_TYPE_ADMIN,
            'admin_id' => 1,
            'customer_id' => null,
            'actor_name' => 'Super Admin',
            'actor_email' => 'superadmin@example.com',
            'actor_role' => 'super-admin',
            'status_from' => '0',
            'status_to' => '10',
            'order_status' => null,
            'action_type' => OrderHistory::ACTION_STATUS_UPDATED,
            'notes' => 'Cập nhật trạng thái đơn hàng Đang xử lý sang Đã hủy',
            'metadata' => null,
            'created_at' => $cancelTime,
            'updated_at' => $cancelTime,
        ]);
    }

    private function generateUniqueOrderCode()
    {
        do {
            $orderCode = substr(str_replace('-', '', base_convert(Str::uuid()->getHex(), 16, 36)), 0, 10);
            $orderExists = Order::where('order_code', $orderCode)->exists();
        } while ($orderExists);

        return $orderCode;
    }

    private function generateTrackingNumber()
    {
        do {
            $prefix = 'TN';
            $timestamp = date('YmHi');
            $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
            $trackingNumber = $prefix . $timestamp . $random;
            $exists = Order::where('tracking_number', $trackingNumber)->exists();
        } while ($exists);

        return $trackingNumber;
    }

    private function generateVietnamesePhone()
    {
        $prefixes = ['098', '097', '096', '086', '032', '033', '034', '035', '036', '037', '038', '039'];
        $prefix = $this->faker->randomElement($prefixes);
        $number = $this->faker->numerify('#######');
        return $prefix . $number;
    }

    /**
     * Tính phí ship dựa trên subtotal
     */
    private function calculateShippingFee($subtotal)
    {
        // Logic phí ship thực tế
        if ($subtotal >= 5000000) {
            return 0; // Miễn phí ship cho đơn >= 5000k
        } elseif ($subtotal >= 200000) {
            return 35000; // 15k cho đơn 200k-500k
        } else {
            return 50000; // 30k cho đơn < 200k
        }
    }
}
