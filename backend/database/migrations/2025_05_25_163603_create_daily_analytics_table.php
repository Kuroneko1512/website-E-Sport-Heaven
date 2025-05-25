<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            
            // Revenue metrics (VND - no decimals)
            $table->bigInteger('total_revenue')->default(0);
            $table->bigInteger('completed_revenue')->default(0);
            
            // Order counts
            $table->integer('total_orders')->default(0);
            $table->integer('pending_orders')->default(0);
            $table->integer('confirmed_orders')->default(0);
            $table->integer('preparing_orders')->default(0);
            $table->integer('ready_to_ship_orders')->default(0);
            $table->integer('shipping_orders')->default(0);
            $table->integer('delivered_orders')->default(0);
            $table->integer('completed_orders')->default(0);
            $table->integer('cancelled_orders')->default(0);
            $table->integer('return_requested_orders')->default(0);
            $table->integer('return_processing_orders')->default(0);
            $table->integer('return_completed_orders')->default(0);
            $table->integer('return_rejected_orders')->default(0);
            $table->integer('return_to_shop_orders')->default(0);
            
            // Customer metrics
            $table->integer('new_customers')->default(0);
            $table->integer('returning_customers')->default(0);
            
            // Product metrics
            $table->integer('total_products_sold')->default(0);
            $table->integer('unique_products_sold')->default(0);
            
            // Calculated metrics
            $table->bigInteger('avg_order_value')->default(0);
            $table->integer('avg_processing_time_minutes')->default(0);
            
            // Meta data
            $table->timestamp('calculated_at')->nullable();
            $table->boolean('is_finalized')->default(false);
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('date');
            $table->index(['date', 'is_finalized']);
            $table->index('calculated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_analytics');
    }
};
