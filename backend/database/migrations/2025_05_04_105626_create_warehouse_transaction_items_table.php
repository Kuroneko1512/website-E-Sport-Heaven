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
        Schema::create('warehouse_transaction_items', function (Blueprint $table) {
            $table->id(); // Khóa chính, ID tự tăng
            
            // Liên kết với bảng warehouse_transactions
            $table->foreignId('transaction_id')->constrained('warehouse_transactions')->onDelete('cascade');
            
            // ID sản phẩm và biến thể (để liên kết với dữ liệu hiện tại)
            $table->foreignId('product_id')->nullable()->constrained('products');
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants');
            
            // Mã SKU sản phẩm và biến thể tại thời điểm giao dịch (bản chụp)
            $table->string('product_sku', 100)->nullable();
            $table->string('variant_sku', 100)->nullable();
            
            // Tên sản phẩm tại thời điểm giao dịch (bản chụp)
            $table->string('product_name');
            
            // Thông tin biến thể dưới dạng JSON (bản chụp)
            $table->json('variant_attributes')->nullable();
            
            // Hình ảnh sản phẩm tại thời điểm giao dịch (bản chụp)
            $table->string('product_image')->nullable();
            
            // Số lượng sản phẩm trong giao dịch
            $table->integer('quantity');
            
            // Tình trạng mặt hàng: 1: Mới, 2: Đã qua sử dụng - còn tốt, 3: Lỗi nhẹ, 4: Lỗi nặng/ Hỏng,
            $table->tinyInteger('item_condition')->default(1);
            
            // Giá nhập của sản phẩm (nếu có)
            $table->decimal('unit_cost', 15, 0)->nullable();
            
            // Tổng giá trị của mục này (quantity * unit_cost)
            $table->decimal('total_cost', 15, 0)->nullable();
            
            // Ghi chú về sản phẩm trong giao dịch
            $table->text('notes')->nullable();
            
            // Vị trí trong kho (nếu có)
            $table->string('location', 50)->nullable();
            
            // Số lô hàng (batch number) - dùng cho hàng có hạn sử dụng
            $table->string('batch_number')->nullable();
            
            // Hạn sử dụng (nếu có)
            $table->date('expiry_date')->nullable();
            
            $table->timestamps(); // created_at, updated_at
            
            // Thêm các index để tối ưu truy vấn
            $table->index('product_id');
            $table->index('product_variant_id');
            $table->index('product_sku');
            $table->index('variant_sku');
            $table->index('item_condition');
            $table->index('batch_number');
            $table->index('expiry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_transaction_items');
    }
};
