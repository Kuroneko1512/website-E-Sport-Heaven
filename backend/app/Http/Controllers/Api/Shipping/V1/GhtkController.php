<?php

namespace App\Http\Controllers\Api\Shipping\V1;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Commune;
use App\Models\District;
use App\Models\Province;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GhtkController extends Controller
{
    public function getShippingFee(Request $request)
    {
        try {
            Log::info('GHTK API Request Params:', $request->all());

            // Chuyển đổi mã thành tên
            $provinceCode = $request->input('province');
            $districtCode = $request->input('district');
            $wardCode = $request->input('ward');

            // Khởi tạo models để sử dụng các phương thức lấy tên
            $provinceModel = new Province();
            $districtModel = new District();
            $communeModel = new Commune();

            // Lấy tên địa điểm từ mã code
            $provinceName = $provinceCode ? $provinceModel->getProvinceName($provinceCode) : '';
            $districtName = $districtCode ? $districtModel->getDistrictName($districtCode) : '';
            $wardName = $wardCode ? $communeModel->getCommuneName($wardCode) : '';

            // Tạo một mảng tham số mới với tên địa chỉ
            $params = [
                'pick_province' => $request->input('pick_province'),
                'pick_district' => $request->input('pick_district'),
                'province' => $provinceName,
                'district' => $districtName,
                'ward' => $wardName,
                'address' => $request->input('address'),
                'weight' => $request->input('weight'),
                'value' => $request->input('value'),
                'transport' => $request->input('transport'),
                // 'deliver_option' => $request->input('deliver_option')
            ];

            Log::info('GHTK API Modified Params:', $params);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Token' => '1EJMnuJmnfE2MQnknmYLaArcYb95ve1ISUEiwA3',
                'X-Client-Source' => 'S22882891',
            ])->get('https://services.giaohangtietkiem.vn/services/shipment/fee', $params);

            Log::info('GHTK API Response:', ['status' => $response->status(), 'body' => $response->json()]);

            return $response->json();
        } catch (Exception $e) {
            Log::error('Error when Get shipping fee from API GHTK: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error when Get shipping fee from API GHTK: ' . $e->getMessage()
            ], 500);
        }
    }
}
