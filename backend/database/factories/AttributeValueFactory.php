<?php

namespace Database\Factories;

use App\Models\Attribute;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AttributeValue>
 */
class AttributeValueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'attribute_id' => Attribute::inRandomOrder()->first()?->id ?? Attribute::factory(),
            'value' => $this->faker->unique()->word(),
            'description' => $this->faker->sentence(),
            'image' => $this->faker->imageUrl(200, 200, 'products', true),
        ];
    }
}
