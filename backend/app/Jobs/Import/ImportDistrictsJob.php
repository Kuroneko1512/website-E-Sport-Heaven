<?php
namespace App\Jobs\Import;

use App\Models\District;
use App\Models\Province;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ImportDistrictsJob implements ShouldQueue
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
                // Kiểm tra tính hợp lệ của dữ liệu
                if (empty($row[0]) || empty($row[1]) || empty($row[2]) || empty($row[3])) {
                    continue; // Bỏ qua dòng không hợp lệ
                }

                // Kiểm tra tỉnh có tồn tại
                $province = Province::where('code', $row[3])->first();

                // Nếu tỉnh tồn tại, tiến hành thêm hoặc cập nhật quận/huyện
                if ($province) {
                    District::updateOrCreate(
                        ['code' => $row[0]], // Sử dụng mã quận/huyện làm khóa chính
                        [
                            'name' => $row[1],          // Tên quận/huyện
                            'type' => $row[2],          // Loại quận/huyện
                            'province_code' => $province->code // Lưu mã tỉnh
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
