<?php

namespace App\Http\Requests\LocationImport;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator as ValidationValidator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ImportRequest extends FormRequest
{
    /**
     * Xác định xem người dùng có quyền thực hiện request này không.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Định nghĩa các quy tắc kiểm tra dữ liệu đầu vào.
     */
    public function rules(): array
    {
        return [
            'provinces' => 'required|file|mimes:csv,txt|max:5120',
            'districts' => 'required|file|mimes:csv,txt|max:5120',
            'communes'  => 'required|file|mimes:csv,txt|max:5120',
        ];
    }

    /**
     * Định nghĩa các thông báo lỗi tùy chỉnh.
     */
    public function messages(): array
    {
        return [
            'provinces.required' => 'Vui lòng tải lên file tỉnh/thành.',
            'provinces.file'     => 'Tập tin tỉnh/thành phải là một tập tin hợp lệ.',
            'provinces.mimes'    => 'Tập tin tỉnh/thành phải có định dạng CSV hoặc TXT.',
            'provinces.max'      => 'Tập tin tỉnh/thành không được vượt quá 5MB.',

            'districts.required' => 'Vui lòng tải lên file quận/huyện.',
            'districts.file'     => 'Tập tin quận/huyện phải là một tập tin hợp lệ.',
            'districts.mimes'    => 'Tập tin quận/huyện phải có định dạng CSV hoặc TXT.',
            'districts.max'      => 'Tập tin quận/huyện không được vượt quá 5MB.',

            'communes.required'  => 'Vui lòng tải lên file xã/phường.',
            'communes.file'      => 'Tập tin xã/phường phải là một tập tin hợp lệ.',
            'communes.mimes'     => 'Tập tin xã/phường phải có định dạng CSV hoặc TXT.',
            'communes.max'       => 'Tập tin xã/phường không được vượt quá 5MB.',
        ];
    }

    /**
     * Xử lý khi validation thất bại.
     */
    protected function failedValidation(ValidationValidator $validator)
    {
        $errors = (new ValidationException($validator))->errors();

        throw new HttpResponseException(
            response()->json(['errors' => $errors], JsonResponse::HTTP_UNPROCESSABLE_ENTITY)
        );
    }
}
