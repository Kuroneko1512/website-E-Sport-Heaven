<?php

namespace App\Services\Media;

use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class MediaService
{
    /**
     * Các cấu hình mặc định cho từng loại ảnh
     */
    protected $imageConfigs = [
        'avatar' => [
            'folder' => 'avatars',
            'format' => 'webp',
            'quality' => 'auto',
            'transformation' => [
                'width' => 500,
                'height' => 500,
                'crop' => 'fill',
                'gravity' => 'face',
                'fetch_format' => 'auto',
                'effect' => 'auto_brightness'
            ]
        ],
        'product' => [
            'folder' => 'products',
            'format' => 'webp',
            'quality' => 'auto',
            'transformation' => [
                'width' => 800,
                'height' => 800,
                'crop' => 'pad',
                'background' => 'white',
                'fetch_format' => 'auto'
            ]
        ],
        'banner' => [
            'folder' => 'banners',
            'format' => 'webp',
            'quality' => 'auto',
            'transformation' => [
                'width' => 1920,
                'height' => 600,
                'crop' => 'fill',
                'gravity' => 'auto',
                'fetch_format' => 'auto'
            ]
        ],
        'thumbnail' => [
            'folder' => 'thumbnails',
            'format' => 'webp',
            'quality' => 'auto',
            'transformation' => [
                'width' => 300,
                'height' => 300,
                'crop' => 'thumb',
                'gravity' => 'auto',
                'fetch_format' => 'auto'
            ]
        ],
        'blog' => [
            'folder' => 'blog',
            'format' => 'webp',
            'quality' => 'auto',
            'transformation' => [
                'width' => 1200,
                'height' => 630,
                'crop' => 'fill',
                'gravity' => 'auto',
                'fetch_format' => 'auto'
            ]
        ]
    ];

    /**
     * Thư mục mặc định cho các loại ảnh
     */
    protected $defaultImageDirs = [
        'avatar' => 'images/avatars',
        'product' => 'images/products',
        'banner' => 'images/banners',
        'thumbnail' => 'images/thumbnails',
        'blog' => 'images/blog'
    ];

    /**
     * Xử lý và lưu ảnh với cấu hình tùy chỉnh
     *
     * @param UploadedFile|string $image File ảnh hoặc chuỗi base64
     * @param string $type Loại ảnh (avatar, product, banner, thumbnail, blog)
     * @param array $options Tùy chọn biến đổi bổ sung
     * @return array Thông tin các phiên bản ảnh
     */
    public function processImage($image, $type = 'avatar', array $options = [])
    {
        // Kiểm tra cấu hình Cloudinary
        $this->checkCloudinaryConfig();

        // Lấy cấu hình mặc định cho loại ảnh
        $defaultConfig = $this->getImageConfig($type);
        
        // Tạo tên file duy nhất
        $filename = $type . '_' . Str::random(10) . '_' . time();
        
        // Thêm public_id vào cấu hình
        $defaultConfig['public_id'] = $filename;
        
        // Kết hợp cấu hình mặc định với tùy chọn được truyền vào
        $mergedOptions = array_replace_recursive($defaultConfig, $options);

        try {
            // Xử lý ảnh và upload lên Cloudinary
            $uploadedFile = $this->uploadToCloudinary($image, $mergedOptions);

            // Trả về thông tin ảnh
            return [
                'public_id' => $uploadedFile->getPublicId(),
                'url' => $uploadedFile->getSecurePath(),
                'format' => $uploadedFile->getExtension(),
                'width' => $uploadedFile->getWidth(),
                'height' => $uploadedFile->getHeight(),
                'type' => $type
            ];
        } catch (\Exception $e) {
            Log::error("Cloudinary upload error for {$type}: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Xử lý và lưu ảnh avatar
     *
     * @param UploadedFile|string $image File ảnh hoặc chuỗi base64
     * @param array $options Tùy chọn biến đổi bổ sung
     * @return array Thông tin các phiên bản ảnh
     */
    public function processAvatar($image, array $options = [])
    {
        return $this->processImage($image, 'avatar', $options);
    }
    
    /**
     * Xử lý và lưu ảnh mặc định
     *
     * @param string $type Loại ảnh (avatar, product, banner, thumbnail, blog)
     * @param string|null $imageName Tên file ảnh mặc định (không bao gồm đường dẫn)
     * @param array $options Tùy chọn biến đổi bổ sung
     * @return array Thông tin các phiên bản ảnh
     */
    public function processDefaultImage($type = 'avatar', $imageName = null, array $options = [])
    {
        // Kiểm tra cấu hình Cloudinary
        $this->checkCloudinaryConfig();

        // Lấy thư mục mặc định cho loại ảnh
        $defaultDir = $this->getDefaultImageDir($type);
        
        // Đường dẫn đầy đủ đến thư mục
        $defaultImagesDir = public_path($defaultDir);
        
        // Nếu không chỉ định tên file, sử dụng ảnh mặc định
        if (empty($imageName)) {
            $imageName = "default-{$type}.jpg";
        }
        
        // Đường dẫn đến ảnh mặc định
        $defaultImagePath = $defaultImagesDir . '/' . $imageName;
        
        // Kiểm tra xem file có tồn tại không
        if (!file_exists($defaultImagePath)) {
            Log::warning("Specified {$type} image file not found, searching for alternatives", [
                'requested_path' => $defaultImagePath
            ]);
            
            // Thử tìm bất kỳ file ảnh nào trong thư mục
            $imageFiles = glob($defaultImagesDir . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
            
            if (empty($imageFiles)) {
                Log::error("No default {$type} image files found in directory", [
                    'directory' => $defaultImagesDir
                ]);
                throw new \Exception("Default {$type} image file not found");
            }
            
            // Sử dụng file đầu tiên tìm thấy
            $defaultImagePath = $imageFiles[0];
            Log::info("Using alternative {$type} image file", ['path' => $defaultImagePath]);
        }

        // Xử lý và upload ảnh
        return $this->processImage($defaultImagePath, $type, $options);
    }
    
    /**
     * Xử lý và lưu ảnh avatar mặc định
     *
     * @param string|null $avatarName Tên file avatar mặc định (không bao gồm đường dẫn)
     * @param array $options Tùy chọn biến đổi bổ sung
     * @return array Thông tin các phiên bản ảnh
     */
    public function processDefaultAvatar($avatarName = null, array $options = [])
    {
        return $this->processDefaultImage('avatar', $avatarName, $options);
    }

    /**
     * Xóa file từ Cloudinary
     *
     * @param string $publicId Public ID của file
     * @return bool
     */
    public function deleteImage($publicId)
    {
        try {
            if (!empty($publicId)) {
                Cloudinary::destroy($publicId);
                Log::info('Image deleted from Cloudinary', ['public_id' => $publicId]);
            }
            return true;
        } catch (\Exception $e) {
            Log::error('Error deleting image from Cloudinary: ' . $e->getMessage(), [
                'public_id' => $publicId,
                'trace' => $e->getTraceAsString()
            ]);
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
            Log::info('Starting upload to Cloudinary', [
                'options' => $options,
                'file_type' => $file instanceof UploadedFile ? 'UploadedFile' : (is_string($file) ? 'String' : gettype($file))
            ]);

            if ($file instanceof UploadedFile) {
                $result = Cloudinary::upload($file->getRealPath(), $options);
            } elseif (is_string($file) && strpos($file, 'base64') !== false) {
                $result = Cloudinary::upload($file, $options);
            } elseif (is_string($file) && file_exists($file)) {
                // Xử lý trường hợp file path
                $result = Cloudinary::upload($file, $options);
            } else {
                throw new \InvalidArgumentException('Invalid file format');
            }

            Log::info('Upload successful', [
                'public_id' => $result->getPublicId(),
                'url' => $result->getSecurePath(),
                'format' => $result->getExtension()
            ]);
            
            return $result;
        } catch (\Exception $e) {
            Log::error('Error uploading to Cloudinary', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
    
    /**
     * Kiểm tra cấu hình Cloudinary
     *
     * @throws \Exception
     */
    protected function checkCloudinaryConfig()
    {
        if (empty(config('cloudinary.cloud_url'))) {
            Log::error('Cloudinary configuration missing', [
                'cloud_url_exists' => !empty(config('cloudinary.cloud_url')),
            ]);
            throw new \Exception('Cloudinary configuration missing');
        }
    }
    
    /**
     * Lấy cấu hình cho loại ảnh
     *
     * @param string $type Loại ảnh
     * @return array
     */
    protected function getImageConfig($type)
    {
        if (isset($this->imageConfigs[$type])) {
            return $this->imageConfigs[$type];
        }
        
        // Nếu không tìm thấy cấu hình cho loại ảnh, sử dụng cấu hình mặc định
        Log::warning("No configuration found for image type: {$type}, using avatar config");
        return $this->imageConfigs['avatar'];
    }
    
    /**
     * Lấy thư mục mặc định cho loại ảnh
     *
     * @param string $type Loại ảnh
     * @return string
     */
    protected function getDefaultImageDir($type)
    {
        if (isset($this->defaultImageDirs[$type])) {
            return $this->defaultImageDirs[$type];
        }
        
        // Nếu không tìm thấy thư mục cho loại ảnh, sử dụng thư mục mặc định
        Log::warning("No default directory found for image type: {$type}, using avatar directory");
        return $this->defaultImageDirs['avatar'];
    }
    
    /**
     * Tạo URL Cloudinary với các biến đổi
     *
     * @param string $publicId Public ID của ảnh
     * @param array $transformations Các biến đổi cần áp dụng
     * @return string URL đã được biến đổi
     */
    public function getTransformedUrl($publicId, array $transformations = [])
    {
        try {
            return Cloudinary::image($publicId)
                ->transform($transformations)
                ->toUrl();
        } catch (\Exception $e) {
            Log::error('Error generating transformed URL: ' . $e->getMessage());
            return '';
        }
    }
}
