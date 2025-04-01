<?php

namespace App\Services\ShippingAddress;

use App\Models\ShippingAddress;
use App\Models\Customer;
use App\Services\BaseService;
use Illuminate\Database\Eloquent\Model;
use Exception;

class ShippingAddressService extends BaseService
{
    protected $customer;

    public function __construct(ShippingAddress $model)
    {
        parent::__construct($model);
    }

    /**
     * Lấy tất cả địa chỉ giao hàng của khách hàng
     *
     * @param Customer $customer
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllByCustomer(Customer $customer)
    {
        return $customer->shippingAddresses()
            ->with(['province', 'district', 'commune'])
            ->get();
    }

    /**
     * Tạo địa chỉ giao hàng mới
     *
     * @param Customer $customer
     * @param array $data
     * @return ShippingAddress
     */
    public function createForCustomer(Customer $customer, array $data)
    {
        // Nếu đánh dấu là địa chỉ mặc định, cập nhật tất cả các địa chỉ khác
        if (isset($data['is_default']) && $data['is_default']) {
            $customer->shippingAddresses()->update(['is_default' => false]);
        }

        $data['customer_id'] = $customer->id;
        
        // Đặt giá trị mặc định cho country nếu không được cung cấp
        if (!isset($data['country'])) {
            $data['country'] = 'Vietnam';
        }
        
        $address = $this->create($data);
        
        // Load các quan hệ
        return $address->load(['province', 'district', 'commune']);
    }

    /**
     * Lấy chi tiết địa chỉ giao hàng
     *
     * @param Customer $customer
     * @param int $id
     * @return ShippingAddress
     */
    public function getByIdForCustomer(Customer $customer, $id)
    {
        return $customer->shippingAddresses()
            ->with(['province', 'district', 'commune'])
            ->findOrFail($id);
    }

    /**
     * Cập nhật địa chỉ giao hàng
     *
     * @param Customer $customer
     * @param int $id
     * @param array $data
     * @return ShippingAddress
     */
    public function updateForCustomer(Customer $customer, $id, array $data)
    {
        $address = $customer->shippingAddresses()->findOrFail($id);
        
        // Nếu đánh dấu là địa chỉ mặc định, cập nhật tất cả các địa chỉ khác
        if (isset($data['is_default']) && $data['is_default']) {
            $customer->shippingAddresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }
        
        $address->update($data);
        
        // Load các quan hệ
        return $address->load(['province', 'district', 'commune']);
    }

    /**
     * Xóa địa chỉ giao hàng
     *
     * @param Customer $customer
     * @param int $id
     * @return bool
     */
    public function deleteForCustomer(Customer $customer, $id)
    {
        $address = $customer->shippingAddresses()->findOrFail($id);
        
        // Nếu xóa địa chỉ mặc định, đặt địa chỉ khác làm mặc định (nếu có)
        if ($address->is_default) {
            $newDefault = $customer->shippingAddresses()
                ->where('id', '!=', $id)
                ->first();
                
            if ($newDefault) {
                $newDefault->is_default = true;
                $newDefault->save();
            }
        }
        
        return $address->delete();
    }

    /**
     * Đặt địa chỉ làm mặc định
     *
     * @param Customer $customer
     * @param int $id
     * @return ShippingAddress
     */
    public function setDefaultForCustomer(Customer $customer, $id)
    {
        $address = $customer->shippingAddresses()->findOrFail($id);
        
        // Cập nhật tất cả các địa chỉ khác
        $customer->shippingAddresses()->where('id', '!=', $id)->update(['is_default' => false]);
        
        // Đặt địa chỉ này làm mặc định
        $address->is_default = true;
        $address->save();
        
        // Load các quan hệ
        return $address->load(['province', 'district', 'commune']);
    }
}
