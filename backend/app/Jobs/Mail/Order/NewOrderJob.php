<?php

namespace App\Jobs\Mail\Order;

use Illuminate\Bus\Queueable;
use App\Mail\Order\AdminOrderMail;
use Illuminate\Support\Facades\Mail;
use App\Mail\Order\CustomerOrderMail;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;

class NewOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $order;

    /**
     * Create a new job instance.
     */
    public function __construct($order)
    {
        $this->order = $order;
//        Log::info('OrderMail - Toàn bộ dữ liệu order:', $this->order->toArray());
        $this->queue = 'order-mail';
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Send email to customer
            if ($this->order->customer_email) {
                Mail::to($this->order->customer_email)->send(new CustomerOrderMail($this->order));
            }

            // Send email to admin
            Mail::to('sportheavenwd66@gmail.com')->send(new AdminOrderMail($this->order));
        } catch (\Throwable $e) {
            Log::error('Lỗi gửi mail khi tạo đơn hàng: ' . $e->getMessage());
        }
    }
}
