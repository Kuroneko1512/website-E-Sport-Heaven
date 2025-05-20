<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::where('email', '!=', 'superadmin@example.com')
        ->where('account_type', 'customer')
        ->get();
      
        return response()->json(data: $users, status: 200);
    }
    public function updateStatus(Request $request, $id){
        $user = User::find($id);
        $user->is_active  == 0 ? $user->is_active = 1 : $user->is_active = 0;
        $user->save();
        return response()->json(data: $user, status: 200);
    }
}
