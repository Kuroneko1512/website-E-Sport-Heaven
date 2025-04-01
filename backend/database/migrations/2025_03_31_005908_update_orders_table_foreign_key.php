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
        Schema::table('orders', function (Blueprint $table) {
            // Xóa khoá ngoại từ customer_profiles
            $table->dropForeign(['customer_id']);
            
            // Thêm lại khoá ngoại mới từ customer
            $table->foreign('customer_id')->nullable()->references('id')->on('customers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Xóa khoá ngoại mới từ customer
            $table->dropForeign(['customer_id']);
            
            // Thêm lại khoá ngoại cũ từ customer_profiles
            $table->foreign('customer_id')->nullable()->references('id')->on('customer_profiles')->onDelete('set null');
        });
    }
};
