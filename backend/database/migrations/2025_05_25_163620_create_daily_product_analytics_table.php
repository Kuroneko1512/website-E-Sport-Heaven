<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_product_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            
            // Sales metrics
            $table->integer('quantity_sold')->default(0);
            $table->bigInteger('revenue')->default(0);
            $table->integer('orders_count')->default(0);
            
            // Stock tracking
            $table->integer('stock_start_day')->default(0);
            $table->integer('stock_end_day')->default(0);
            $table->integer('stock_changes')->default(0);
            
            // Snapshot data (để tránh join khi query)
            $table->string('product_name');
            $table->string('product_sku')->nullable();
            $table->string('category_name')->nullable();
            $table->bigInteger('product_price')->default(0);
            
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['date', 'product_id']);
            
            // Indexes
            $table->index('date');
            $table->index('product_id');
            $table->index(['date', 'quantity_sold']);
            $table->index(['date', 'revenue']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_product_analytics');
    }
};
