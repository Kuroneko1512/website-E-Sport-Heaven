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
        Schema::table('order_items', function (Blueprint $table) {
            // Thông tin sản phẩm "bản chụp"
            $table->string('product_name')->after('product_id');
            $table->string('product_sku')->nullable()->after('product_name');
            $table->tinyInteger('product_type')->default(0)->after('product_sku');

            // Thông tin biến thể (nếu có)
            $table->string('variant_sku')->nullable()->after('product_variant_id');
            $table->json('variant_attributes')->nullable()->after('variant_sku');
            $table->text('product_image')->nullable()->after('variant_attributes');

            // Thông tin giá và giảm giá
            $table->decimal('original_price', 10, 2)->after('price'); // Giá gốc trước khi giảm giá

            // Thêm trường subtotal nếu chưa có
            if (!Schema::hasColumn('order_items', 'subtotal')) {
                $table->decimal('subtotal', 10, 2)->after('quantity'); // Thành tiền = price * quantity
            }

            // Thông tin hoàn hàng cho từng sản phẩm
            $table->integer('returned_quantity')->default(0)->after('quantity');
            $table->tinyInteger('return_status')->default(0)->after('returned_quantity');
            $table->text('return_reason')->nullable()->after('return_status');
            $table->decimal('refunded_amount', 10, 2)->default(0)->after('return_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Xóa thông tin sản phẩm "bản chụp"
            $table->dropColumn('product_name');
            $table->dropColumn('product_sku');
            $table->dropColumn('product_type');

            // Xóa thông tin biến thể
            $table->dropColumn('variant_sku');
            $table->dropColumn('variant_attributes');
            $table->dropColumn('product_image');

            // Xóa thông tin giá và giảm giá
            $table->dropColumn('original_price');

            // Xóa trường subtotal nếu đã thêm mới
            if (Schema::hasColumn('order_items', 'subtotal')) {
                $table->dropColumn('subtotal');
            }

            // Xóa thông tin hoàn hàng
            $table->dropColumn('returned_quantity');
            $table->dropColumn('return_status');
            $table->dropColumn('return_reason');
            $table->dropColumn('refunded_amount');
        });
    }
};
