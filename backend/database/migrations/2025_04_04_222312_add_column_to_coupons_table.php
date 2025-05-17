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
        Schema::table('coupons', function (Blueprint $table) {
            $table->string('code')->unique()->after('id');
            $table->string('name')->after('code');
            $table->text('description')->nullable()->after('name');
            $table->integer('discount_type')->default(0)->after('description');
            $table->decimal('discount_value', 10)->after('discount_type');
            $table->decimal('max_purchase', 10)->default(0)->after('discount_value'); // oder_price
            $table->integer('max_uses')->nullable()->after('max_purchase');
            $table->boolean('is_active')->default(true)->after('max_uses');
            $table->timestamp('start_date')->nullable()->after('is_active');
            $table->timestamp('end_date')->nullable()->after('start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn('code');
            $table->dropColumn('name');
            $table->dropColumn('description');
            $table->dropColumn('discount_type');
            $table->dropColumn('discount_value');
            $table->dropColumn('max_purchase');
            $table->dropColumn('max_uses');
            $table->dropColumn('is_active');
            $table->dropColumn('start_date');
            $table->dropColumn('end_date');
        });
    }
};
