<?php

namespace App\Http\Requests\Attribute;

use Illuminate\Foundation\Http\FormRequest;
use Dotenv\Validator;
use Illuminate\Contracts\Validation\Validator as ValidationValidator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AttributeUpdateRequest extends FormRequest
{
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
        $id = $this->route('attribute');
        return [
            'name' => 'required|string|max:255|unique:attributes,name,' . $id,
            'description' => 'nullable|string|max:1000',
        ];
    }
    public function messages()
    {
        return [
            'name.required' => 'Tên thuộc tính không được để trống.',
            'name.string' => 'Tên thuộc tính phải là chuỗi.',
            'name.max' => 'Tên thuộc tính không được vượt quá 255 ký tự.',
            'name.unique' => 'Tên thuộc tính đã tồn tại.',
            'description.string' => 'Mô tả phải là chuỗi.',
            'description.max' => 'Mô tả không được vượt quá 1000 ký tự.',
        ];
    }
    protected function failedValidation(ValidationValidator $validator)
    {
        $errors = (new ValidationException($validator))->errors();

        throw new HttpResponseException(
            response()->json(['errors' => $errors], JsonResponse::HTTP_UNPROCESSABLE_ENTITY)
        );
    }
}
