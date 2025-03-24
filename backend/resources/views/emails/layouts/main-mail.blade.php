<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>@yield('title', 'Sport Heaven')</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
            background-color: @yield('header-bg-color', '#ffffff');
        }
        .alert {
            background-color: #f2f7ff;
            border-left: 4px solid #0d6efd;
            padding: 15px;
            margin: 20px 0;
        }
        .order-info {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        .product-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .product-table th, .product-table td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        .product-table th {
            background-color: #f2f2f2;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #777;
            font-size: 14px;
        }
        .total {
            font-weight: bold;
            text-align: right;
            margin-top: 20px;
        }
        .action-button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #0d6efd;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
    @yield('additional-styles')
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>@yield('header-title', 'E-Sport Heaven')</h1>
            <p>@yield('header-subtitle')</p>
        </div>
        
        @yield('content')
        
        <div class="footer">
            @yield('footer-content')
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email support@esportheaven.com hoặc số điện thoại 1900 1234.</p>
            <p>&copy; {{ date('Y') }} Sport Heaven. Tất cả các quyền được bảo lưu.</p>
        </div>
    </div>
</body>
</html>
