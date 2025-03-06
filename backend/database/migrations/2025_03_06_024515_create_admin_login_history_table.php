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
        Schema::create('admin_login_history', function (Blueprint $table) {
            // Thông tin đăng nhập
            $table->id();
            $table->foreignId('admin_id')->constrained()->onDelete('cascade');
            $table->string('ip_address');
            $table->string('user_agent');
            $table->enum('status', ['success', 'failed']);

            // Thời gian đăng nhập/đăng xuất
            $table->timestamp('login_at');
            $table->timestamp('logout_at')->nullable(); // Thời điểm đăng xuất, để null khi phiên đang hoạt động
            $table->timestamps();

            // Đánh index cho tìm kiếm và lọc
            $table->index('status');
            $table->index('login_at');
            $table->index('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_login_history');
    }
};
