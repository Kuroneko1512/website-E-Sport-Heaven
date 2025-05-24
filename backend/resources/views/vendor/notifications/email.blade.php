@component('mail::message')
Đặt lại mật khẩu

Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để tiếp tục:

@component('mail::button', ['url' => $actionUrl])
Đặt lại mật khẩu
@endcomponent

Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.

Trân trọng,<br>
{{ config('app.name') }}
@endcomponent