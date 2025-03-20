<?php

namespace App\Http\Controllers\Api\Order\V1;

use Exception;
use Illuminate\Http\Request;
use App\Mail\Order\AdminOrderMail;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Services\Order\OrderService;
use Illuminate\Support\Facades\Mail;
use App\Mail\Order\CustomerOrderMail;
use App\Http\Requests\Order\OrderStoreRequest;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }
    public function index()
    {
        try {
            // Gọi service để lấy dữ liệu
            $Product = $this->orderService->getOrderAll();
            return response()->json([
                'status' => 200,
                'data' => $Product, // Trả về dữ liệu thuộc tính
            ], 200);
        } catch (\Throwable $th) {
            // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'errnor' => 'lấy thất bại',
                'mess' => $th,
                'status' => 500
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function store(OrderStoreRequest $request)
    {

        DB::beginTransaction();
        try {

            // Validate và lấy dữ liệu từ request
            $data = $request->validated();
            //tạo sp
            $Order = $this->orderService->createOrder($data);

            // Tải lại đơn hàng với các quan hệ để gửi email
            $orderWithRelations = $this->orderService->getOrderById($Order->id);

            // Gửi email cho khách hàng
            if ($orderWithRelations->customer_email) {
                Mail::to($orderWithRelations->customer_email)->send(new CustomerOrderMail($orderWithRelations));
            }

            // Gửi email cho admin
            Mail::to('sportheavenwd66@gmail.com')->send(new AdminOrderMail($orderWithRelations));

            DB::commit();
            return response()->json([
                'message' => 'Order đã được tạo thành công!', // Thông báo thành công
                'data' => $Order
            ], 201); // Trả về mã thành công 201 (Created)

        } catch (Exception $e) {
            DB::rollBack();
            // Trường hợp có lỗi xảy ra khi tạo thuộc tính
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage(), // Lỗi cụ thể
                'status' => 500
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    public function show(string $id)
    {
        try {
            // Gọi service để lấy thông tin chi tiết thuộc tính
            $order = $this->orderService->getOrderById($id);
            return response()->json([
                'message' => 'lấy thành công', // Thông báo thành công
                'data' => $order, // Dữ liệu thuộc tính chi tiết
                'status' => 200 // Trả về mã trạng thái 200 (OK)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function showOrderBycode(string $code)
    {
        try {
            // Gọi service để lấy thông tin chi tiết thuộc tính
            $order = $this->orderService->getOrderByCode($code);
            return response()->json([
                'message' => 'lấy thành công', // Thông báo thành công
                'data' => $order, // Dữ liệu thuộc tính chi tiết
                'status' => 200 // Trả về mã trạng thái 200 (OK)
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        $result = $this->orderService->updateStatus($id, $request->status);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 404);
        }

        return response()->json([
            'message' => $result['message'],
            'data' => $result['data']
        ]);
    }
}
