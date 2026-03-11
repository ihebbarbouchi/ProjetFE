<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@edushare.com'],
            [
                'name'     => 'Super Admin',
                'email'    => 'admin@edushare.com',
                'password' => 'admin123',
                'role'     => 'super-admin',
            ]
        );

        echo "Super Admin created! Email: admin@edushare.com / Password: admin123\n";
    }
}
