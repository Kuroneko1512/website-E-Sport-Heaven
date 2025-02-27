<?php

namespace App\Http\Requests\Attribute;

use Illuminate\Foundation\Http\FormRequest;
use App\Traits\HandlesValidationFailure;


class AttributeValueUpdateRequest extends FormRequest
{
    use HandlesValidationFailure;
    /**
     * Determine if the user is authorized to make this request.
     */
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
            'attribute_id' => 'required|exists:attributes,id',
            'value'        => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }
    public function messages()
    {
        return [
            'attribute_id.required' => 'Trường thuộc tính là bắt buộc.',
            'attribute_id.exists'   => 'Thuộc tính không tồn tại trong hệ thống.',
            'value.string'          => 'Giá trị phải là một chuỗi.',
            'value.max'            => 'Giá trị không được vượt quá 255 ký tự.',
            'description.string'    => 'Mô tả phải là một chuỗi.',
            'image.image'           => 'Tệp tải lên phải là một hình ảnh.',
            'image.mimes'           => 'Ảnh chỉ chấp nhận các định dạng: jpeg, png, jpg, gif.',
            'image.max'             => 'Dung lượng ảnh không được vượt quá 2MB.',
        ];
    }
  
}
