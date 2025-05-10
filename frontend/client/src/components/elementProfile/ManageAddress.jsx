import { Button, Form, Input, Modal, Select, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../config/db";

const { Title } = Typography;
const { Option } = Select;

const ManageAddress = () => {
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

  const queryClient = useQueryClient();

  // Fetch provinces on mount
  useEffect(() => {
    axiosInstance
      .get("/api/v1/address/provinces/")
      .then((response) => setProvinces(response?.data?.data))
      .catch(() => message.error("Lỗi khi tải tỉnh/thành phố"));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      axiosInstance
        .get(`/api/v1/address/districts?province_code=${selectedProvince}`)
        .then((response) => setDistricts(response?.data?.data))
        .catch(() => message.error("Lỗi khi tải quận/huyện"));
    } else {
      setDistricts([]);
      setSelectedDistrict("");
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axiosInstance
        .get(`/api/v1/address/communes?district_code=${selectedDistrict}`)
        .then((response) => setWards(response?.data?.data))
        .catch(() => message.error("Lỗi khi tải phường/xã"));
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict]);

  const {
    data: addressesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => axiosInstance.get("/api/v1/customer/shipping-address").then((res) => res.data.data),
    refetchOnWindowFocus: false,
  });

  console.log("addressesData", addressesData);

  const createMutation = (mutationFn, successMessage, errorMessage) =>
    useMutation({
      mutationFn,
      onSuccess: () => {
        message.success(successMessage);
        queryClient.invalidateQueries(["addresses"]);
        setIsModalOpen(false);
        form.resetFields();
        setSelectedProvince("");
        setSelectedDistrict("");
        setSelectedWard("");
      },
      onError: () => {
        message.error(errorMessage);
      },
    });

  const addAddressMutation = createMutation(
    async (newAddress) => await axiosInstance.post("/api/v1/customer/shipping-address", newAddress),
    "Thêm địa chỉ thành công",
    "Thêm địa chỉ thất bại"
  );

  const updateAddressMutation = createMutation(
    async ({ id, updatedAddress }) => await axiosInstance.put(`/api/v1/customer/shipping-address/${id}`, updatedAddress),
    "Cập nhật địa chỉ thành công",
    "Cập nhật địa chỉ thất bại"
  );

  const deleteAddressMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/customer/shipping-address/${id}`),
    onSuccess: () => {
      message.success("Xóa địa chỉ thành công");
      queryClient.invalidateQueries(["addresses"]);
    },
    onError: () => {
      message.error("Xóa địa chỉ thất bại");
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id) => axiosInstance.post(`/api/v1/customer/shipping-address/${id}/set-default`),
    onSuccess: () => {
      message.success("Cài đặt địa chỉ mặc định thành công");
      queryClient.invalidateQueries(["addresses"]);
    },
    onError: () => {
      message.error("Cài đặt địa chỉ mặc định thất bại");
    },
  });

  const openAddModal = () => {
    setIsEditMode(false);
    form.resetFields();
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setIsModalOpen(true);
  };

  const openEditModal = (address) => {
    setIsEditMode(true);
    setEditingAddress(address);
    form.setFieldsValue(address);

    const provinceObj = provinces.find((p) => p.name === address.province);
    const districtObj = districts.find((d) => d.name === address.district);
    const wardObj = wards.find((w) => w.name === address.ward);

    setSelectedProvince(provinceObj ? provinceObj.code : "");
    setSelectedDistrict(districtObj ? districtObj.code : "");
    setSelectedWard(wardObj ? wardObj.code : "");
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa điểm giao hàng",
      content: "Bạn có chắc muốn xóa điểm giao hàng này?",
      cancelText: "Hủy",
      onOk: () => {
        deleteAddressMutation.mutate(id);
      },
    });
  };

  const handleSetDefault = (id) => {
    setDefaultAddressMutation.mutate(id);
  };

  const handleFinish = (values) => {
    console.log("Form values:", values);
    const provinceName = provinces.find((p) => Number(p.code) === Number(selectedProvince))?.name;
    const districtName = districts.find((d) => Number(d.code) === Number(selectedDistrict))?.name;
    const wardName = wards.find((w) => Number(w.code) === Number(selectedWard))?.name;

    const addressPayload = {
      ...values,
      is_default: true,
      province: provinceName,
      district: districtName,
      ward: wardName,
    };

    if (isEditMode && editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, updatedAddress: addressPayload });
    } else {
      addAddressMutation.mutate(addressPayload);
    }
  };

  if (isLoading) {
    return <div>Đang tải địa chỉ...</div>;
  }

  if (isError) {
    return <div>Lỗi khi tải địa chỉ</div>;
  }

  const addresses = addressesData || [];

  return (
    <div className="p-6 dark:bg-gray-800 px-10 py-6">
      <Title className="text-black dark:text-white" level={3}>
        Quản lý địa chỉ
      </Title>
      <Button
        type="primary"
        onClick={openAddModal}
        className="mb-4 bg-black dark:bg-gray-800 text-white py-2 px-4 rounded hover:!bg-white hover:!border-gray-800 hover:!text-black dark:hover:bg-gray-700"
      >
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
                  {address.recipient_name}
                  <span className="ml-4 font-normal text-gray-500 dark:text-gray-400 text-base">
                    {address.phone} - {address.email}
                  </span>
                </h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">
                  {address.address_line1}, {address.commune.name}, {address.district.name},{" "}
                  {address.province.name}
                </p>
              </div>
              <div className="col-span-1">
                {address.is_default ? (
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
            name="recipient_name"
            label="Tên"
            rules={[{ required: true, message: "Hãy nhập tên" }]}
          >
            <Input placeholder="Tên" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Hãy nhập số diện thoại" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Số điện thoại" maxLength={11} />
          </Form.Item>

          {/* <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item> */}

          <Form.Item
            label="Tỉnh/Thành phố"
            name="province_code"
            rules={[{ required: true, message: "Hãy chọn tỉnh/thành phố" }]}
          >
            <Select
              placeholder="Chọn Tỉnh/Thành phố"
              value={selectedProvince}
              onChange={(val) => {
                setSelectedProvince(val);
                setSelectedDistrict("");
                setDistricts([]);
                setSelectedWard("");
                setWards([]);
                form.setFieldsValue({
                  district: undefined,
                  ward: undefined,
                });
              }}
              disabled={!provinces.length}
            >
              {provinces.map((p) => (
                <Option key={p.code} value={p.code}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Quận/Huyện"
            name="district_code"
            rules={[{ required: true, message: "Hãy chọn quận/huyện" }]}
          >
            <Select
              placeholder="Chọn Quận/Huyện"
              value={selectedDistrict}
              onChange={(val) => {
                setSelectedDistrict(val);
                setSelectedWard("");
                setWards([]);
                form.setFieldsValue({
                  ward: undefined,
                });
              }}
              disabled={!selectedProvince}
            >
              {districts.map((d) => (
                <Option key={d.code} value={d.code}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Phường/Xã"
            name="commune_code"
            rules={[{ required: true, message: "Hãy chọn phường/xã" }]}
          >
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
            name="address_line1"
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
