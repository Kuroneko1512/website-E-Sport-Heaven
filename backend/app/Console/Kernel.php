<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */


    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();



        // $schedule->command('orders:auto-complete')->dailyAt('01:00');
        $schedule->command('orders:auto-complete')->everyMinute();
        $schedule->command('orders:cancel-expired')->everyMinute();
//        $schedule->job(new \App\Jobs\Mail\User\SendWarningWislistEmail())->everyTenMinutes();
        $schedule->command('wishlist:send-warning-emails')->dailyAt('09:00');
        $schedule->command('coupons:deactivate')->everyMinute();

    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
