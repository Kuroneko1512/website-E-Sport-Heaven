<?php

namespace App\Http\Controllers\Api\Payment;

use App\Http\Controllers\Controller;
use App\Services\Order\OrderService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }
    // public function createPayment(Request $request)
    // {

    //     $vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    //     $vnp_Returnurl =  env('VNP_RETURN_URL');
    //     $vnp_TmnCode = "NJJ0R8FS"; // Merchant code at VNPAY
    //     $vnp_HashSecret = "BYKJBHPPZKQMKBIBGGXIYKWYFAYSJXCW"; // Secret key

    //     $vnp_TxnRef = time(); // Transaction reference (unique per order)
    //     $vnp_OrderInfo = 'Thanh toán đơn hàng test'; // Order information
    //     $vnp_OrderType = 'other';
    //     $vnp_Amount = 121029 * 100; // Amount in VND (VNPAY expects amount in cents)
    //     $vnp_Locale = 'vn'; // Locale

    //     $vnp_IpAddr = $request->ip(); // Use Laravel's request to get IP

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

    //     return response()->json(['vnpUrl' => $vnp_Url]);
    // }

    public function vnpayReturn(Request $request)
    {
        $vnp_HashSecret = 'BYKJBHPPZKQMKBIBGGXIYKWYFAYSJXCW';
        $inputData = $request->query();
        $vnpSecureHash = $inputData['vnp_SecureHash'] ?? '';

        unset($inputData['vnp_SecureHash']);
        unset($inputData['vnp_SecureHashType']);
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
        $secureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);

        // Append the secure hash to the query string
        // ksort($inputData);
        // $hashData = urldecode(http_build_query($inputData, '', '&'));

        // $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
        // $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
        // $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
        if ($secureHash === $vnpSecureHash) {
            $orderCode = $request->query('vnp_TxnRef'); // Lấy mã đơn hàng từ query

            if ($request->query('vnp_ResponseCode') === "00") {
                // Giao dịch thành công
                $this->orderService->updatePaymentStatus($orderCode, 'đã thanh toán'); // Cập nhật trạng thái thành công

                // Chuyển hướng đến trang "ThankYou" với orderCode
                return redirect()->away(env('FRONTEND_URL') . "/thankyou?orderCode={$orderCode}");
            } else {
                // Giao dịch thất bại: Xóa đơn hàng và chuyển hướng người dùng về trang "Checkout"
                $this->orderService->deleteOrder($orderCode); // Xóa đơn hàng thất bại
                return redirect()->away(env('FRONTEND_URL') . "/checkout?error=payment_failed"); // Chuyển hướng về checkout kèm thông báo lỗi
            }
        } else {
            return response()->json(['message' => 'Chữ ký không hợp lệ!'], 400); // Trường hợp chữ ký sai
        }
    }
}
