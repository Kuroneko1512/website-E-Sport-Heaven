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
        Schema::create('customers', function (Blueprint $table) {
            // Thông tin cơ bản
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('birthdate')->nullable();
            $table->text('bio')->nullable();

            // Thông tin thành viên
            $table->integer('loyalty_points')->default(0);
            $table->enum('customer_rank', ['regular', 'silver', 'gold', 'platinum'])->default('regular');
            $table->string('preferred_contact_method')->nullable();

            // Thông tin hoạt động
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('rank_updated_at')->nullable();
            $table->json('preferences')->nullable(); // Các tùy chọn cá nhân
            $table->timestamps();

            // Đánh index cho tìm kiếm và lọc
            $table->index(['first_name', 'last_name']);
            $table->index('gender');
            $table->index('customer_rank');
            $table->index('loyalty_points');
            $table->index('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
