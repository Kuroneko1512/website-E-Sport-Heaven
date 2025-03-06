<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BlogCategory>
 */
class BlogCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true); // Tạo tên danh mục ngẫu nhiên
        return [
            'name' => $name,
            'slug' => Str::slug($name), // Tạo slug từ name
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
