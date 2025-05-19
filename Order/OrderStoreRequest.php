<?php

namespace App\Http\Requests\Order;

use App\Models\Order;
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
            'customer_id' => 'nullable|exists:customers,id',

            // Nếu không có customer_id thì bắt buộc nhập các thông tin khách hàng
            'customer_name' => 'required_without:customer_id|string|max:255',
            'customer_email' => 'required_without:customer_id|nullable|email|max:255',
            'customer_phone' => 'required_without:customer_id|nullable|string|max:15',
            'shipping_address' => 'required_without:customer_id|nullable|string|max:500',

            // Thông tin bổ sung
            'customer_note' => 'nullable|string|max:1000',
            'admin_note' => 'nullable|string|max:1000',
            'shipping_method' => 'nullable|string|max:100',
            'shipping_fee' => 'nullable|numeric|min:0',
            'tracking_number' => 'nullable|string|max:100',

            // Thông tin mã giảm giá đơn hàng
            'order_coupon_code' => 'nullable|string|max:50',
            'order_coupon_name' => 'nullable|string|max:100',
            'order_discount_type' => 'nullable|integer|in:' . implode(',', [
                Order::DISCOUNT_TYPE_PERCENTAGE,
                Order::DISCOUNT_TYPE_FIXED,
                Order::DISCOUNT_TYPE_FREE
            ]),
            'order_discount_value' => 'nullable|numeric|min:0',
            'order_discount_amount' => 'nullable|numeric|min:0',

            // Thông tin mã giảm giá vận chuyển
            'shipping_coupon_code' => 'nullable|string|max:50',
            'shipping_coupon_name' => 'nullable|string|max:100',
            'shipping_discount_type' => 'nullable|integer|in:' . implode(',', [
                Order::DISCOUNT_TYPE_PERCENTAGE,
                Order::DISCOUNT_TYPE_FIXED,
                Order::DISCOUNT_TYPE_FREE
            ]),
            'shipping_discount_value' => 'nullable|numeric|min:0',
            'shipping_discount_amount' => 'nullable|numeric|min:0',

            // Thông tin tài chính
            'subtotal' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric|min:0',

            // Thông tin đơn hàng tại cửa hàng
            'is_store_pickup' => 'nullable|boolean',

            // Thông tin trạng thái đơn hàng
            'status' => 'nullable|integer|in:' . implode(',', [
                Order::STATUS_PENDING,
                Order::STATUS_CONFIRMED,
                Order::STATUS_PREPARING,
                Order::STATUS_READY_TO_SHIP,
                Order::STATUS_SHIPPING,
                Order::STATUS_DELIVERED,
                Order::STATUS_COMPLETED,
                Order::STATUS_RETURN_REQUESTED,
                Order::STATUS_RETURN_PROCESSING,
                Order::STATUS_RETURN_COMPLETED,
                Order::STATUS_RETURN_REJECTED,
                Order::STATUS_RETURN_TO_SHOP,
                Order::STATUS_CANCELLED
            ]),
            'payment_status' => 'nullable|integer|in:' . implode(',', [
                Order::PAYMENT_STATUS_UNPAID,
                Order::PAYMENT_STATUS_PAID
            ]),

            // Danh sách sản phẩm
            'order_items' => 'required|array|min:1',
            'order_items.*.product_id' => 'required|exists:products,id',
            'order_items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'order_items.*.quantity' => 'required|integer|min:1',
            'order_items.*.price' => 'required|numeric|min:0',
            'order_items.*.original_price' => 'nullable|numeric|min:0',
            'order_items.*.subtotal' => 'nullable|numeric|min:0',
            'order_items.*.discount' => 'nullable|numeric|min:0',

            // Phương thức thanh toán
            'payment_method' => 'required|string|in:vnpay,cod,momo,zalopay,bank_transfer',
        ];
    }

    public function messages()
    {
        return [
            // Lỗi customer_id
            'customer_id.exists' => 'Customer does not exist.',

            // Nếu không có customer_id thì phải nhập đầy đủ thông tin khách hàng
            'customer_name.required_without' => 'Customer name is required if no customer_id is provided.',
            'customer_email.required_without' => 'Customer email is required if no customer_id is provided.',
            'customer_phone.required_without' => 'Customer phone is required if no customer_id is provided.',
            'shipping_address.required_without' => 'Shipping address is required if no customer_id is provided.',

            // Lỗi thông tin bổ sung
            'customer_note.max' => 'Customer note cannot exceed 1000 characters.',
            'admin_note.max' => 'Admin note cannot exceed 1000 characters.',
            'shipping_method.max' => 'Shipping method cannot exceed 100 characters.',
            'shipping_fee.numeric' => 'Shipping fee must be a number.',
            'shipping_fee.min' => 'Shipping fee cannot be negative.',
            'tracking_number.max' => 'Tracking number cannot exceed 100 characters.',

            // Lỗi mã giảm giá đơn hàng
            'order_coupon_code.max' => 'Coupon code cannot exceed 50 characters.',
            'order_coupon_name.max' => 'Coupon name cannot exceed 100 characters.',
            'order_discount_type.in' => 'Invalid discount type.',
            'order_discount_value.numeric' => 'Discount value must be a number.',
            'order_discount_value.min' => 'Discount value cannot be negative.',
            'order_discount_amount.numeric' => 'Discount amount must be a number.',
            'order_discount_amount.min' => 'Discount amount cannot be negative.',

            // Lỗi mã giảm giá vận chuyển
            'shipping_coupon_code.max' => 'Shipping coupon code cannot exceed 50 characters.',
            'shipping_coupon_name.max' => 'Shipping coupon name cannot exceed 100 characters.',
            'shipping_discount_type.in' => 'Invalid shipping discount type.',
            'shipping_discount_value.numeric' => 'Shipping discount value must be a number.',
            'shipping_discount_value.min' => 'Shipping discount value cannot be negative.',
            'shipping_discount_amount.numeric' => 'Shipping discount amount must be a number.',
            'shipping_discount_amount.min' => 'Shipping discount amount cannot be negative.',

            // Lỗi thông tin tài chính
            'subtotal.numeric' => 'Subtotal must be a number.',
            'subtotal.min' => 'Subtotal cannot be negative.',
            'tax_amount.numeric' => 'Tax amount must be a number.',
            'tax_amount.min' => 'Tax amount cannot be negative.',
            'total_amount.numeric' => 'Total amount must be a number.',
            'total_amount.min' => 'Total amount cannot be negative.',

            // Lỗi đơn hàng tại cửa hàng
            'is_store_pickup.boolean' => 'Store pickup field must be true or false.',

            // Lỗi trạng thái đơn hàng
            'status.in' => 'Invalid order status.',
            'payment_status.in' => 'Invalid payment status.',

            // Lỗi danh sách sản phẩm
            'order_items.required' => 'Order must have at least one product.',
            'order_items.array' => 'Order items must be a valid array.',
            'order_items.min' => 'Order must contain at least one product.',

            // Lỗi từng sản phẩm trong đơn hàng
            'order_items.*.product_id.required' => 'Product is required.',
            'order_items.*.product_id.exists' => 'Invalid product.',
            'order_items.*.product_variant_id.exists' => 'Invalid product variant.',
            'order_items.*.quantity.required' => 'Product quantity is required.',
            'order_items.*.quantity.integer' => 'Quantity must be an integer.',
            'order_items.*.quantity.min' => 'Quantity must be greater than 0.',
            'order_items.*.price.required' => 'Product price is required.',
            'order_items.*.price.numeric' => 'Product price must be a number.',
            'order_items.*.price.min' => 'Invalid product price.',
            'order_items.*.original_price.numeric' => 'Original product price must be a number.',
            'order_items.*.original_price.min' => 'Invalid original product price.',
            'order_items.*.subtotal.numeric' => 'Subtotal must be a number.',
            'order_items.*.subtotal.min' => 'Subtotal cannot be negative.',

            // Lỗi phương thức thanh toán
            'payment_method.in' => 'Invalid payment method (only VNPay, COD, MoMo, ZaloPay or bank transfer are supported).',
        ];
    }
}
