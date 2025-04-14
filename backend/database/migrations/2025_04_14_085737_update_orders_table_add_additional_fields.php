<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Thông tin đơn hàng bổ sung
            $table->text('customer_note')->nullable()->after('shipping_address');
            $table->text('admin_note')->nullable()->after('customer_note');

            // Thông tin thanh toán
            $table->string('payment_method')->nullable()->after('payment_status');
            $table->string('payment_transaction_id')->nullable()->after('payment_method');
            $table->timestamp('paid_at')->nullable()->after('payment_transaction_id');

            // Thông tin vận chuyển
            $table->string('shipping_method')->nullable()->after('paid_at');
            $table->decimal('shipping_fee', 10, 2)->default(0)->after('shipping_method');
            $table->string('tracking_number')->nullable()->after('shipping_fee');

            // Thông tin mã giảm giá đơn hàng
            $table->string('order_coupon_code')->nullable()->after('tracking_number');
            $table->string('order_coupon_name')->nullable()->after('order_coupon_code');
            $table->tinyInteger('order_discount_type')->nullable()->after('order_coupon_name');
            $table->decimal('order_discount_value', 10, 2)->nullable()->after('order_discount_type');
            $table->decimal('order_discount_amount', 10, 2)->default(0)->after('order_discount_value');

            // Thông tin mã giảm giá vận chuyển
            $table->string('shipping_coupon_code')->nullable()->after('order_discount_amount');
            $table->string('shipping_coupon_name')->nullable()->after('shipping_coupon_code');
            $table->tinyInteger('shipping_discount_type')->nullable()->after('shipping_coupon_name');
            $table->decimal('shipping_discount_value', 10, 2)->nullable()->after('shipping_discount_type');
            $table->decimal('shipping_discount_amount', 10, 2)->default(0)->after('shipping_discount_value');

            // Thông tin tài chính
            $table->decimal('subtotal', 10, 2)->after('total_amount'); // Tổng tiền hàng trước giảm giá
            $table->decimal('tax_amount', 10, 2)->default(0)->after('subtotal');

            // Thông tin hoàn hàng tổng quan
            $table->boolean('has_return_request')->default(false)->after('status'); // Có yêu cầu hoàn hàng không
            $table->tinyInteger('return_status')->default(0)->after('has_return_request');
            $table->decimal('refunded_amount', 10, 2)->default(0)->after('return_status'); // Tổng số tiền đã hoàn
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Xóa thông tin đơn hàng bổ sung
            $table->dropColumn('customer_note');
            $table->dropColumn('admin_note');

            // Xóa thông tin thanh toán
            $table->dropColumn('payment_method');
            $table->dropColumn('payment_transaction_id');
            $table->dropColumn('paid_at');

            // Xóa thông tin vận chuyển
            $table->dropColumn('shipping_method');
            $table->dropColumn('shipping_fee');
            $table->dropColumn('tracking_number');

            // Xóa thông tin mã giảm giá đơn hàng
            $table->dropColumn('order_coupon_code');
            $table->dropColumn('order_coupon_name');
            $table->dropColumn('order_discount_type');
            $table->dropColumn('order_discount_value');
            $table->dropColumn('order_discount_amount');

            // Xóa thông tin mã giảm giá vận chuyển
            $table->dropColumn('shipping_coupon_code');
            $table->dropColumn('shipping_coupon_name');
            $table->dropColumn('shipping_discount_type');
            $table->dropColumn('shipping_discount_value');
            $table->dropColumn('shipping_discount_amount');

            // Xóa thông tin tài chính
            $table->dropColumn('subtotal');
            $table->dropColumn('tax_amount');

            // Xóa thông tin hoàn hàng
            $table->dropColumn('has_return_request');
            $table->dropColumn('return_status');
            $table->dropColumn('refunded_amount');
        });
    }
};
