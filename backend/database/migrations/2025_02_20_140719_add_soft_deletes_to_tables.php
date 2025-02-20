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
        // Thêm soft delete cho bảng products
        Schema::table('products', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Thêm soft delete cho bảng product_variants
        Schema::table('product_variants', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Thêm soft delete cho bảng attributes
        Schema::table('attributes', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Thêm soft delete cho bảng attribute_values
        Schema::table('attribute_values', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa soft delete khỏi bảng products
        Schema::table('products', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        // Xóa soft delete khỏi bảng product_variants
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        // Xóa soft delete khỏi bảng attributes
        Schema::table('attributes', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        // Xóa soft delete khỏi bảng attribute_values
        Schema::table('attribute_values', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
