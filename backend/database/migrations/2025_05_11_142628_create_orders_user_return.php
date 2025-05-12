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
        Schema::create('orders_user_return', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->onDelete('cascade');
            $table->foreignId('order_item_id')->nullable()->constrained('order_items')->onDelete('cascade');
            $table->tinyInteger('reason')->default(0);
            $table->string('description')->nullable();
            $table->string('image')->nullable();
            $table->string('video')->nullable();
            $table->string('refund_bank_account')->nullable();
            $table->string('refund_bank_name')->nullable();
            $table->string('refund_bank_customer_name')->nullable();
            $table->decimal('refund_amount', 15)->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->tinyInteger('status')->default(0);  // Sử dụng tinyInteger cho status
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders_user_return');
    }
};
