<?php

namespace App\Http\Requests\Product;

use App\Traits\HandlesValidationFailure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    use HandlesValidationFailure;
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'             => ['required', 'string', 'max:255'],
            'price'            => ['nullable', 'numeric', 'between:0,99999999.99'],
            'stock'            => ['nullable', 'numeric', 'between:0,99999999.99'],
            'selected_attributes' => 'required_if:product_type,variable|array',
            // 'sku'              => ['required', 'string', Rule::unique('products', 'sku')],
            'description'      => ['nullable', 'string'],
            'image'            => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:10240'],
            'product_type'     => ['required', 'in:simple,variable'],
            'status'           => ['nullable', 'in:active,inactive'],
            'category_id'      => ['required', 'exists:categories,id'],
            'discount_percent' => ['nullable', 'numeric', 'between:0,100'], // Giảm giá 0 - 100%
            'discount_start'   => ['nullable', 'date', 'before_or_equal:discount_end'],
            'discount_end'     => ['nullable', 'date', 'after_or_equal:discount_start'],

            // 🚀 Kiểm tra biến thể (variants)
            'variants' => [
                'nullable',
                'array',
                function ($attribute, $value, $fail) {
                    if ($this->input('product_type') === 'variable' && empty($value)) {
                        $fail('Sản phẩm có biến thể thì phải có ít nhất một biến thể.');
                    }
                }
            ],
            // 'variants.*.sku' => [
            //     'required_if:product_type,variable',
            //     'string',
            //     Rule::unique('product_variants', 'sku'),
            // ],
            'variants.*.discount_percent' => ['nullable', 'numeric', 'between:0,100'],
            'variants.*.discount_start'   => ['nullable', 'date', 'before_or_equal:variants.*.discount_end'],
            'variants.*.discount_end'     => ['nullable', 'date', 'after_or_equal:variants.*.discount_start'],
            'variants.*.price' => ['required_if:product_type,variable', 'nullable', 'numeric', 'min:0'],
            'variants.*.stock' => ['required_if:product_type,variable', 'integer', 'min:0'],
            // 🚀 Kiểm tra thuộc tính của biến thể
            'variants.*.attributes' => [
                'required_if:product_type,variable',
                'array',
                'min:1'
            ],
            'variants.*.attributes.*.attribute_id' => [
                'required_if:product_type,variable',
                'exists:attributes,id',
            ],
            'variants.*.attributes.*.attribute_value_id' => [
                'required_if:product_type,variable',
                'exists:attribute_values,id',
                //     function ($attribute, $value, $fail) {
                //         $variantIndex = explode('.', $attribute)[1];

                //         // Lấy giá trị attribute_value
                //         $attributeValue = \App\Models\AttributeValue::find($value);
                //         if (!$attributeValue) {
                //             return $fail("Giá trị thuộc tính không hợp lệ.");
                //         }

                //         $attributeId = $attributeValue->attribute_id;
                //         $variantAttributes = $this->input("variants.{$variantIndex}.attributes", []);

                //         // 🛑 Kiểm tra một biến thể có nhiều giá trị của cùng một thuộc tính không
                //         $existingAttributes = collect($variantAttributes)->pluck('attribute_id');
                //         if ($existingAttributes->duplicates()->isNotEmpty()) {
                //             return $fail("Biến thể không thể có hai giá trị cho cùng một thuộc tính.");
                //         }

                //         // 🛑 Kiểm tra trùng giá trị thuộc tính giữa các biến thể trong request
                //         $variants = $this->input('variants', []);
                //         foreach ($variants as $index => $variant) {
                //             if ($index != $variantIndex) { // Loại trừ biến thể hiện tại
                //                 foreach ($variant['attributes'] ?? [] as $attr) {
                //                     if ($attr['attribute_id'] == $attributeId && $attr['attribute_value_id'] == $value) {
                //                         return $fail("Giá trị thuộc tính này đã tồn tại trong một biến thể khác của sản phẩm.");
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // ],
                function ($attribute, $value, $fail) {
                    $variantIndex = explode('.', $attribute)[1];

                    // Lấy danh sách biến thể từ request
                    $variants = $this->input('variants', []);

                    // Tạo danh sách tổ hợp thuộc tính của tất cả biến thể
                    $variantCombinations = [];

                    foreach ($variants as $index => $variant) {
                        $sortedAttributes = collect($variant['attributes'] ?? [])
                            ->sortBy('attribute_id') // Sắp xếp để đảm bảo thứ tự giống nhau
                            ->pluck('attribute_value_id')
                            ->toArray();

                        $combinationKey = implode('-', $sortedAttributes); // Ghép thành chuỗi duy nhất

                        if ($index != $variantIndex && in_array($combinationKey, $variantCombinations)) {
                            return $fail("Biến thể với tổ hợp thuộc tính này đã tồn tại.");
                        }

                        $variantCombinations[] = $combinationKey;
                    }
                },
            ],
            // 🚀 Kiểm tra ảnh của biến thể
            'variants.*.image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif,svg,webp',
                'max:5120' // Giới hạn 5MB
            ],
        ];
    }

    public function messages()
    {
        return [
            // 'sku.required' => 'SKU là bắt buộc..',
            // 'sku.unique' => 'SKU này đã tồn tại.',
            'price.numeric' => 'Giá phải là một số hợp lệ.',
            'price.between' => 'Giá phải nằm trong khoảng từ 0 đến 99999999.99.',
            'image.image' => 'Hình ảnh phải là một file ảnh.',
            'image.mimes' => 'Hình ảnh phải có định dạng: jpeg, png, jpg, gif, svg, webp.',
            'image.max' => 'Hình ảnh không được vượt quá 10MB.',
            'category_id.exists' => 'Danh mục không tồn tại.',
            'variants.required_if' => 'Biến thể sản phẩm là bắt buộc khi loại sản phẩm là variable.',
            'variants.*.sku.required_if' => 'SKU của biến thể là bắt buộc khi loại sản phẩm là variable.',
            'variants.*.attributes.*.attribute_id.exists' => 'Thuộc tính không tồn tại.',
            'variants.*.attributes.*.attribute_value_id.exists' => 'Giá trị thuộc tính không tồn tại.',
        ];
    }
}
