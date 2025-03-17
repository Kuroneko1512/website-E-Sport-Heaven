<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo super admin
        $superAdminUser = User::create([
            'email' => 'superadmin@example.com',
            'name' => 'SuperAdmin',
            'password' => Hash::make('password'),
            'account_type' => 'admin',
            'is_active' => true,
        ]);

        // Tạo thông tin chi tiết cho super admin trong bảng admins
        Admin::create([
            'user_id' => $superAdminUser->id,
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'position' => 'Super Administrator',
            'department' => 'Administration',
            'status' => 'active',
        ]);

        // Tạo admin
        $adminUser = User::create([
            'email' => 'admin@example.com',
            'name' => 'Admin',
            'password' => Hash::make('password'),
            'account_type' => 'admin',
            'is_active' => true,
        ]);

        // Tạo thông tin chi tiết cho admin trong bảng admins
        Admin::create([
            'user_id' => $adminUser->id,
            'first_name' => 'Regular',
            'last_name' => 'Admin',
            'position' => 'Administrator',
            'department' => 'Operations',
            'status' => 'active',
        ]);
    }
}
