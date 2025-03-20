<?php

namespace App\Services\Auth;

class AdminAuthService extends AuthService
{
    /**
     * Xác thực đăng nhập cho Admin
     */
    public function attemptLogin($identifier, $password,$accountType = null)
    {
        return parent::attemptLogin($identifier, $password, 'admin');
    }

    /**
     * Làm mới token cho Admin
     */
    public function refreshToken($refreshToken,$accountType = null)
    {
        return parent::refreshToken($refreshToken, 'admin');
    }
}
