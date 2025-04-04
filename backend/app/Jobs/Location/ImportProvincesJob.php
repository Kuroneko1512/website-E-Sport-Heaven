<?php

namespace App\Jobs\Location;

use App\Models\Province;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ImportProvincesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3; // Số lần retry tối đa
    public $timeout = 120;
    protected $data;

    /**
     * Create a new job instance.
     */
    public function __construct(array $data)
    {
        $this->data = $data;
        $this->onQueue('location_import');
    }

    /**
     * Execute the job.
     */
    /**
     * Xử lý import tỉnh/thành phố
     */
    public function handle()
    {
        try {
            // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
            DB::beginTransaction();

            // Xử lý từng dòng dữ liệu trong chunk
            foreach ($this->data as $row) {
                // Tìm và cập nhật hoặc tạo mới tỉnh/thành
                Province::updateOrCreate(
                    ['code' => $row[0]], // Điều kiện tìm kiếm theo mã
                    [
                        'name' => $row[1], // Cập nhật tên
                        'type' => $row[2]  // Cập nhật loại (tỉnh/thành phố)
                    ]
                );
            }

            // Commit transaction nếu thành công
            DB::commit();

            // Tăng số lượng bản ghi đã xử lý
            Cache::increment('processed_location_jobs');
        } catch (\Exception $e) {
            // Rollback nếu có lỗi
            DB::rollBack();

            // Lưu thông tin lỗi vào cache
            Cache::put('import_error', 'Lỗi import tỉnh/thành: ' . $e->getMessage());

            // Ném lại exception để job queue xử lý retry
            throw $e;
        }
    }
}
