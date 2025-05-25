<?php

namespace App\Http\Controllers\Api\Analytics\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Analytics\AnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get comprehensive dashboard analytics
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'from_date' => 'nullable|date',
                'to_date' => 'nullable|date|after_or_equal:from_date',
                'top_products_limit' => 'integer|min:1|max:20'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Default date range (last 30 days)
            $fromDate = $request->input('from_date', Carbon::now()->subDays(30)->toDateString());
            $toDate = $request->input('to_date', Carbon::now()->toDateString());
            $topProductsLimit = $request->input('top_products_limit', 10);

            $data = $this->analyticsService->getComprehensiveDashboard($fromDate, $toDate, $topProductsLimit);

            return response()->json([
                'success' => true,
                'message' => 'Dashboard analytics retrieved successfully',
                'data' => $data,
                'meta' => [
                    'from_date' => $fromDate,
                    'to_date' => $toDate,
                    'generated_at' => now()->toISOString()
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Dashboard analytics error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get revenue analytics
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function revenue(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date',
                'group_by' => 'in:day,week,month'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');
            $groupBy = $request->input('group_by', 'day');

            $data = $this->analyticsService->getRevenueAnalytics($fromDate, $toDate, $groupBy);

            return response()->json([
                'success' => true,
                'message' => 'Revenue analytics retrieved successfully',
                'data' => $data,
                'meta' => [
                    'from_date' => $fromDate,
                    'to_date' => $toDate,
                    'group_by' => $groupBy,
                    'total_records' => count($data)
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Revenue analytics error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve revenue analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get top selling products
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function topProducts(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date',
                'limit' => 'integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');
            $limit = $request->input('limit', 10);

            $data = $this->analyticsService->getTopSellingProducts($fromDate, $toDate, $limit);

            return response()->json([
                'success' => true,
                'message' => 'Top selling products retrieved successfully',
                'data' => $data,
                'meta' => [
                    'from_date' => $fromDate,
                    'to_date' => $toDate,
                    'limit' => $limit,
                    'total_records' => count($data)
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Top products analytics error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve top products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order status analytics
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function orderStatus(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $data = $this->analyticsService->getOrderStatusAnalytics($fromDate, $toDate);

            return response()->json([
                'success' => true,
                'message' => 'Order status analytics retrieved successfully',
                'data' => $data,
                'meta' => [
                    'from_date' => $fromDate,
                    'to_date' => $toDate
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Order status analytics error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve order status analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get daily analytics for specific date range
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function dailyAnalytics(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date',
                'page' => 'integer|min:1',
                'per_page' => 'integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');
            $page = $request->input('page', 1);
            $perPage = $request->input('per_page', 15);

            $data = $this->analyticsService->getDailyAnalytics($fromDate, $toDate, $page, $perPage);

            return response()->json([
                'success' => true,
                'message' => 'Daily analytics retrieved successfully',
                'data' => $data['data'],
                'meta' => [
                    'from_date' => $fromDate,
                    'to_date' => $toDate,
                    'current_page' => $data['current_page'],
                    'per_page' => $data['per_page'],
                    'total' => $data['total'],
                    'last_page' => $data['last_page']
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Daily analytics error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve daily analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product analytics for specific date range
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function productAnalytics(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date',
                'product_id' => 'integer|exists:products,id',
                'category' => 'string',
                'page' => 'integer|min:1',
                'per_page' => 'integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');
            $productId = $request->input('product_id');
            $category = $request->input('category');
            $page = $request->input('page', 1);
            $perPage = $request->input('per_page', 15);

            $data = $this->analyticsService->getProductAnalytics(
                $fromDate, 
                $toDate, 
                $productId, 
                $category, 
                $page, 
                $perPage
            );

            return response()->json([
                'success' => true,
                'message' => 'Product analytics retrieved successfully',
                'data' => $data['data'],
                'meta' => [
                    'from_date' => $fromDate,
                    'to_date' => $toDate,
                    'product_id' => $productId,
                    'category' => $category,
                    'current_page' => $data['current_page'],
                    'per_page' => $data['per_page'],
                    'total' => $data['total'],
                    'last_page' => $data['last_page']
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Product analytics error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get realtime cache data
     * 
     * @return JsonResponse
     */
    public function realtimeCache(): JsonResponse
    {
        try {
            $data = $this->analyticsService->getRealtimeCache();

            return response()->json([
                'success' => true,
                'message' => 'Realtime cache retrieved successfully',
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            Log::error('Realtime cache error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve realtime cache',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
