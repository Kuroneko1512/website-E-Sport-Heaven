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
        Schema::table('products', function (Blueprint $table) {
            $table->string('slug')->unique()->after('name');
            $table->text('short_description')->nullable()->after('description');
            $table->foreignId('brand_id')->nullable()->after('category_id')->constrained('brands')->onDelete('set null');
            $table->string('meta_title')->nullable()->after('status');
            $table->text('meta_description')->nullable()->after('meta_title');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('sale_price', 10, 2)->nullable()->after('price');
            $table->enum('status', ['active', 'inactive', 'out_of_stock'])->default('active')->after('stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
            $table->dropColumn([
                'slug',
                'short_description',
                'brand_id',
                'meta_title',
                'meta_description'
            ]);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn([
                'sale_price',
                'status'
            ]);
        });
    }
};
