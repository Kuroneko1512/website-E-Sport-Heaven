<?php

namespace App\Services\Warehouse;

use Exception;
use App\Models\Warehouse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\WarehouseTransaction;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class WarehouseService
{
    protected $model;

    public function __construct(Warehouse $warehouse)
    {
        $this->model = $warehouse;
    }

    /**
     * Lấy danh sách kho có phân trang và lọc
     *
     * @param array $filters Các bộ lọc
     * @param int $perPage Số lượng kết quả mỗi trang
     * @param string $sortBy Trường sắp xếp
     * @param string $sortOrder Thứ tự sắp xếp
     * @return LengthAwarePaginator
     */
    public function getPaginatedWarehouses($filters = [], $perPage = 15, $sortBy = 'created_at', $sortOrder = 'desc')
    {
        try {
            $query = $this->model->query();

            // Lọc theo loại kho
            if (isset($filters['type']) && !empty($filters['type'])) {
                $query->ofType($filters['type']);
            }

            // Lọc theo trạng thái
            if (isset($filters['is_active']) && $filters['is_active'] !== null) {
                if ($filters['is_active']) {
                    $query->active();
                } else {
                    $query->where('is_active', false);
                }
            }

            // Tìm kiếm theo tên, mã hoặc địa chỉ
            if (isset($filters['search']) && !empty($filters['search'])) {
                $search = $filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                });
            }

            // Lọc theo người quản lý
            if (isset($filters['manager_id']) && !empty($filters['manager_id'])) {
                $query->where('manager_id', $filters['manager_id']);
            }

            // Sắp xếp
            $query->orderBy($sortBy, $sortOrder);

            // Phân trang
            return $query->paginate($perPage);
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách kho: " . $e->getMessage());
        }
    }

    /**
     * Lấy tất cả kho không phân trang
     *
     * @param array $filters Các bộ lọc
     * @return Collection
     */
    public function getAllWarehouses($filters = [])
    {
        try {
            $query = $this->model->query();

            // Lọc theo loại kho
            if (isset($filters['type']) && !empty($filters['type'])) {
                $query->ofType($filters['type']);
            }

            // Lọc theo trạng thái
            if (isset($filters['is_active']) && $filters['is_active'] !== null) {
                if ($filters['is_active']) {
                    $query->active();
                } else {
                    $query->where('is_active', false);
                }
            }

            return $query->get();
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy tất cả kho: " . $e->getMessage());
        }
    }

    /**
     * Tạo mã kho tự động (tối đa 10 ký tự)
     * 
     * @param string $name Tên kho
     * @param int $type Loại kho
     * @return string
     */
    public function generateWarehouseCode($name, $type)
    {
        // Tạo prefix dựa trên loại kho (1 ký tự)
        $prefix = '';
        if ($type == Warehouse::TYPE_SALES) {
            $prefix = 'S';
        } elseif ($type == Warehouse::TYPE_RETURNS) {
            $prefix = 'R';
        } else {
            $prefix = 'O'; // Cho TYPE_OTHER
        }

        // Lấy 3 ký tự đầu của tên kho
        $namePart = Str::upper(Str::substr(Str::slug($name), 0, 3));

        // Ngày hiện tại dạng MMDD (4 ký tự)
        $datePart = date('md');

        // Phần ngẫu nhiên (2 ký tự)
        $randomPart = Str::upper(Str::random(2));

        // Ghép lại thành mã kho (10 ký tự: 1+3+4+2)
        $code = $prefix . $namePart . $datePart . $randomPart;

        // Đảm bảo mã không quá 10 ký tự
        $code = substr($code, 0, 10);

        // Kiểm tra xem mã đã tồn tại chưa, nếu có thì tạo lại
        while ($this->model->where('code', $code)->exists()) {
            $randomPart = Str::upper(Str::random(2));
            $code = $prefix . $namePart . $datePart . $randomPart;
            $code = substr($code, 0, 10);
        }

        return $code;
    }

    /**
     * Kiểm tra mã kho đã tồn tại chưa
     * 
     * @param string $code Mã kho cần kiểm tra
     * @param int|null $excludeId ID kho cần loại trừ (khi cập nhật)
     * @return bool
     */
    public function isWarehouseCodeExists($code, $excludeId = null)
    {
        $query = $this->model->where('code', $code);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Tạo kho mới
     *
     * @param array $data Dữ liệu kho
     * @return Warehouse
     */
    public function createWarehouse(array $data)
    {
        try {
            DB::beginTransaction();

            // Nếu không có mã kho, tạo mã tự động
            if (empty($data['code'])) {
                $data['code'] = $this->generateWarehouseCode($data['name'], $data['type'] ?? Warehouse::TYPE_SALES);
            } else {
                // Nếu có mã kho, kiểm tra xem đã tồn tại chưa
                if ($this->isWarehouseCodeExists($data['code'])) {
                    throw new Exception("Mã kho '{$data['code']}' đã tồn tại. Vui lòng chọn mã khác.");
                }

                // Đảm bảo mã kho không quá 10 ký tự
                if (strlen($data['code']) > 10) {
                    throw new Exception("Mã kho không được quá 10 ký tự.");
                }
            }

            // Đảm bảo trạng thái mặc định là active nếu không được chỉ định
            if (!isset($data['is_active'])) {
                $data['is_active'] = true;
            }

            $warehouse = $this->model->create($data);

            // Xóa cache liên quan để đảm bảo dữ liệu mới nhất
            Cache::forget('warehouses.active');
            Cache::forget('warehouses.type.' . $warehouse->type);
            Cache::forget('warehouses.active.type.' . $warehouse->type);

            DB::commit();
            return $warehouse;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Lỗi khi tạo kho: " . $e->getMessage());
        }
    }

    /**
     * Cập nhật kho
     *
     * @param int $id ID kho
     * @param array $data Dữ liệu cập nhật
     * @return Warehouse
     */
    public function updateWarehouse($id, array $data)
    {
        try {
            DB::beginTransaction();

            $warehouse = $this->model->findOrFail($id);

            // Nếu có thay đổi mã kho, kiểm tra xem đã tồn tại chưa
            if (isset($data['code']) && $data['code'] !== $warehouse->code) {
                if ($this->isWarehouseCodeExists($data['code'])) {
                    throw new Exception("Mã kho '{$data['code']}' đã tồn tại. Vui lòng chọn mã khác.");
                }

                // Đảm bảo mã kho không quá 10 ký tự
                if (strlen($data['code']) > 10) {
                    throw new Exception("Mã kho không được quá 10 ký tự.");
                }
            }

            $warehouse->update($data);

            // Xóa cache liên quan để đảm bảo dữ liệu mới nhất
            Cache::forget('warehouses.active');
            Cache::forget('warehouses.type.' . $warehouse->type);
            Cache::forget('warehouses.active.type.' . $warehouse->type);

            // Nếu có thay đổi loại kho, xóa thêm cache của loại mới
            if (isset($data['type']) && $data['type'] != $warehouse->type) {
                Cache::forget('warehouses.type.' . $data['type']);
                Cache::forget('warehouses.active.type.' . $data['type']);
            }

            DB::commit();
            return $warehouse;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Lỗi khi cập nhật kho: " . $e->getMessage());
        }
    }

    /**
     * Xóa mềm kho
     *
     * @param int $id ID kho
     * @return bool
     */
    public function softDeleteWarehouse($id)
    {
        try {
            DB::beginTransaction();

            $warehouse = $this->model->findOrFail($id);

            // Kiểm tra xem có giao dịch đang diễn ra không
            $hasActiveTransactions = $warehouse->transactions()
                ->where('status', WarehouseTransaction::STATUS_DRAFT) // STATUS_DRAFT
                ->exists();

            if ($hasActiveTransactions) {
                throw new Exception("Không thể xóa kho khi có giao dịch đang xử lý.");
            }

            // Kiểm tra tồn kho
            $hasStock = $warehouse->stocks()->where('quantity', '>', 0)->exists();
            if ($hasStock) {
                throw new Exception("Không thể xóa kho khi còn hàng tồn kho.");
            }

            // Tự động đánh dấu kho không hoạt động trước khi xóa mềm
            $warehouse->is_active = false;
            $warehouse->save();
            $result = $warehouse->delete();

            // Xóa cache liên quan để đảm bảo dữ liệu mới nhất
            Cache::forget('warehouses.active');
            Cache::forget('warehouses.type.' . $warehouse->type);
            Cache::forget('warehouses.active.type.' . $warehouse->type);

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Lỗi khi xóa mềm kho: " . $e->getMessage());
        }
    }

    /**
     * Khôi phục kho đã xóa mềm
     *
     * @param int $id ID kho
     * @return bool|mixed
     */
    public function restoreWarehouse($id)
    {
        try {
            DB::beginTransaction();
            // Lấy thông tin kho đã xóa
            $warehouse = $this->model->withTrashed()->findOrFail($id);
            $result = $warehouse->restore();

            // Xóa cache liên quan để đảm bảo dữ liệu mới nhất
            Cache::forget('warehouses.active');
            Cache::forget('warehouses.type.' . $warehouse->type);
            Cache::forget('warehouses.active.type.' . $warehouse->type);

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Lỗi khi khôi phục kho: " . $e->getMessage());
        }
    }

    /**
     * Lấy thông tin chi tiết kho
     *
     * @param int $id ID kho
     * @return Warehouse
     */
    public function getWarehouseById($id)
    {
        try {
            return $this->model->findOrFail($id);
        } catch (Exception $e) {
            throw new Exception("Không tìm thấy kho: " . $e->getMessage());
        }
    }

    /**
     * Lấy thông tin chi tiết kho theo mã
     *
     * @param string $code Mã kho
     * @return Warehouse
     */
    public function getWarehouseByCode($code)
    {
        try {
            $warehouse = $this->model->where('code', $code)->first();

            if (!$warehouse) {
                throw new Exception("Không tìm thấy kho với mã: {$code}");
            }

            return $warehouse;
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy thông tin kho: " . $e->getMessage());
        }
    }

    /**
     * Cập nhật trạng thái kho
     *
     * @param int $id ID kho
     * @param bool $isActive Trạng thái mới
     * @return Warehouse
     */
    public function updateWarehouseStatus($id, $isActive)
    {
        try {
            DB::beginTransaction();
            $warehouse = $this->model->findOrFail($id);
            // Nếu đang chuyển từ hoạt động sang không hoạt động, kiểm tra điều kiện
            if ($warehouse->is_active && !$isActive) {
                // Kiểm tra giao dịch đang xử lý
                $hasActiveTransactions = $warehouse->transactions()
                    ->where('status', WarehouseTransaction::STATUS_DRAFT)
                    ->exists();

                if ($hasActiveTransactions) {
                    throw new Exception("Không thể ngừng hoạt động kho khi có giao dịch đang xử lý.");
                }

                // Kiểm tra tồn kho
                $hasStock = $warehouse->stocks()->where('quantity', '>', 0)->exists();
                if ($hasStock) {
                    throw new Exception("Không thể ngừng hoạt động kho khi còn hàng tồn kho.");
                }
            }
            $result = $this->updateWarehouse($id, ['is_active' => $isActive]);

            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Lỗi khi cập nhật trạng thái kho: " . $e->getMessage());
        }
    }

    /**
     * Lấy danh sách kho đang hoạt động
     *
     * @return Collection
     */
    public function getActiveWarehouses()
    {
        try {
            return Cache::remember('warehouses.active', 300, function () {
                return $this->model->active()->get();
            });
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách kho đang hoạt động: " . $e->getMessage());
        }
    }

    /**
     * Lấy danh sách kho theo loại
     *
     * @param int $type Loại kho
     * @return Collection
     */
    public function getWarehousesByType($type)
    {
        try {
            return Cache::remember("warehouses.type.{$type}", 300, function () use ($type) {
                return $this->model->ofType($type)->get();
            });
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách kho theo loại: " . $e->getMessage());
        }
    }

    /**
     * Lấy danh sách kho đang hoạt động theo loại
     *
     * @param int $type Loại kho
     * @return Collection
     */
    public function getActiveWarehousesByType($type)
    {
        try {
            return Cache::remember("warehouses.active.type.{$type}", 300, function () use ($type) {
                return $this->model->active()->ofType($type)->get();
            });
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách kho đang hoạt động theo loại: " . $e->getMessage());
        }
    }

    /**
     * Lấy danh sách kho theo người quản lý
     *
     * @param int $managerId ID người quản lý
     * @return Collection
     */
    public function getWarehousesByManager($managerId)
    {
        try {
            return $this->model->where('manager_id', $managerId)->get();
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách kho theo người quản lý: " . $e->getMessage());
        }
    }

    /**
     * Lấy danh sách kho đã xóa mềm
     *
     * @return Collection
     */
    public function getTrashedWarehouses()
    {
        try {
            return $this->model->onlyTrashed()->get();
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách kho đã xóa: " . $e->getMessage());
        }
    }

    /**
     * Kiểm tra xem kho có đang hoạt động không
     *
     * @param int $id ID kho
     * @return bool
     */
    public function isWarehouseActive($id)
    {
        try {
            $warehouse = $this->model->findOrFail($id);
            return $warehouse->is_active;
        } catch (Exception $e) {
            throw new Exception("Lỗi khi kiểm tra trạng thái kho: " . $e->getMessage());
        }
    }

    /**
     * Kiểm tra xem kho có tồn tại không
     *
     * @param int $id ID kho
     * @return bool
     */
    public function warehouseExists($id)
    {
        return $this->model->where('id', $id)->exists();
    }

    /**
     * Đếm số lượng kho theo loại
     *
     * @param int $type Loại kho
     * @return int
     */
    public function countWarehousesByType($type)
    {
        try {
            return $this->model->ofType($type)->count();
        } catch (Exception $e) {
            throw new Exception("Lỗi khi đếm số lượng kho theo loại: " . $e->getMessage());
        }
    }

    /**
     * Đếm số lượng kho đang hoạt động
     *
     * @return int
     */
    public function countActiveWarehouses()
    {
        try {
            return $this->model->active()->count();
        } catch (Exception $e) {
            throw new Exception("Lỗi khi đếm số lượng kho đang hoạt động: " . $e->getMessage());
        }
    }

    /**
     * Lấy thông tin tổng quan về kho
     *
     * @return array
     */
    public function getWarehousesStatistics()
    {
        try {
            $totalWarehouses = $this->model->count();
            $activeWarehouses = $this->model->active()->count();
            $inactiveWarehouses = $this->model->where('is_active', false)->count();
            $salesWarehouses = $this->model->ofType(Warehouse::TYPE_SALES)->count();
            $returnsWarehouses = $this->model->ofType(Warehouse::TYPE_RETURNS)->count();
            $otherWarehouses  = $this->model->ofType(Warehouse::TYPE_OTHER)->count();

            return [
                'total' => $totalWarehouses,
                'active' => $activeWarehouses,
                'inactive' => $inactiveWarehouses,
                'sales' => $salesWarehouses,
                'returns' => $returnsWarehouses,
                'other' => $otherWarehouses
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy thông tin tổng quan về kho: " . $e->getMessage());
        }
    }

    /**
     * Lấy danh sách kho có tồn kho thấp
     *
     * @return Collection
     */
    public function getWarehousesWithLowStock()
    {
        try {
            return $this->model->whereHas('stocks', function ($query) {
                $query->whereRaw('quantity <= min_quantity');
            })->get();
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách kho có tồn kho thấp: " . $e->getMessage());
        }
    }

    /**
     * Lấy danh sách kho và số lượng sản phẩm trong kho
     *
     * @return Collection
     */
    public function getWarehousesWithProductCount()
    {
        try {
            return $this->model->withCount('stocks')->get();
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách kho và số lượng sản phẩm: " . $e->getMessage());
        }
    }

    /**
     * Tìm kiếm kho theo tên, mã hoặc địa chỉ
     *
     * @param string $keyword Từ khóa tìm kiếm
     * @return Collection
     */
    public function searchWarehouses($keyword)
    {
        try {
            return $this->model->where('name', 'like', "%{$keyword}%")
                ->orWhere('code', 'like', "%{$keyword}%")
                ->orWhere('address', 'like', "%{$keyword}%")
                ->get();
        } catch (Exception $e) {
            throw new Exception("Lỗi khi tìm kiếm kho: " . $e->getMessage());
        }
    }

    /**
     * Cập nhật người quản lý kho
     *
     * @param int $id ID kho
     * @param int $managerId ID người quản lý mới
     * @param string $managerName Tên người quản lý mới
     * @return Warehouse
     */
    public function updateWarehouseManager($id, $managerId, $managerName)
    {
        try {
            DB::beginTransaction();
            $warehouse = $this->model->findOrFail($id);
            $warehouse->update([
                'manager_id' => $managerId,
                'manager_name' => $managerName
            ]);
            // Xóa cache liên quan để đảm bảo dữ liệu mới nhất
            Cache::forget('warehouses.active');
            Cache::forget('warehouses.type.' . $warehouse->type);
            Cache::forget('warehouses.active.type.' . $warehouse->type);
            DB::commit();
            return $warehouse;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Lỗi khi cập nhật người quản lý kho: " . $e->getMessage());
        }
    }

    /**
     * Kiểm tra xem kho có đang được sử dụng trong giao dịch nào không
     *
     * @param int $id ID kho
     * @return bool
     */
    public function isWarehouseInUse($id)
    {
        try {
            $warehouse = $this->model->findOrFail($id);
            return $warehouse->transactions()->exists() || $warehouse->stocks()->exists();
        } catch (Exception $e) {
            throw new Exception("Lỗi khi kiểm tra kho đang sử dụng: " . $e->getMessage());
        }
    }
}
