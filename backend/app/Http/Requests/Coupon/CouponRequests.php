<?php

namespace App\Http\Requests\Coupon;

use Illuminate\Foundation\Http\FormRequest;

class CouponRequests extends FormRequest
{
    public function authorize()
    {
        return true;
    }   
    public function rules()
    {
        return [
            'coupon_id' => 'required',

            'user_id' => 'required',
        ];
    }
}