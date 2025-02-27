<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attribute>
 */
class AttributeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word, // Tạo tên thuộc tính ngẫu nhiên
            'description' => $this->faker->sentence, // Tạo mô tả ngẫu nhiên
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
