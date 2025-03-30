<?php

namespace Database\Seeders;

use App\Models\Attribute as ModelsAttribute;
use App\Models\AttributeValue;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AttributeValueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $attributes = ModelsAttribute::all();

        ModelsAttribute::factory(10)->create();
        foreach ($attributes as $attribute) {
            AttributeValue::factory(5)->create(['attribute_id' => $attribute->id]);
        }
    }
}
