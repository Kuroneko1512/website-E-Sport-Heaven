<?php

namespace App\Helpers;

class UrlHelpers
{
    /**
     * Tạo URL cho trang admin
     *
     * @param string $path
     * @return string
     */
    public static function adminUrl($path = '')
    {
        return rtrim(config('frontend.admin_url'), '/') . '/' . ltrim($path, '/');
    }

    /**
     * Tạo URL cho trang client
     *
     * @param string $path
     * @return string
     */
    public static function clientUrl($path = '')
    {
        return rtrim(config('frontend.client_url'), '/') . '/' . ltrim($path, '/');
    }
}
