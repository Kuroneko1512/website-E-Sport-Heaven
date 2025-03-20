<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;
use Laravel\Passport\Passport;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Cấu hình thời gian hết hạn token:
        // Access token và Personal access token hết hạn sau 1 ngày:
        Passport::tokensExpireIn(now()->addDay());
        Passport::personalAccessTokensExpireIn(now()->addDays(15));

        // Refresh token hết hạn sau 7 ngày:
        Passport::refreshTokensExpireIn(now()->addDays(7));
    }
}
