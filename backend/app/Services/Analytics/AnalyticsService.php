<?php

namespace App\Services\Analytics;

use Carbon\Carbon;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AnalyticsService
{
    /**
     * Get dashboard data with smart cache (2 minutes) - API /dashboard
     */
    public function getDirectDashboard($fromDate, $toDate, $topProductsLimit = 10)
    {
        $cacheKey = "dashboard_direct_" . md5($fromDate . $toDate . $topProductsLimit);

        // Cache 2 phút - balance giữa performance và real-time
        return Cache::remember($cacheKey, 2 * 60, function () use ($fromDate, $toDate, $topProductsLimit) {
            return [
                'today_summary' => $this->getTodaySummaryDirect(),
                'revenue_chart' => $this->getRevenueAnalytics($fromDate, $toDate, 'day'),
                'top_products' => $this->getTopSellingProducts($fromDate, $toDate, $topProductsLimit),
                'order_status' => $this->getOrderStatusAnalytics($fromDate, $toDate),
                'revenue_comparison' => $this->getRevenueComparison($fromDate, $toDate),
                'recent_trends' => $this->getSalesTrends($fromDate, $toDate, 7),
                'customer_stats' => $this->getCustomerAnalytics($fromDate, $toDate),
                'generated_at' => now()->toISOString()
            ];
        });
    }

    /**
     * Get fast dashboard data from pre-calculated tables (10 minutes cache) - API /dashboard-fast
     */
    public function getFastDashboard($topProductsLimit = 10)
    {
        $cacheKey = "dashboard_fast_{$topProductsLimit}";

        return Cache::remember($cacheKey, 10 * 60, function () use ($topProductsLimit) {
            $fromDate = Carbon::now()->subDays(30)->toDateString();
            $toDate = Carbon::now()->toDateString();

            return [
                'today_summary' => $this->getFastTodayMetrics(),
                'revenue_chart' => $this->getFastRevenueAnalytics($fromDate, $toDate),
                'top_products' => $this->getFastTopProducts($fromDate, $toDate, $topProductsLimit),
                'order_status' => $this->getFastOrderStatus($fromDate, $toDate),
                'revenue_comparison' => $this->getFastRevenueComparison($fromDate, $toDate),
                'recent_trends' => $this->getFastTrends($fromDate, $toDate, 7),
                'customer_stats' => $this->getFastCustomerStats($fromDate, $toDate)
            ];
        });
    }

    /**
     * Clear dashboard cache when new order created
     */
    public function clearDashboardCache()
    {
        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        // Clear cache cho các date range phổ biến
        $commonRanges = [
            [$today, $today], // Hôm nay
            [$yesterday, $today], // Hôm qua đến hôm nay
            [now()->startOfWeek()->format('Y-m-d'), $today], // Tuần này
            [now()->startOfMonth()->format('Y-m-d'), $today], // Tháng này
            [now()->subDays(7)->format('Y-m-d'), $today], // 7 ngày
            [now()->subDays(30)->format('Y-m-d'), $today], // 30 ngày
        ];

        foreach ($commonRanges as $range) {
            $cacheKey = "dashboard_direct_" . md5($range[0] . $range[1] . "10");
            Cache::forget($cacheKey);
        }

        // Clear fast dashboard cache
        Cache::forget("dashboard_fast_10");

        Log::info('Dashboard cache cleared after new order');
    }

    // =================================================================
    // PRIVATE METHODS CHO /dashboard (Direct queries)
    // =================================================================

    /**
     * Get today summary with direct queries
     */
    private function getTodaySummaryDirect()
    {
        $startOfDay = now()->startOfDay();
        $endOfDay = now()->endOfDay();

        // 1 query thay vì nhiều queries
        $orderSummary = DB::table('orders')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->selectRaw('
                SUM(CASE WHEN status != ? THEN total_amount ELSE 0 END) as total_revenue,
                COUNT(*) as total_orders,
                AVG(CASE WHEN status != ? THEN total_amount ELSE NULL END) as avg_order_value
            ', [Order::STATUS_CANCELLED, Order::STATUS_CANCELLED])
            ->first();

        $newCustomers = DB::table('customers')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->count();

        return [
            'total_revenue' => (int) ceil($orderSummary->total_revenue ?? 0), // Float -> Int (làm tròn lên)
            'total_orders' => (int) ($orderSummary->total_orders ?? 0), // Đã là int
            'new_customers' => (int) $newCustomers, // Đã là int
            'avg_order_value' => (int) ceil($orderSummary->avg_order_value ?? 0) // Float -> Int (làm tròn lên)
        ];
    }

    /**
     * Get revenue analytics by date range
     */
    public function getRevenueAnalytics($fromDate, $toDate, $groupBy = 'day')
    {
        $baseQuery = DB::table('orders')
            ->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
            ->where('status', '!=', Order::STATUS_CANCELLED);
        // ✅ BỎ ->orderBy('created_at') ở đây

        switch ($groupBy) {
            case 'week':
                $results = $baseQuery->selectRaw('
                YEARWEEK(created_at) as period,
                MIN(DATE(created_at)) as start_date,
                MAX(DATE(created_at)) as end_date,
                SUM(total_amount) as revenue,
                COUNT(*) as orders,
                AVG(total_amount) as avg_order_value
            ')
                    ->groupBy('period')
                    ->orderBy('period', 'asc') // ✅ THÊM: ORDER BY sau GROUP BY
                    ->get();
                break;

            case 'month':
                $results = $baseQuery->selectRaw('
                DATE_FORMAT(created_at, "%Y-%m") as period,
                MIN(DATE(created_at)) as start_date,
                MAX(DATE(created_at)) as end_date,
                SUM(total_amount) as revenue,
                COUNT(*) as orders,
                AVG(total_amount) as avg_order_value
            ')
                    ->groupBy('period')
                    ->orderBy('period', 'asc') // ✅ THÊM: ORDER BY sau GROUP BY
                    ->get();
                break;

            default: // day
                $results = $baseQuery->selectRaw('
                DATE(created_at) as period,
                DATE(created_at) as start_date,
                DATE(created_at) as end_date,
                SUM(total_amount) as revenue,
                COUNT(*) as orders,
                AVG(total_amount) as avg_order_value
            ')
                    ->groupBy('period')
                    ->orderBy('period', 'asc') // ✅ THÊM: ORDER BY sau GROUP BY
                    ->get();
                break;
        }

        // Chỉ làm tròn revenue và avg_order_value (là float)
        return $results->map(function ($item) {
            return [
                'period' => $item->period,
                'start_date' => $item->start_date,
                'end_date' => $item->end_date,
                'revenue' => (int) ceil($item->revenue ?? 0), // Float -> Int
                'orders' => (int) ($item->orders ?? 0), // Đã là int
                'avg_order_value' => (int) ceil($item->avg_order_value ?? 0) // Float -> Int
            ];
        });
    }

    /**
     * Get top selling products
     */
    public function getTopSellingProducts($fromDate, $toDate, $limit = 10)
    {
        $results = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->whereBetween('orders.created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->groupBy('order_items.product_id', 'products.name', 'products.sku', 'categories.name')
            ->selectRaw('
                order_items.product_id,
                products.name as product_name,
                products.sku as product_sku,
                categories.name as category_name,
                SUM(order_items.quantity) as total_sold,
                SUM(order_items.subtotal) as total_revenue,
                COUNT(DISTINCT orders.id) as total_orders
            ')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();

        // Chỉ làm tròn total_revenue (là float)
        return $results->map(function ($item) {
            return [
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'category_name' => $item->category_name,
                'total_sold' => (int) ($item->total_sold ?? 0), // Đã là int
                'total_revenue' => (int) ceil($item->total_revenue ?? 0), // Float -> Int
                'total_orders' => (int) ($item->total_orders ?? 0) // Đã là int
            ];
        });
    }

    /**
     * Get order status analytics
     */
    public function getOrderStatusAnalytics($fromDate, $toDate)
    {
        $statusCounts = DB::table('orders')
            ->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
            ->selectRaw('
                CASE
                    WHEN status = ? THEN "pending"
                    WHEN status = ? THEN "confirmed"
                    WHEN status = ? THEN "preparing"
                    WHEN status = ? THEN "ready_to_ship"
                    WHEN status = ? THEN "shipping"
                    WHEN status = ? THEN "delivered"
                    WHEN status = ? THEN "completed"
                    WHEN status = ? THEN "cancelled"
                    WHEN status = ? THEN "return_requested"
                    WHEN status = ? THEN "return_processing"
                    WHEN status = ? THEN "return_completed"
                    WHEN status = ? THEN "return_rejected"
                    ELSE "unknown"
                END as status_name,
                COUNT(*) as count
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
            ])
            ->groupBy('status_name') // ✅ SỬA: group theo status_name thay vì status
            ->pluck('count', 'status_name')
            ->toArray();

        // Đảm bảo tất cả status đều có giá trị
        return array_merge([
            'pending' => 0,
            'confirmed' => 0,
            'preparing' => 0,
            'ready_to_ship' => 0,
            'shipping' => 0,
            'delivered' => 0,
            'completed' => 0,
            'cancelled' => 0,
            'return_requested' => 0,
            'return_processing' => 0,
            'return_completed' => 0,
            'return_rejected' => 0
        ], $statusCounts);
    }

    /**
     * Get revenue comparison (current vs previous period)
     */
    public function getRevenueComparison($fromDate, $toDate)
    {
        $currentPeriod = DB::table('orders')
            ->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->selectRaw('
                COALESCE(SUM(total_amount), 0) as revenue,
                COALESCE(COUNT(*), 0) as orders,
                COALESCE(AVG(total_amount), 0) as avg_order_value
            ')
            ->first();

        // Calculate previous period dates
        $from = Carbon::parse($fromDate);
        $to = Carbon::parse($toDate);
        $daysDiff = $from->diffInDays($to) + 1;

        $prevFromDate = $from->copy()->subDays($daysDiff)->toDateString();
        $prevToDate = $from->copy()->subDay()->toDateString();

        $previousPeriod = DB::table('orders')
            ->whereBetween('created_at', [$prevFromDate . ' 00:00:00', $prevToDate . ' 23:59:59'])
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->selectRaw('
                COALESCE(SUM(total_amount), 0) as revenue,
                COALESCE(COUNT(*), 0) as orders,
                COALESCE(AVG(total_amount), 0) as avg_order_value
            ')
            ->first();

        // Calculate growth percentages (float)
        $currentRevenue = (float) ($currentPeriod->revenue ?? 0);
        $currentOrders = (int) ($currentPeriod->orders ?? 0);
        $previousRevenue = (float) ($previousPeriod->revenue ?? 0);
        $previousOrders = (int) ($previousPeriod->orders ?? 0);

        $revenueGrowth = $previousRevenue > 0
            ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100
            : 0;

        $ordersGrowth = $previousOrders > 0
            ? (($currentOrders - $previousOrders) / $previousOrders) * 100
            : 0;

        return [
            'current_period' => [
                'revenue' => (int) ceil($currentRevenue), // Float -> Int
                'orders' => $currentOrders, // Đã là int
                'avg_order_value' => (int) ceil($currentPeriod->avg_order_value ?? 0) // Float -> Int
            ],
            'previous_period' => [
                'revenue' => (int) ceil($previousRevenue), // Float -> Int
                'orders' => $previousOrders, // Đã là int
                'avg_order_value' => (int) ceil($previousPeriod->avg_order_value ?? 0) // Float -> Int
            ],
            'growth' => [
                'revenue_growth' => (int) ceil($revenueGrowth), // Float -> Int
                'orders_growth' => (int) ceil($ordersGrowth) // Float -> Int
            ]
        ];
    }

    /**
     * Get sales trends for recent days
     */
    public function getSalesTrends($fromDate, $toDate, $days = 7)
    {
        $results = DB::table('orders')
            ->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->selectRaw('
                DATE(created_at) as date,
                SUM(total_amount) as revenue,
                COUNT(*) as orders
            ')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit($days)
            ->get();

        // Chỉ làm tròn revenue (là float)
        return $results->map(function ($item) {
            return [
                'date' => $item->date,
                'revenue' => (int) ceil($item->revenue ?? 0), // Float -> Int
                'orders' => (int) ($item->orders ?? 0) // Đã là int
            ];
        });
    }

    /**
     * Get customer analytics
     */
    public function getCustomerAnalytics($fromDate, $toDate)
    {
        $newCustomers = DB::table('customers')
            ->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
            ->count();

        // ✅ SỬA: Dùng subquery để tránh lỗi GROUP BY
        $returningCustomers = DB::table(
            DB::table('orders')
                ->select('customer_id') // ✅ CHỈ SELECT customer_id
                ->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
                ->whereNotNull('customer_id')
                ->groupBy('customer_id')
                ->havingRaw('COUNT(*) > 1')
        )->count();

        $totalCustomersWithOrders = DB::table('orders')
            ->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59'])
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count();

        $retentionRate = $totalCustomersWithOrders > 0
            ? (($returningCustomers / $totalCustomersWithOrders) * 100)
            : 0;

        return [
            'new_customers' => $newCustomers,
            'returning_customers' => $returningCustomers,
            'total_customers_with_orders' => $totalCustomersWithOrders,
            'customer_retention_rate' => (int) ceil($retentionRate)
        ];
    }

    // =================================================================
    // PRIVATE METHODS CHO /dashboard-fast (Pre-calculated data)
    // =================================================================

    /**
     * Get fast today metrics from pre-calculated data
     */
    private function getFastTodayMetrics()
    {
        $today = now()->toDateString();

        $todayData = DB::table('daily_analytics')
            ->where('date', $today)
            ->first();

        if ($todayData) {
            return [
                'total_revenue' => (int) ceil($todayData->total_revenue ?? 0), // Float -> Int
                'total_orders' => (int) ($todayData->total_orders ?? 0), // Đã là int
                'new_customers' => (int) ($todayData->new_customers ?? 0), // Đã là int
                'avg_order_value' => (int) ceil($todayData->avg_order_value ?? 0) // Float -> Int
            ];
        }

        // Fallback to direct query if no pre-calculated data
        return $this->getTodaySummaryDirect();
    }

    /**
     * Get fast revenue analytics from pre-calculated data
     */
    private function getFastRevenueAnalytics($fromDate, $toDate)
    {
        $results = DB::table('daily_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->select([
                'date as period',
                'date as start_date',
                'date as end_date',
                'total_revenue as revenue',
                'total_orders as orders',
                'avg_order_value'
            ])
            ->orderBy('date')
            ->get();

        // Chỉ làm tròn revenue và avg_order_value (là float)
        return $results->map(function ($item) {
            return [
                'period' => $item->period,
                'start_date' => $item->start_date,
                'end_date' => $item->end_date,
                'revenue' => (int) ceil($item->revenue ?? 0), // Float -> Int
                'orders' => (int) ($item->orders ?? 0), // Đã là int
                'avg_order_value' => (int) ceil($item->avg_order_value ?? 0) // Float -> Int
            ];
        });
    }

    /**
     * Get fast top products from pre-calculated data
     */
    private function getFastTopProducts($fromDate, $toDate, $limit = 10)
    {
        $results = DB::table('daily_product_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->groupBy('product_id', 'product_name', 'product_sku', 'category_name')
            ->selectRaw('
                product_id,
                product_name,
                product_sku,
                category_name,
                SUM(quantity_sold) as total_sold,
                SUM(revenue) as total_revenue,
                SUM(orders_count) as total_orders
            ')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();

        // Chỉ làm tròn total_revenue (là float)
        return $results->map(function ($item) {
            return [
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'category_name' => $item->category_name,
                'total_sold' => (int) ($item->total_sold ?? 0), // Đã là int
                'total_revenue' => (int) ceil($item->total_revenue ?? 0), // Float -> Int
                'total_orders' => (int) ($item->total_orders ?? 0) // Đã là int
            ];
        });
    }

    /**
     * Get fast order status from pre-calculated data
     */
    private function getFastOrderStatus($fromDate, $toDate)
    {
        $statusData = DB::table('daily_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->selectRaw('
            SUM(pending_orders) as pending,
            SUM(confirmed_orders) as confirmed,
            SUM(preparing_orders) as preparing,
            SUM(ready_to_ship_orders) as ready_to_ship,
            SUM(shipping_orders) as shipping,
            SUM(delivered_orders) as delivered,
            SUM(completed_orders) as completed,
            SUM(cancelled_orders) as cancelled,
            SUM(return_requested_orders) as return_requested,
            SUM(return_processing_orders) as return_processing,
            SUM(return_completed_orders) as return_completed,
            SUM(return_rejected_orders) as return_rejected,
            SUM(return_to_shop_orders) as return_to_shop
        ')
            ->first();

        return [
            'pending' => (int) ($statusData->pending ?? 0),
            'confirmed' => (int) ($statusData->confirmed ?? 0),
            'preparing' => (int) ($statusData->preparing ?? 0),
            'ready_to_ship' => (int) ($statusData->ready_to_ship ?? 0),
            'shipping' => (int) ($statusData->shipping ?? 0),
            'delivered' => (int) ($statusData->delivered ?? 0),
            'completed' => (int) ($statusData->completed ?? 0),
            'cancelled' => (int) ($statusData->cancelled ?? 0),
            'return_requested' => (int) ($statusData->return_requested ?? 0),
            'return_processing' => (int) ($statusData->return_processing ?? 0),
            'return_completed' => (int) ($statusData->return_completed ?? 0),
            'return_rejected' => (int) ($statusData->return_rejected ?? 0),
            'return_to_shop' => (int) ($statusData->return_to_shop ?? 0),
        ];
    }

    /**
     * Get fast revenue comparison from pre-calculated data
     */
    private function getFastRevenueComparison($fromDate, $toDate)
    {
        $currentData = DB::table('daily_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->selectRaw('
                SUM(total_revenue) as revenue,
                SUM(total_orders) as orders,
                AVG(avg_order_value) as avg_order_value
            ')
            ->first();

        // Calculate previous period
        $from = Carbon::parse($fromDate);
        $to = Carbon::parse($toDate);
        $daysDiff = $from->diffInDays($to) + 1;
        $prevFromDate = $from->copy()->subDays($daysDiff)->toDateString();
        $prevToDate = $from->copy()->subDay()->toDateString();

        $previousData = DB::table('daily_analytics')
            ->whereBetween('date', [$prevFromDate, $prevToDate])
            ->selectRaw('
                SUM(total_revenue) as revenue,
                SUM(total_orders) as orders,
                AVG(avg_order_value) as avg_order_value
            ')
            ->first();

        $currentRevenue = (float) ($currentData->revenue ?? 0);
        $currentOrders = (int) ($currentData->orders ?? 0);
        $previousRevenue = (float) ($previousData->revenue ?? 0);
        $previousOrders = (int) ($previousData->orders ?? 0);

        $revenueGrowth = $previousRevenue > 0
            ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100
            : 0;

        $ordersGrowth = $previousOrders > 0
            ? (($currentOrders - $previousOrders) / $previousOrders) * 100
            : 0;

        return [
            'current_period' => [
                'revenue' => (int) ceil($currentRevenue), // Float -> Int
                'orders' => $currentOrders, // Đã là int
                'avg_order_value' => (int) ceil($currentData->avg_order_value ?? 0) // Float -> Int
            ],
            'previous_period' => [
                'revenue' => (int) ceil($previousRevenue), // Float -> Int
                'orders' => $previousOrders, // Đã là int
                'avg_order_value' => (int) ceil($previousData->avg_order_value ?? 0) // Float -> Int
            ],
            'growth' => [
                'revenue_growth' => (int) ceil($revenueGrowth), // Float -> Int
                'orders_growth' => (int) ceil($ordersGrowth) // Float -> Int
            ]
        ];
    }

    /**
     * Get fast trends from pre-calculated data
     */
    private function getFastTrends($fromDate, $toDate, $days = 7)
    {
        $results = DB::table('daily_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->select([
                'date',
                'total_revenue as revenue',
                'total_orders as orders'
            ])
            ->orderBy('date', 'desc')
            ->limit($days)
            ->get();

        // Chỉ làm tròn revenue (là float)
        return $results->map(function ($item) {
            return [
                'date' => $item->date,
                'revenue' => (int) ceil($item->revenue ?? 0), // Float -> Int
                'orders' => (int) ($item->orders ?? 0) // Đã là int
            ];
        });
    }

    /**
     * Get fast customer stats from pre-calculated data
     */
    private function getFastCustomerStats($fromDate, $toDate)
    {
        $customerData = DB::table('daily_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->selectRaw('
            SUM(new_customers) as new_customers,
            SUM(returning_customers) as returning_customers,
            SUM(total_orders) as total_orders_with_customers
        ')
            ->first();

        $newCustomers = (int) ($customerData->new_customers ?? 0);
        $returningCustomers = (int) ($customerData->returning_customers ?? 0);
        $totalOrdersWithCustomers = (int) ($customerData->total_orders_with_customers ?? 0);

        $retentionRate = $totalOrdersWithCustomers > 0
            ? (($returningCustomers / $totalOrdersWithCustomers) * 100)
            : 0;

        return [
            'new_customers' => $newCustomers,
            'returning_customers' => $returningCustomers,
            'total_customers_with_orders' => $totalOrdersWithCustomers,
            'customer_retention_rate' => (int) ceil($retentionRate)
        ];
    }


    //
    /**
     * Calculate and store daily analytics data
     */
    public function calculateAndStoreDailyAnalytics($date)
    {
        $startDate = $date . ' 00:00:00';
        $endDate = $date . ' 23:59:59';

        try {
            DB::beginTransaction();

            // 1. Calculate daily analytics
            $dailyData = $this->calculateDailyData($date, $startDate, $endDate);

            // 2. Upsert daily_analytics
            DB::table('daily_analytics')->updateOrInsert(
                ['date' => $date],
                array_merge($dailyData, [
                    'calculated_at' => now(),
                    'is_finalized' => true,
                    'updated_at' => now()
                ])
            );

            // 3. Calculate and store product analytics
            $this->calculateAndStoreProductAnalytics($date, $startDate, $endDate);

            DB::commit();
            Log::info("Daily analytics calculated successfully for {$date}");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to calculate daily analytics for {$date}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Calculate daily data
     */
    private function calculateDailyData($date, $startDate, $endDate)
    {
        // Revenue metrics
        $revenueData = DB::table('orders')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
            SUM(CASE WHEN status != ? THEN total_amount ELSE 0 END) as total_revenue,
            SUM(CASE WHEN status = ? THEN total_amount ELSE 0 END) as completed_revenue,
            COUNT(*) as total_orders,
            AVG(CASE WHEN status != ? THEN total_amount ELSE NULL END) as avg_order_value
        ', [Order::STATUS_CANCELLED, Order::STATUS_COMPLETED, Order::STATUS_CANCELLED])
            ->first();

        // Order status counts
        $statusCounts = DB::table('orders')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
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
            SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as return_to_shop_orders
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
                Order::STATUS_RETURN_TO_SHOP
            ])
            ->first();

        // Customer metrics
        $newCustomers = DB::table('customers')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $returningCustomers = DB::table(
            DB::table('orders')
                ->select('customer_id')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->whereNotNull('customer_id')
                ->groupBy('customer_id')
                ->havingRaw('COUNT(*) > 1')
        )->count();

        // Product metrics
        $productMetrics = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->selectRaw('
            SUM(order_items.quantity) as total_products_sold,
            COUNT(DISTINCT order_items.product_id) as unique_products_sold
        ')
            ->first();

        return [
            'total_revenue' => (int) ($revenueData->total_revenue ?? 0),
            'completed_revenue' => (int) ($revenueData->completed_revenue ?? 0),
            'total_orders' => (int) ($revenueData->total_orders ?? 0),
            'avg_order_value' => (int) ($revenueData->avg_order_value ?? 0),

            'pending_orders' => (int) ($statusCounts->pending_orders ?? 0),
            'confirmed_orders' => (int) ($statusCounts->confirmed_orders ?? 0),
            'preparing_orders' => (int) ($statusCounts->preparing_orders ?? 0),
            'ready_to_ship_orders' => (int) ($statusCounts->ready_to_ship_orders ?? 0),
            'shipping_orders' => (int) ($statusCounts->shipping_orders ?? 0),
            'delivered_orders' => (int) ($statusCounts->delivered_orders ?? 0),
            'completed_orders' => (int) ($statusCounts->completed_orders ?? 0),
            'cancelled_orders' => (int) ($statusCounts->cancelled_orders ?? 0),
            'return_requested_orders' => (int) ($statusCounts->return_requested_orders ?? 0),
            'return_processing_orders' => (int) ($statusCounts->return_processing_orders ?? 0),
            'return_completed_orders' => (int) ($statusCounts->return_completed_orders ?? 0),
            'return_rejected_orders' => (int) ($statusCounts->return_rejected_orders ?? 0),
            'return_to_shop_orders' => (int) ($statusCounts->return_to_shop_orders ?? 0),

            'new_customers' => (int) $newCustomers,
            'returning_customers' => (int) $returningCustomers,

            'total_products_sold' => (int) ($productMetrics->total_products_sold ?? 0),
            'unique_products_sold' => (int) ($productMetrics->unique_products_sold ?? 0),
        ];
    }

    /**
     * Calculate and store product analytics
     */
    private function calculateAndStoreProductAnalytics($date, $startDate, $endDate)
    {
        $productData = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->groupBy('order_items.product_id')
            ->selectRaw('
            order_items.product_id,
            products.name as product_name,
            products.sku as product_sku,
            products.price as product_price,
            categories.id as category_id,
            categories.name as category_name,
            SUM(order_items.quantity) as quantity_sold,
            SUM(order_items.subtotal) as revenue,
            COUNT(DISTINCT orders.id) as orders_count
        ')
            ->get();

        foreach ($productData as $product) {
            DB::table('daily_product_analytics')->updateOrInsert(
                [
                    'date' => $date,
                    'product_id' => $product->product_id
                ],
                [
                    'quantity_sold' => (int) $product->quantity_sold,
                    'revenue' => (int) $product->revenue,
                    'orders_count' => (int) $product->orders_count,
                    'product_name' => $product->product_name,
                    'product_sku' => $product->product_sku,
                    'product_price' => (int) $product->product_price,
                    'category_id' => $product->category_id,
                    'category_name' => $product->category_name,
                    'updated_at' => now()
                ]
            );
        }
    }
}
