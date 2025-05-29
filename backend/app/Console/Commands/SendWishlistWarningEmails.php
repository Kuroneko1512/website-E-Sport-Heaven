<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\Mail\User\SendWarningWislistEmail;
use Exception;
use Illuminate\Support\Facades\Log;

class SendWishlistWarningEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wishlist:send-warning-emails';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send warning emails to users when wishlist items are low in stock';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Dispatching wishlist warning email job...');

        try {
            // Dispatch job to queue (vì job đã implement ShouldQueue)
            SendWarningWislistEmail::dispatch();

            $this->info('Wishlist warning email job has been dispatched successfully.');
            Log::info('Wishlist warning email job dispatched via command');

            return Command::SUCCESS;

        } catch (Exception $e) {
            $this->error('Failed to dispatch wishlist warning email job: ' . $e->getMessage());
            Log::error('Wishlist warning email command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Command::FAILURE;
        }
    }
}
