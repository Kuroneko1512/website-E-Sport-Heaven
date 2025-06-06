<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_product_analytics', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable()->after('product_sku');
        });
    }

    public function down(): void
    {
        Schema::table('daily_product_analytics', function (Blueprint $table) {
            $table->dropColumn('category_id');
        });
    }
};
