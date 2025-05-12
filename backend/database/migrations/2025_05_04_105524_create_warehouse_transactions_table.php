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
        Schema::create('warehouse_transactions', function (Blueprint $table) {
            $table->id(); // Khóa chính, ID tự tăng
            
            // Mã giao dịch theo định dạng: [MÃ KHO]-[LOẠI GIAO DỊCH]-[YYMMDD]-[6 KÝ TỰ NGẪU NHIÊN]
            $table->string('transaction_code', 50)->unique();
            
            // Liên kết với bảng warehouses
            $table->foreignId('warehouse_id')->constrained('warehouses');
            
            // Tên kho tại thời điểm giao dịch (bản chụp)
            $table->string('warehouse_name');
            
            // Kho đích (chỉ dùng cho giao dịch chuyển kho)
            $table->foreignId('destination_warehouse_id')->nullable()->constrained('warehouses');
            $table->string('destination_warehouse_name')->nullable();
            
            // Loại giao dịch: 1: Nhập kho, 2: Xuất kho, 3: Chuyển kho, 4: Kiểm kê
            $table->tinyInteger('transaction_type');
            
            // Loại tham chiếu: 1: Đơn hàng, 2: Đơn trả, 3: Nhập từ NCC, 4: Điều chỉnh
            $table->tinyInteger('reference_type')->nullable();
            
            // Mã tham chiếu: Mã đơn hàng, mã đơn trả, mã phiếu nhập...
            $table->string('reference_code', 50)->nullable();
            
            // ID của admin thực hiện giao dịch
            $table->unsignedBigInteger('admin_id')->nullable();
            
            // Tên admin tại thời điểm giao dịch (bản chụp)
            $table->string('admin_name');
            
            // Ghi chú về giao dịch
            $table->text('notes')->nullable();
            
            // Trạng thái giao dịch: 0: Nháp, 1: Hoàn thành, 2: Hủy
            $table->tinyInteger('status')->default(0);
            
            // Thời gian hoàn thành giao dịch (có thể khác với created_at)
            $table->timestamp('completed_at')->nullable();
            
            // Thời gian hủy giao dịch
            $table->timestamp('cancelled_at')->nullable();
            
            // Lý do hủy
            $table->string('cancel_reason')->nullable();
            
            // Dữ liệu bổ sung (JSON)
            $table->json('metadata')->nullable();
            
            $table->timestamps(); // created_at, updated_at
            
            // Thêm các index để tối ưu truy vấn
            $table->index('transaction_type');
            $table->index('reference_type');
            $table->index('reference_code');
            $table->index('admin_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_transactions');
    }
};
