
import { Button, Form, Input, Modal, Select, Typography } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title } = Typography;
const { Option } = Select;

const ManageAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/address/provinces/')
      .then(response => setProvinces(response?.data?.data))
      .catch(error => console.error('Lỗi khi tải tỉnh/thành phố:', error));

    // const cartItems = localStorage.getItem('checkoutItems');
    // const cartTotal = localStorage.getItem('cartTotal');

    // if (cartItems) setCartItems(JSON.parse(cartItems));
    // if (cartTotal) setCartTotal(JSON.parse(cartTotal));
  }, []);

  console.log("provinces", provinces);
  console.log("districts", districts);
  console.log("wards", wards);

  useEffect(() => {
    if (selectedProvince) {
      axios.get(`http://127.0.0.1:8000/api/v1/address/districts?province_code=${selectedProvince}`)
        .then(response => setDistricts(response?.data?.data))
        .catch(error => console.error('Lỗi khi tải quận/huyện:', error));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`http://127.0.0.1:8000/api/v1/address/communes?district_code=${selectedDistrict}`)
        .then(response => setWards(response?.data?.data))
        .catch(error => console.error('Lỗi khi tải phường/xã:', error));
    }
  }, [selectedDistrict]);

  // console.log(wards);

  useEffect(() => {
    setAddresses(JSON.parse(localStorage.getItem('addresses')) || []);
  }, []);  

  const saveAddresses = (updated) => {
    localStorage.setItem("addresses", JSON.stringify(updated));
    setAddresses(updated);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa điểm giao hàng",
      content: "Bạn có chắc muốn xóa điểm giao hàng nay?",
      cancelText: "Hủy",
      onOk: () => {
        const updated = addresses.filter((addr) => addr.id !== id);
        saveAddresses(updated);
      },
    })
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      defaultAddress: addr.id === id,
    }));
    saveAddresses(updated);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    form.resetFields();
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setIsModalOpen(true);
  };

  const openEditModal = (address) => {
    console.log("address", address);
    setIsEditMode(true);
    setEditingAddress(address);
    form.setFieldsValue(address);
    setSelectedProvince(
      provinces.find((p) => p.name === address.province)?.code || ""
    );
    setSelectedDistrict(
      districts.find((d) => d.name === address.district)?.code || ""
    );
    setSelectedWard(wards.find((w) => w.name === address.ward)?.code || "");
    setIsModalOpen(true);
  };

  const handleFinish = (values) => {
    const provinceName = provinces.find(
      (p) => Number(p.code) === Number(selectedProvince)
    )?.name;
    const districtName = districts.find(
      (d) => Number(d.code) === Number(selectedDistrict)
    )?.name;
    const wardName = wards.find((w) => Number(w.code) === Number(selectedWard))?.name;

    if (isEditMode) {
      const updated = addresses.map((addr) =>
        addr.id === editingAddress.id
          ? {
              ...editingAddress,
              ...values,
              province: provinceName,
              district: districtName,
              ward: wardName,
            }
          : addr
      );
      saveAddresses(updated);
    } else {
      const updated = [
        ...addresses,
        {
          ...values,
          id: Date.now(),
          province: provinceName,
          district: districtName,
          ward: wardName,
          defaultAddress: addresses.length === 0,
        },
      ];
      saveAddresses(updated);
    }

    setIsModalOpen(false);
    form.resetFields();
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
  };

  return (
    <div className="p-6 dark:bg-gray-800 px-10 py-6">
      <Title className="text-black dark:text-white" level={3}>Quản lý địa chỉ</Title>
      <Button type="primary" onClick={openAddModal} className="mb-4 bg-black dark:bg-gray-800 text-white py-2 px-4 rounded hover:!bg-white hover:!border-gray-800 hover:!text-black dark:hover:bg-gray-700">
        + Thêm địa chỉ
      </Button>

      <div className="space-y-6">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="border-b border-gray-300 dark:border-gray-700 pb-4"
          >
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="col-span-2">
                <h2 className="font-bold text-lg text-black dark:text-white">
                  {address.fullname}
                  <span className="ml-4 font-normal text-gray-500 dark:text-gray-400 text-base">
                    {address.mobile} - {address.email}
                  </span>
                </h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">
                  {address.specificAddress}, {address.ward}, {address.district},{" "}
                  {address.province}
                </p>
              </div>
              <div className="col-span-1">
                {address.defaultAddress ? (
                  <span className="text-black dark:text-white">Mặc định</span>
                ) : (
                  <Button
                    type="link"
                    className="!text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-gray-300"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Cài mặc định
                  </Button>
                )}
              </div>
              <div className="col-span-1 flex flex-col space-y-2 items-end">
                <Button
                  onClick={() => openEditModal(address)}
                  className="bg-gray-200  hover:!bg-white hover:!border-gray-800 hover:!text-black dark:hover:bg-gray-700"
                >
                  Chỉnh sửa
                </Button>
                <Button
                  onClick={() => handleDelete(address.id)}
                  className="bg-red-200 text-red-600  hover:!bg-white hover:!border-gray-800 hover:!text-black dark:hover:bg-gray-700"
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        title={isEditMode ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="fullname"
            label="Tên"
            rules={[{ required: true, message: "Hãy nhập tên" }]}
          >
            <Input placeholder="Tên" />
          </Form.Item>
          <Form.Item
            name="mobile"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Hãy nhập số diện thoại" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Mobile" maxLength={11} />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item label="Tỉnh/Thành phố" name="province" rules={[{ required: true, message: "Hãy chọn tỉnh/thành phố" }]}>
            <Select
              placeholder="Chọn Tỉnh/Thành phố"
              value={selectedProvince}
              onChange={(val) => setSelectedProvince(val)}
            >
              {provinces.map((p) => (
                <Option key={p.code} value={p.code}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Quận/Huyện" name="district" rules={[{ required: true, message: "Hãy chọn quận/huyện" }]}>
            <Select
              placeholder="Chọn Quận/Huyện"
              value={selectedDistrict}
              onChange={(val) => setSelectedDistrict(val)}
              disabled={!selectedProvince}
            >
              {districts.map((d) => (
                <Option key={d.code} value={d.code}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Phường/Xã" name="ward" rules={[{ required: true, message: "Hãy chọn phường/xã" }]}>
            <Select
              placeholder="Chọn Phường/Xã"
              value={selectedWard}
              onChange={(val) => setSelectedWard(val)}
              disabled={!selectedDistrict}
            >
              {wards.map((w) => (
                <Option key={w.code} value={w.code}>
                  {w.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="specificAddress"
            label="Địa chỉ cụ thể"
            rules={[{ required: true, message: "Hãy nhập điểm chỉ cụ thể" }]}
          >
            <Input placeholder="Địa chỉ cụ thể" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isEditMode ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default ManageAddress;