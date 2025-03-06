<?php

namespace App\Http\Requests\Product;

use App\Traits\HandlesValidationFailure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $rules = [
            'name' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|between:0,99999999.99',
            'sku' => [
                'required',
                'string',
                Rule::unique('products', 'sku')->ignore($this->route('product')), // Sửa $productId thành $this->route('product')
            ],
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:10240',
            'product_type' => 'nullable|in:simple,variable',
            'status' => 'nullable|in:active,inactive',
            'category_id' => 'nullable|exists:categories,id',

            // Kiểm tra biến thể
            'variants' => [
                'nullable',
                'array',
                function ($attribute, $value, $fail) {
                    if ($this->input('product_type') === 'variable' && empty($value)) {
                        $fail('Sản phẩm có biến thể thì phải có ít nhất một biến thể.');
                    }
                }
            ],
            'variants.*.id' => 'nullable|exists:product_variants,id',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'required_if:product_type,variable|integer|min:0',
            'variants.*.attributes' => 'required_if:product_type,variable|array|min:1',
            'variants.*.attributes.*.attribute_id' => [
                'required_if:product_type,variable',
                'exists:attributes,id',
            ],
            'variants.*.attributes.*.attribute_value_id' => [
                'required_if:product_type,variable',
                'exists:attribute_values,id',
                function ($attribute, $value, $fail) {
                    $variantIndex = explode('.', $attribute)[1];

                    // Kiểm tra attribute_value_id có hợp lệ không
                    $attributeValue = \App\Models\AttributeValue::find($value);
                    if (!$attributeValue) {
                        return $fail("Giá trị thuộc tính không hợp lệ.");
                    }

                    $attributeId = $attributeValue->attribute_id;
                    $variantAttributes = $this->input("variants.{$variantIndex}.attributes", []);

                    // 🛑 Kiểm tra một biến thể có nhiều giá trị của cùng một thuộc tính không
                    $count = collect($variantAttributes)->where('attribute_id', $attributeId)->count();
                    if ($count > 1) {
                        return $fail("Biến thể không thể có hai giá trị cho cùng một thuộc tính.");
                    }

                    // 🛑 Kiểm tra giá trị thuộc tính có trùng giữa các biến thể không
                    $productId = $this->route('product');
                    $existsInProduct = \App\Models\ProductAttribute::whereHas('productVariant', function ($query) use ($productId) {
                        $query->where('product_id', $productId);
                    })
                        ->where('attribute_value_id', $value)
                        ->whereNotIn('product_variant_id', [$this->input("variants.{$variantIndex}.id")])
                        ->exists();

                    if ($existsInProduct) {
                        return $fail("Giá trị thuộc tính này đã tồn tại trong một biến thể khác của sản phẩm.");
                    }
                }
            ],
            'variants.*.images' => 'nullable|array',
            'variants.*.images.*' => 'nullable|string|url',
        ];

        // ✅ Cách sửa lỗi unique cho variants.*.sku
        foreach ($this->input('variants', []) as $key => $variant) {
            $variantId = $variant['id'] ?? null;
            $rules["variants.$key.sku"] = [
                'required_if:product_type,variable',
                'string',
                Rule::unique('product_variants', 'sku')->ignore($variantId),
            ];
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'sku.unique' => 'SKU này đã tồn tại.',
            'price.numeric' => 'Giá phải là một số hợp lệ.',
            'price.between' => 'Giá phải nằm trong khoảng từ 0 đến 99999999.99.',
            'image.image' => 'Hình ảnh phải là một file ảnh.',
            'image.mimes' => 'Hình ảnh phải có định dạng: jpeg, png, jpg, gif, svg.',
            'image.max' => 'Hình ảnh không được vượt quá 10MB.',
            'category_id.exists' => 'Danh mục không tồn tại.',
            'variants.required_if' => 'Biến thể sản phẩm là bắt buộc khi loại sản phẩm là variable.',
            'variants.*.sku.required_if' => 'SKU của biến thể là bắt buộc khi loại sản phẩm là variable.',
            'variants.*.attributes.*.attribute_id.exists' => 'Thuộc tính không tồn tại.',
            'variants.*.attributes.*.attribute_value_id.exists' => 'Giá trị thuộc tính không tồn tại.',
        ];
    }
}
