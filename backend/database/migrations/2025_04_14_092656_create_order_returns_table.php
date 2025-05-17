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
        Schema::create('order_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('return_code')->unique(); // Mã yêu cầu hoàn hàng

            // Thông tin người yêu cầu
            $table->unsignedBigInteger('customer_id')->nullable(); // Không dùng foreignId để tránh ràng buộc
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();

            // Thông tin người xử lý
            $table->unsignedBigInteger('processed_by')->nullable(); // ID của admin xử lý
            $table->string('processor_name')->nullable(); // Tên admin xử lý

            // Thông tin yêu cầu
            $table->tinyInteger('return_type')->default(0); // 0: hoàn hàng, 1: đổi hàng, 2: hoàn tiền
            $table->tinyInteger('return_reason_type')->default(0); // Loại lý do hoàn hàng
            $table->text('return_reason')->nullable(); // Lý do hoàn hàng chi tiết
            $table->text('customer_note')->nullable(); // Ghi chú của khách hàng
            $table->text('admin_note')->nullable(); // Ghi chú của admin

            // Thông tin trạng thái
            $table->tinyInteger('status')->default(0); // 0: chờ xử lý, 1: đã duyệt, 2: đang xử lý, 3: hoàn thành, 4: từ chối
            $table->timestamp('requested_at')->useCurrent(); // Thời điểm yêu cầu
            $table->timestamp('processed_at')->nullable(); // Thời điểm xử lý
            $table->timestamp('completed_at')->nullable(); // Thời điểm hoàn thành

            // Thông tin tài chính
            $table->decimal('total_return_amount', 10, 2)->default(0); // Tổng số tiền hoàn lại
            $table->decimal('refund_amount', 10, 2)->default(0); // Số tiền hoàn lại thực tế
            $table->decimal('restocking_fee', 10, 2)->default(0); // Phí tái nhập kho
            $table->string('refund_method')->nullable(); // Phương thức hoàn tiền
            $table->string('refund_transaction_id')->nullable(); // Mã giao dịch hoàn tiền

            // Thông tin vận chuyển
            $table->text('return_address')->nullable(); // Địa chỉ hoàn hàng
            $table->string('shipping_carrier')->nullable(); // Đơn vị vận chuyển
            $table->string('tracking_number')->nullable(); // Mã vận đơn
            $table->decimal('shipping_fee', 10, 2)->default(0); // Phí vận chuyển

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_returns');
    }
};
