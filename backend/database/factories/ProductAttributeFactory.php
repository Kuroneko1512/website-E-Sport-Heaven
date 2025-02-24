<?php

namespace Database\Factories;

use App\Models\Attribute as ModelsAttribute;
use App\Models\AttributeValue;
use App\Models\ProductVariant;
use Attribute;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductAttribute>
 */
class ProductAttributeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_variant_id' => ProductVariant::factory(),
            'attribute_id' => ModelsAttribute::factory(),
            'attribute_value_id' => AttributeValue::factory(),
        ];
    }
}
