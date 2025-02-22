<?php

namespace Database\Seeders;

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
        // Create Super Admin
        Admin::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('super@admin123'),
                'position' => 'Super Administrator',
                'department' => 'Management',
                'status' => 'active'
            ]
        )->assignRole('super_admin');

        // Create Admin
        Admin::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin@123'),
                'position' => 'Administrator',
                'department' => 'Operations',
                'status' => 'active'
            ]
        )->assignRole('admin');

        // Nhân viên bán hàng
        Admin::firstOrCreate(
            ['email' => 'sales@esport.com'],
            [
                'name' => 'Sales Staff',
                'password' => Hash::make('sales@123'),
                'position' => 'Sales Executive',
                'department' => 'Sales',
                'status' => 'active'
            ]
        )->assignRole('sales');

        // Nhân viên kho
        Admin::firstOrCreate(
            ['email' => 'warehouse@esport.com'],
            [
                'name' => 'Warehouse Staff',
                'password' => Hash::make('warehouse@123'),
                'position' => 'Warehouse Manager',
                'department' => 'Warehouse',
                'status' => 'active'
            ]
        )->assignRole('warehouse');

        // Content Manager
        Admin::firstOrCreate(
            ['email' => 'content@esport.com'],
            [
                'name' => 'Content Manager',
                'password' => Hash::make('content@123'),
                'position' => 'Content Manager',
                'department' => 'Marketing',
                'status' => 'active'
            ]
        )->assignRole('content');

        // Customer Service
        Admin::firstOrCreate(
            ['email' => 'cs@esport.com'],
            [
                'name' => 'Customer Service',
                'password' => Hash::make('cs@123'),
                'position' => 'CS Executive',
                'department' => 'Customer Service',
                'status' => 'active'
            ]
        )->assignRole('customer_service');
    }
}
