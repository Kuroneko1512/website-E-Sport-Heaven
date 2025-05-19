<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class OrderUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
 public $order;
    /**
     * Create a new event instance.
     */
    public function __construct($order)
    { 
        //
        $this->order = $order;
        Log::info("OrderUpdated", $order->toArray());
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('channel-name'),
        ];
    }
       public function broadcastWith()
    {
        return ['order' => $this->order];
    }

    public function broadcastAs()
    {
        return 'OrderUpdated';
    }
}
