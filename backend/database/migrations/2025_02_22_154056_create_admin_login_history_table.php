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
            // Khoá chính và khoá ngoại
            $table->id();
            $table->foreignId('admin_id')->constrained('admins');

            // Thông tin đăng nhập
            $table->string('ip_address');
            $table->text('user_agent');
            $table->enum('status', ['success', 'failed'])->index();
            $table->timestamp('login_at')->index();

            // Indexes cho security monitoring
            $table->index(['admin_id', 'status']);
            $table->index(['ip_address', 'status']);
            $table->index(['admin_id', 'login_at']);
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
