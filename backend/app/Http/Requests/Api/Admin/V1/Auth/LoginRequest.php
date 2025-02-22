<?php

namespace App\Http\Requests\Api\Admin\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
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
            'email' => 'required|email|exists:admins,email',
            'password' => 'required|string|min:8'
        ];
    }
    public function messages(): array
    {
        return [
            'email.required'    => 'Email không được để trống',
            'email.email'       => 'Email không đúng định dạng',
            'email.exists'      => 'Email không tồn tại trong hệ thống',
            'password.required' => 'Mật khẩu không được để trống',
            'password.string'   => 'Mật khẩu phải là chuỗi ký tự',
            'password.min'      => 'Mật khẩu phải có ít nhất 8 ký tự'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ',
            'errors' => $validator->errors()
        ], 422));
    }
}
