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
            $table->id();

            // Thông tin cơ bản
            $table->string('name');
            $table->string('email')->unique()->index(); // Index cho login và tìm kiếm
            $table->string('password');

            // Phân loại và trạng thái - index cho phân quyền và filter
            $table->enum('type', ['super_admin', 'admin', 'staff'])->index();
            $table->string('position')->nullable();
            $table->string('department')->nullable();
            $table->enum('status', ['active', 'inactive', 'blocked'])->default('active')->index();

            // Security tracking - index cho monitoring
            $table->integer('failed_login_attempts')->default(0)->index();
            $table->timestamp('last_login_at')->nullable()->index();
            $table->string('last_login_ip')->nullable();
            $table->timestamp('password_changed_at')->nullable();
            $table->boolean('force_password_change')->default(false);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();

            // Audit fields
            $table->foreignId('created_by')->nullable()->constrained('admins');
            $table->foreignId('updated_by')->nullable()->constrained('admins');

            // Soft delete với index để query
            $table->softDeletes()->index();
            $table->timestamps();

            // Composite index cho các truy vấn phổ biến
            $table->index(['department', 'status']);
            $table->index(['type', 'status']);
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
