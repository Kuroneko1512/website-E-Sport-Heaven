<?php

namespace App\Services\Analytics;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use App\Models\Order;

class AnalyticsService
{
    /**
     * Get dashboard overview data
     */
    public function getDashboardOverview()
    {
        return Cache::remember('dashboard_overview', 300, function () {
            return [
                'today' => $this->getTodayMetrics(),
                'orders' => $this->getOrdersOverview(),
                'revenue' => $this->getRevenueOverview(),
                'products' => $this->getProductsOverview(),
                'customers' => $this->getCustomersOverview(),
            ];
        });
    }

    /**
     * Get comprehensive dashboard data
     */
    public function getComprehensiveDashboard($fromDate, $toDate, $topProductsLimit = 10)
    {
        $cacheKey = "dashboard_comprehensive_{$fromDate}_{$toDate}_{$topProductsLimit}";

        return Cache::remember($cacheKey, 300, function () use ($fromDate, $toDate, $topProductsLimit) {
            return [
                // Tổng quan hôm nay
                'today_summary' => $this->getTodayMetrics(),

                // Biểu đồ doanh thu theo ngày
                'revenue_chart' => $this->getRevenueAnalytics($fromDate, $toDate, 'day'),

                // Top sản phẩm bán chạy
                'top_products' => $this->getTopSellingProducts($fromDate, $toDate, $topProductsLimit),

                // Thống kê trạng thái đơn hàng
                'order_status' => $this->getOrderStatusAnalytics($fromDate, $toDate),

                // So sánh với kỳ trước
                'revenue_comparison' => $this->getRevenueComparison($fromDate, $toDate),

                // Xu hướng 7 ngày gần nhất
                'recent_trends' => $this->getSalesTrends($fromDate, $toDate, 7),

                // Cache realtime
                'realtime_metrics' => $this->getRealtimeCache(),

                // Thống kê khách hàng
                'customer_stats' => $this->getCustomerAnalytics($fromDate, $toDate)
            ];
        });
    }

