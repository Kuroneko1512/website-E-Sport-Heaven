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
        Schema::create('order_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_return_id')->constrained('order_returns')->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained('order_items')->onDelete('cascade');

            // Thông tin sản phẩm (bản chụp từ order_items)
            $table->string('product_name');
            $table->string('product_sku')->nullable();
            $table->string('variant_sku')->nullable();
            $table->json('variant_attributes')->nullable();
            $table->text('product_image')->nullable();

            // Thông tin số lượng và giá
            $table->integer('quantity_ordered')->default(0); // Số lượng đã đặt
            $table->integer('quantity_returned')->default(0); // Số lượng hoàn lại
            $table->decimal('price', 10, 2); // Giá sản phẩm
            $table->decimal('subtotal', 10, 2); // Thành tiền = price * quantity_returned

            // Thông tin trạng thái
            $table->tinyInteger('item_condition')->default(0); // 0: mới, 1: đã sử dụng, 2: hư hỏng
            $table->tinyInteger('return_reason_type')->default(0); // Loại lý do hoàn hàng
            $table->text('return_reason')->nullable(); // Lý do hoàn hàng chi tiết
            $table->tinyInteger('status')->default(0); // 0: chờ xử lý, 1: đã duyệt, 2: đã nhận, 3: từ chối

            // Thông tin xử lý
            $table->tinyInteger('action_taken')->default(0); // 0: chưa xử lý, 1: hoàn kho, 2: hủy, 3: đổi mới
            $table->text('admin_note')->nullable(); // Ghi chú của admin

            $table->timestamps();
            $table->softDeletes(); // Thêm trường deleted_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_return_items');
    }
};
