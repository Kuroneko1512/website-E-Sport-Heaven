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
        Schema::create('warehouse_stocks', function (Blueprint $table) {
            $table->id(); // Khóa chính, ID tự tăng

            // Liên kết với bảng warehouses
            $table->foreignId('warehouse_id')->constrained('warehouses')->onDelete('cascade');

            // Liên kết với bảng products (NULL nếu là biến thể)
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('cascade');

            // Liên kết với bảng product_variants (NULL nếu là sản phẩm đơn giản)
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->onDelete('cascade');

            // Mã SKU để dễ dàng tìm kiếm và import
            $table->string('product_sku', 100)->nullable();
            $table->string('variant_sku', 100)->nullable();

            // Số lượng hiện có trong kho
            $table->integer('quantity')->default(0);

            // Số lượng đã được đặt (đang chờ giao)
            $table->integer('allocated_quantity')->default(0);

            // Tình trạng mặt hàng: 1: Mới, 2: Đã qua sử dụng - còn tốt, 3: Lỗi nhẹ, 4: Lỗi/hỏng
            $table->tinyInteger('item_condition')->default(1);

            // Vị trí trong kho (nếu có)
            $table->string('location', 50)->nullable(); // VD: "Kệ A, Hàng 3"

            // Số lượng tối thiểu cần duy trì trong kho
            $table->integer('min_quantity')->default(0);

            // Số lượng tối đa cho phép trong kho
            $table->integer('max_quantity')->nullable();

            // Trạng thái: true: Đang hoạt động, false: Ngừng hoạt động
            $table->boolean('is_active')->default(true);

            $table->timestamps(); // created_at, updated_at
            $table->softDeletes(); // deleted_at - Hỗ trợ xóa mềm

            // Thêm các index để tối ưu truy vấn
            $table->index(['warehouse_id', 'product_id']);
            $table->index(['warehouse_id', 'product_variant_id']);
            $table->index(['warehouse_id', 'product_sku']);
            $table->index(['warehouse_id', 'variant_sku']);
            $table->index(['warehouse_id', 'item_condition']);
            $table->index('is_active');

            // Đảm bảo mỗi sản phẩm/biến thể chỉ có một bản ghi tồn kho cho mỗi tình trạng trong mỗi kho
            $table->unique(['warehouse_id', 'product_id', 'product_variant_id', 'item_condition'], 'unique_stock_item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_stocks');
    }
};
