<?php

namespace App\Jobs\Mail\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models;
use App\Models\Wishlist;
use Illuminate\Bus\Queueable;
use App\Services\WishlistService;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Mail\User\WarningWishlistItemOutOfStock;
use Exception;

class SendWarningWislistEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting wishlist warning email job execution');

        $wishlists = Wishlist::join('products', 'products.id', '=', 'wishlists.product_id')
                    ->join('users', 'users.id', '=', 'wishlists.user_id')
                    ->where('products.stock', '<', 10)
                    ->where('products.stock', '>', 0)
                    ->get([
                        'products.id as product_id',
                        'products.name as product_name',
                        'products.price as product_price',
                        'products.stock as product_stock',
                        'users.id as user_id',
                        'users.email as user_email',
                        'users.name as user_name'
                    ]);

        Log::info('Found wishlists with low stock products', [
            'count' => $wishlists->count(),
            'wishlists' => $wishlists->toArray()
        ]);

        $emailsSent = 0;
        $emailsFailed = 0;

        foreach ($wishlists as $item) {
            try {
                $email = new WarningWishlistItemOutOfStock($item);
                Mail::to($item['user_email'])->send($email);
                $emailsSent++;

                Log::info('Wishlist warning email sent successfully', [
                    'user_id' => $item['user_id'],
                    'user_email' => $item['user_email'],
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name']
                ]);

            } catch (Exception $e) {
                $emailsFailed++;
                Log::error('Failed to send wishlist warning email', [
                    'user_id' => $item['user_id'],
                    'user_email' => $item['user_email'],
                    'product_id' => $item['product_id'],
                    'error' => $e->getMessage()
                ]);
            }
        }

        Log::info('Wishlist warning email job completed', [
            'total_wishlists' => $wishlists->count(),
            'emails_sent' => $emailsSent,
            'emails_failed' => $emailsFailed
        ]);
    }
}
