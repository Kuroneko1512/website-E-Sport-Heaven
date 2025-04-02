<?php

namespace Database\Seeders;

use App\Enums\RolesEnum;
use App\Models\Admin;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
class GiveRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::where('email', 'Customer@example.com')->first()?->removeRole('admin');
         // Tạo admin
        $customerUser = User::create([
            'email' => 'Customer@example.com',
            'name' => 'Customer',
            'password' => Hash::make('password'),
            'is_active' => true,
            'email_verified_at'=> now(),
        ]);

        // Tạo thông tin chi tiết cho admin trong bảng admins
        Customer::create([
            'user_id' => $customerUser->id,
            'first_name' => 'First',
            'last_name' => 'Customer',
            'gender' => 'other',
            'birthdate' => '1998-01-01',
        ]);

        // Gán role cho user
        User::where('email', 'Customer@example.com')->where('account_type', 'customer')->first()?->assignRole(RolesEnum::Customer->value);
    }
}
