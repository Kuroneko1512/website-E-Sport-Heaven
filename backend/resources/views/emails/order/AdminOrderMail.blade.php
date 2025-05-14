@extends('emails.layouts.main-mail')

@section('title', 'Thông Báo Đơn Hàng Mới')

@section('header-bg-color', '#f0f4fa')
@section('header-title', 'Đơn Hàng Mới')
@section('header-subtitle', 'Một đơn hàng mới vừa được tạo trên hệ thống')

@section('content')
    <div class="alert" style="background-color: #e7f3ff; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 16px; color: #0c5460;">
            <strong>Thông báo:</strong> Đơn hàng mới #{{ $order->order_code }} cần được xử lý!
        </p>
    </div>

    <div class="order-info">
        <h2 style="margin-top: 0; color: #2c3e50; font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            Thông Tin Đơn Hàng #{{ $order->order_code }}
        </h2>
        <p><strong>Ngày đặt hàng:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>
        <p>
            <strong>Trạng thái:</strong>  
            <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 14px; color: white; background-color: {{ $order->status === 6 ? '#28a745' : ($order->status === 0 ? '#ffc107' : '#dc3545') }}">
                {{ $order->status_label }}
            </span>
        </p>
        <p>
            <strong>Phương thức thanh toán:</strong> 
            @if($order->payment_method == 'cod')
                Thanh toán khi nhận hàng (COD)
            @elseif($order->payment_method == 'vnpay')
                Thanh toán qua VNPay
            @else
                {{ $order->payment_method }}
            @endif
        </p>
        <p>
            <strong>Trạng thái thanh toán:</strong>
            <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 14px; color: white; background-color: {{ $order->payment_status === 1 ? '#28a745' : '#ffc107' }}">
                {{ $order->payment_status_label }}
            </span>
        </p>
    </div>

    <div class="customer-info">
        <h2 style="margin-top: 0; color: #2c3e50; font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            Thông Tin Khách Hàng
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; width: 150px;"><strong>Tên:</strong></td>
                <td style="padding: 8px 0;">{{ $order->customer_name }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Email:</strong></td>
                <td style="padding: 8px 0;">
                    <a href="mailto:{{ $order->customer_email }}" style="color: #3498db; text-decoration: none;">
                        {{ $order->customer_email }}
                    </a>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Số điện thoại:</strong></td>
                <td style="padding: 8px 0;">
                    <a href="tel:{{ $order->customer_phone }}" style="color: #3498db; text-decoration: none;">
                        {{ $order->customer_phone }}
                    </a>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Địa chỉ giao hàng:</strong></td>
                <td style="padding: 8px 0;">{{ $order->shipping_address }}</td>
            </tr>
            @if($order->customer_note)
            <tr>
                <td style="padding: 8px 0;"><strong>Ghi chú:</strong></td>
                <td style="padding: 8px 0;">{{ $order->customer_note }}</td>
            </tr>
            @endif
        </table>
    </div>

    <h2 class="section-title" style="color: #2c3e50; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-top: 30px; font-size: 20px;">
        Chi Tiết Đơn Hàng
    </h2>
    <table class="product-table" style="width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 8px; overflow: hidden;">
        <thead>
            <tr>
                <th style="background-color: #3498db; color: white; padding: 12px 15px; text-align: left;">Sản phẩm</th>
                <th style="background-color: #3498db; color: white; padding: 12px 15px; text-align: center; width: 80px;">Số lượng</th>
                <th style="background-color: #3498db; color: white; padding: 12px 15px; text-align: right; width: 120px;">Đơn giá</th>
                <th style="background-color: #3498db; color: white; padding: 12px 15px; text-align: right; width: 120px;">Thành tiền</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->orderItems as $item)
                <tr style="background-color: {{ $loop->even ? '#f8f9fa' : '#ffffff' }};">
                    <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee;">
                        <div style="font-weight: bold;">{{ $item->product->name ?? $item->product_name ?? 'Sản phẩm không xác định' }}</div>
                        @if ($item->productVariant)
                            <div style="font-size: 13px; color: #666; margin-top: 5px;">
                                <strong>SKU: {{ $item->productVariant->sku }}</strong><br>
                                @php
                                    $attributes = [];
                                    foreach ($item->productVariant->productAttributes as $attribute) {
                                        $attributeName = $attribute->attribute->name;
                                        $attributeValue = $attribute->attributeValue->value;
                                        $attributes[] = "$attributeName: $attributeValue";
                                    }
                                @endphp
                                @if (!empty($attributes))
                                    ({{ implode(', ', $attributes) }})
                                @endif
                            </div>
                        @elseif($item->variant_sku)
                            <div style="font-size: 13px; color: #666; margin-top: 5px;">
                                <strong>SKU: {{ $item->variant_sku }}</strong>
                                @if($item->variant_attributes)
                                    <br>
                                    @php
                                        $variantAttrs = json_decode($item->variant_attributes, true);
                                        $attrStrings = [];
                                        if(is_array($variantAttrs)) {
                                            foreach($variantAttrs as $attrName => $attrValue) {
                                                $attrStrings[] = "$attrName: $attrValue";
                                            }
                                        }
                                    @endphp
                                    @if(!empty($attrStrings))
                                        ({{ implode(', ', $attrStrings) }})
                                    @endif
                                @endif
                            </div>
                        @elseif($item->product_sku)
                            <div style="font-size: 13px; color: #666; margin-top: 5px;">
                                <strong>SKU: {{ $item->product_sku }}</strong>
                            </div>
                        @endif
                    </td>
                    <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #eee;">{{ $item->quantity }}</td>
                    <td style="padding: 12px 15px; text-align: right; border-bottom: 1px solid #eee;">{{ number_format($item->price) }} VNĐ</td>
                    <td style="padding: 12px 15px; text-align: right; border-bottom: 1px solid #eee;">{{ number_format($item->price * $item->quantity) }} VNĐ</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background-color: #f8f9fa;">
                <td colspan="3" style="padding: 12px 15px; text-align: right; font-weight: bold;">Tạm tính:</td>
                <td style="padding: 12px 15px; text-align: right; font-weight: bold;">{{ number_format($order->subtotal) }} VNĐ</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
                <td colspan="3" style="padding: 12px 15px; text-align: right; font-weight: bold;">Phí giao hàng:</td>
                <td style="padding: 12px 15px; text-align: right; font-weight: bold;">{{ number_format($order->shipping_fee) }} VNĐ</td>
            </tr>
            @if($order->order_discount_amount > 0)
            <tr style="background-color: #f8f9fa;">
                <td colspan="3" style="padding: 12px 15px; text-align: right; font-weight: bold;">Giảm giá:</td>
                <td style="padding: 12px 15px; text-align: right; font-weight: bold;">-{{ number_format($order->order_discount_amount) }} VNĐ</td>
            </tr>
            @endif
            <tr style="background-color: #e9f7ef;">
                <td colspan="3" style="padding: 12px 15px; text-align: right; font-weight: bold; color: #e74c3c;">Tổng thanh toán:</td>
                <td style="padding: 12px 15px; text-align: right; font-weight: bold; color: #e74c3c; font-size: 16px;">{{ number_format($order->total_amount) }} VNĐ</td>
            </tr>
        </tfoot>
    </table>

    <div style="text-align: center; margin-top: 30px;">
        <a href="{{ \App\Helpers\UrlHelpers::adminUrl('/Order/Details/' . $order->id) }}" class="action-button" style="display: inline-block; padding: 12px 25px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Xem Chi Tiết Đơn Hàng
        </a>
    </div>

    <div style="margin-top: 30px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #f39c12;">
        <p style="margin: 0; font-weight: bold; color: #f39c12;">Lưu ý:</p>
        <p style="margin: 10px 0 0;">Vui lòng xử lý đơn hàng này trong thời gian sớm nhất để đảm bảo trải nghiệm tốt cho khách hàng.</p>
    </div>
@endsection

@section('footer-content')
    <p style="font-size: 14px; color: #7f8c8d;">Email này được gửi tự động từ hệ thống Sport Heaven.</p>
    <p style="font-size: 14px; color: #7f8c8d;">Đây là email nội bộ, vui lòng không chuyển tiếp.</p>
@endsection
