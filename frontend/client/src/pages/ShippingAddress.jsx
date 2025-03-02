import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';



const ShippingAddress = () => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');
  const [defaultAddress, setDefaultAddress] = useState(false);

  const { data: addressData, isLoading, isError } = useQuery({
    queryKey: ['address'],
    queryFn: async()=>{
      const res = await axios.get('http://localhost:3000/address');
      return res.data;
    }
  });
  console.log(addressData)

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">⚠️ Failed to load address data. Please try again.</div>;

  // Kiểm tra nếu dữ liệu bị null hoặc lỗi
  const provinces = addressData ? addressData.map(province => ({
    Code: province.Code,
    name: province.FullName,
  })) : [];

  const selectedProvinceData = addressData?.find(province => province.Code === selectedProvince);
  const districts = selectedProvinceData?.District || [];

  const selectedDistrictData = districts.find(district => district.Code === selectedDistrict);
  const wards = selectedDistrictData?.Ward || [];

  // Reset district và ward khi thay đổi province
  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedDistrict('');
    setSelectedWard('');
  };

  // Reset ward khi thay đổi district
  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedWard('');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    
    if (!name || !mobile || !selectedProvince || !selectedDistrict || !selectedWard || !specificAddress) {
      alert('Please fill in all address details');
      return;
    }

    // Gửi API lưu địa chỉ mới
    axios.post('http://localhost:3000/addresses', {
      name,
      mobile,
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
      specificAddress,
      defaultAddress
    }).then(response => {
      alert('Address added successfully');
      setName('');
      setMobile('');
      setSelectedProvince('');
      setSelectedDistrict('');
      setSelectedWard('');
      setSpecificAddress('');
      setDefaultAddress(false);
    }).catch(error => {
      alert('Failed to add address');
    });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shipping Address</h1>
      <div className="w-full max-w-lg p-2">
        <h1 className="text-2xl font-bold mb-6">Add a new address</h1>
        <form onSubmit={handleAddAddress}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              id="name"
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobile">
              Mobile Number
            </label>
            <input
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              id="mobile"
              type="text"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">
              Province/City
            </label>
            <select
              className="block w-full border px-4 py-2 rounded"
              id="province"
              value={selectedProvince}
              onChange={handleProvinceChange}
            >
              <option value="">Select Province/City</option>
              {provinces.map((province) => (
                <option key={province.Code} value={province.Code}>{province.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">
              District
            </label>
            <select
              className="block w-full border px-4 py-2 rounded"
              id="district"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={!selectedProvince}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.Code} value={district.Code}>{district.FullName}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ward">
              Ward/Town
            </label>
            <select
              className="block w-full border px-4 py-2 rounded"
              id="ward"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={!selectedDistrict}
            >
              <option value="">Select Ward/Town</option>
              {wards.map((ward) => (
                <option key={ward.Code} value={ward.Code}>{ward.FullName}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specific-address">
              Specific Address
            </label>
            <input
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              id="specific-address"
              type="text"
              placeholder="Enter Specific Address"
              value={specificAddress}
              onChange={(e) => setSpecificAddress(e.target.value)}
            />
          </div>
          <div className="mb-4 flex items-center">
            <input
              className="mr-2 leading-tight"
              type="checkbox"
              id="default-address"
              checked={defaultAddress}
              onChange={(e) => setDefaultAddress(e.target.checked)}
            />
            <label className="text-sm" htmlFor="default-address">
              Use as my default address
            </label>
          </div>
          <div className="flex items-center">
            <button
              className="bg-black text-white font-bold py-2 px-4 rounded"
              type="submit"
            >
              Add New Address
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ShippingAddress;
