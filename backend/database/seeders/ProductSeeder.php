<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use App\Models\ProductAttribute;
use App\Models\ProductVariantAttribute;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::factory(10)->create()->each(function ($product) {
            if ($product->product_type == 'variable') {
                ProductVariant::factory(rand(2, 5))->create(['product_id' => $product->id])->each(function ($variant) {
                    ProductVariantAttribute::factory(rand(1, 3))->create(['product_variant_id' => $variant->id]);
                });
            }
        });
    }
}
