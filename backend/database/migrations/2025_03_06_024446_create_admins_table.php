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
        Schema::create('admins', function (Blueprint $table) {
            // Thông tin cơ bản
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('position')->nullable(); // Vị trí trong công ty
            $table->string('department')->nullable(); // Phòng ban

            // Trạng thái và bảo mật
            $table->enum('status', ['active', 'inactive', 'blocked'])->default('active');
            $table->integer('failed_login_attempts')->default(0);
            $table->timestamp('account_locked_until')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();

            // Thông tin người tạo/cập nhật
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();

            // Đánh index cho tìm kiếm và lọc
            $table->index('status');
            $table->index(['first_name', 'last_name']);
            $table->index('department');
            $table->index('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
