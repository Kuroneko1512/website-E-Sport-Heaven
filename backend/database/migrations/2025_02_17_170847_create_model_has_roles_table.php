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
        Schema::create('model_has_roles', function (Blueprint $table) {
            // Foreign key với index sẵn
            $table->foreignId('role_id')->constrained()->onDelete('cascade');

            // Polymorphic relationship fields
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');

            // Index cho polymorphic queries
            $table->index(['model_id', 'model_type']);

            // Primary key kết hợp
            $table->primary(['role_id', 'model_id', 'model_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('model_has_roles');
    }
};
