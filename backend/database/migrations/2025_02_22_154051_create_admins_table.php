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
            // Thông tin cơ bản admin
            $table->id();
            $table->string('name');
            $table->string('email')->unique()->index();
            $table->string('password');
            $table->string('position')->nullable();
            $table->string('department')->nullable();

            // Trạng thái và security
            $table->enum('status', ['active', 'inactive', 'blocked'])
                ->default('active')
                ->index();
            $table->integer('failed_login_attempts')->default(0)->index();
            $table->timestamp('last_login_at')->nullable()->index();
            $table->string('last_login_ip')->nullable();

            // Audit fields
            $table->foreignId('created_by')->nullable()->constrained('admins');
            $table->foreignId('updated_by')->nullable()->constrained('admins');
            $table->softDeletes()->index();
            $table->timestamps();

            // Indexes cho queries phổ biến
            $table->index(['department', 'status']);
            $table->index(['email', 'status']);
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
