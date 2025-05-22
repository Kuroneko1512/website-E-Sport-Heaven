<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Coupon;
class DeactivateExpiredCoupons extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'coupons:deactivate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Coupon::where('end_date', '<', now())->update(['is_active' => 1]);
    }
}
