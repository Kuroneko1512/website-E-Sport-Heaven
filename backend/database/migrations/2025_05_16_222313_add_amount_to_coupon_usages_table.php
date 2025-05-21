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
        Schema::table('coupon_usages', function (Blueprint $table) {
            if ( !Schema::hasColumn('coupon_usages', 'user_id') ) {
                $table->foreignId('user_id')->constrained('users');
            }
            $table->integer('amount')->default(0)->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupon_usages', function (Blueprint $table) {
            $table->dropColumn('amount');
        });
    }
}; 