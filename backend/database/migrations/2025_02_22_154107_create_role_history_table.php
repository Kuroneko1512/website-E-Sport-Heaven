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
            // Khoá chính và Khoá ngoại
            $table->id();
            $table->foreignId('admin_id')->constrained('admins');
            $table->foreignId('changed_by')->constrained('admins');

            // Thông tin thay đổi role
            $table->json('old_roles');
            $table->json('new_roles');
            $table->text('reason');
            $table->timestamps();

            // Indexes cho audit
            $table->index(['admin_id', 'created_at']);
            $table->index(['changed_by', 'created_at']);
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
