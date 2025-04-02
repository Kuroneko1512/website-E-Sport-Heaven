<?php

namespace App\Services\Media;

use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class MediaService
{
    /**
     * Xử lý và lưu ảnh avatar
     *
     * @param UploadedFile|string $image File ảnh hoặc chuỗi base64
     * @return array Thông tin các phiên bản ảnh
     */
    public function processAvatar($image)
    {
        // Kiểm tra cấu hình Cloudinary
        if (empty(config('cloudinary.cloud_url'))) {
            Log::error('Cloudinary configuration missing', [
                'cloud_url_exists' => !empty(config('cloudinary.cloud_url')),
            ]);
            throw new \Exception('Cloudinary configuration missing');
        }

        // Tạo tên file duy nhất
        $filename = 'avatar_' . Str::random(10) . '_' . time();

        try {
            // Xử lý ảnh và upload lên Cloudinary
            $uploadedFile = $this->uploadToCloudinary($image, [
                'folder' => 'avatars',
                'public_id' => $filename,
                'transformation' => [
                    'width' => 500,
                    'height' => 500,
                    'crop' => 'fill',
                    'gravity' => 'face'
                ]
            ]);

            // Trả về thông tin ảnh
            return [
                'public_id' => $uploadedFile->getPublicId(),
                'url' => $uploadedFile->getSecurePath()
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary upload error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Xóa file từ Cloudinary
     *
     * @param string $publicId Public ID của file
     * @return bool
     */
    public function deleteAvatar($publicId)
    {
        try {
            if (!empty($publicId)) {
                Cloudinary::destroy($publicId);
            }
            return true;
        } catch (\Exception $e) {
            Log::error('Lỗi xóa avatar từ Cloudinary: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Upload file lên Cloudinary
     *
     * @param UploadedFile|string $file File hoặc chuỗi base64
     * @param array $options Tùy chọn upload
     * @return \CloudinaryLabs\CloudinaryLaravel\CloudinaryUploadedFile
     */
    protected function uploadToCloudinary($file, array $options = [])
    {
        try {
            Log::info('Bắt đầu upload lên Cloudinary', [
                'options' => $options,
                'file_type' => $file instanceof UploadedFile ? 'UploadedFile' : (is_string($file) ? 'String' : gettype($file)),
                'cloudinary_config' => [
                    'cloud_url_exists' => !empty(config('cloudinary.cloud_url')),
                    'cloud_url_length' => strlen(config('cloudinary.cloud_url')),
                ]
            ]);

            if ($file instanceof UploadedFile) {
                $result = Cloudinary::upload($file->getRealPath(), $options);
                Log::info('Upload thành công', [
                    'public_id' => $result->getPublicId(),
                    'url' => $result->getSecurePath()
                ]);
                return $result;
            } elseif (is_string($file) && strpos($file, 'base64') !== false) {
                $result = Cloudinary::upload($file, $options);
                Log::info('Upload thành công', [
                    'public_id' => $result->getPublicId(),
                    'url' => $result->getSecurePath()
                ]);
                return $result;
            } else {
                throw new \InvalidArgumentException('Định dạng file không hợp lệ');
            }
        } catch (\Exception $e) {
            Log::error('Lỗi khi upload lên Cloudinary', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
