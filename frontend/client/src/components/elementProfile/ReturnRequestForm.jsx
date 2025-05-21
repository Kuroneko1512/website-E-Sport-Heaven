import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Upload, Select, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import instanceAxios from "../../config/db";
import { useQuery } from "@tanstack/react-query";

const ReturnRequestForm = () => {
  const { order_code } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [selectedOrderItemIds, setSelectedOrderItemIds] = useState([]);

  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // Hiển thị preview cho tất cả ảnh
    if (newFileList.length === 0) {
      setPreviewImage([]);
      return;
    }
    const previews = [];
    let loaded = 0;
    newFileList.forEach((file, idx) => {
      if (file.originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[idx] = e.target.result;
          loaded++;
          if (loaded === newFileList.length) {
            setPreviewImage([...previews]);
          }
        };
        reader.readAsDataURL(file.originFileObj);
      } else {
        loaded++;
        previews[idx] = file.url || "";
        if (loaded === newFileList.length) {
          setPreviewImage([...previews]);
        }
      }
    });
  };

  // Xóa ảnh khỏi fileList và previewImage
  const handleRemove = (file) => {
    const idx = fileList.indexOf(file);
    const newFileList = fileList.filter((f) => f.uid !== file.uid);
    setFileList(newFileList);
    if (previewImage && Array.isArray(previewImage)) {
      const newPreview = [...previewImage];
      newPreview.splice(idx, 1);
      setPreviewImage(newPreview);
    }
    return false; // Ngăn Upload tự động xóa, ta tự xử lý
  };

  const { data, isLoading } = useQuery({
    queryKey: ["order", order_code],
    queryFn: async () => {
      const response = await instanceAxios.get(
        `/api/v1/order/showByCode/${order_code}`
      );
      return response.data;
    },
    enabled: !!order_code,
  });
  console.log("gia tien", data?.data?.subtotal);
  console.log("data", data?.data?.order_items);

  useEffect(() => {
    if (data?.data?.order_items && data?.data?.order_items.length > 0) {
      // Set default selected items (all or first one)
      const defaultIds = [data?.data?.order_items[0].id];
      setSelectedOrderItemIds(defaultIds);
      // Set initial refund_amount
      form.setFieldsValue({
        refund_amount: data?.data?.order_items[0].subtotal,
        order_item_id: defaultIds,
      });
    }
  }, [data, form]);

  // Update refund_amount when selectedOrderItemIds changes
  useEffect(() => {
    if (data?.data?.order_items && selectedOrderItemIds.length > 0) {
      const selectedItems = data.data.order_items.filter(item =>
        selectedOrderItemIds.includes(item.id)
      );
      const total = selectedItems.reduce(
        (sum, item) => sum + parseFloat(item.subtotal || 0),
        0
      );
      form.setFieldsValue({
        refund_amount: total.toString(),
      });
    }
  }, [selectedOrderItemIds, data, form]);

  const onFinish = async (values) => {
    if (!data?.data?.id) {
      message.error("Không tìm thấy thông tin đơn hàng.");
      return;
    }
    setLoading(true);
    try {
      let formData;
      if (fileList && fileList.length > 0 && fileList[0].originFileObj) {
        formData = new FormData();
        formData.append("order_id", data?.data?.id || "");
        formData.append(
          "order_item_id",
          (values.order_item_id && values.order_item_id.length > 0)
            ? values.order_item_id[0]
            : ""
        );
        formData.append("reason", String(values.reason) || "");
        formData.append("description", values.description || "");
        formData.append("refund_bank_account", values.refund_bank_account || "");
        formData.append("refund_bank_name", values.refund_bank_name || "");
        formData.append("refund_amount", values.refund_amount || "");
        formData.append("refund_bank_customer_name", values.refund_bank_customer_name || "");
        // Gửi tất cả ảnh
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("images[]", file.originFileObj);
          }
        });
        await instanceAxios.post("/api/v1/order/orders-user-return", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload = {
          order_id: data?.data?.id || "",
          order_item_id:
            values.order_item_id && values.order_item_id.length > 0
              ? values.order_item_id[0]
              : "",
          reason: String(values.reason) || "",
          description: values.description || "",
          refund_bank_account: values.refund_bank_account || "",
          refund_bank_name: values.refund_bank_name || "",
          refund_amount: values.refund_amount || "",
          refund_bank_customer_name: values.refund_bank_customer_name || "",
        };
        await instanceAxios.post("/api/v1/order/orders-user-return", payload);
      }
      message.success("Đã gửi yêu cầu trả hàng thành công");
      nav("/my-profile/orders");
    } catch (error) {
      console.log(error.response?.data || error);
      message.error("Gửi yêu cầu thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spin />
      </div>
    );
  }

  // Lấy danh sách sản phẩm từ đơn hàng (nếu có)
  const orderItems = data?.data?.order_items || [];

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow mb-10">
      <h2 className="text-xl font-bold mb-4">Yêu cầu trả hàng</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {orderItems.length > 0 && (
          <Form.Item
            label="Chọn sản phẩm"
            name="order_item_id"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn sản phẩm"
              value={selectedOrderItemIds}
              onChange={(ids) => {
                setSelectedOrderItemIds(ids);
                form.setFieldsValue({ order_item_id: ids });
              }}
              optionLabelProp="label"
              optionFilterProp="children"
            >
              {orderItems.map((item) => (
                <Select.Option
                  key={item.id}
                  value={item.id}
                  label={
                    <span>
                      <img
                        // src={item.product_image ? `${process.env.REACT_APP_API_URL || ""}/${item.product_image}` : ""}
                        src={`http://127.0.0.1:8000/storage/${
                        item.product_image || item?.variants[0]?.image
                      }`}
                        alt={item.product_name}
                        style={{
                          width: 32,
                          height: 32,
                          objectFit: "cover",
                          borderRadius: 4,
                          marginRight: 8,
                          verticalAlign: "middle",
                        }}
                      />
                      {item.product_name} ({item.product_sku})
                    </span>
                  }
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={`http://127.0.0.1:8000/storage/${
                        item.product_image || item?.variants[0]?.image
                      }`}
                      alt={item.product_name}
                      style={{
                        width: 32,
                        height: 32,
                        objectFit: "cover",
                        borderRadius: 4,
                        marginRight: 8,
                        verticalAlign: "middle",
                      }}
                    />
                    <div>
                      <div>{item.product_name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{item.product_sku}</div>
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item
          label="Lý do trả hàng"
          name="reason"
          rules={[{ required: true, message: "Vui lòng nhập lý do trả hàng" }]}
        >
          <Select placeholder="Chọn lý do trả hàng">
            <Select.Option value="1">Sản phẩm lỗi</Select.Option>
            <Select.Option value="2">Giao sai màu</Select.Option>
            <Select.Option value="3">Không đúng mô tả</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Mô tả chi tiết" name="description">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item label="Tên ngân hàng" name="refund_bank_name">
          <Input />
        </Form.Item>
        <Form.Item label="Số tài khoản hoàn tiền" name="refund_bank_account">
          <Input />
        </Form.Item>
        <Form.Item label="Tên chủ tài khoản" name="refund_bank_customer_name">
          <Input />
        </Form.Item>
        <Form.Item label="Số tiền hoàn" name="refund_amount">
          <Input
            disabled={true}
            className="!bg-white !border !border-gray-300 !text-black"
          />
        </Form.Item>
        
        <Form.Item
          label="Ảnh minh chứng"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
        >
          <Upload
            beforeUpload={() => false}
            multiple
            maxCount={5}
            accept="image/*"
            onChange={handleImageChange}
            onRemove={handleRemove}
            showUploadList={false}
            fileList={fileList}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
          {previewImage && Array.isArray(previewImage) && (
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {previewImage.map((img, idx) => (
                <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={img}
                    alt={`preview-${idx}`}
                    style={{ maxWidth: 100, maxHeight: 100, borderRadius: 8, border: "1px solid #eee" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 14,
                      zIndex: 2,
                    }}
                    onClick={() => handleRemove(fileList[idx])}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          )}
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Gửi yêu cầu
        </Button>
      </Form>
    </div>
  );
};

export default ReturnRequestForm;
