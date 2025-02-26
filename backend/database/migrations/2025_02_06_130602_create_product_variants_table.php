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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id(); // ID tự động
            $table->foreignId('product_id')->constrained(); // Khóa ngoại liên kết với bảng products
            $table->string('sku')->unique(); // Mã SKU cho biến thể
            $table->decimal('price', 10, 2); // Giá của biến thể
            $table->decimal('discount_percent', 5, 2)->nullable(); // Giảm giá theo %
            $table->dateTime('discount_start')->nullable(); // Thời gian bắt đầu giảm giá
            $table->dateTime('discount_end')->nullable(); // Thời gian kết thúc giảm giá
            $table->integer('stock')->default(0);// Số lượng tồn kho
            $table->string('image')->nullable(); 
            $table->timestamps(); // Timestamps (created_at, updated_at)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
