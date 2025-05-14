<?php

namespace App\Http\Requests\Wishlist;

use Dotenv\Validator;
use Illuminate\Contracts\Validation\Validator as ValidationValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WishlistStoreRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id'
        ];
    }
    public function messages()
    {
        return [
            'product_id.required' => 'Sản phẩm không được để trống.',
            'product_id.exists' => 'Sản phẩm không tồn tại trong hệ thống.',
            'user_id.required' => 'Người mua không được để trống.',
            'user_id.exists'   => 'Người mua không tồn tại trong hệ thống.',
        ];
    }
    protected function failedValidation(ValidationValidator $validator)
    {
        $errors = (new ValidationException($validator))->errors();

        throw new HttpResponseException(
            response()->json(['errors' => $errors], JsonResponse::HTTP_UNPROCESSABLE_ENTITY)
        );
    }

    public function prepareForValidation()
    {
        $this->merge([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
        ]);
    }
}
