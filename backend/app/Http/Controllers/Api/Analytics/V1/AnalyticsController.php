<?php

namespace App\Http\Controllers\Api\Analytics\V1;

use Exception;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Services\Analytics\AnalyticsService;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get comprehensive dashboard analytics (Direct queries - Real-time)
     * API: /dashboard
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

            $data = $this->analyticsService->getDirectDashboard($fromDate, $toDate, $topProductsLimit);

            return response()->json([
                'success' => true,
                'message' => 'Dashboard analytics retrieved successfully',
                'data' => $data,
                'meta' => [
                    'from_date' => $fromDate,
                    'to_date' => $toDate,
                    'data_source' => 'direct_queries',
                    'cache_duration' => '2_minutes',
                    'generated_at' => now()->toISOString()
                ]
            ], 200);

        } catch (Exception $e) {
            Log::error('Dashboard analytics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fast dashboard analytics from pre-calculated data
     * API: /dashboard-fast
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function dashboardFast(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'top_products_limit' => 'integer|min:1|max:20'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $topProductsLimit = $request->input('top_products_limit', 10);

            $data = $this->analyticsService->getFastDashboard($topProductsLimit);

            return response()->json([
                'success' => true,
                'message' => 'Fast dashboard analytics retrieved successfully',
                'data' => $data,
                'meta' => [
                    'top_products_limit' => $topProductsLimit,
                    'data_source' => 'pre_calculated',
                    'cache_duration' => '10_minutes',
                    'period' => 'last_30_days',
                    'generated_at' => now()->toISOString()
                ]
            ], 200);

        } catch (Exception $e) {
            Log::error('Fast dashboard analytics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fast dashboard analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
