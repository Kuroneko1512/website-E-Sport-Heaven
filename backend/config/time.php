<?php

return [
    'order_auto_complete_days' => env('ORDER_AUTO_COMPLETE_DAYS', 3),
    'order_auto_complete_hours' => env('ORDER_AUTO_COMPLETE_HOURS', 24),
    'order_auto_complete_minutes' => env('ORDER_AUTO_COMPLETE_MINUTES', 60),

    'vnpay_payment_expire_minutes' => env('VNPAY_PAYMENT_EXPIRE_MINUTES', 15),
];
