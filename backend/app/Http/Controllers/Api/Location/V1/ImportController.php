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

    
}
