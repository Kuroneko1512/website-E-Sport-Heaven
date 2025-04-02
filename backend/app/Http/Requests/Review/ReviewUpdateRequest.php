<?php

namespace App\Http\Requests\Review;

use Illuminate\Foundation\Http\FormRequest;
use Dotenv\Validator;
use Illuminate\Contracts\Validation\Validator as ValidationValidator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewUpdateRequest extends FormRequest
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
        $id = $this->route('review');
        return [
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'user_id' => 'required|exists:users,id',
            'rating' => 'required|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:1000',
            'images' => 'nullable|string|max:5000',
        ];
    }
    public function messages()
    {
        return [
            'product_id.required' => 'Sản phẩm không được để trống.',
            'product_id.exists'   => 'Sản phẩm không tồn tại trong hệ thống.',
            'product_variant_id.exists'   => 'Sản phẩm không tồn tại trong hệ thống.',
            'user_id.required' => 'Người mua không được để trống.',
            'user_id.exists'   => 'Người mua không tồn tại trong hệ thống.',
            'rating.required' => 'Đánh giá không được để trống.',
            'title.max' => 'Tiêu đề không được vượt quá 255 ký tự.',
            'comment.max' => 'Bình luận không được vượt quá 1000 ký tự.',
            'images.max' => 'Ảnh không được vượt quá 5000 ký tự.',
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
