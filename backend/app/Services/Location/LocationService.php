<?php

namespace App\Services\Location;

use App\Models\Province;
use App\Models\District;
use App\Models\Commune;
use Illuminate\Support\Facades\Cache;

class LocationService
{
    /**
     * Lấy danh sách tất cả tỉnh/thành phố cho select box
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllProvinces()
    {
        return Cache::remember('all_provinces_select', 86400, function () {
            return Province::select('id', 'code', 'name')
                ->orderBy('code')
                ->get();
        });
    }

    /**
     * Lấy danh sách quận/huyện theo tỉnh/thành phố cho select box
     *
     * @param string $provinceCode Mã tỉnh/thành phố
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getDistrictsByProvinceCode($provinceCode)
    {
        $cacheKey = 'districts_by_province_' . $provinceCode;

        return Cache::remember($cacheKey, 86400, function () use ($provinceCode) {
            $province = Province::where('code', $provinceCode)->first();

            if (!$province) {
                return collect();
            }

            return District::select('id', 'code', 'name')
                ->where('province_code', $province->code)
                ->orderBy('code')
                ->get();
        });
    }

    /**
     * Lấy danh sách xã/phường theo quận/huyện cho select box
     *
     * @param string $districtCode Mã quận/huyện
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getCommunesByDistrictCode($districtCode)
    {
        $cacheKey = 'communes_by_district_' . $districtCode;

        return Cache::remember($cacheKey, 86400, function () use ($districtCode) {
            $district = District::where('code', $districtCode)->first();

            if (!$district) {
                return collect();
            }

            return Commune::select('id', 'code', 'name')
                ->where('district_code', $district->code)
                ->orderBy('code')
                ->get();
        });
    }
}
