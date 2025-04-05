<?php

namespace App\Http\Controllers\Api\Location;

use App\Http\Controllers\Controller;
use App\Services\Location\LocationService;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    protected $locationService;

    public function __construct(LocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    /**
     * Lấy danh sách tất cả tỉnh/thành phố
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProvinces()
    {
        try {
            $provinces = $this->locationService->getAllProvinces();

            return response()->json([
                'success' => true,
                'data' => $provinces
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách tỉnh/thành phố: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách quận/huyện theo mã tỉnh/thành phố
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDistricts(Request $request)
    {
        try {
            $provinceCode = $request->input('province_code');

            if (!$provinceCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vui lòng cung cấp mã tỉnh/thành phố'
                ], 400);
            }

            $districts = $this->locationService->getDistrictsByProvinceCode($provinceCode);

            return response()->json([
                'success' => true,
                'data' => $districts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách quận/huyện: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách xã/phường theo mã quận/huyện
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCommunes(Request $request)
    {
        try {
            $districtCode = $request->input('district_code');

            if (!$districtCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vui lòng cung cấp mã quận/huyện'
                ], 400);
            }

            $communes = $this->locationService->getCommunesByDistrictCode($districtCode);

            return response()->json([
                'success' => true,
                'data' => $communes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách xã/phường: ' . $e->getMessage()
            ], 500);
        }
    }
}
