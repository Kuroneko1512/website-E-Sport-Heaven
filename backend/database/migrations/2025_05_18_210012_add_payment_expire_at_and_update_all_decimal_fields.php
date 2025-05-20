<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Thêm trường payment_expire_at và cập nhật tất cả các trường decimal từ có dấu thập phân thành không có dấu thập phân
     */
    public function up(): void
    {
        // Bước 1: Thêm trường payment_expire_at vào bảng orders (nếu chưa tồn tại)
        if (!Schema::hasColumn('orders', 'payment_expire_at')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->timestamp('payment_expire_at')->nullable()->after('paid_at');
            });
        }

        // Bước 2: Làm tròn dữ liệu trong bảng orders trước khi thay đổi kiểu dữ liệu
        // Mỗi trường cần một câu lệnh UPDATE riêng biệt
        DB::statement('UPDATE orders SET total_amount = ROUND(total_amount) WHERE total_amount IS NOT NULL');
        DB::statement('UPDATE orders SET subtotal = ROUND(subtotal) WHERE subtotal IS NOT NULL');
        DB::statement('UPDATE orders SET tax_amount = ROUND(tax_amount) WHERE tax_amount IS NOT NULL');
        DB::statement('UPDATE orders SET shipping_fee = ROUND(shipping_fee) WHERE shipping_fee IS NOT NULL');
        DB::statement('UPDATE orders SET order_discount_value = ROUND(order_discount_value) WHERE order_discount_value IS NOT NULL');
        DB::statement('UPDATE orders SET order_discount_amount = ROUND(order_discount_amount) WHERE order_discount_amount IS NOT NULL');
        DB::statement('UPDATE orders SET shipping_discount_value = ROUND(shipping_discount_value) WHERE shipping_discount_value IS NOT NULL');
        DB::statement('UPDATE orders SET shipping_discount_amount = ROUND(shipping_discount_amount) WHERE shipping_discount_amount IS NOT NULL');
        DB::statement('UPDATE orders SET refunded_amount = ROUND(refunded_amount) WHERE refunded_amount IS NOT NULL');

        // Bước 3: Thay đổi kiểu dữ liệu các trường decimal trong bảng orders
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('total_amount', 10, 0)->default(0)->change();
            $table->decimal('subtotal', 10, 0)->default(0)->change();
            $table->decimal('tax_amount', 10, 0)->default(0)->change();
            $table->decimal('shipping_fee', 10, 0)->default(0)->change();
            $table->decimal('order_discount_value', 10, 0)->nullable()->change();
            $table->decimal('order_discount_amount', 10, 0)->default(0)->change();
            $table->decimal('shipping_discount_value', 10, 0)->nullable()->change();
            $table->decimal('shipping_discount_amount', 10, 0)->default(0)->change();
            $table->decimal('refunded_amount', 10, 0)->default(0)->change();
        });

        // Bước 4: Làm tròn dữ liệu trong bảng order_items
        DB::statement('UPDATE order_items SET price = ROUND(price) WHERE price IS NOT NULL');
        DB::statement('UPDATE order_items SET original_price = ROUND(original_price) WHERE original_price IS NOT NULL');
        DB::statement('UPDATE order_items SET subtotal = ROUND(subtotal) WHERE subtotal IS NOT NULL');
        DB::statement('UPDATE order_items SET refunded_amount = ROUND(refunded_amount) WHERE refunded_amount IS NOT NULL');

        // Bước 5: Thay đổi kiểu dữ liệu các trường decimal trong bảng order_items
        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('price', 10, 0)->default(0)->change();
            $table->decimal('original_price', 10, 0)->default(0)->change();
            $table->decimal('subtotal', 10, 0)->default(0)->change();
            $table->decimal('refunded_amount', 10, 0)->default(0)->change();
        });

        // Bước 6: Làm tròn dữ liệu trong bảng orders_user_return
        DB::statement('UPDATE orders_user_return SET refund_amount = ROUND(refund_amount) WHERE refund_amount IS NOT NULL');

        // Bước 7: Thay đổi kiểu dữ liệu các trường decimal trong bảng orders_user_return
        Schema::table('orders_user_return', function (Blueprint $table) {
            $table->decimal('refund_amount', 15, 0)->nullable()->change();
        });

        // Bước 8: Làm tròn dữ liệu trong bảng order_returns
        DB::statement('UPDATE order_returns SET total_return_amount = ROUND(total_return_amount) WHERE total_return_amount IS NOT NULL');
        DB::statement('UPDATE order_returns SET refund_amount = ROUND(refund_amount) WHERE refund_amount IS NOT NULL');
        DB::statement('UPDATE order_returns SET restocking_fee = ROUND(restocking_fee) WHERE restocking_fee IS NOT NULL');
        DB::statement('UPDATE order_returns SET shipping_fee = ROUND(shipping_fee) WHERE shipping_fee IS NOT NULL');

        // Bước 9: Thay đổi kiểu dữ liệu các trường decimal trong bảng order_returns
        Schema::table('order_returns', function (Blueprint $table) {
            $table->decimal('total_return_amount', 10, 0)->default(0)->change();
            $table->decimal('refund_amount', 10, 0)->default(0)->change();
            $table->decimal('restocking_fee', 10, 0)->default(0)->change();
            $table->decimal('shipping_fee', 10, 0)->default(0)->change();
        });

        // Bước 10: Làm tròn dữ liệu trong bảng order_return_items
        DB::statement('UPDATE order_return_items SET price = ROUND(price) WHERE price IS NOT NULL');
        DB::statement('UPDATE order_return_items SET subtotal = ROUND(subtotal) WHERE subtotal IS NOT NULL');

        // Bước 11: Thay đổi kiểu dữ liệu các trường decimal trong bảng order_return_items
        Schema::table('order_return_items', function (Blueprint $table) {
            $table->decimal('price', 10, 0)->default(0)->change();
            $table->decimal('subtotal', 10, 0)->default(0)->change();
        });

        // Bước 12: Xử lý bảng products
        // Thêm cột mới với kiểu dữ liệu mới
        Schema::table('products', function (Blueprint $table) {
            // Tạo cột price_new kiểu decimal(10,0) không có phần thập phân, nullable
            $table->decimal('price_new', 10, 0)->nullable()->after('price');
            // Tạo cột discount_percent_new kiểu decimal(3,0) không có phần thập phân, nullable
            $table->decimal('discount_percent_new', 3, 0)->nullable()->after('discount_percent');
        });

        // Sao chép dữ liệu đã làm tròn vào cột mới
        // Làm tròn giá trị price và copy vào price_new
        DB::statement('UPDATE products SET price_new = ROUND(price) WHERE price IS NOT NULL');
        // Làm tròn giá trị discount_percent và copy vào discount_percent_new
        DB::statement('UPDATE products SET discount_percent_new = ROUND(discount_percent) WHERE discount_percent IS NOT NULL');

        // Xóa cột cũ để tránh xung đột
        Schema::table('products', function (Blueprint $table) {
            // Xóa cột price cũ
            $table->dropColumn('price');
            // Xóa cột discount_percent cũ
            $table->dropColumn('discount_percent');
        });

        // Đổi tên cột mới thành tên cột cũ để giữ nguyên tên cột trong ứng dụng
        Schema::table('products', function (Blueprint $table) {
            // Đổi tên price_new thành price
            $table->renameColumn('price_new', 'price');
            // Đổi tên discount_percent_new thành discount_percent
            $table->renameColumn('discount_percent_new', 'discount_percent');
        });

        // Bước 13: Xử lý bảng product_variants tương tự như bảng products
        // Thêm cột mới với kiểu dữ liệu mới
        Schema::table('product_variants', function (Blueprint $table) {
            // Tạo cột price_new kiểu decimal(10,0) không có phần thập phân, NOT NULL với default 0
            $table->decimal('price_new', 10, 0)->default(0)->after('price');
            // Tạo cột discount_percent_new kiểu decimal(3,0) không có phần thập phân, nullable
            $table->decimal('discount_percent_new', 3, 0)->nullable()->after('discount_percent');
        });

        // Sao chép dữ liệu đã làm tròn vào cột mới
        // Làm tròn giá trị price và copy vào price_new
        DB::statement('UPDATE product_variants SET price_new = ROUND(price) WHERE price IS NOT NULL');
        // Làm tròn giá trị discount_percent và copy vào discount_percent_new
        DB::statement('UPDATE product_variants SET discount_percent_new = ROUND(discount_percent) WHERE discount_percent IS NOT NULL');

        // Xóa cột cũ để tránh xung đột
        Schema::table('product_variants', function (Blueprint $table) {
            // Xóa cột price cũ
            $table->dropColumn('price');
            // Xóa cột discount_percent cũ
            $table->dropColumn('discount_percent');
        });

        // Đổi tên cột mới thành tên cột cũ để giữ nguyên tên cột trong ứng dụng
        Schema::table('product_variants', function (Blueprint $table) {
            // Đổi tên price_new thành price
            $table->renameColumn('price_new', 'price');
            // Đổi tên discount_percent_new thành discount_percent
            $table->renameColumn('discount_percent_new', 'discount_percent');
        });
    }

    /**
     * Reverse the migrations.
     * Khôi phục lại tất cả các thay đổi đã thực hiện trong phương thức up()
     */
    public function down(): void
    {
        // Bước 1: Khôi phục kiểu dữ liệu các trường decimal trong bảng orders
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('total_amount', 10, 2)->default(0)->change();
            $table->decimal('subtotal', 10, 2)->default(0)->change();
            $table->decimal('tax_amount', 10, 2)->default(0)->change();
            $table->decimal('shipping_fee', 10, 2)->default(0)->change();
            $table->decimal('order_discount_value', 10, 2)->nullable()->change();
            $table->decimal('order_discount_amount', 10, 2)->default(0)->change();
            $table->decimal('shipping_discount_value', 10, 2)->nullable()->change();
            $table->decimal('shipping_discount_amount', 10, 2)->default(0)->change();
            $table->decimal('refunded_amount', 10, 2)->default(0)->change();
        });

        // Bước 2: Xóa trường payment_expire_at khỏi bảng orders
        if (Schema::hasColumn('orders', 'payment_expire_at')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('payment_expire_at');
            });
        }

        // Bước 3: Khôi phục kiểu dữ liệu các trường decimal trong bảng order_items
        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->default(0)->change();
            $table->decimal('original_price', 10, 2)->default(0)->change();
            $table->decimal('subtotal', 10, 2)->default(0)->change();
            $table->decimal('refunded_amount', 10, 2)->default(0)->change();
        });

        // Bước 4: Khôi phục kiểu dữ liệu các trường decimal trong bảng orders_user_return
        Schema::table('orders_user_return', function (Blueprint $table) {
            $table->decimal('refund_amount', 15, 2)->nullable()->change();
        });

        // Bước 5: Khôi phục kiểu dữ liệu các trường decimal trong bảng order_returns
        Schema::table('order_returns', function (Blueprint $table) {
            $table->decimal('total_return_amount', 10, 2)->default(0)->change();
            $table->decimal('refund_amount', 10, 2)->default(0)->change();
            $table->decimal('restocking_fee', 10, 2)->default(0)->change();
            $table->decimal('shipping_fee', 10, 2)->default(0)->change();
        });

        // Bước 6: Khôi phục kiểu dữ liệu các trường decimal trong bảng order_return_items
        Schema::table('order_return_items', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->default(0)->change();
            $table->decimal('subtotal', 10, 2)->default(0)->change();
        });

        // Bước 7: Khôi phục bảng products - sử dụng cách tiếp cận tạo cột mới
        Schema::table('products', function (Blueprint $table) {
            // Tạo cột mới với kiểu dữ liệu cũ (có phần thập phân), nullable
            $table->decimal('price_new', 10, 2)->nullable()->after('price');
            $table->decimal('discount_percent_new', 5, 2)->nullable()->after('discount_percent');
        });

        // Sao chép dữ liệu vào cột mới
        DB::statement('UPDATE products SET price_new = price WHERE price IS NOT NULL');
        DB::statement('UPDATE products SET discount_percent_new = discount_percent WHERE discount_percent IS NOT NULL');

        // Xóa cột cũ
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('price');
            $table->dropColumn('discount_percent');
        });

        // Đổi tên cột mới thành tên cột cũ
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('price_new', 'price');
            $table->renameColumn('discount_percent_new', 'discount_percent');
        });

        // Bước 8: Khôi phục bảng product_variants - sử dụng cách tiếp cận tạo cột mới
        Schema::table('product_variants', function (Blueprint $table) {
            // Tạo cột mới với kiểu dữ liệu cũ (có phần thập phân)
            $table->decimal('price_new', 10, 2)->default(0)->after('price');
            $table->decimal('discount_percent_new', 5, 2)->nullable()->after('discount_percent');
        });

        // Sao chép dữ liệu vào cột mới
        DB::statement('UPDATE product_variants SET price_new = price WHERE price IS NOT NULL');
        DB::statement('UPDATE product_variants SET discount_percent_new = discount_percent WHERE discount_percent IS NOT NULL');

        // Xóa cột cũ
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('price');
            $table->dropColumn('discount_percent');
        });

        // Đổi tên cột mới thành tên cột cũ
        Schema::table('product_variants', function (Blueprint $table) {
            $table->renameColumn('price_new', 'price');
            $table->renameColumn('discount_percent_new', 'discount_percent');
        });
    }
};
