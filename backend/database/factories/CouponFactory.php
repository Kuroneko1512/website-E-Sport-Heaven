<?php

namespace Database\Factories;

use App\Models\BlogCategory;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Blog>
 */
class CouponFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = $this->faker->sentence(6); // Tạo tiêu đề bài viết
        return [
            'code' => $this->faker->unique()->regexify('[A-Z0-9]{6}'),
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
            'discount_type' => $this->faker->numberBetween(0, 1),
            'discount_value' => $this->faker->numberBetween(1, 100),
            'max_purchase' => $this->faker->numberBetween(1, 1000), 
            'max_uses' => $this->faker->numberBetween(1, 1000), 
            'is_active' => $this->faker->boolean,
            'start_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'end_date' => $this->faker->dateTimeBetween('now', '+1 year'),
            
        ];
    }
}
