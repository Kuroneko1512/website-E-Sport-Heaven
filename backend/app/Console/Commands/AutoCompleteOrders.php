<?php

namespace App\Console\Commands;

use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Services\Order\OrderService;

class AutoCompleteOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:auto-complete 
                            {--days= : ngày sau khi giao hàng để tự động hoàn thành}
                            {--hours= : giờ sau khi giao hàng để tự động hoàn thành}
                            {--minutes= : phút sau khi giao hàng để tự động hoàn thành}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động chuyển trạng thái đơn hàng từ đã giao sang hoàn thành sau một khoảng thời gian';

    /**
     * Execute the console command.
     * 
     * @param OrderService $orderService
     * @return int
     */
    public function handle(OrderService $orderService)
    {
        $minutes = $this->option('minutes');
        $hours = $this->option('hours');
        $days = $this->option('days');

        try {
            // Ưu tiên theo thứ tự: phút > giờ > ngày
            if (!is_null($minutes)) {
                $minutes = (int) $minutes;
                $this->info("Đang tìm các đơn hàng đã giao quá {$minutes} phút để tự động hoàn thành...");
                $count = $orderService->autoCompleteDeliveredOrders($minutes, 'minutes');
                $this->info("Đã cập nhật {$count} đơn hàng sang trạng thái hoàn thành.");
                Log::info("Auto-complete orders: {$count} orders updated to completed status after {$minutes} minutes");
            } elseif (!is_null($hours)) {
                $hours = (int) $hours;
                $this->info("Đang tìm các đơn hàng đã giao quá {$hours} giờ để tự động hoàn thành...");
                $count = $orderService->autoCompleteDeliveredOrders($hours, 'hours');
                $this->info("Đã cập nhật {$count} đơn hàng sang trạng thái hoàn thành.");
                Log::info("Auto-complete orders: {$count} orders updated to completed status after {$hours} hours");
            } else {
                $days = $days ?? config('time.order_auto_complete_days', 3);
                $days = (int) $days;
                $this->info("Đang tìm các đơn hàng đã giao quá {$days} ngày để tự động hoàn thành...");
                $count = $orderService->autoCompleteDeliveredOrders($days, 'days');
                $this->info("Đã cập nhật {$count} đơn hàng sang trạng thái hoàn thành.");
                Log::info("Auto-complete orders: {$count} orders updated to completed status after {$days} days");
            }

            return Command::SUCCESS;
        } catch (Exception $e) {
            $this->error("Lỗi khi tự động cập nhật trạng thái đơn hàng: " . $e->getMessage());
            Log::error("Auto-complete orders error: " . $e->getMessage());

            return Command::FAILURE;
        }
    }
}
