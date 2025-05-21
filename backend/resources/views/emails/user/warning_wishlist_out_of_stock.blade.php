@extends('emails.layouts.main-mail')

@section('title', 'Thông Báo Sản Phẩm Sắp Hết Hàng')

@section('header-bg-color', '#f0f4fa')
@section('header-title', 'Thông Báo Sản Phẩm Sắp Hết Hàng')
@section('header-subtitle', 'Thông Báo Sản Phẩm Sắp Hết Hàng')

@section('content')
    <div class="alert" style="background-color: #e7f3ff; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 16px; color: #0c5460;">
            <strong>Thông báo:</strong> Sản Phẩm Sắp Hết Hàng
        </p>
    </div>

    <div class="order-info">
        <h2 style="margin-top: 0; color: #2c3e50; font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            Thông Tin Sản Phẩm{{ $product->name }}
        </h2>
        
        <p>
            Sản phẩm sắp hết hàng, bạn vui lòng mua sớm!
        </p>
    </div>
@endsection

@section('footer-content')
    <p style="font-size: 14px; color: #7f8c8d;">Email này được gửi tự động từ hệ thống Sport Heaven.</p>
    <p style="font-size: 14px; color: #7f8c8d;">Đây là email nội bộ, vui lòng không chuyển tiếp.</p>
@endsection
