<?php

namespace App\Services\LocationImport;

use App\Jobs\Import\ImportProvincesJob;
use App\Jobs\Import\ImportDistrictsJob;
use App\Jobs\Import\ImportCommunesJob;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ImportService
{
    /**
     * Xử lý import dữ liệu từ các file CSV.
     *
     * @param array $files ['provinces' => file, 'districts' => file, 'communes' => file]
     */
    public function import(array $files): void
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
     * Đếm số lượng chunks của file.
     */
    private function countChunks($file): float
    {
        $data = $this->readCsv($file);
        return ceil(count($data) / 100);
    }

    /**
     * Import tỉnh/thành
     */
    private function importProvinces($file): void
    {
        $data = $this->readCsv($file);
        foreach (array_chunk($data, 100) as $chunk) {
            ImportProvincesJob::dispatch($chunk)
                ->onQueue('Location_import')
                ->delay(now()->addSeconds(2));
        }
    }

    /**
     * Import quận/huyện
     */
    private function importDistricts($file): void
    {
        $data = $this->readCsv($file);
        foreach (array_chunk($data, 100) as $chunk) {
            ImportDistrictsJob::dispatch($chunk)
                ->onQueue('Location_import')
                ->delay(now()->addSeconds(2));
        }
    }

    /**
     * Import xã/phường
     */
    private function importCommunes($file): void
    {
        $data = $this->readCsv($file);
        foreach (array_chunk($data, 100) as $chunk) {
            ImportCommunesJob::dispatch($chunk)
                ->onQueue('Location_import')
                ->delay(now()->addSeconds(2));
        }
    }

    /**
     * Đọc file CSV và trả về mảng dữ liệu
     */
    private function readCsv($file): array
    {
        $data = [];
        if (($handle = fopen($file->getPathname(), 'r')) !== false) {
            // Đọc và bỏ qua header
            fgetcsv($handle);

            while (($row = fgetcsv($handle)) !== false) {
                if (count($row) < 4) {
                    continue; // Bỏ qua dòng không hợp lệ
                }
                $data[] = $row;
            }
            fclose($handle);
        }
        return $data;
    }
}
