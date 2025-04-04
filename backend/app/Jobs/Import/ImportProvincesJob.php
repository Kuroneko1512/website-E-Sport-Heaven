<?php

namespace App\Jobs\Import;

use App\Models\Province;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ImportProvincesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
        $this->onQueue('location_import');
    }

    public function handle(): void
    {
        try {
            DB::beginTransaction();
            foreach ($this->data as $row) {
                // Đảm bảo không có giá trị rỗng hoặc thiếu
                if (empty($row[0]) || empty($row[1]) || empty($row[2])) {
                    continue; // Bỏ qua dòng không hợp lệ
                }

                // Cập nhật hoặc tạo mới tỉnh/thành
                Province::updateOrCreate(
                    ['code' => $row[0]], // Dùng code làm khóa chính
                    [
                        'name' => $row[1],     // Tên tỉnh
                        'type' => $row[2]      // Loại tỉnh
                    ]
                );
            }
            DB::commit();
            Cache::increment('processed_location_jobs');
        } catch (\Exception $e) {
            DB::rollBack();
            Cache::put('import_error', 'Lỗi import tỉnh/thành: ' . $e->getMessage());
            throw $e;
        }
    }
}
