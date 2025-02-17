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
            $table->integer('stock')->default(0);
            $table->string('image')->nullable(); // Số lượng tồn kho
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
