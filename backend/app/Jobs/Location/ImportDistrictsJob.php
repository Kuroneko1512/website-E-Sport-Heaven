<?php

namespace App\Jobs\Location;

use App\Models\District;
use App\Models\Province;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ImportDistrictsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
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
     * Xử lý import quận/huyện
     */
    public function handle()
    {
        try {
            // Bắt đầu transaction
            DB::beginTransaction();

            foreach ($this->data as $row) {
                // Tìm tỉnh/thành phố theo mã
                $province = Province::where('code', $row[3])->first();

                // Chỉ tạo quận/huyện khi tìm thấy tỉnh/thành
                if ($province) {
                    District::updateOrCreate(
                        ['code' => $row[0]], // Tìm theo mã quận/huyện
                        [
                            'name' => $row[1],      // Tên quận/huyện
                            'type' => $row[2],      // Loại (quận/huyện/thị xã...)
                            'province_code' => $province->code  // Liên kết với tỉnh/thành
                        ]
                    );
                }
            }

            DB::commit();
            Cache::increment('processed_location_jobs');
        } catch (\Exception $e) {
            DB::rollBack();
            Cache::put('import_error', 'Lỗi import quận/huyện: ' . $e->getMessage());
            throw $e;
        }
    }
}
