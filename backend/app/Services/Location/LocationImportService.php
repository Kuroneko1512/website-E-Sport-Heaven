<?php

namespace App\Services\Location;

use App\Jobs\Location\ImportCommunesJob;
use App\Jobs\Location\ImportDistrictsJob;
use App\Jobs\Location\ImportProvincesJob;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class LocationImportService
{
    /**
     * Xử lý import dữ liệu từ files CSV
     * @param array $files ['provinces' => file, 'districts' => file, 'communes' => file]
     */
    public function import(array $files)
    {
        // Reset cache trước khi import mới
        Cache::forget('total_location_jobs');
        Cache::forget('processed_location_jobs');
        Cache::forget('import_error');

        DB::beginTransaction();
        try {
            $totalChunks = 0;
            
            // Đếm tổng chunks cho cả 3 loại
            $totalChunks += $this->countChunks($files['provinces']);
            $totalChunks += $this->countChunks($files['districts']); 
            $totalChunks += $this->countChunks($files['communes']);

            // Lưu tổng số chunks vào cache
            Cache::put('total_location_jobs', $totalChunks);

            // Import theo thứ tự
            $this->importProvinces($files['provinces']);
            $this->importDistricts($files['districts']);
            $this->importCommunes($files['communes']);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Đếm số chunks từ file
     */
    private function countChunks($file)
    {
        $data = $this->readCsv($file);
        return ceil(count($data) / 100);
    }

    /**
     * Import tỉnh/thành
     */
    private function importProvinces($file)
    {
        $data = $this->readCsv($file);
        foreach(array_chunk($data, 100) as $chunk) {
            ImportProvincesJob::dispatch($chunk)
                ->onQueue('location_import')
                ->delay(now()->addSeconds(2));
        }
    }

    /**
     * Xử lý import quận/huyện
     * @param \Illuminate\Http\UploadedFile $file File CSV chứa dữ liệu quận/huyện
     */
    private function importDistricts($file)
    {
        $data = $this->readCsv($file);
        foreach(array_chunk($data, 100) as $chunk) {
            ImportDistrictsJob::dispatch($chunk)
                ->onQueue('location_import')
                ->delay(now()->addSeconds(2));
        }
    }

    /**
     * Xử lý import xã/phường
     * @param \Illuminate\Http\UploadedFile $file File CSV chứa dữ liệu xã/phường
     */
    private function importCommunes($file)
    {
        $data = $this->readCsv($file);
        foreach(array_chunk($data, 100) as $chunk) {
            ImportCommunesJob::dispatch($chunk)
                ->onQueue('location_import')
                ->delay(now()->addSeconds(2));
        }
    }

    /**
     * Đọc nội dung file CSV
     * @param \Illuminate\Http\UploadedFile $file File CSV cần đọc
     * @return array Mảng dữ liệu từ CSV
     */
    private function readCsv($file)
    {
        $handle = fopen($file->getPathname(), 'r');
        $header = fgetcsv($handle);
        $data = [];
        while (($row = fgetcsv($handle)) !== false) {
            $data[] = $row;
        }
        fclose($handle);
        return $data;
    }
}
