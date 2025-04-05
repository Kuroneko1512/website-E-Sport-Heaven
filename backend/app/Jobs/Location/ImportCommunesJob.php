<?php

namespace App\Jobs\Location;

use App\Models\Commune;
use App\Models\District;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ImportCommunesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

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
     * Xử lý import xã/phường
     */
    public function handle()
    {
        try {
            // Bắt đầu transaction
            DB::beginTransaction();

            foreach ($this->data as $row) {
                // Tìm quận/huyện theo mã
                $district = District::where('code', $row[3])->first();

                // Chỉ tạo xã/phường khi tìm thấy quận/huyện
                if ($district) {
                    Commune::updateOrCreate(
                        ['code' => $row[0]], // Tìm theo mã xã/phường
                        [
                            'name' => $row[1],      // Tên xã/phường
                            'type' => $row[2],      // Loại (phường/xã/thị trấn...)
                            'district_code' => $district->code  // Liên kết với quận/huyện
                        ]
                    );
                }
            }

            DB::commit();
            Cache::increment('processed_location_jobs');
        } catch (\Exception $e) {
            DB::rollBack();
            Cache::put('import_error', 'Lỗi import xã/phường: ' . $e->getMessage());
            throw $e;
        }
    }
}
