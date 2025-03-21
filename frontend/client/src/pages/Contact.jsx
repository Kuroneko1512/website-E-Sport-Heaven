import { Form, Input, Button } from "antd";
import { EnvironmentOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const Contact = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("Form Values:", values);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Form gửi thông tin */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-xl md:text-2xl font-bold mb-4 dark:text-white">GỬI THÔNG TIN</h2>
          <p className="mb-6 dark:text-gray-300 text-sm md:text-base">
            Bạn hãy điền nội dung tin nhắn vào form dưới đây và gửi cho chúng tôi. 
            Chúng tôi sẽ trả lời bạn sau khi nhận được.
          </p>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
          >
            <div className="flex flex-col md:flex-row md:gap-4">
              <div className="w-full">
                <Form.Item
                  label={<span className="dark:text-white">Họ tên*</span>}
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                  <Input 
                    placeholder="Nhập họ tên" 
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </Form.Item>
              </div>
              <div className="w-full">
                <Form.Item
                  label={<span className="dark:text-white">Email*</span>}
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input 
                    placeholder="Nhập email" 
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </Form.Item>
              </div>
            </div>

            <Form.Item
              label={<span className="dark:text-white">Điện thoại*</span>}
              name="phone"
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
            >
              <Input 
                placeholder="Nhập số điện thoại" 
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </Form.Item>

            <Form.Item
              label={<span className="dark:text-white">Nội dung*</span>}
              name="message"
              rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
            >
              <TextArea 
                rows={6} 
                placeholder="Nhập nội dung tin nhắn"
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </Form.Item>

            <Button 
              type="primary" 
              htmlType="submit" 
              className="bg-gray-800 dark:bg-gray-700 px-6 py-2 text-sm md:text-base"
            >
              GỬI TIN NHẮN
            </Button>
          </Form>
        </div>

        {/* Thông tin liên hệ */}
        <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
          <h2 className="text-xl md:text-2xl font-bold mb-4 dark:text-white">THÔNG TIN LIÊN HỆ</h2>
          <p className="mb-6 dark:text-gray-300 text-sm md:text-base">
            Liên hệ ngay Hotline <span className="font-semibold">(704) 655-0127</span> để được tư vấn cụ thể bạn nhé!
          </p>
          <ul className="space-y-4">
            <li className="flex items-start dark:text-gray-300 text-sm md:text-base">
              <EnvironmentOutlined className="text-lg mr-2 mt-1" />
              <p>Mễ Trì, Nam Từ Liêm, TP. Hà Nộii</p>
            </li>
            <li className="flex items-start dark:text-gray-300 text-sm md:text-base">
              <PhoneOutlined className="text-lg mr-2 mt-1" />
              <p>(704) 655-0127</p>
            </li>
            <li className="flex items-start dark:text-gray-300 text-sm md:text-base">
              <MailOutlined className="text-lg mr-2 mt-1" />
              <p>sportheaven@gmail.com</p>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default Contact;