    /**
     * Get revenue analytics by date range
     */
    public function getRevenueAnalytics($fromDate, $toDate, $groupBy = 'day')
    {
        $query = DB::table('daily_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->orderBy('date');

        switch ($groupBy) {
            case 'week':
                return $query->selectRaw('
                    YEARWEEK(date) as period,
                    MIN(date) as start_date,
                    MAX(date) as end_date,
                    SUM(total_revenue) as revenue,
                    SUM(total_orders) as orders,
                    AVG(avg_order_value) as avg_order_value
                ')
                    ->groupBy('period')
                    ->get();

            case 'month':
                return $query->selectRaw('
                    DATE_FORMAT(date, "%Y-%m") as period,
                    MIN(date) as start_date,
                    MAX(date) as end_date,
                    SUM(total_revenue) as revenue,
                    SUM(total_orders) as orders,
                    AVG(avg_order_value) as avg_order_value
                ')
                    ->groupBy('period')
                    ->get();

            default: // day
                return $query->select([
                    'date as period',
                    'date as start_date',
                    'date as end_date',
                    'total_revenue as revenue',
                    'total_orders as orders',
                    'avg_order_value'
                ])->get();
        }
    }

    /**
     * Get top selling products
     */
    public function getTopSellingProducts($fromDate, $toDate, $limit = 10)
    {
        return DB::table('daily_product_analytics')
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
    }

    /**
     * Get order status analytics
     */
    public function getOrderStatusAnalytics($fromDate, $toDate)
    {
        return DB::table('daily_analytics')
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
                SUM(return_completed_orders) as return_completed
            ')
            ->first();
    }

    // Private helper methods...
    private function getTodayMetrics()
    {
        $today = Carbon::today()->toDateString();

        return DB::table('daily_analytics')
            ->where('date', $today)
            ->first() ?: [
                'total_revenue' => 0,
                'total_orders' => 0,
                'new_customers' => 0,
                'avg_order_value' => 0
            ];
    }

    private function getOrdersOverview()
    {
        return $this->getCacheData('orders_total_count', 0);
    }

    private function getRevenueOverview()
    {
        $today = $this->getCacheData('revenue_today', 0);
        $thisMonth = DB::table('daily_analytics')
            ->whereMonth('date', Carbon::now()->month)
            ->whereYear('date', Carbon::now()->year)
            ->sum('total_revenue');

        return [
            'today' => $today,
            'this_month' => $thisMonth
        ];
    }

    private function getProductsOverview()
    {
        return [
            'total' => $this->getCacheData('products_total_count', 0),
            'low_stock' => $this->getCacheData('products_low_stock_count', 0)
        ];
    }

    private function getCustomersOverview()
    {
        return [
            'total' => $this->getCacheData('customers_total_count', 0),
            'new_today' => $this->getCacheData('customers_today_count', 0)
        ];
    }

    private function getCacheData($key, $default = null)
    {
        $cache = DB::table('realtime_analytics_cache')
            ->where('cache_key', $key)
            ->where('expires_at', '>', now())
            ->first();

        if ($cache) {
            $data = json_decode($cache->cache_data, true);
            return $data['value'] ?? $default;
        }

        return $default;
    }
    /**
     * Get daily analytics with pagination
     */
    public function getDailyAnalytics($fromDate, $toDate, $page = 1, $perPage = 15)
    {
        $query = DB::table('daily_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->orderBy('date', 'desc');

        $total = $query->count();
        $lastPage = ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;

        $data = $query->offset($offset)->limit($perPage)->get();

        return [
            'data' => $data,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => $lastPage
        ];
    }

    /**
     * Get product analytics with filters and pagination
     */
    public function getProductAnalytics($fromDate, $toDate, $productId = null, $category = null, $page = 1, $perPage = 15)
    {
        $query = DB::table('daily_product_analytics')
            ->whereBetween('date', [$fromDate, $toDate]);

        // Filter by product ID if provided
        if ($productId) {
            $query->where('product_id', $productId);
        }

        // Filter by category if provided
        if ($category) {
            $query->where('category_name', 'like', '%' . $category . '%');
        }

        $query->orderBy('date', 'desc')
            ->orderBy('quantity_sold', 'desc');

        $total = $query->count();
        $lastPage = ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;

        $data = $query->offset($offset)->limit($perPage)->get();

        return [
            'data' => $data,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => $lastPage
        ];
    }

    /**
     * Get all realtime cache data
     */
    public function getRealtimeCache()
    {
        $cacheData = DB::table('realtime_analytics_cache')
            ->where('expires_at', '>', now())
            ->get();

        $result = [];
        foreach ($cacheData as $cache) {
            $data = json_decode($cache->cache_data, true);
            $result[$cache->cache_key] = [
                'value' => $data['value'] ?? null,
                'updated_at' => $cache->updated_at,
                'expires_at' => $cache->expires_at
            ];
        }

        return $result;
    }

    /**
     * Get customer analytics
     */
    public function getCustomerAnalytics($fromDate, $toDate)
    {
        $data = DB::table('daily_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->selectRaw('
                SUM(new_customers) as total_new_customers,
                SUM(total_orders) as total_orders,
                COUNT(DISTINCT date) as active_days,
                AVG(new_customers) as avg_new_customers_per_day,
                MAX(new_customers) as peak_new_customers,
                MIN(new_customers) as min_new_customers
            ')
            ->first();

        return [
            'total_new_customers' => (int)($data->total_new_customers ?? 0),
            'total_orders' => (int)($data->total_orders ?? 0),
            'active_days' => (int)($data->active_days ?? 0),
            'avg_new_customers_per_day' => round((float)($data->avg_new_customers_per_day ?? 0), 0), // Làm tròn thành số nguyên
            'peak_new_customers' => (int)($data->peak_new_customers ?? 0),
            'min_new_customers' => (int)($data->min_new_customers ?? 0)
        ];
    }

    /**
     * Get revenue comparison (current vs previous period)
     */
    public function getRevenueComparison($fromDate, $toDate)
    {
        $currentPeriod = DB::table('daily_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->selectRaw('
                COALESCE(SUM(total_revenue), 0) as revenue,
                COALESCE(SUM(total_orders), 0) as orders,
                COALESCE(AVG(avg_order_value), 0) as avg_order_value
            ')
            ->first();

        // Calculate previous period dates
        $from = Carbon::parse($fromDate);
        $to = Carbon::parse($toDate);
        $daysDiff = $from->diffInDays($to) + 1;

        $prevFromDate = $from->copy()->subDays($daysDiff)->toDateString();
        $prevToDate = $from->copy()->subDay()->toDateString();

        $previousPeriod = DB::table('daily_analytics')
            ->whereBetween('date', [$prevFromDate, $prevToDate])
            ->selectRaw('
                COALESCE(SUM(total_revenue), 0) as revenue,
                COALESCE(SUM(total_orders), 0) as orders,
                COALESCE(AVG(avg_order_value), 0) as avg_order_value
            ')
            ->first();

        // Ensure we have valid numbers
        $currentRevenue = (float) ($currentPeriod->revenue ?? 0);
        $currentOrders = (int) ($currentPeriod->orders ?? 0);
        $previousRevenue = (float) ($previousPeriod->revenue ?? 0);
        $previousOrders = (int) ($previousPeriod->orders ?? 0);

        // Calculate growth percentages
        $revenueGrowth = $previousRevenue > 0
            ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100
            : 0;

        $ordersGrowth = $previousOrders > 0
            ? (($currentOrders - $previousOrders) / $previousOrders) * 100
            : 0;

        return [
            'current_period' => [
                'revenue' => $currentRevenue,
                'orders' => $currentOrders,
                'avg_order_value' => round((float) ($currentPeriod->avg_order_value ?? 0), 0)
            ],
            'previous_period' => [
                'revenue' => $previousRevenue,
                'orders' => $previousOrders,
                'avg_order_value' => round((float) ($currentPeriod->avg_order_value ?? 0), 0)
            ],
            'growth' => [
                'revenue_growth_percent' => round($revenueGrowth, 2),
                'orders_growth_percent' => round($ordersGrowth, 2)
            ],
            'period_info' => [
                'current' => ['from' => $fromDate, 'to' => $toDate],
                'previous' => ['from' => $prevFromDate, 'to' => $prevToDate]
            ]
        ];
    }

    /**
     * Get sales trends (daily growth)
     */
    public function getSalesTrends($fromDate, $toDate, $days = 7)
    {
        return DB::table('daily_analytics')
            ->whereBetween('date', [$fromDate, $toDate])
            ->select([
                'date',
                'total_revenue',
                'total_orders',
                'avg_order_value',
                'new_customers'
            ])
            ->orderBy('date', 'desc')
            ->limit($days)
            ->get()
            ->reverse()
            ->values();
    }

    /**
     * Update realtime cache
     */
    public function updateRealtimeCache($key, $value, $expiresInMinutes = 60)
    {
        $expiresAt = now()->addMinutes($expiresInMinutes);

        DB::table('realtime_analytics_cache')->updateOrInsert(
            ['cache_key' => $key],
            [
                'cache_data' => json_encode(['value' => $value]),
                'expires_at' => $expiresAt,
                'updated_at' => now()
            ]
        );

        return true;
    }
}
