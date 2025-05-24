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
        Schema::table('coupons', function (Blueprint $table) {
            // Thay đổi discount_type từ enum sang integer
            $table->integer('discount_type')->default(0)->change();

            // Thay đổi min_purchase thành max_purchase và cập nhật kiểu dữ liệu
            $table->decimal('min_purchase', 10)->default(0)->change();
            $table->renameColumn('min_purchase', 'max_discount_amount');
            $table->decimal('min_order_amount', 10)->default(0)->after('discount_type');
            // Cập nhật kiểu dữ liệu cho discount_value
            $table->decimal('discount_value', 10)->change();

            // Xóa các cột không cần thiết
            if (Schema::hasColumn('coupons', 'used_count')) {
                $table->dropColumn('used_count');
            }

            if (Schema::hasColumn('coupons', 'user_usage')) {
                $table->dropColumn('user_usage');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            // Khôi phục discount_type về enum
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage')->change();

            // Đổi tên max_purchase về min_purchase và khôi phục kiểu dữ liệu
            $table->decimal('max_discount_amount', 10, 2)->default(0)->change();
            $table->renameColumn('max_discount_amount', 'min_purchase');

            // Khôi phục kiểu dữ liệu cho discount_value
            $table->decimal('discount_value', 10, 2)->change();

            // Thêm lại các cột đã xóa
            $table->integer('used_count')->default(0)->after('max_uses');
            $table->json('user_usage')->nullable()->after('is_active');
            $table->dropColumn('min_order_amount');
        });
    }
};
