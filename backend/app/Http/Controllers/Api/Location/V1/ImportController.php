<?php

namespace App\Http\Controllers\Api\Location\V1;

use App\Services\LocationImport\ImportService;
use App\Http\Controllers\Controller;
use App\Http\Requests\LocationImport\ImportRequest;
use App\Models\Province;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ImportController extends Controller
{
    protected $importService;

    /**
     * Khởi tạo controller với dependency injection.
     *
     * @param ImportService $importService Service xử lý import.
     */
    public function __construct(ImportService $importService)
    {
        $this->importService = $importService;
    }

    /**
     * Hiển thị danh sách địa chỉ đã import (bao gồm Tỉnh, Quận/Huyện, Xã/Phường).
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Lấy danh sách tỉnh với thông tin quận/huyện và xã/phường kèm theo
        $provinces = Province::with(['districts', 'communes'])->paginate(20);

        return response()->json([
            'data' => $provinces,
            'message' => 'Danh sách tỉnh/thành phố với quận/huyện và xã/phường',
            'status' => 'success',
        ]);
    }

    /**
     * Lấy danh sách tỉnh theo trang (có thể bao gồm quận/huyện và xã/phường).
     *
     * @return JsonResponse
     */
    public function list(): JsonResponse
    {
        $perPage = request('per_page', 20); // Mặc định lấy 20 bản ghi mỗi trang
        // Lấy danh sách tỉnh với thông tin quận/huyện và xã/phường kèm theo
        $provinces = Province::with(['districts', 'communes'])->paginate($perPage);

        return response()->json([
            'data' => $provinces,
            'message' => 'Danh sách tỉnh/thành phố với quận/huyện và xã/phường',
            'status' => 'success',
        ]);
    }

    /**
     * Import dữ liệu từ file CSV thông qua API.
     *
     * @param ImportRequest $request Yêu cầu chứa file import.
     * @return JsonResponse
     */
    public function import(ImportRequest $request): JsonResponse
    {
        try {
            // Gọi service để thực hiện import
            $this->importService->import($request->allFiles());

            return response()->json([
                'message' => 'Bắt đầu import dữ liệu thành công',
                'status' => 'success',
            ]);
        } catch (\Exception $e) {
            // Lưu lỗi vào cache để kiểm tra tiến độ hoặc hiển thị thông báo lỗi
            Cache::put('import_error', 'Lỗi trong quá trình import: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Lỗi trong quá trình import: ' . $e->getMessage(),
                'status' => 'error',
            ], 500);
        }
    }

    /**
     * Kiểm tra tiến độ import dữ liệu.
     *
     * @return JsonResponse
     */
    public function importProgress(): JsonResponse
    {
        // Tổng số jobs cần xử lý
        $totalJobs = Cache::get('total_location_jobs', 0);

        // Số jobs đang chờ trong queue
        $pendingJobs = DB::table('jobs')
            ->where('queue', 'Location_import')
            ->count();

        // Số jobs thất bại
        $failedJobs = DB::table('failed_jobs')
            ->where('queue', 'Location_import')
            ->count();

        // Số jobs đã xử lý
        $processedJobs = Cache::get('processed_location_jobs', 0);

    }
}
