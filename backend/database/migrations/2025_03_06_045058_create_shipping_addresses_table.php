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
        Schema::create('shipping_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('recipient_name', 100);    // Tên người nhận
            $table->string('phone', 20);              // Số điện thoại
            $table->string('email', 100)->nullable(); // Email người nhận
            $table->string('address_line1');          // Địa chỉ chi tiết dòng 1
            $table->string('address_line2')->nullable(); // Địa chỉ chi tiết dòng 2

            // Địa chỉ hành chính
            $table->foreignId('province_code')->constrained('provinces', 'code');
            $table->foreignId('district_code')->constrained('districts', 'code');
            $table->foreignId('commune_code')->constrained('communes', 'code');

            $table->string('postal_code', 10)->nullable();
            $table->string('country', 50)->default('Vietnam');

            // Cài đặt
            $table->boolean('is_default')->default(false);
            $table->text('notes')->nullable();        // Ghi chú thêm
            $table->timestamps();
            $table->softDeletes();

            // Index cho tìm kiếm
            $table->index('recipient_name');
            $table->index('phone');
            $table->index('is_default');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_addresses');
    }
};
