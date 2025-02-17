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
            $table->id();

            // Foreign keys với index sẵn
            $table->foreignId('admin_id')->constrained('admins');
            $table->foreignId('changed_by')->constrained('admins');

            // Role change data
            $table->json('old_roles');
            $table->json('new_roles');
            $table->text('reason');
            $table->timestamps();

            // Index cho audit queries
            $table->index(['admin_id', 'created_at']);
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
