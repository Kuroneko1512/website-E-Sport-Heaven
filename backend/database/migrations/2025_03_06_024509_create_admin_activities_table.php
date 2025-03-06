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
        Schema::create('admin_activities', function (Blueprint $table) {
            // Thông tin hoạt động
            $table->id();
            $table->foreignId('admin_id')->constrained()->onDelete('cascade'); // ID admin thực hiện hành động 
            $table->string('action'); // Hành động (ví dụ: "create", "update", "delete")
            $table->string('module'); // Module hoặc phần hệ thống bị tác động (ví dụ: "products", "orders")
            $table->string('entity_type'); // Loại đối tượng bị tác động (ví dụ: "Product", "Order")
            $table->bigInteger('entity_id');  // ID của đối tượng bị tác động - Required

            // Dữ liệu thay đổi
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('context')->nullable();

            // Thông tin truy cập
            $table->string('ip_address'); // Địa chỉ IP của admin khi thực hiện hành động
            $table->string('user_agent'); // Thông tin trình duyệt (user agent)
            $table->timestamps();

            // Đánh index cho tìm kiếm và lọc
            $table->index('action');
            $table->index('module');
            $table->index(['entity_type', 'entity_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_activities');
    }
};
