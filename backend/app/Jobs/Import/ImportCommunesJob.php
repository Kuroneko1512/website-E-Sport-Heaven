<?php
namespace App\Jobs\Import;

use App\Models\Commune;
use App\Models\District;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ImportCommunesJob implements ShouldQueue
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
                // Kiểm tra dữ liệu hợp lệ
                if (empty($row[0]) || empty($row[1]) || empty($row[2]) || empty($row[3])) {
                    continue; // Bỏ qua dòng không hợp lệ
                }

                // Kiểm tra quận/huyện có tồn tại
                $district = District::where('code', $row[3])->first();

                // Nếu quận/huyện tồn tại, tiến hành thêm hoặc cập nhật xã/phường
                if ($district) {
                    Commune::updateOrCreate(
                        ['code' => $row[0]], // Dùng mã xã/phường làm khóa chính
                        [
                            'name' => $row[1],             // Tên xã/phường
                            'type' => $row[2],             // Loại xã/phường
                            'district_code' => $district->code // Lưu mã quận/huyện
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
