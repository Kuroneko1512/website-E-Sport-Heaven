<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use Exception;

class MigrateHistoricalData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-historical-data 
                           {--from= : Start date (Y-m-d)}
                           {--to= : End date (Y-m-d)}
                           {--chunk=100 : Chunk size for processing}
                           {--force : Force overwrite existing data}
                           {--dry-run : Show what would be migrated without doing it}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate historical order data to analytics tables for faster reporting';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting historical data migration for analytics...');
        $this->newLine();

        // Parse options
        $fromDate = $this->option('from')
            ? Carbon::parse($this->option('from'))
            : $this->getFirstOrderDate();

        $toDate = $this->option('to')
            ? Carbon::parse($this->option('to'))
            : Carbon::yesterday(); // Không bao gồm hôm nay

        $chunk = (int) $this->option('chunk');
        $force = $this->option('force');
        $dryRun = $this->option('dry-run');

        // Validate date range
        if ($fromDate > $toDate) {
            $this->error('❌ From date cannot be greater than to date');
            return 1;
        }

        // Show migration info
        $totalDays = $fromDate->diffInDays($toDate) + 1;
        $this->info("📅 Date range: {$fromDate->toDateString()} to {$toDate->toDateString()}");
        $this->info("📊 Total days to process: {$totalDays}");
        $this->info("📦 Chunk size: {$chunk}");
        $this->info("🔄 Mode: " . ($dryRun ? 'DRY RUN' : 'LIVE MIGRATION'));
        $this->info("💪 Force overwrite: " . ($force ? 'YES' : 'NO'));
        $this->newLine();

        // Log migration start
        Log::info('Historical data migration started', [
            'from_date' => $fromDate->toDateString(),
            'to_date' => $toDate->toDateString(),
            'total_days' => $totalDays,
            'force' => $force,
            'dry_run' => $dryRun,
            'chunk_size' => $chunk
        ]);

        if ($dryRun) {
            $this->showDryRunInfo($fromDate, $toDate);
            return 0;
        }

        if (!$this->confirm('Continue with migration?')) {
            $this->info('Migration cancelled.');
            return 0;
        }

        try {
            // Check if analytics tables exist
            Log::info('Checking analytics tables...');
            $this->checkAnalyticsTables();

            // Migrate daily analytics
            Log::info('Starting daily analytics migration...');
            $this->migrateDailyAnalytics($fromDate, $toDate, $force);

            // Migrate product analytics  
            Log::info('Starting product analytics migration...');
            $this->migrateProductAnalytics($fromDate, $toDate, $force);

            // Initialize realtime cache
            Log::info('Starting realtime cache initialization...');
            $this->initializeRealtimeCache();

            $this->newLine();
            $this->info('✅ Historical data migration completed successfully!');
            $this->info('🎯 You can now use fast analytics queries.');
        } catch (Exception $e) {
            $this->error('❌ Migration failed: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());

            Log::error('Historical data migration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'from_date' => $fromDate->toDateString(),
                'to_date' => $toDate->toDateString()
            ]);

            return 1;
        }

        return 0;
    }

    /**
     * Get the date of the first order
     */
    private function getFirstOrderDate()
    {
        $firstOrder = Order::orderBy('created_at')->first();
        if (!$firstOrder) {
            $this->warn('⚠️ No orders found in database');
            return Carbon::today();
        }

        return $firstOrder->created_at->startOfDay();
    }

    /**
     * Show dry run information
     */
    private function showDryRunInfo($fromDate, $toDate)
    {
        $this->info('🔍 DRY RUN - What would be migrated:');
        $this->newLine();

        // Count orders by date range
        $orderCount = Order::whereBetween('created_at', [$fromDate, $toDate->endOfDay()])->count();
        $this->info("📦 Total orders to process: {$orderCount}");

        // Count unique products
        $productCount = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$fromDate, $toDate->endOfDay()])
            ->distinct('order_items.product_id')
            ->count('order_items.product_id');
        $this->info("🛍️ Unique products to analyze: {$productCount}");

        // Sample date calculation
        $sampleDate = $fromDate->copy();
        $sampleMetrics = $this->calculateDailyMetrics($sampleDate);
        $this->newLine();
        $this->info("📊 Sample metrics for {$sampleDate->toDateString()}:");
        $this->info("   - Orders: {$sampleMetrics['total_orders']}");
        $this->info("   - Revenue: " . number_format($sampleMetrics['total_revenue']) . " VND");
        $this->info("   - New customers: {$sampleMetrics['new_customers']}");

        $this->newLine();
        $this->info('Run without --dry-run to execute migration.');
    }

    /**
     * Check if analytics tables exist
     */
    private function checkAnalyticsTables()
    {
        $tables = ['daily_analytics', 'daily_product_analytics', 'realtime_analytics_cache'];

        foreach ($tables as $table) {
            if (!DB::getSchemaBuilder()->hasTable($table)) {
                throw new Exception("Table '{$table}' does not exist. Please run migrations first.");
            }
        }

        // Validate Order constants exist
        $requiredConstants = [
            'Order::STATUS_PENDING',
            'Order::STATUS_CONFIRMED',
            'Order::STATUS_CANCELLED'
        ];

        if (!defined('App\Models\Order::STATUS_PENDING')) {
            throw new Exception('Order status constants are not properly defined');
        }

        $this->info('✅ All analytics tables exist');
    }

    /**
     * Migrate daily analytics data
     */
    private function migrateDailyAnalytics($fromDate, $toDate, $force)
    {
        $this->info('📊 Migrating daily analytics...');

        $currentDate = $fromDate->copy();
        $totalDays = $fromDate->diffInDays($toDate) + 1;

        // Validate large date range
        if ($totalDays > 365) {
            $this->warn("⚠️ Large date range detected: {$totalDays} days");
            Log::warning('Large migration detected', ['total_days' => $totalDays]);
        }

        $progressBar = $this->output->createProgressBar($totalDays);
        $progressBar->setFormat('verbose');

        $migrated = 0;
        $skipped = 0;
        $errors = 0;

        while ($currentDate <= $toDate) {
            $dateString = $currentDate->toDateString();

            try {
                // Check if already exists
                $exists = DB::table('daily_analytics')->where('date', $dateString)->exists();

                if ($exists && !$force) {
                    $skipped++;
                    $progressBar->advance();
                    $currentDate->addDay();
                    continue;
                }

                // Calculate metrics for this date
                $metrics = $this->calculateDailyMetrics($currentDate);

                // Log daily calculation
                Log::debug('Daily metrics calculated', [
                    'date' => $dateString,
                    'total_orders' => $metrics['total_orders'],
                    'total_revenue' => $metrics['total_revenue'],
                    'new_customers' => $metrics['new_customers']
                ]);

                // Skip if no data for this date
                if ($metrics['total_orders'] == 0 && $metrics['new_customers'] == 0) {
                    $progressBar->advance();
                    $currentDate->addDay();
                    continue;
                }

                // Upsert data
                DB::table('daily_analytics')->updateOrInsert(
                    ['date' => $dateString],
                    array_merge($metrics, [
                        'calculated_at' => now(),
                        'is_finalized' => true,
                        'notes' => 'Migrated from historical data',
                        'created_at' => now(),
                        'updated_at' => now()
                    ])
                );

                $migrated++;
            } catch (Exception $e) {
                $errors++;
                Log::error('Failed to migrate daily analytics', [
                    'date' => $dateString,
                    'error' => $e->getMessage()
                ]);

                $this->error("❌ Error on {$dateString}: " . $e->getMessage());
            }

            $progressBar->advance();
            $currentDate->addDay();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info("✅ Daily analytics: {$migrated} days migrated, {$skipped} days skipped");

        if ($errors > 0) {
            $this->warn("⚠️ {$errors} errors occurred during daily analytics migration");
        }

        Log::info('Daily analytics migration completed', [
            'total_days' => $totalDays,
            'migrated' => $migrated,
            'skipped' => $skipped,
            'errors' => $errors,
            'from_date' => $fromDate->toDateString(),
            'to_date' => $toDate->toDateString()
        ]);
    }

    /**
     * Calculate daily metrics for a specific date
     */
    private function calculateDailyMetrics($date)
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();

        // Order metrics with status counts
        $orderMetrics = DB::table('orders')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->selectRaw('
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as confirmed_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as preparing_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as ready_to_ship_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as shipping_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as return_requested_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as return_processing_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as return_completed_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as return_rejected_orders,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as return_to_shop_orders,
                SUM(CASE WHEN status != ? THEN total_amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN status = ? THEN total_amount ELSE 0 END) as completed_revenue,
                AVG(CASE WHEN status != ? THEN total_amount ELSE NULL END) as avg_order_value
            ', [
                Order::STATUS_PENDING,
                Order::STATUS_CONFIRMED,
                Order::STATUS_PREPARING,
                Order::STATUS_READY_TO_SHIP,
                Order::STATUS_SHIPPING,
                Order::STATUS_DELIVERED,
                Order::STATUS_COMPLETED,
                Order::STATUS_CANCELLED,
                Order::STATUS_RETURN_REQUESTED,
                Order::STATUS_RETURN_PROCESSING,
                Order::STATUS_RETURN_COMPLETED,
                Order::STATUS_RETURN_REJECTED,
                Order::STATUS_RETURN_TO_SHOP,
                Order::STATUS_CANCELLED, // for revenue calculation
                Order::STATUS_COMPLETED, // for completed revenue
                Order::STATUS_CANCELLED  // for avg order value
            ])
            ->first();

        // Customer metrics
        $customerMetrics = DB::table('customers')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->selectRaw('COUNT(*) as new_customers')
            ->first();

        // Product metrics
        $productMetrics = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$startOfDay, $endOfDay])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->selectRaw('
                SUM(order_items.quantity) as total_products_sold,
                COUNT(DISTINCT order_items.product_id) as unique_products_sold
            ')
            ->first();

        return [
            'total_revenue' => (int) ($orderMetrics->total_revenue ?? 0),
            'completed_revenue' => (int) ($orderMetrics->completed_revenue ?? 0),
            'total_orders' => (int) ($orderMetrics->total_orders ?? 0),
            'pending_orders' => (int) ($orderMetrics->pending_orders ?? 0),
            'confirmed_orders' => (int) ($orderMetrics->confirmed_orders ?? 0),
            'preparing_orders' => (int) ($orderMetrics->preparing_orders ?? 0),
            'ready_to_ship_orders' => (int) ($orderMetrics->ready_to_ship_orders ?? 0),
            'shipping_orders' => (int) ($orderMetrics->shipping_orders ?? 0),
            'delivered_orders' => (int) ($orderMetrics->delivered_orders ?? 0),
            'completed_orders' => (int) ($orderMetrics->completed_orders ?? 0),
            'cancelled_orders' => (int) ($orderMetrics->cancelled_orders ?? 0),
            'return_requested_orders' => (int) ($orderMetrics->return_requested_orders ?? 0),
            'return_processing_orders' => (int) ($orderMetrics->return_processing_orders ?? 0),
            'return_completed_orders' => (int) ($orderMetrics->return_completed_orders ?? 0),
            'return_rejected_orders' => (int) ($orderMetrics->return_rejected_orders ?? 0),
            'return_to_shop_orders' => (int) ($orderMetrics->return_to_shop_orders ?? 0),
            'new_customers' => (int) ($customerMetrics->new_customers ?? 0),
            'returning_customers' => 0, // Will calculate later if needed
            'total_products_sold' => (int) ($productMetrics->total_products_sold ?? 0),
            'unique_products_sold' => (int) ($productMetrics->unique_products_sold ?? 0),
            'avg_order_value' => (int) ($orderMetrics->avg_order_value ?? 0),
            'avg_processing_time_minutes' => 0, // Will calculate later if needed
        ];
    }

    /**
     * Migrate product analytics data
     */
    private function migrateProductAnalytics($fromDate, $toDate, $force)
    {
        $this->info('📦 Migrating product analytics...');

        $currentDate = $fromDate->copy();
        $totalDays = $fromDate->diffInDays($toDate) + 1;
        $progressBar = $this->output->createProgressBar($totalDays);
        $progressBar->setFormat('verbose');

        $migrated = 0;
        $skipped = 0;

        while ($currentDate <= $toDate) {
            $result = $this->migrateProductAnalyticsForDate($currentDate, $force);

            $migrated += $result['migrated'];
            $skipped += $result['skipped'];

            $progressBar->advance();
            $currentDate->addDay();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info("✅ Product analytics: {$migrated} product-days migrated, {$skipped} product-days skipped");
    }

    /**
     * Migrate product analytics for a specific date
     */
    private function migrateProductAnalyticsForDate($date, $force)
    {
        $dateString = $date->toDateString();
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();

        // Get products sold on this date
        $productSales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->whereBetween('orders.created_at', [$startOfDay, $endOfDay])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->groupBy('order_items.product_id', 'products.name', 'products.sku', 'products.price', 'categories.name')
            ->selectRaw('
                order_items.product_id,
                products.name as product_name,
                products.sku as product_sku,
                products.price as product_price,
                categories.name as category_name,
                SUM(order_items.quantity) as quantity_sold,
                SUM(order_items.subtotal) as revenue,
                COUNT(DISTINCT orders.id) as orders_count
            ')
            ->get();

        $migrated = 0;
        $skipped = 0;

        foreach ($productSales as $sale) {
            // Check if already exists
            $exists = DB::table('daily_product_analytics')
                ->where('date', $dateString)
                ->where('product_id', $sale->product_id)
                ->exists();

            if ($exists && !$force) {
                $skipped++;
                continue;
            }

            // Get stock info (simplified - you may need to adjust based on your stock tracking)
            $currentStock = DB::table('products')
                ->where('id', $sale->product_id)
                ->value('stock') ?? 0;

            // Upsert product analytics
            DB::table('daily_product_analytics')->updateOrInsert(
                [
                    'date' => $dateString,
                    'product_id' => $sale->product_id
                ],
                [
                    'quantity_sold' => (int) $sale->quantity_sold,
                    'revenue' => (int) $sale->revenue,
                    'orders_count' => (int) $sale->orders_count,
                    'stock_start_day' => $currentStock, // Simplified
                    'stock_end_day' => $currentStock,
                    'stock_changes' => 0,
                    'product_name' => $sale->product_name,
                    'product_sku' => $sale->product_sku,
                    'category_name' => $sale->category_name ?? 'Uncategorized',
                    'product_price' => (int) $sale->product_price,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            $migrated++;

            // Log detailed product migration
            Log::info('Product analytics migrated', [
                'date' => $dateString,
                'product_id' => $sale->product_id,
                'product_name' => $sale->product_name,
                'quantity_sold' => $sale->quantity_sold,
                'revenue' => $sale->revenue,
                'orders_count' => $sale->orders_count
            ]);
        }

        // Log daily summary
        Log::info('Daily product analytics migration completed', [
            'date' => $dateString,
            'products_processed' => count($productSales),
            'migrated' => $migrated,
            'skipped' => $skipped
        ]);

        return [
            'migrated' => $migrated,
            'skipped' => $skipped
        ];
    }

    /**
     * Initialize realtime cache with current data
     */
    private function initializeRealtimeCache()
    {
        $this->info('🔄 Initializing realtime cache...');

        try {
            // Check memory usage
            $memoryUsage = memory_get_usage(true);
            if ($memoryUsage > 128 * 1024 * 1024) { // 128MB
                Log::warning('High memory usage detected', [
                    'memory_usage' => $memoryUsage,
                    'memory_limit' => ini_get('memory_limit')
                ]);
            }

            // Clear existing cache
            $existingCount = DB::table('realtime_analytics_cache')->count();
            if ($existingCount > 0) {
                Log::info("Clearing {$existingCount} existing cache entries");
            }

            DB::table('realtime_analytics_cache')->truncate();

            $today = Carbon::today();
            $cacheData = [];

            // Orders counts
            $orderCounts = $this->calculateOrderCounts();
            $cacheData = array_merge($cacheData, $orderCounts);

            // Today's metrics
            $todayMetrics = $this->calculateTodayMetrics();
            $cacheData = array_merge($cacheData, $todayMetrics);

            // Product metrics
            $productMetrics = $this->calculateProductMetrics();
            $cacheData = array_merge($cacheData, $productMetrics);

            // Customer metrics
            $customerMetrics = $this->calculateCustomerMetrics();
            $cacheData = array_merge($cacheData, $customerMetrics);

            // Insert cache data
            $cacheRecords = [];
            foreach ($cacheData as $key => $data) {
                $cacheRecords[] = [
                    'cache_key' => $key,
                    'cache_data' => json_encode([
                        'value' => $data,
                        'calculated_at' => now()->toISOString()
                    ]),
                    'expires_at' => now()->addMinutes(5),
                    'updated_at' => now()
                ];

                // Log cache initialization
                Log::info('Cache initialized', [
                    'cache_key' => $key,
                    'value' => $data
                ]);
            }

            DB::table('realtime_analytics_cache')->insert($cacheRecords);

            $this->info("✅ Initialized " . count($cacheRecords) . " cache entries");
        } catch (Exception $e) {
            $this->error("❌ Failed to initialize cache: " . $e->getMessage());
            Log::error('Cache initialization failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Calculate current order counts by status
     */
    private function calculateOrderCounts()
    {
        $counts = DB::table('orders')
            ->selectRaw('
                COUNT(*) as total_count,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as confirmed_count,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as preparing_count,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as shipping_count,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as delivered_count,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as cancelled_count,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as return_requested_count
            ', [
                Order::STATUS_PENDING,
                Order::STATUS_CONFIRMED,
                Order::STATUS_PREPARING,
                Order::STATUS_SHIPPING,
                Order::STATUS_DELIVERED,
                Order::STATUS_COMPLETED,
                Order::STATUS_CANCELLED,
                Order::STATUS_RETURN_REQUESTED
            ])
            ->first();

        return [
            'orders_total_count' => (int) $counts->total_count,
            'orders_pending_count' => (int) $counts->pending_count,
            'orders_confirmed_count' => (int) $counts->confirmed_count,
            'orders_preparing_count' => (int) $counts->preparing_count,
            'orders_shipping_count' => (int) $counts->shipping_count,
            'orders_delivered_count' => (int) $counts->delivered_count,
            'orders_completed_count' => (int) $counts->completed_count,
            'orders_cancelled_count' => (int) $counts->cancelled_count,
            'orders_return_requested_count' => (int) $counts->return_requested_count,
        ];
    }

    /**
     * Calculate today's metrics
     */
    private function calculateTodayMetrics()
    {
        $today = Carbon::today();

        $todayOrders = DB::table('orders')
            ->whereDate('created_at', $today)
            ->selectRaw('
                COUNT(*) as orders_today,
                SUM(CASE WHEN status != ? THEN total_amount ELSE 0 END) as revenue_today
            ', [Order::STATUS_CANCELLED])
            ->first();

        $todayCustomers = DB::table('customers')
            ->whereDate('created_at', $today)
            ->count();

        return [
            'orders_today_count' => (int) $todayOrders->orders_today,
            'revenue_today' => (int) $todayOrders->revenue_today,
            'customers_today_count' => (int) $todayCustomers,
        ];
    }

    /**
     * Calculate product metrics
     */
    private function calculateProductMetrics()
    {
        $productCount = DB::table('products')->count();

        $lowStockCount = DB::table('products')
            ->where('stock', '<', 10)
            ->where('status', 'active')
            ->count();

        // Top selling products (last 30 days)
        $topSelling = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.created_at', '>=', Carbon::now()->subDays(30))
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->groupBy('order_items.product_id', 'products.name')
            ->selectRaw('
                order_items.product_id,
                products.name as product_name,
                SUM(order_items.quantity) as total_sold,
                SUM(order_items.subtotal) as total_revenue
            ')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        // Top products today
        $topToday = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereDate('orders.created_at', Carbon::today())
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->groupBy('order_items.product_id', 'products.name')
            ->selectRaw('
                order_items.product_id,
                products.name as product_name,
                SUM(order_items.quantity) as sold_today,
                SUM(order_items.subtotal) as revenue_today
            ')
            ->orderByDesc('sold_today')
            ->limit(5)
            ->get();

        return [
            'products_total_count' => $productCount,
            'products_low_stock_count' => $lowStockCount,
            'products_top_selling' => $topSelling->toArray(),
            'products_top_today' => $topToday->toArray(),
        ];
    }

    /**
     * Calculate customer metrics
     */
    private function calculateCustomerMetrics()
    {
        $totalCustomers = DB::table('customers')->count();

        return [
            'customers_total_count' => $totalCustomers,
        ];
    }
}
