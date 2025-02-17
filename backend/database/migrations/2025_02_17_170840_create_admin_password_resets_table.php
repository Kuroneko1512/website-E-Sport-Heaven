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
        Schema::create('admin_password_resets', function (Blueprint $table) {
            $table->id();

            // Fields cho password reset với index
            $table->string('email')->index();
            $table->string('token')->index();
            $table->timestamp('expires_at')->index();
            $table->timestamp('used_at')->nullable();

            // Audit field
            $table->foreignId('created_by')->nullable()->constrained('admins');
            $table->timestamps();

            // Composite index cho validation
            $table->index(['email', 'token']);;
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_password_resets');
    }
};
