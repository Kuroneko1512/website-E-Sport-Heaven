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
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id(); // Khóa chính, ID tự tăng
            
            $table->string('name'); // Tên kho hàng (VD: "Kho chính", "Kho trả hàng")
            $table->string('code', 10)->unique(); // Mã kho ngắn gọn để nhận diện (VD: "WH01", "WH02")
            
            // Loại kho: 1: Kho bán hàng, 2: Kho trả về, 3: Kho nhà cung cấp
            $table->tinyInteger('type')->default(1); 
            
            $table->text('address')->nullable(); // Địa chỉ vật lý của kho hàng
            $table->string('phone', 20)->nullable(); // Số điện thoại liên hệ của kho
            $table->string('email')->nullable(); // Email liên hệ của kho
            
            // Thông tin người quản lý kho
            $table->string('manager_name')->nullable(); // Tên người quản lý kho
            $table->unsignedBigInteger('manager_id')->nullable(); // ID của admin quản lý kho (nếu có)
            
            // Trạng thái kho: true: Đang hoạt động, false: Ngừng hoạt động
            $table->boolean('is_active')->default(true);
            
            // Mô tả thêm về kho
            $table->text('description')->nullable();
            
            $table->timestamps(); // created_at, updated_at
            $table->softDeletes(); // deleted_at - Hỗ trợ xóa mềm
            
            // Thêm các index để tối ưu truy vấn
            $table->index('type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};
