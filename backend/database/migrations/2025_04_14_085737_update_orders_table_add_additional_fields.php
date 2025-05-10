<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Bước 1: Thêm cột status_int và payment_status_int mới
        Schema::table('orders', function (Blueprint $table) {
            $table->tinyInteger('status_int')->nullable()->after('total_amount');
            $table->tinyInteger('payment_status_int')->nullable()->after('status_int');
        });

        // Bước 2: Chuyển đổi dữ liệu từ cột enum sang cột integer
        DB::statement("UPDATE orders SET status_int = CASE 
            WHEN status = 'đang xử lý' THEN 0 
            WHEN status = 'đã xác nhận' THEN 1 
            WHEN status = 'đang giao' THEN 4 
            WHEN status = 'hoàn thành' THEN 6 
            WHEN status = 'đã hủy' THEN 10 
            ELSE 0 END");

        DB::statement("UPDATE orders SET payment_status_int = CASE 
            WHEN `payment_status` = 'chưa thanh toán' THEN 0 
            WHEN `payment_status` = 'đã thanh toán' THEN 1 
            ELSE 0 END");

        // Bước 3: Xóa cột enum cũ và đổi tên cột mới
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->dropColumn('payment_status');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('status_int', 'status');
            $table->renameColumn('payment_status_int', 'payment_status');
        });

        // Bước 4: Đặt giá trị mặc định và ràng buộc not null
        Schema::table('orders', function (Blueprint $table) {
            $table->tinyInteger('status')->default(0)->change();
            $table->tinyInteger('payment_status')->default(0)->change();
            
            // Thêm các trường thông tin đơn hàng bổ sung
            $table->text('customer_note')->nullable()->after('shipping_address');
            $table->text('admin_note')->nullable()->after('customer_note');

            // Thêm các trường thông tin thanh toán
            $table->string('payment_method')->nullable()->after('payment_status');
            $table->string('payment_transaction_id')->nullable()->after('payment_method');
            $table->timestamp('paid_at')->nullable()->after('payment_transaction_id');

            // Thêm các trường thông tin vận chuyển
            $table->string('shipping_method')->nullable()->after('paid_at');
            $table->decimal('shipping_fee', 10, 2)->default(0)->after('shipping_method');
            $table->string('tracking_number')->nullable()->after('shipping_fee');
            
            // Thêm các trường thông tin mã giảm giá đơn hàng
            $table->string('order_coupon_code')->nullable()->after('tracking_number');
            $table->string('order_coupon_name')->nullable()->after('order_coupon_code');
            $table->tinyInteger('order_discount_type')->nullable()->after('order_coupon_name');
            $table->decimal('order_discount_value', 10, 2)->nullable()->after('order_discount_type');
            $table->decimal('order_discount_amount', 10, 2)->default(0)->after('order_discount_value');

            // Thêm các trường thông tin mã giảm giá vận chuyển
            $table->string('shipping_coupon_code')->nullable()->after('order_discount_amount');
            $table->string('shipping_coupon_name')->nullable()->after('shipping_coupon_code');
            $table->tinyInteger('shipping_discount_type')->nullable()->after('shipping_coupon_name');
            $table->decimal('shipping_discount_value', 10, 2)->nullable()->after('shipping_discount_type');
            $table->decimal('shipping_discount_amount', 10, 2)->default(0)->after('shipping_discount_value');

            // Thêm các trường thông tin tài chính
            $table->decimal('subtotal', 10, 2)->default(0)->after('total_amount');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('subtotal');
            
            // Thêm trường cho đơn hàng tại cửa hàng
            $table->boolean('is_store_pickup')->default(false)->after('status');
            
            // Thêm trường cho lý do hủy đơn hàng
            $table->string('cancel_reason')->nullable()->after('is_store_pickup');
            $table->unsignedBigInteger('cancelled_by')->nullable()->after('cancel_reason');
            
            // Thêm trường cho số tiền hoàn lại
            $table->decimal('refunded_amount', 10, 2)->default(0)->after('cancelled_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Bước 1: Thêm cột enum mới
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status_enum', ['đang xử lý', 'đã xác nhận', 'đang giao', 'hoàn thành', 'đã hủy'])->nullable()->after('total_amount');
            $table->enum('payment_status_enum', ['đã thanh toán', 'chưa thanh toán'])->nullable()->after('status');
        });

        // Bước 2: Chuyển đổi dữ liệu từ cột integer sang cột enum
        DB::statement("UPDATE orders SET status_enum = CASE 
            WHEN status = 0 THEN 'đang xử lý' 
            WHEN status = 1 THEN 'đã xác nhận' 
            WHEN status = 4 THEN 'đang giao' 
            WHEN status = 6 THEN 'hoàn thành' 
            WHEN status = 10 THEN 'đã hủy' 
            ELSE 'đang xử lý' END");

        DB::statement("UPDATE orders SET payment_status_enum = CASE 
            WHEN payment_status = 0 THEN 'chưa thanh toán' 
            WHEN payment_status = 1 THEN 'đã thanh toán' 
            ELSE 'chưa thanh toán' END");

        // Bước 3: Xóa cột integer cũ
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->dropColumn('payment_status');
        });

        // Bước 4: Đổi tên cột enum mới và đặt giá trị mặc định
        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('status_enum', 'status');
            $table->renameColumn('payment_status_enum', 'payment-status');
            
            // Xóa các trường bổ sung
            $table->dropColumn([
                'customer_note',
                'admin_note',
                'payment_method',
                'payment_transaction_id',
                'paid_at',
                'shipping_method',
                'shipping_fee',
                'tracking_number',
                'order_coupon_code',
                'order_coupon_name',
                'order_discount_type',
                'order_discount_value',
                'order_discount_amount',
                'shipping_coupon_code',
                'shipping_coupon_name',
                'shipping_discount_type',
                'shipping_discount_value',
                'shipping_discount_amount',
                'subtotal',
                'tax_amount',
                'is_store_pickup',
                'cancel_reason',
                'cancelled_by',
                'refunded_amount'
            ]);
        });
    }
};
