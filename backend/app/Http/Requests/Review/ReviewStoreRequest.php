<?php

namespace App\Http\Requests\Review;

use Dotenv\Validator;
use Illuminate\Contracts\Validation\Validator as ValidationValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewStoreRequest extends FormRequest
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
        return [
            'product_id' => 'required|exists:products,id',
            'user_id' => 'required|exists:users,id',
            'rating' => 'required',
            'comment' => 'nullable|string|max:1000',
        ];
    }
    public function messages()
    {
        return [
            'product_id.required' => 'Sản phẩm không được để trống.',
            'product_id.exists'   => 'Sản phẩm không tồn tại trong hệ thống.',
            'user_id.required' => 'Người mua không được để trống.',
            'user_id.exists'   => 'Người mua không tồn tại trong hệ thống.',
            'rating.required' => 'Đánh giá không được để trống.',
            'comment.max' => 'Bình luận không được vượt quá 1000 ký tự.',
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
