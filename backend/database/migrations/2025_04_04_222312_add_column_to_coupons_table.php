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
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage')->after('description');
            $table->decimal('discount_value', 10, 2)->after('discount_type');
            $table->decimal('min_purchase', 10, 2)->default(0)->after('discount_value');
            $table->integer('max_uses')->nullable()->after('min_purchase');
            $table->integer('used_count')->default(0)->after('max_uses');
            $table->boolean('is_active')->default(true)->after('used_count');
            $table->integer('max_uses_per_user')->nullable()->after('is_active');
            $table->json('user_usage')->nullable()->after('max_uses_per_user');
            $table->timestamp('start_date')->nullable()->after('user_usage');
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
            $table->dropColumn('min_purchase');
            $table->dropColumn('max_uses');
            $table->dropColumn('used_count');
            $table->dropColumn('is_active');
            $table->dropColumn('max_uses_per_user');
            $table->dropColumn('user_usage');
            $table->dropColumn('start_date');
            $table->dropColumn('end_date');
        });
    }
};
