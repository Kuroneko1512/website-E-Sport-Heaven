<?php

namespace App\Http\Controllers\Api\Admin\V1;

use App\Models\Admin;
use Exception;
use Carbon\Carbon;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Jobs\Mail\Order\NewOrderJob;
use App\Services\Order\OrderService;
use App\Http\Requests\Order\OrderStoreRequest;


class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index(Request $request)
    {
        $paginate = $request -> input('paginate', 15);
        $search = $request -> input('search', '');
        try {
            // Gọi service để lấy dữ liệu
            $Product = $this->orderService->getOrderAll($paginate, $search);
            return response()->json([
                'status' => 200,
                'data' => $Product, // Trả về dữ liệu thuộc tính
            ], 200);
        } catch (\Throwable $th) {
            // Trường hợp có lỗi xảy ra khi lấy dữ liệu
            return response()->json([
                'error' => 'lấy thất bại',
                'mess' => $th,
                'status' => 500
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
        }
    }
    // public function store(OrderStoreRequest $request)
    // {

    //     DB::beginTransaction();
    //     try {

    //         // Validate và lấy dữ liệu từ request
    //         $data = $request->validated();
    //         //tạo sp
    //         $Order = $this->orderService->createOrder($data);
    //         if ($data['payment_method'] === 'vnpay') {
    //             $vnpUrl = $this->payment($Order, $request->ip());

    //             DB::commit();
    //             return response()->json([
    //                 'message' => 'URL thanh toán VNPay đã được tạo thành công!',
    //                 'vnpUrl'  => $vnpUrl, // Trả về URL để chuyển hướng người dùng
    //             ], 200); // Trả về 200 OK với URL VNPay
    //         }

    //         // Tải lại đơn hàng với các quan hệ để gửi email
    //         $orderWithRelations = $this->orderService->getOrderById($Order->id);

    //         NewOrderJob::dispatch($orderWithRelations); // gửi mail với jobs và queue

    //         DB::commit();
    //         $this->orderService->updateStockForOrder($Order->order_code);
    //         return response()->json([
    //             'message' => 'Order đã được tạo thành công!', // Thông báo thành công
    //             'data' => $Order
    //         ], 201); // Trả về mã thành công 201 (Created)

    //     } catch (Exception $e) {
    //         DB::rollBack();
    //         // Trường hợp có lỗi xảy ra khi tạo thuộc tính
    //         return response()->json([
    //             'message' => 'Lỗi khi xử lý dữ liệu.',
    //             'error' => $e->getMessage(), // Lỗi cụ thể
    //             'status' => 500
    //         ], 500); // Trả về mã lỗi 500 (Internal Server Error)
    //     }
    // }


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

    /**
     * Hiển thị chi tiết đơn hàng theo mã đơn hàng
     *
     * @param string $orderCode Mã đơn hàng
     * @return \Illuminate\Http\JsonResponse
     */
    public function showOrderByCode(string $orderCode)
    {
        try {
            // Gọi service để lấy thông tin chi tiết đơn hàng
            $order = $this->orderService->getOrderByCode($orderCode);
            // Log::info('Show order : ' . json_encode($order));

            return response()->json([
                'message' => 'Order details retrieved successfully',
                'data' => $order,
                'status' => 200
            ], 200); // 200 OK
        } catch (Exception $e) {
            Log::error('Error fetching order by code: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'order_code' => $orderCode
            ]);

            return response()->json([
                'message' => 'Error processing request',
                'error' => $e->getMessage()
            ], 500); // 500 Internal Server Error
        }
    }

    public function getOrdersWithReturnRequests()
    {
        try {
            // Gọi service để lấy thông tin chi tiết thuộc tính
            $order = $this->orderService->getOrderReturn();
            Log::info('Order return request : ' . json_encode($order));

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
            'status' => 'nullable|integer|in:' . implode(',', [
                    Order::STATUS_PENDING,
                    Order::STATUS_CONFIRMED,
                    Order::STATUS_PREPARING,
                    Order::STATUS_READY_TO_SHIP,
                    Order::STATUS_SHIPPING,
                    Order::STATUS_DELIVERED,
                    Order::STATUS_COMPLETED,
                    Order::STATUS_RETURN_REQUESTED,
                    Order::STATUS_RETURN_PROCESSING,
                    Order::STATUS_RETURN_COMPLETED,
                    Order::STATUS_RETURN_REJECTED,
                    Order::STATUS_RETURN_TO_SHOP,
                    Order::STATUS_CANCELLED
                ])
        ]);

        $userId = auth()->user()->id;
        $adminId = Admin::where('user_id', $userId)->value('id');

        $result = $this->orderService->updateStatus($id, $request->status, $adminId);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 404);
        }

        return response()->json([
            'message' => $result['message'],
            'data' => $result['data']
        ]);
    }

    public function getOrderUserReturn($id)
    {
        try {
            // Gọi service để lấy thông tin chi tiết thuộc tính
            $order = $this->orderService->getOrderUserReturn($id);
            Log::info('Order return  : ' . json_encode($order));

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


    // private function payment($data, $ip)
    // {
    //     Log::info('vnpay', [
    //         'data' => $data,
    //         'ip' => $ip,
    //     ]);
    //     $vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    //     $vnp_Returnurl =  env('VNP_RETURN_URL');
    //     $vnp_TmnCode = "NJJ0R8FS"; // Merchant code at VNPAY
    //     $vnp_HashSecret = "BYKJBHPPZKQMKBIBGGXIYKWYFAYSJXCW"; // Secret key

    //     $vnp_TxnRef = $data['order_code']; // Transaction reference (unique per order)
    //     $vnp_OrderInfo = 'Thanh toán đơn hàng test'; // Order information
    //     $vnp_OrderType = 'other';
    //     $vnp_Amount = ($data['total_amount']) * 100; // Amount in VND (VNPAY expects amount in cents)
    //     $vnp_Locale = 'vn'; // Locale

    //     $vnp_IpAddr = $ip; // Use Laravel's request to get IP

    //     // Prepare input data
    //     $inputData = [
    //         "vnp_Version" => "2.1.0",
    //         "vnp_TmnCode" => $vnp_TmnCode,
    //         "vnp_Amount" => $vnp_Amount,
    //         "vnp_Command" => "pay",
    //         "vnp_CreateDate" => Carbon::now('Asia/Ho_Chi_Minh')->format('YmdHis'),
    //         "vnp_CurrCode" => "VND",
    //         "vnp_IpAddr" => $vnp_IpAddr,
    //         "vnp_Locale" => $vnp_Locale,
    //         "vnp_OrderInfo" => $vnp_OrderInfo,
    //         "vnp_OrderType" => $vnp_OrderType,
    //         "vnp_ReturnUrl" => $vnp_Returnurl,
    //         "vnp_TxnRef" => $vnp_TxnRef,
    //     ];

    //     // Optional fields
    //     if (!empty($vnp_BankCode)) {
    //         $inputData['vnp_BankCode'] = $vnp_BankCode;
    //     } else {
    //         // Bỏ qua mã ngân hàng và để VNPAY tự động chọn
    //         unset($inputData['vnp_BankCode']);
    //     }


    //     // Sort parameters by key
    //     ksort($inputData);

    //     // Build the query string and hashdata for signature
    //     $queryString = "";
    //     $hashdata = "";
    //     $i = 0;
    //     foreach ($inputData as $key => $value) {
    //         if ($i == 1) {
    //             $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
    //         } else {
    //             $hashdata .= urlencode($key) . "=" . urlencode($value);
    //             $i = 1;
    //         }
    //         $queryString .= urlencode($key) . "=" . urlencode($value) . '&';
    //     }

    //     // Remove trailing '&' from the query string
    //     $queryString = rtrim($queryString, '&');

    //     // Now calculate the secure hash using the secret key
    //     $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);

    //     // Append the secure hash to the query string
    //     $vnp_Url .= "?" . $queryString . "&vnp_SecureHash=" . $vnpSecureHash;

    //     return $vnp_Url;
    // }

}
