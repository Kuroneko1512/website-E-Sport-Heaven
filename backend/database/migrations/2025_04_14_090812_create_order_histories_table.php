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
        Schema::create('order_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            
            // Thông tin người thực hiện (lưu cả ID và thông tin "bản chụp")
            $table->tinyInteger('actor_type')->default(0); // 0: system, 1: admin, 2: customer
            
            // Lưu ID tham chiếu (không ràng buộc cascade/restrict)
            $table->unsignedBigInteger('admin_id')->nullable(); // Không dùng foreignId để tránh ràng buộc
            $table->unsignedBigInteger('customer_id')->nullable(); // Không dùng foreignId để tránh ràng buộc
            
            // Lưu thông tin "bản chụp" của người thực hiện
            $table->string('actor_name')->nullable(); // Tên người thực hiện
            $table->string('actor_email')->nullable(); // Email người thực hiện
            $table->string('actor_role')->nullable(); // Vai trò (nếu là admin)
            
            // Thông tin hành động
            $table->string('status_from')->nullable(); // Trạng thái trước
            $table->string('status_to')->nullable(); // Trạng thái sau
            $table->tinyInteger('action_type'); // Loại hành động
            
            $table->text('notes')->nullable(); // Ghi chú
            $table->json('metadata')->nullable(); // Dữ liệu bổ sung
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_histories');
    }
};
