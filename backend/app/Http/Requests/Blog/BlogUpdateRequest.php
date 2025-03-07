<?php

namespace App\Http\Requests\Blog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator as ValidationValidator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class BlogUpdateRequest extends FormRequest
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
        $id = $this->route('id'); // Lấy ID bài viết từ route
        $rules = [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:blog_categories,id',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        // Chỉ kiểm tra unique nếu title có thay đổi
        if ($this->has('title')) {
            $rules['title'] .= '|unique:blogs,title,' . $id . ',id';
        }

        return $rules;
    }


    /**
     * Get the custom validation messages.
     */
    public function messages()
    {
        return [
            'title.required' => 'Tiêu đề không được để trống.',
            'title.string' => 'Tiêu đề phải là chuỗi.',
            'title.max' => 'Tiêu đề không được vượt quá 255 ký tự.',
            'title.unique' => 'Tiêu đề đã tồn tại.',
            'content.required' => 'Nội dung không được để trống.',
            'content.string' => 'Nội dung phải là chuỗi.',
            'category_id.required' => 'Danh mục không được để trống.',
            'category_id.exists' => 'Danh mục không tồn tại.',
            'thumbnail.image' => 'Thumbnail phải là hình ảnh.',
            'thumbnail.mimes' => 'Ảnh thumbnail phải có định dạng: jpeg, png, jpg, gif.',
            'thumbnail.max' => 'Kích thước ảnh tối đa là 2MB.',
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
