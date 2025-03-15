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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('discount_percent', 5, 2)->nullable(); // Giảm giá theo %
            $table->dateTime('discount_start')->nullable(); // Thời gian bắt đầu giảm giá
            $table->dateTime('discount_end')->nullable(); // Thời gian kết thúc giảm giá
            $table->string('sku')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->enum('product_type', ['simple', 'variable'])->default('simple');
            $table->enum('status', ['active', 'inactive', 'staff'])->default('active');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
