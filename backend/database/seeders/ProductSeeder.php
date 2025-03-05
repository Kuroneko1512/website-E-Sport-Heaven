<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductVariant;
use App\Models\ProductVariantAttibute;

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
                    ProductVariantAttibute::factory(rand(1, 3))->create(['product_variant_id' => $variant->id]);
                });
            }
        });
    }
}
