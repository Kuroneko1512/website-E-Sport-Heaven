<?php

namespace App\Http\Requests\Product;

use App\Traits\HandlesValidationFailure;
use Illuminate\Foundation\Http\FormRequest;


class ProductUpdateRequest extends FormRequest
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

    public function rules()
    {
        return [
            'name'             => ['required', 'string', 'max:255'],
            'price'            => ['nullable', 'between:0,99999999.99'],
            'stock'            => ['nullable', 'between:0,99999999.99'],
            'selected_attributes' => 'required_if:product_type,variable|array',
            'description'      => ['nullable', 'string'],
            'image'            => ['nullable', 'max:10240'],
            'product_type'     => ['required', 'in:simple,variable'],
            'status'           => ['nullable', 'in:active,inactive'],
            'category_id'      => ['nullable', 'exists:categories,id'],
            'discount_percent' => ['nullable', 'numeric', 'between:0,100'],
            'discount_start'   => ['nullable', 'date', 'before_or_equal:discount_end'],
            'discount_end'     => ['nullable', 'date', 'after_or_equal:discount_start'],
            'delete_variant_id' => ['nullable', 'array'],
            'delete_variant_id.*' => ['integer', 'exists:product_variants,id'],
            // Kiểm tra biến thể (variants)
            'variants' => [
                'nullable',
                'array',
                function ($attribute, $value, $fail) {
                    if ($this->input('product_type') === 'variable' && empty($value)) {
                        $fail('Sản phẩm có biến thể thì phải có ít nhất một biến thể.');
                    }
                }
            ],

            'variants.*.discount_percent' => ['nullable', 'numeric', 'between:0,100'],
            'variants.*.discount_start'   => ['nullable', 'date', 'before_or_equal:variants.*.discount_end'],
            'variants.*.discount_end'     => ['nullable', 'date', 'after_or_equal:variants.*.discount_start'],
            'variants.*.price' => ['required_if:product_type,variable', 'nullable', 'numeric', 'min:0'],
            'variants.*.stock' => ['required_if:product_type,variable', 'integer', 'min:0'],

            // Kiểm tra thuộc tính của biến thể
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
                function ($attribute, $value, $fail) {
                    $variantIndex = explode('.', $attribute)[1];

                    // Lấy tất cả biến thể
                    $variants = $this->input('variants', []);

                    // Tổ hợp thuộc tính của từng biến thể
                    $variantCombinations = [];

                    foreach ($variants as $index => $variant) {
                        $sortedAttributes = collect($variant['attributes'] ?? [])
                            ->sortBy('attribute_id')
                            ->pluck('attribute_value_id')
                            ->toArray();

                        $combinationKey = implode('-', $sortedAttributes);

                        // ✅ Lấy id của biến thể hiện tại (nếu có)
                        $currentId = $variants[$variantIndex]['id'] ?? null;
                        $otherId = $variant['id'] ?? null;


                        if ($index != $variantIndex && $combinationKey && $currentId !== $otherId) {
                            if (in_array($combinationKey, $variantCombinations)) {
                                return $fail("Biến thể với tổ hợp thuộc tính này đã tồn tại.");
                            }
                        }

                        $variantCombinations[] = $combinationKey;
                    }
                }
            ],


            // Kiểm tra ảnh của biến thể
            'variants.*.image' => [
                'nullable',
                
                'max:5120' // Giới hạn 5MB
            ],
            'variants.*.id' => ['nullable', 'exists:product_variants,id'],
        ];
    }

    public function messages()
    {
        return [
            'sku.unique' => 'SKU này đã tồn tại.',
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
            'variants.*.attributes.*.attribute_value_id' => 'Giá trị thuộc tính phải hợp lệ.',

            'delete_variant_id.array' => 'Danh sách ID biến thể cần xóa phải là một mảng.',
            'delete_variant_id.*.integer' => 'ID biến thể phải là số nguyên.',
            'delete_variant_id.*.exists' => 'Biến thể không tồn tại trong hệ thống.',
        ];
    }
}
