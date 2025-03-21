<?php

namespace App\Http\Requests\Order;

use App\Traits\HandlesValidationFailure;
use Illuminate\Foundation\Http\FormRequest;

class OrderStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    use HandlesValidationFailure;
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        return [
            'customer_id' => 'nullable|exists:customer_profiles,id',

            // Nếu không có customer_id thì bắt buộc nhập các thông tin khách hàng
            'customer_name' => 'required_without:customer_id|string|max:255',
            'customer_email' => 'required_without:customer_id|nullable|email|max:255',
            'customer_phone' => 'required_without:customer_id|nullable|string|max:15',
            'shipping_address' => 'required_without:customer_id|nullable|string|max:500',

            // Danh sách sản phẩm
            'order_items' => 'required|array|min:1',
            'order_items.*.product_id' => 'required|exists:products,id',
            'order_items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'order_items.*.quantity' => 'required|integer|min:1',
            'order_items.*.price' => 'required|numeric|min:0',
            'payment_method'    => 'required|string|in:vnpay,cod',
        ];
    }
    public function messages()
{
    return [
        // Lỗi customer_id
        'customer_id.exists' => 'Khách hàng không tồn tại.',

        // Nếu không có customer_id thì phải nhập đầy đủ thông tin khách hàng
        'customer_name.required_without' => 'Tên khách hàng là bắt buộc nếu không có `customer_id`.',
        'customer_email.required_without' => 'Email khách hàng là bắt buộc nếu không có `customer_id`.',
        'customer_phone.required_without' => 'Số điện thoại khách hàng là bắt buộc nếu không có `customer_id`.',
        'shipping_address.required_without' => 'Địa chỉ giao hàng là bắt buộc nếu không có `customer_id`.',

        // Lỗi danh sách sản phẩm
        'order_items.required' => 'Đơn hàng phải có ít nhất một sản phẩm.',
        'order_items.array' => 'Danh sách sản phẩm phải là mảng hợp lệ.',
        'order_items.min' => 'Đơn hàng phải chứa ít nhất một sản phẩm.',

        // Lỗi từng sản phẩm trong đơn hàng
        'order_items.*.product_id.required' => 'Sản phẩm là bắt buộc.',
        'order_items.*.product_id.exists' => 'Sản phẩm không hợp lệ.',
        'order_items.*.product_variant_id.exists' => 'Biến thể sản phẩm không hợp lệ.',
        'order_items.*.quantity.required' => 'Số lượng sản phẩm là bắt buộc.',
        'order_items.*.quantity.integer' => 'Số lượng phải là số nguyên.',
        'order_items.*.quantity.min' => 'Số lượng phải lớn hơn 0.',
        'order_items.*.price.required' => 'Giá sản phẩm là bắt buộc.',
        'order_items.*.price.numeric' => 'Giá sản phẩm phải là số.',
        'order_items.*.price.min' => 'Giá sản phẩm không hợp lệ.',
        'payment_method.in'         => 'Phương thức thanh toán không hợp lệ (chỉ hỗ trợ VNPay hoặc COD).',
    ];
}

}
