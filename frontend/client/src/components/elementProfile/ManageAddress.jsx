import { Button, Form, Input, Modal, Select, Typography, message } from "antd";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../config/db";

const { Title } = Typography;
const { Option } = Select;

export default function ManageAddress() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 1. Fetch provinces
  const {
    data: provinces = [],
    isLoading: provincesLoading,
    isError: provincesError,
  } = useQuery({
    queryKey: ["provinces"],
    queryFn: () =>
      axiosInstance
        .get("/api/v1/address/provinces/")
        .then((res) => res.data.data),
    refetchOnWindowFocus: false,
  });

  // 2. Fetch districts when province selected
  const {
    data: districts = [],
    isFetching: districtsLoading,
  } = useQuery({
    queryKey: ["districts", selectedProvince],
    queryFn: () =>
      axiosInstance
        .get(
          `/api/v1/address/districts?province_code=${selectedProvince}`
        )
        .then((res) => res.data.data),
    enabled: Boolean(selectedProvince),
  });

  // 3. Fetch wards when district selected
  const {
    data: wards = [],
    isFetching: wardsLoading,
  } = useQuery({
    queryKey: ["wards", selectedDistrict],
    queryFn: () =>
      axiosInstance
        .get(
          `/api/v1/address/communes?district_code=${selectedDistrict}`
        )
        .then((res) => res.data.data),
    enabled: Boolean(selectedDistrict),
  });

  // 4. Fetch current addresses
  const {
    data: addresses = [],
    isLoading: addressesLoading,
    isError: addressesError,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: () =>
      axiosInstance
        .get("/api/v1/customer/shipping-address")
        .then((res) => res.data.data),
    refetchOnWindowFocus: false,
  });

  // 5. Mutations
  const addAddressMutation = useMutation({
    mutationFn: (newAddress) =>
      axiosInstance.post(
        "/api/v1/customer/shipping-address",
        newAddress
      ),
    onSuccess: () => {
      message.success("Thêm địa chỉ thành công");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      form.resetFields();
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedWard("");
      setIsModalOpen(false);
    },
    onError: () => message.error("Thêm địa chỉ thất bại"),
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, updatedAddress }) =>
      axiosInstance.put(
        `/api/v1/customer/shipping-address/${id}`,
        updatedAddress
      ),
    onSuccess: () => {
      message.success("Cập nhật địa chỉ thành công");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      form.resetFields();
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedWard("");
      setIsModalOpen(false);
    },
    onError: () => message.error("Cập nhật địa chỉ thất bại"),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id) =>
      axiosInstance.delete(
        `/api/v1/customer/shipping-address/${id}`
      ),
    onSuccess: () => {
      message.success("Xóa địa chỉ thành công");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => message.error("Xóa địa chỉ thất bại"),
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id) =>
      axiosInstance.post(
        `/api/v1/customer/shipping-address/${id}/set-default`
      ),
    onSuccess: () => {
      message.success(
        "Cài đặt địa chỉ mặc định thành công"
      );
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () =>
      message.error("Cài đặt địa chỉ mặc định thất bại"),
  });

  // 6. Open add modal
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingAddress(null);
    form.resetFields();
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setIsModalOpen(true);
  };

  // 7. Open edit modal with prefetch
  const openEditModal = (address) => {
    setIsEditMode(true);
    setEditingAddress(address);

    // Prefetch districts & wards
    queryClient.prefetchQuery({
      queryKey: ["districts", address.province_code],
      queryFn: () =>
        axiosInstance
          .get(
            `/api/v1/address/districts?province_code=${address.province_code}`
          )
          .then((res) => res.data.data),
    });
    queryClient.prefetchQuery({
      queryKey: ["wards", address.district_code],
      queryFn: () =>
        axiosInstance
          .get(
            `/api/v1/address/communes?district_code=${address.district_code}`
          )
          .then((res) => res.data.data),
    });

    // Set form + selections immediately
    form.setFieldsValue({
      ...address,
      province_code: address.province_code,
      district_code: address.district_code,
      commune_code: address.commune_code,
    });
    setSelectedProvince(address.province_code);
    setSelectedDistrict(address.district_code);
    setSelectedWard(address.commune_code);

    setIsModalOpen(true);
  };

  // 8. Handlers
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa điểm giao hàng",
      content: "Bạn có chắc muốn xóa điểm giao hàng này?",
      cancelText: "Hủy",
      onOk: () => deleteAddressMutation.mutate(id),
    });
  };

  const handleSetDefault = (id) => {
    setDefaultAddressMutation.mutate(id);
  };

  const handleFinish = (values) => {
    const provinceName = provinces.find(
      (p) => String(p.code) === String(selectedProvince)
    )?.name;
    const districtName = districts.find(
      (d) => String(d.code) === String(selectedDistrict)
    )?.name;
    const wardName = wards.find(
      (w) => String(w.code) === String(selectedWard)
    )?.name;

    const payload = {
      ...values,
      is_default: editingAddress?.is_default ? editingAddress.is_default : true, // Set default to true if not editing
      province: provinceName,
      district: districtName,
      ward: wardName,
    };

    if (isEditMode && editingAddress) {
      // Check if data changed before updating
      const isChanged =
        editingAddress.recipient_name !== payload.recipient_name ||
        editingAddress.phone !== payload.phone ||
        editingAddress.province_code !== selectedProvince ||
        editingAddress.district_code !== selectedDistrict ||
        editingAddress.commune_code !== selectedWard ||
        editingAddress.address_line1 !== payload.address_line1;

      if (isChanged) {
        updateAddressMutation.mutate({
          id: editingAddress.id,
          updatedAddress: payload,
        });
      } else {
        message.info("Không có thay đổi nào để cập nhật");
        setIsModalOpen(false);
      }
    } else {
      addAddressMutation.mutate(payload);
    }
  };

  console.log("editingAddress", editingAddress);

  // 9. Loading/Error states
  if (provincesLoading || addressesLoading) {
    return <div>Đang tải dữ liệu...</div>;
  }
  if (provincesError || addressesError) {
    return <div>Lỗi khi tải dữ liệu</div>;
  }

  // 10. Render
  return (
    <div className="p-6 dark:bg-gray-800 px-10 py-6">
      <Title className="text-black dark:text-white" level={3}>
        Quản lý địa chỉ
      </Title>
      <Button
        type="primary"
        onClick={openAddModal}
        className="mb-4 bg-black dark:bg-gray-800 text-white"
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
              <div className="col-span-1 text-center">
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
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
              { required: true, message: "Hãy nhập số điện thoại" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Số điện thoại" maxLength={11} />
          </Form.Item>

          <Form.Item
            name="province_code"
            label="Tỉnh/Thành phố"
            rules={[{ required: true, message: "Chọn tỉnh/thành phố" }]}
          >
            <Select
              placeholder="Chọn tỉnh/thành phố"
              loading={provincesLoading}
              value={selectedProvince}
              onChange={(val) => {
                setSelectedProvince(val);
                setSelectedDistrict("");
                setSelectedWard("");
                form.setFieldsValue({
                  district_code: undefined,
                  commune_code: undefined,
                });
              }}
            >
              {provinces.map((p) => (
                <Option key={p.code} value={p.code}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="district_code"
            label="Quận/Huyện"
            rules={[{ required: true, message: "Chọn quận/huyện" }]}
          >
            <Select
              placeholder="Chọn quận/huyện"
              loading={districtsLoading}
              disabled={!selectedProvince}
              value={selectedDistrict}
              onChange={(val) => {
                setSelectedDistrict(val);
                setSelectedWard("");
                form.setFieldsValue({ commune_code: undefined });
              }}
            >
              {districts.map((d) => (
                <Option key={d.code} value={d.code}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="commune_code"
            label="Phường/Xã"
            rules={[{ required: true, message: "Chọn phường/xã" }]}
          >
            <Select
              placeholder="Chọn phường/xã"
              loading={wardsLoading}
              disabled={!selectedDistrict}
              value={selectedWard}
              onChange={(val) => setSelectedWard(val)}
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
            rules={[{ required: true, message: "Nhập địa chỉ cụ thể" }]}
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
}
