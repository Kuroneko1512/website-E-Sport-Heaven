<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $categories = [
            ['name' => 'Nam'],
            ['name' => 'Nữ'],
            ['name' => 'Giày Chạy Bộ'],
            ['name' => 'Dép Chạy Bộ'],
            ['name' => 'Áo Chạy Bộ'],
            ['name' => 'Quần Chạy Bộ'],
            ['name' => 'Giày Chạy Địa Hình'],
            ['name' => 'Mũ Chạy Bộ'],
            ['name' => 'Kính Chạy Bộ'],
            ['name' => 'Tất Chạy Bộ'],
            ['name' => 'Đồng Hồ'],
            ['name' => 'Tai Nghe'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
