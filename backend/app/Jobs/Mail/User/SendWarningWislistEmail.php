<?php

namespace App\Jobs\Mail\User;
use Mail;
use App\Mail\User\WarningWishlistItemOutOfStock;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\WishlistService;
use App\Models;

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
        $wishlists = Wishlist::join('products', 'products.id', '=', 'wishlists.product_id')
                    ->join('users', 'users.id', '=', 'wishlists.user_id')
                    ->where('products.stock', '>', 5)
                    ->get([
                        'products.id as product_id',
                        'products.name as product_name',
                        'products.price as product_price',
                        'users.email as user_email'
                    ]);

        foreach ($wishlists as $item) {
            $email = new WarningWishlistItemOutOfStock($item);
            Mail::to($item['user_email'])->send($email);
        }
    }
}
