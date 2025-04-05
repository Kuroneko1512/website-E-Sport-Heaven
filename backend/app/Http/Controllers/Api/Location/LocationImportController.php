<?php

namespace App\Http\Controllers\Api\Location;

use App\Http\Controllers\Controller;
use App\Services\Location\LocationImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;


class LocationImportController extends Controller
{

    protected $locationImportService;

    public function __construct(LocationImportService $locationImportService)
    {
        $this->locationImportService = $locationImportService;
    }

    /**
     * Import dữ liệu địa điểm từ files CSV
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function import(Request $request)
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'provinces' => 'required|file|mimes:csv,txt',
                'districts' => 'required|file|mimes:csv,txt',
                'communes' => 'required|file|mimes:csv,txt',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Lấy files từ request
            $files = [
                'provinces' => $request->file('provinces'),
                'districts' => $request->file('districts'),
                'communes' => $request->file('communes'),
            ];

            // Gọi service để xử lý import
            $this->locationImportService->import($files);

            return response()->json([
                'success' => true,
                'message' => 'Đã bắt đầu import dữ liệu địa điểm. Quá trình này sẽ diễn ra trong nền.',
            ]);
        } catch (\Exception $e) {
            Log::error('Import location data failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi import dữ liệu: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Kiểm tra tiến độ import
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkProgress()
    {
        $totalJobs = Cache::get('total_location_jobs', 0);
        $processedJobs = Cache::get('processed_location_jobs', 0);
        $error = Cache::get('import_error');

        $progress = $totalJobs > 0 ? round(($processedJobs / $totalJobs) * 100, 2) : 0;
        $isCompleted = $totalJobs > 0 && $processedJobs >= $totalJobs;

        return response()->json([
            'success' => true,
            'data' => [
                'total_jobs' => $totalJobs,
                'processed_jobs' => $processedJobs,
                'progress_percentage' => $progress,
                'is_completed' => $isCompleted,
                'error' => $error,
            ],
        ]);
    }

    /**
     * Import dữ liệu địa điểm từ files có sẵn trong public/Location
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function importFromPublicFiles()
    {
        try {
            $basePath = public_path('Location');

            // Kiểm tra xem các file có tồn tại không
            $provincesPath = $basePath . '/provinces.csv';
            $districtsPath = $basePath . '/districts.csv';
            $communesPath = $basePath . '/communes.csv';

            if (!file_exists($provincesPath) || !file_exists($districtsPath) || !file_exists($communesPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Một hoặc nhiều file CSV không tồn tại trong thư mục public/Location',
                ], 404);
            }

            // Tạo UploadedFile objects từ file có sẵn
            $files = [
                'provinces' => new \Illuminate\Http\UploadedFile(
                    $provincesPath,
                    'provinces.csv',
                    'text/csv',
                    null,
                    true
                ),
                'districts' => new \Illuminate\Http\UploadedFile(
                    $districtsPath,
                    'districts.csv',
                    'text/csv',
                    null,
                    true
                ),
                'communes' => new \Illuminate\Http\UploadedFile(
                    $communesPath,
                    'communes.csv',
                    'text/csv',
                    null,
                    true
                ),
            ];

            // Gọi service để xử lý import
            $this->locationImportService->import($files);

            return response()->json([
                'success' => true,
                'message' => 'Đã bắt đầu import dữ liệu địa điểm từ files có sẵn. Quá trình này sẽ diễn ra trong nền.',
            ]);
        } catch (\Exception $e) {
            Log::error('Import location data from public files failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi import dữ liệu: ' . $e->getMessage(),
            ], 500);
        }
    }
}
