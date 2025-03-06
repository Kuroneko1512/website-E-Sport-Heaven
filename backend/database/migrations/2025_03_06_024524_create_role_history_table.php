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
        Schema::create('role_history', function (Blueprint $table) {
            // Thông tin thay đổi vai trò
            $table->id();
            $table->foreignId('admin_id')->constrained()->onDelete('cascade');
            $table->foreignId('changed_by')->constrained('users');
            $table->json('old_roles');
            $table->json('new_roles');
            $table->text('reason')->nullable();
            $table->timestamps();

            // Đánh index cho tìm kiếm và lọc
            $table->index('changed_by');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_history');
    }
};
