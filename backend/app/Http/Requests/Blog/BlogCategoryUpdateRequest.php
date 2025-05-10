<?php

namespace App\Http\Requests\Blog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator as ValidationValidator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class BlogCategoryUpdateRequest extends FormRequest
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
        $id = $this->route('id'); //lấy đúng ID danh mục từ route.
        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            "description" => "nullable|string|max:255"
        ];
        Log::info("Log" . $id);
        // Nếu 'name' thay đổi, kiểm tra 'unique'
        $category = $this->route('category'); // hoặc bạn có thể dùng model để kiểm tra
        // Nếu có danh mục và tên hiện tại khác tên mới được nhập
        if ($category && $category->name !== $this->input('name')) {
            // Thêm quy tắc kiểm tra duy nhất (unique), bỏ qua ID hiện tại để không báo trùng chính nó
            // $rules['name'][] = Rule::unique('blog_categories')->ignore($id);
        }

        return $rules;
    }

    /**
     * Get the custom validation messages.
     */
    public function messages()
    {
        return [
            'name.required' => 'Tên danh mục không được để trống.',
            'name.string' => 'Tên danh mục phải là chuỗi.',
            'name.max' => 'Tên danh mục không được vượt quá 255 ký tự.',
            'name.unique' => 'Tên danh mục đã tồn tại.'
        ];
    }

    /**
     * Handle failed validation.
     */
    protected function failedValidation(ValidationValidator $validator)
    {
        $errors = (new ValidationException($validator))->errors();

        throw new HttpResponseException(
            response()->json(['errors' => $errors], JsonResponse::HTTP_UNPROCESSABLE_ENTITY)
        );
    }
}
