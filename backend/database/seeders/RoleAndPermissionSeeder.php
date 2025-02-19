<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo roles
        $superAdmin = Role::create(['name' => 'super_admin', 'guard_name' => 'admin']);
        $admin = Role::create(['name' => 'admin', 'guard_name' => 'admin']);
        $staff = Role::create(['name' => 'staff', 'guard_name' => 'admin']);

        // Tạo permissions
        Permission::create(['name' => 'manage_admins', 'guard_name' => 'admin']);
        Permission::create(['name' => 'manage_roles', 'guard_name' => 'admin']);
        Permission::create(['name' => 'view_logs', 'guard_name' => 'admin']);
        // Thêm các permission khác...

        // Gán permissions cho roles
        $superAdmin->givePermissionTo(Permission::all());
        $admin->givePermissionTo(['manage_roles', 'view_logs']);
    }
}
