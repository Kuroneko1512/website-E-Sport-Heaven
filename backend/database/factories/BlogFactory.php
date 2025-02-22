<?php

namespace Database\Factories;

use App\Models\BlogCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Blog>
 */
class BlogFactory extends Factory
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
            'title' => $title,
            'slug' => Str::slug($title), // Tạo slug từ tiêu đề
            'content' => $this->faker->paragraphs(5, true), // Tạo nội dung giả
            'category_id' => BlogCategory::factory(), // Tạo danh mục ngẫu nhiên
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
