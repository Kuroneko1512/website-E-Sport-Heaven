<?php

namespace App\Jobs\Mail\User;
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
