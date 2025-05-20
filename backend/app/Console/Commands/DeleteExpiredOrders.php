<?php

namespace App\Console\Commands;

use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Services\Order\OrderService;

class DeleteExpiredOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancel orders with expired payment deadline';

    /**
     * Execute the console command.
     */
    public function handle(OrderService $orderService)
    {
        $this->info('Starting to check for expired payment orders...');
        Log::info('DeleteExpiredOrders command started');
        try {
            $result = $orderService->cancelExpiredOrders();

            if ($result['success']) {
                $count = $result['count'];
                Log::info("Found and cancelled {$count} expired orders", [
                    'cancelled_orders' => $result['cancelled_orders']
                ]);
                $this->info("Found and cancelled {$count} expired orders.");

                if ($count > 0) {
                    $this->table(
                        ['Order Code', 'Customer Name', 'Payment Expired At'],
                        array_map(function ($order) {
                            return [
                                $order['order_code'],
                                $order['customer_name'],
                                $order['payment_expire_at']
                            ];
                        }, $result['cancelled_orders'])
                    );
                }

                $this->info('Expired orders process completed successfully.');
            } else {
                Log::error('Failed to cancel expired orders', [
                    'message' => $result['message']
                ]);
                $this->error('Failed to cancel expired orders: ' . $result['message']);
            }
        } catch (Exception $e) {
            Log::error('Error in cancel expired orders command', [
                'message' => $e->getMessage()
            ]);
            $this->error('An error occurred: ' . $e->getMessage());
        }
        Log::info('DeleteExpiredOrders command completed');
    }
}
