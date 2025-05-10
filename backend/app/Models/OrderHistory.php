<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderHistory extends Model
{
    use HasFactory;

    // Các loại người thực hiện
    const ACTOR_TYPE_SYSTEM = 0;
    const ACTOR_TYPE_ADMIN = 1;
    const ACTOR_TYPE_CUSTOMER = 2;

    // Các loại hành động
    const ACTION_ORDER_CREATED = 0;       // Tạo đơn hàng
    const ACTION_ORDER_UPDATED = 1;       // Cập nhật đơn hàng
    const ACTION_STATUS_UPDATED = 2;      // Cập nhật trạng thái
    const ACTION_PAYMENT_UPDATED = 3;     // Cập nhật thanh toán
    const ACTION_SHIPPING_UPDATED = 4;    // Cập nhật vận chuyển
    const ACTION_RETURN_REQUESTED = 5;    // Yêu cầu hoàn hàng
    const ACTION_RETURN_APPROVED = 6;     // Duyệt hoàn hàng
    const ACTION_RETURN_REJECTED = 7;     // Từ chối hoàn hàng
    const ACTION_RETURN_COMPLETED = 8;    // Hoàn tất hoàn hàng
    const ACTION_REFUND_PROCESSED = 9;    // Xử lý hoàn tiền
    const ACTION_EXCHANGE_PROCESSED = 10; // Xử lý đổi hàng
    const ACTION_ORDER_CANCELLED = 11;    // Hủy đơn hàng
    const ACTION_NOTE_ADDED = 12;         // Thêm ghi chú
    const ACTION_CUSTOMER_CONTACTED = 13; // Liên hệ khách hàng

    // Nhãn hiển thị cho các loại
    public static $actorTypeLabels = [
        self::ACTOR_TYPE_SYSTEM => 'Hệ thống',
        self::ACTOR_TYPE_ADMIN => 'Quản trị viên',
        self::ACTOR_TYPE_CUSTOMER => 'Khách hàng'
    ];

    public static $actionTypeLabels = [
        self::ACTION_ORDER_CREATED => 'Tạo đơn hàng',
        self::ACTION_ORDER_UPDATED => 'Cập nhật đơn hàng',
        self::ACTION_STATUS_UPDATED => 'Cập nhật trạng thái',
        self::ACTION_PAYMENT_UPDATED => 'Cập nhật thanh toán',
        self::ACTION_SHIPPING_UPDATED => 'Cập nhật vận chuyển',
        self::ACTION_RETURN_REQUESTED => 'Yêu cầu hoàn hàng',
        self::ACTION_RETURN_APPROVED => 'Duyệt hoàn hàng',
        self::ACTION_RETURN_REJECTED => 'Từ chối hoàn hàng',
        self::ACTION_RETURN_COMPLETED => 'Hoàn tất hoàn hàng',
        self::ACTION_REFUND_PROCESSED => 'Xử lý hoàn tiền',
        self::ACTION_EXCHANGE_PROCESSED => 'Xử lý đổi hàng',
        self::ACTION_ORDER_CANCELLED => 'Hủy đơn hàng',
        self::ACTION_NOTE_ADDED => 'Thêm ghi chú',
        self::ACTION_CUSTOMER_CONTACTED => 'Liên hệ khách hàng'
    ];

    protected $fillable = [
        'order_id',
        'actor_type',
        'admin_id',
        'customer_id',
        'actor_name',
        'actor_email',
        'actor_role',
        'status_from',
        'status_to',
        'order_status',
        'action_type',
        'notes',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Accessor để lấy nhãn loại
    public function getActorTypeLabelAttribute()
    {
        return self::$actorTypeLabels[$this->actor_type] ?? 'Unknown';
    }

    public function getActionTypeLabelAttribute()
    {
        return self::$actionTypeLabels[$this->action_type] ?? 'Unknown';
    }

    public function getOrderStatusLabelAttribute()
    {
        if ($this->order_status === null) {
            return 'Unknown';
        }

        return Order::$statusLabels[$this->order_status] ?? 'Unknown';
    }

    /**
     * Quan hệ với bảng orders
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Quan hệ với bảng admins (không ràng buộc)
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id')->withDefault([
            'first_name' => $this->actor_name,
            'last_name' => '',
        ]);
    }

    /**
     * Quan hệ với bảng customers (không ràng buộc)
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id')->withDefault([
            'first_name' => $this->actor_name,
            'last_name' => '',
        ]);
    }

    /**
     * Tạo bản ghi lịch sử đơn hàng
     * 
     * @param int $orderId ID đơn hàng
     * @param int $actionType Loại hành động
     * @param array $data Dữ liệu bổ sung
     * @return OrderHistory
     */
    public static function createHistory($orderId, $actionType, $data = [])
    {
        $history = new self();
        $history->order_id = $orderId;
        $history->action_type = $actionType;

        // Xử lý thông tin người thực hiện
        if (isset($data['admin_id'])) {
            $admin = Admin::find($data['admin_id']);
            if ($admin) {
                $history->actor_type = self::ACTOR_TYPE_ADMIN;
                $history->admin_id = $admin->id;

                // Lấy thông tin từ bảng Admin và User liên kết
                $user = $admin->user;
                $history->actor_name = $admin->first_name . ' ' . $admin->last_name;
                $history->actor_email = $user ? $user->email : null;

                // Lấy vai trò từ user (sử dụng HasRoles trait)
                if ($user && method_exists($user, 'getRoleNames')) {
                    $history->actor_role = $user->getRoleNames()->first();
                } else {
                    $history->actor_role = $admin->position;
                }
            }
        } elseif (isset($data['customer_id'])) {
            $customer = Customer::find($data['customer_id']);
            if ($customer) {
                $history->actor_type = self::ACTOR_TYPE_CUSTOMER;
                $history->customer_id = $customer->id;

                // Lấy thông tin từ bảng Customer và User liên kết
                $user = $customer->user;
                $history->actor_name = $customer->first_name . ' ' . $customer->last_name;
                $history->actor_email = $user ? $user->email : null;

                // Thêm thông tin về hạng khách hàng (tương đương với role của admin)
                $history->actor_role = $customer->customer_rank; // Lưu hạng khách hàng vào trường actor_role
            }
        } elseif (isset($data['actor_name'])) {
            $history->actor_name = $data['actor_name'];
            $history->actor_email = $data['actor_email'];
            $history->actor_type = self::ACTOR_TYPE_CUSTOMER;
        } else {
            $history->actor_type = self::ACTOR_TYPE_SYSTEM;
            $history->actor_name = 'System';
        }

        // Xử lý thông tin trạng thái
        if (isset($data['status_from'])) {
            $history->status_from = $data['status_from'];
        }

        if (isset($data['status_to'])) {
            $history->status_to = $data['status_to'];
        }

        // Lấy tên trạng thái hiện tại của đơn hàng
        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                // Lưu tên trạng thái (label) thay vì giá trị số
                $history->order_status = Order::$statusLabels[$order->status];
            }
        }

        // Xử lý ghi chú
        if (isset($data['notes'])) {
            $history->notes = $data['notes'];
        }

        // Xử lý metadata
        if (isset($data['metadata'])) {
            $history->metadata = $data['metadata'];
        }

        $history->save();

        return $history;
    }
}
