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
            // Xác định đơn vị thời gian và giá trị
            $unit = 'minutes'; // Mặc định là phút
            $time = null;
            $unitLabel = 'minutes';

            // Ưu tiên theo thứ tự: phút > giờ > ngày
            if (!is_null($minutes)) {
                $time = (int) $minutes;
            } elseif (!is_null($hours)) {
                $time = (int) $hours;
                $unit = 'hours';
                $unitLabel = 'hours';
            } elseif (!is_null($days)) {
                $time = (int) $days;
                $unit = 'days';
                $unitLabel = 'days';
            }

            // Lấy giá trị hiển thị (từ tham số hoặc config)
            $displayTime = $time ?? config("time.order_auto_complete_{$unit}");

            $this->info("Đang tìm các đơn hàng đã giao quá {$displayTime} {$unitLabel} để tự động hoàn thành...");
            $count = $orderService->autoCompleteDeliveredOrders($time, $unit);
            $this->info("Đã cập nhật {$count} đơn hàng sang trạng thái hoàn thành.");

            // Ghi log để có thể theo dõi khi chạy schedule
            Log::info("Auto-complete orders: {$count} orders updated to completed status after {$displayTime} {$unitLabel}");

            return Command::SUCCESS;
        } catch (Exception $e) {
            $this->error("Lỗi khi tự động cập nhật trạng thái đơn hàng: " . $e->getMessage());
            Log::error("Auto-complete orders error: " . $e->getMessage());

            return Command::FAILURE;
        }
    }
}
