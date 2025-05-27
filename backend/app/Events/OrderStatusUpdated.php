<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class OrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;
    public $source;

    /**
     * Create a new event instance.
     */
    public function __construct($order, $source = 'manual') // ✅ Nhận dữ liệu
    {
        $this->order = $order;
        $this->source = $source;
        Log::info("OrderStatusUpdated", [
            'order_id' => $order->id ?? 'unknown',
            'status' => $order->status ?? 'unknown',
            'source' => $source
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('orders.1'),
        ];
    }

    public function broadcastAs()
    {
        return 'order-status-updated';
    }

    //  Method này để gửi dữ liệu
    public function broadcastWith()
    {
        $data = [
            'order' => [
                'id' => $this->order->id,
                'status' => $this->order->status,
                'payment_status' => $this->order->payment_status,
                'order_code' => $this->order->order_code,
            ],
            'source' => $this->source,
            'timestamp' => now()->toISOString(),
        ];

        Log::info("Broadcasting data:", $data);

        return $data;
    }
}
