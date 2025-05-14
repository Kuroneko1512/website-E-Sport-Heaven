@extends('emails.layouts.main-mail')

@section('title', 'Xác Nhận Đơn Hàng')

@section('header-title', 'Xác Nhận Đơn Hàng')
@section('header-subtitle', 'Cảm ơn bạn đã đặt hàng tại Sport Heaven!')
@section('header-bg-color', '#f0f7ff')

@section('content')
    <div class="order-info">
        <h2>Thông Tin Đơn Hàng #{{ $order->order_code }}</h2>
        <p><strong>Ngày đặt hàng:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>
        <p><strong>Trạng thái:</strong> 
            <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 14px; color: white; background-color: {{ $order->status === 6 ? '#28a745' : ($order->status === 0 ? '#ffc107' : '#dc3545') }}">
                {{ $order->status_label }}
            </span>
        </p>
        <p><strong>Phương thức thanh toán:</strong> 
            @if($order->payment_method == 'cod')
                Thanh toán khi nhận hàng (COD)
            @elseif($order->payment_method == 'vnpay')
                Thanh toán qua VNPay
            @else
                {{ $order->payment_method }}
            @endif
        </p>
    </div>

    <div class="customer-info">
        <h2>Thông Tin Khách Hàng</h2>
        <p><strong>Tên:</strong> {{ $order->customer_name }}</p>
        <p><strong>Email:</strong> {{ $order->customer_email }}</p>
        <p><strong>Số điện thoại:</strong> {{ $order->customer_phone }}</p>
        <p><strong>Địa chỉ giao hàng:</strong> {{ $order->shipping_address }}</p>
        @if($order->customer_note)
            <p><strong>Ghi chú:</strong> {{ $order->customer_note }}</p>
        @endif
    </div>

    <h2 class="section-title">Chi Tiết Đơn Hàng</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 8px; overflow: hidden;">
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

    <div class="tracking">
        <h2>Theo Dõi Đơn Hàng</h2>
        <p>Bạn có thể theo dõi trạng thái đơn hàng của mình bằng mã đơn hàng: <strong>{{ $order->order_code }}</strong></p>
        <p>Hoặc truy cập vào trang web của chúng tôi và nhập mã đơn hàng vào mục "Tra cứu đơn hàng".</p>
        <a href="{{ \App\Helpers\UrlHelpers::clientUrl('/order-history/' . $order->order_code) }}" class="action-button">Theo dõi đơn hàng</a>
    </div>
@endsection

@section('footer-content')
    <p style="font-size: 16px; font-weight: bold; color: #3498db;">Cảm ơn bạn đã mua sắm tại Sport Heaven!</p>
    <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao.</p>
@endsection
