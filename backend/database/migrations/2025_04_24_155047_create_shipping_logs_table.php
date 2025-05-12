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
        Schema::create('shipping_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('tracking_number')->nullable();
            $table->string('carrier')->nullable(); // Đơn vị vận chuyển (GHN, GHTK, v.v.)
            
            // Thông tin sự kiện vận chuyển
            $table->string('event_code')->nullable(); // Mã sự kiện từ API vận chuyển
            $table->string('event_name')->nullable(); // Tên sự kiện
            $table->text('event_description')->nullable(); // Mô tả chi tiết
            $table->timestamp('event_time')->nullable(); // Thời gian xảy ra sự kiện
            
            // Thông tin vị trí
            $table->string('location')->nullable(); // Vị trí xảy ra sự kiện
            $table->string('location_code')->nullable(); // Mã vị trí (nếu có)
            
            // Thông tin người xử lý
            $table->string('handler_name')->nullable(); // Tên người xử lý (shipper, nhân viên kho, v.v.)
            $table->string('handler_phone')->nullable(); // Số điện thoại người xử lý
            
            // Thông tin bổ sung
            $table->text('notes')->nullable(); // Ghi chú
            $table->json('raw_data')->nullable(); // Dữ liệu gốc từ API
            
            $table->timestamps();
            
            // Indexes
            $table->index('tracking_number');
            $table->index('event_time');
            $table->index('event_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_logs');
    }
};
