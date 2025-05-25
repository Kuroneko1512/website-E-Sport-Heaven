<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Services\Analytics\AnalyticsService;

class CalculateDailyAnalytics extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'analytics:calculate-daily {--date=} {--days=30}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate daily analytics data for pre-calculated dashboard';

    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        parent::__construct();
        $this->analyticsService = $analyticsService;
    }
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting daily analytics calculation...');

        try {
            // Lấy ngày từ option hoặc hôm qua
            $date = $this->option('date')
                ? Carbon::parse($this->option('date'))
                : Carbon::yesterday();

            // Nếu muốn tính nhiều ngày (backfill)
            $days = (int) $this->option('days');

            if ($days > 1) {
                $this->info("📊 Calculating analytics for {$days} days ending at {$date->toDateString()}");

                for ($i = $days - 1; $i >= 0; $i--) {
                    $currentDate = $date->copy()->subDays($i);
                    $this->calculateForDate($currentDate);
                }
            } else {
                $this->info("📊 Calculating analytics for {$date->toDateString()}");
                $this->calculateForDate($date);
            }

            $this->info('✅ Daily analytics calculation completed successfully!');
        } catch (\Exception $e) {
            $this->error('❌ Error calculating daily analytics: ' . $e->getMessage());
            Log::error('Daily analytics calculation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }

        return 0;
    }

    private function calculateForDate(Carbon $date)
    {
        $this->line("  📅 Processing {$date->toDateString()}...");

        // Gọi service để tính toán và lưu dữ liệu
        $this->analyticsService->calculateAndStoreDailyAnalytics($date->toDateString());

        $this->line("  ✅ Completed {$date->toDateString()}");
    }
}
