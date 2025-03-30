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
        Schema::create('users', function (Blueprint $table) {
            // Thông tin cơ bản
            $table->id();
            $table->string('name')->unique();
            $table->string('email')->unique();
            $table->string('phone')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // Trạng thái và loại tài khoản
            $table->boolean('is_active')->default(true);
            $table->enum('account_type', ['admin', 'customer'])->default('customer');
            $table->string('avatar')->nullable();

            // Thông tin đăng nhập xã hội: bên thứ 3
            $table->string('provider')->nullable();
            $table->string('provider_id')->nullable();

            // Token ghi nhớ đăng nhập - Nullable
            $table->rememberToken();

            $table->timestamps();
            $table->softDeletes();

            // Đánh index cho các trường thường xuyên tìm kiếm
            $table->index('email');
            $table->index('phone');
            $table->index('account_type');
            $table->index(['provider', 'provider_id']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
