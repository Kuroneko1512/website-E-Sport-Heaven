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
        Schema::create('orders_user_return_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_id')->constrained('orders_user_return')->onDelete('cascade');
            $table->string('image_path'); // Đường dẫn hoặc tên file ảnh
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders_user_return_images');
    }
};
