<?php

namespace App\Http\Requests\Api\Admin\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:admins',
            'password' => 'required|min:8',
            'role' => 'required|exists:roles,name',
            'position' => 'required|string',
            'department' => 'required|string',
            'status' => 'required|in:active,inactive,blocked'
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Tên không được để trống',
            'email.required' => 'Email không được để trống',
            'email.email' => 'Email không đúng định dạng',
            'email.unique' => 'Email đã tồn tại',
            'password.required' => 'Mật khẩu không được để trống',
            'password.min' => 'Mật khẩu tối thiểu 8 ký tự',
            'role.required' => 'Role không được để trống',
            'role.exists' => 'Role không tồn tại',
            'position.required' => 'Chức vụ không được để trống',
            'department.required' => 'Phòng ban không được để trống',
            'status.required' => 'Trạng thái không được để trống',
            'status.in' => 'Trạng thái không hợp lệ'
        ];
    }
}
