<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'price' => $this->faker->randomFloat(2, 100, 1000),
            'discount_percent' => $this->faker->optional(0.5, 0)->randomFloat(2, 5, 50),
            'discount_start' => now(),
            'discount_end' => now()->addDays(rand(1, 30)),
            'sku' => Str::upper($this->faker->unique()->lexify('???-?????')),
            'description' => $this->faker->paragraph(),
            'image' => $this->faker->imageUrl(200, 200, 'products'),
            'product_type' => $this->faker->randomElement(['simple', 'variable']),
            'status' => $this->faker->randomElement(['active', 'inactive']),
           'category_id' => Category::inRandomOrder()->first()?->id,
        ];
    }
}
