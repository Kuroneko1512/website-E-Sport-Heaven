<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Sport Heaven')</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding: 25px 0;
            border-bottom: 2px solid #eee;
            background-color: @yield('header-bg-color', '#f8f9fa');
        }
        .header h1 {
            margin: 0;
            color: #2c3e50;
            font-size: 24px;
        }
        .header p {
            margin: 10px 0 0;
            color: #7f8c8d;
        }
        .alert {
            background-color: #f2f7ff;
            border-left: 4px solid #0d6efd;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .order-info {
            margin: 20px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .order-info h2 {
            margin-top: 0;
            color: #2c3e50;
            font-size: 18px;
        }
        .customer-info {
            margin: 20px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #2ecc71;
        }
        .customer-info h2 {
            margin-top: 0;
            color: #2c3e50;
            font-size: 18px;
        }
        .product-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
        }
        .product-table th, .product-table td {
            padding: 12px 15px;
            text-align: left;
        }
        .product-table th {
            background-color: #3498db;
            color: white;
            font-weight: 600;
        }
        .product-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .product-table tr:hover {
            background-color: #f1f1f1;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #7f8c8d;
            font-size: 14px;
            padding: 20px 0;
            border-top: 1px solid #eee;
        }
        .total {
            background-color: #f8f9fa;
            padding: 15px 20px;
            border-radius: 8px;
            margin-top: 20px;
            border-left: 4px solid #e74c3c;
        }
        .total p {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }
        .total p:last-child {
            font-size: 18px;
            font-weight: bold;
            color: #e74c3c;
            border-top: 1px solid #ddd;
            padding-top: 8px;
            margin-top: 8px;
        }
        .action-button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
            text-align: center;
        }
        .tracking {
            margin: 20px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #9b59b6;
            text-align: center;
        }
        .tracking h2 {
            margin-top: 0;
            color: #2c3e50;
            font-size: 18px;
        }
        .section-title {
            color: #2c3e50;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
            margin-top: 30px;
            font-size: 20px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100%;
                padding: 10px;
            }
            .product-table th, .product-table td {
                padding: 8px;
            }
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
            <p>&copy; {{ date('Y') }} Sport Heaven. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
