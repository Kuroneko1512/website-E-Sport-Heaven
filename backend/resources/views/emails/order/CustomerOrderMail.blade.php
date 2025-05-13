@extends('emails.layouts.main-mail')

@section('title', 'Xác Nhận Đơn Hàng')

@section('header-title', 'Xác Nhận Đơn Hàng')
@section('header-subtitle', 'Cảm ơn bạn đã đặt hàng tại Sport Heaven!')

@section('content')
    <div class="order-info">
        <h2>Thông Tin Đơn Hàng #{{ $order->order_code }}</h2>
        <p><strong>Ngày đặt hàng:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>
        <p><strong>Trạng thái:</strong> 
            <span style="color: {{ $order->status === 6 ? '#28a745' : ($order->status === 0 ? '#ffc107' : '#dc3545') }}">
                {{ $order->status->getStatusLabelAttribute() }}
            </span>
        </p>
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
                    <td>{{ number_format(num: $item->price * $item->quantity) }} VNĐ</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total">
        <p><strong>Tổng thanh toán:</strong> {{ number_format($order->total_amount) }} VNĐ</p>
    </div>

    <div class="tracking">
        <h2>Theo Dõi Đơn Hàng</h2>
        <p>Bạn có thể theo dõi trạng thái đơn hàng của mình bằng mã đơn hàng: <strong>{{ $order->order_code }}</strong></p>
        <p>Hoặc truy cập vào trang web của chúng tôi và nhập mã đơn hàng vào mục "Tra cứu đơn hàng".</p>
    </div>
@endsection

@section('footer-content')
    <p>Cảm ơn bạn đã mua sắm tại Sport Heaven!</p>
@endsection
