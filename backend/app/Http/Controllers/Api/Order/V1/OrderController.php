<?php

namespace App\Http\Controllers\Api\Order\V1;

use App\Http\Requests\Order\OrderStoreRequest;
use App\Services\Order\OrderService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Jobs\Mail\Order\NewOrderJob;
use App\Models\Order;
use App\Models\OrdersUserReturnImage;
use App\Models\OrderHistory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\OrderUserReturn;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function store(OrderStoreRequest $request)
    {

        DB::beginTransaction();
        try {

            // Validate và lấy dữ liệu từ request
            $data = $request->validated();
            Log::info('data', $data);
            //tạo sp
            $Order = $this->orderService->createOrder($data);
            // Thanh toán vn pay sẽ xử lý ở PaymentController
            if ($data['payment_method'] === 'vnpay') {
                $vnpUrl = $this->payment($Order, $request->ip());
                
                OrderHistory::createHistory(
                    $Order->id,
                    OrderHistory::ACTION_ORDER_UPDATED,
                    [
                        'status_to' => $Order->status,
                        'notes' => 'Cập nhật url VNPay',
                        'metadata' => [
                            'total_amount' => $Order->total_amount,
                            'payment_method' => $Order->payment_method ?? 'unknown',
                            'items_count' => $Order->orderItems->count(),
                            'vnpay_url' => $vnpUrl,
                            'expire_date' => $Order->payment_expire_at,
                        ]
                    ]
                );

                DB::commit();
                return response()->json([
                    'message' => 'URL thanh toán VNPay đã được tạo thành công!',
                    'vnpUrl'  => $vnpUrl, // Trả về URL để chuyển hướng người dùng
                ], 200); // Trả về 200 OK với URL VNPay 
            }

            // Tải lại đơn hàng với các quan hệ để gửi email
            $orderWithRelations = $this->orderService->getOrderById($Order->id);

            NewOrderJob::dispatch($orderWithRelations); // gửi mail với jobs và queue

            DB::commit();
            $this->orderService->updateStockForOrder($Order->order_code);
            return response()->json([
                'message' => 'Order đã được tạo thành công!', // Thông báo thành công
                'data' => $Order
            ], 201); // Trả về mã thành công 201 (Created)

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error creating order: ' . $e->getMessage());
            // Trường hợp có lỗi xảy ra khi tạo thuộc tính
            return response()->json([
                'message' => 'Order creation failed.',
                'error' => $e->getMessage(), // Lỗi cụ thể
                'status' => 500
            ], 500); // Trả về mã lỗi 500 (Internal Server Error)
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
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|integer',
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        Log::info('updateStatus', [
            'request' => $request->all(),
            'id' => $id,
        ]);

        $customerId = $request->customer_id;

        $result = $this->orderService->updateStatus($id, $request->status, null, $customerId);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 404);
        }

        return response()->json([
            'message' => $result['message'],
            'data' => $result['data']
        ]);
    }
    private function payment($data, $ip): string
    {
        Log::info('vnpay', [
            'data' => $data,
            'ip' => $ip,
        ]);
        $expireMinutes = config('time.vnpay_payment_expire_minutes');
        $expireDate = Carbon::now('Asia/Ho_Chi_Minh')->addMinutes($expireMinutes);

        $vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        $vnp_Returnurl =  env('VNP_RETURN_URL');
        $vnp_TmnCode = "NJJ0R8FS"; // Merchant code at VNPAY
        $vnp_HashSecret = "BYKJBHPPZKQMKBIBGGXIYKWYFAYSJXCW"; // Secret key
        $vnp_ExpireDate = $expireDate->format('YmdHis'); // thời gian hết hạn thanh toán 
        $vnp_TxnRef = $data['order_code']; // Transaction reference (unique per order)
        $vnp_OrderInfo = 'Thanh toán đơn hàng test'; // Order information
        $vnp_OrderType = 'other';
        $vnp_Amount = ($data['total_amount']) * 100; // Amount in VND (VNPAY expects amount in cents)
        $vnp_Locale = 'vn'; // Locale

        $vnp_IpAddr = $ip; // Use Laravel's request to get IP

        // Prepare input data
        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => Carbon::now('Asia/Ho_Chi_Minh')->format('YmdHis'),
            "vnp_ExpireDate" => $vnp_ExpireDate,
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        // Optional fields
        if (!empty($vnp_BankCode)) {
            $inputData['vnp_BankCode'] = $vnp_BankCode;
        } else {
            // Bỏ qua mã ngân hàng và để VNPAY tự động chọn
            unset($inputData['vnp_BankCode']);
        }


        // Sort parameters by key
        ksort($inputData);

        // Build the query string and hashdata for signature
        $queryString = "";
        $hashdata = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $queryString .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        // Remove trailing '&' from the query string
        $queryString = rtrim($queryString, '&');

        // Now calculate the secure hash using the secret key
        $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);

        // Append the secure hash to the query string
        $vnp_Url .= "?" . $queryString . "&vnp_SecureHash=" . $vnpSecureHash;

        return $vnp_Url;
    }

    public function myOrders(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'message' => 'Người dùng chưa đăng nhập',
                    'status' => 401
                ], 401);
            }

            // Lấy các tham số tìm kiếm từ request
            $searchParams = [
                'order_code' => $request->input('order_code'),
                'product_name' => $request->input('product_name')
            ];

            // Lấy số lượng kết quả mỗi trang
            $perPage = $request->input('per_page', 10);

            // Gọi service để lấy dữ liệu với tham số tìm kiếm và phân trang
            $orders = $this->orderService->getOrdersByUser($user, $searchParams, $perPage);

            return response()->json([
                'message' => 'Lấy danh sách đơn hàng thành công',
                'data' => $orders,
                'status' => 200
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu',
                'error' => $th->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Lấy chi tiết một đơn hàng của khách hàng đang đăng nhập
     *
     * @param Request $request
     * @param string $orderCode Mã đơn hàng
     * @return \Illuminate\Http\JsonResponse
     */
    public function myOrderDetail(Request $request, $orderCode)
    {
        try {
            $user = $request->user();

            if (!$user || $user->account_type !== 'customer' || !$user->customer) {
                return response()->json([
                    'message' => 'Không có quyền truy cập',
                    'status' => 403
                ], 403);
            }

            // Lấy thông tin đơn hàng
            $order = $this->orderService->getOrderByCode($orderCode);

            // Kiểm tra xem đơn hàng có thuộc về khách hàng này không
            if ($order->customer_id !== $user->customer->id) {
                return response()->json([
                    'message' => 'Không có quyền truy cập đơn hàng này',
                    'status' => 403
                ], 403);
            }

            return response()->json([
                'message' => 'Lấy thông tin đơn hàng thành công',
                'data' => $order,
                'status' => 200
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu',
                'error' => $th->getMessage(),
                'status' => 500
            ], 500);
        }
    }
    public function orderUserReturn(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id|unique:orders_user_return,order_id',
            'order_item_id' => 'nullable|exists:order_items,id',
            'reason' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'images' => 'required|array|max:5|min:1',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'refund_bank_account' => 'nullable|string|max:255',
            'refund_bank_name' => 'nullable|string|max:255',
            'refund_bank_customer_name' => 'nullable|string|max:255',
            'refund_amount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $data = $validator->validated();

            $data['status'] = OrderUserReturn::STATUS_PENDING;

            $orderReturn = OrderUserReturn::create($data);

            // Cập nhật trạng thái đơn hàng
            $this->orderService->updateStatus(
                $data['order_id'],
                Order::STATUS_RETURN_REQUESTED,
                null,
                3
            );

            // Xử lý lưu nhiều ảnh (nếu có)
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $imagePath = $image->store('returns', 'public');
                    OrdersUserReturnImage::create([
                        'return_id' => $orderReturn->id,
                        'image_path' => $imagePath,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Tạo yêu cầu đổi/trả thành công',
                'data' => $orderReturn->load('images') // trả về kèm ảnh
            ], 201);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi xử lý dữ liệu',
                'error' => $th->getMessage(),
                'status' => 500
            ], 500);
        }
    }



    // Lấy thông tin đơn hàng
}
