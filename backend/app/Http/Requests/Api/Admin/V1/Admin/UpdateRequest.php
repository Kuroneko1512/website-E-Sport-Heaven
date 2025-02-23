<?php

namespace App\Http\Requests\Api\Admin\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
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
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:admins,email,' . $this->admin->id,
            'password' => 'sometimes|min:8',
            'role' => 'sometimes|exists:roles,name',
            'position' => 'sometimes|string',
            'department' => 'sometimes|string',
            'status' => 'sometimes|in:active,inactive,blocked',
            'reason' => 'required_with:role|string' // Lý do khi thay đổi role
        ];
    }

    public function messages()
    {
        return [
            'email.unique' => 'Email đã tồn tại',
            'password.min' => 'Mật khẩu tối thiểu 8 ký tự',
            'role.exists' => 'Role không tồn tại',
            'status.in' => 'Trạng thái không hợp lệ',
            'reason.required_with' => 'Vui lòng nhập lý do thay đổi role'
        ];
    }
}
