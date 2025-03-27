@extends('emails.layouts.main-mail')

@section('title', 'Thông Báo Đơn Hàng Mới')

@section('header-bg-color', '#f8f9fa')
@section('header-title', 'Đơn Hàng Mới')
@section('header-subtitle', 'Một đơn hàng mới vừa được tạo trên hệ thống')

@section('content')
    <div class="alert">
        <p>Đơn hàng mới #{{ $order->order_code }} cần được xử lý!</p>
    </div>

    <div class="order-info">
        <h2>Thông Tin Đơn Hàng #{{ $order->order_code }}</h2>
        <p><strong>Ngày đặt hàng:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>
        <p><strong>Trạng thái:</strong> {{ $order->status }}</p>
    </div>

    <div class="customer-info">
        <h2>Thông Tin Khách Hàng</h2>
        <p><strong>Tên:</strong> {{ $order->customer_name }}</p>
        <p><strong>Email:</strong> {{ $order->customer_email }}</p>
        <p><strong>Số điện thoại:</strong> {{ $order->customer_phone }}</p>
        <p><strong>Địa chỉ giao hàng:</strong> {{ $order->shipping_address }}</p>
    </div>

    <h2>Chi Tiết Đơn Hàng</h2>
    <table class="product-table">
        <thead>
            <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->orderItems as $item)
                <tr>
                    <td>
                        {{ $item->product->name ?? 'Sản phẩm không xác định' }}
                        @if ($item->productVariant)
                            <br>
                            <small>
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
                            </small>
                        @endif
                    </td>
                    <td>{{ $item->quantity }}</td>
                    <td>{{ number_format($item->price) }} VNĐ</td>
                    <td>{{ number_format($item->price * $item->quantity) }} VNĐ</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total">
        <p><strong>Tổng thanh toán:</strong> {{ number_format($order->total_amount) }} VNĐ</p>
    </div>

    <div style="text-align: center;">
        <a href="" class="action-button">Xem Chi Tiết Đơn Hàng</a>
    </div>
@endsection

@section('footer-content')
    <p>Email này được gửi tự động từ hệ thống Sport Heaven.</p>
@endsection
