/** Ảnh kèm theo yêu cầu đổi/trả */
export interface OrderReturnImage {
  id: number;
  return_id: number;
  image_path: string;
  created_at: string;
  updated_at: string;
}

/** Sản phẩm (bản đầy đủ như API trả về) */
export interface Product {
  id: number;
  name: string;
  price: string;               // chuỗi vì backend gửi kiểu decimal
  discount_percent: string | null;
  discount_start: string | null;
  discount_end: string | null;
  sku: string;
  description: string;
  image: string;
  stock: number;
  product_type: "simple" | "variant";
  status: "active" | "inactive";
  category_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Biến thể sản phẩm (nếu backend trả null thì cứ để optional) */
export interface ProductVariant {
  id: number;
  sku: string;
  // thêm các trường khác nếu API có
}

/** Mục đơn hàng */
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  product_type: number;                     // 0: simple, 1: variant…
  product_variant_id: number | null;
  variant_sku: string | null;
  variant_attributes: Record<string, any> | null;
  product_image: string | null;
  quantity: number;
  returned_quantity: number;
  return_status: number;
  return_reason: string | null;
  refunded_amount: string;
  subtotal: string;
  price: string;
  original_price: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product: Product;
  product_variant: ProductVariant | null;
}

/** Đơn hàng (rút gọn các trường bạn dùng, thêm/bớt tùy nhu cầu) */
export interface Order {
  id: number;
  customer_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  order_code: string;
  total_amount: string;
  subtotal: string;
  tax_amount: string;
  status: number;
  is_store_pickup: boolean;
  refunded_amount: string;
  payment_status: number;
  payment_method: string;
  paid_at: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  order_items: OrderItem[];
}

/** Yêu cầu đổi / trả hàng */
export interface OrderReturn {
  id: number;
  order_id: number;
  order_item_id: number | null;
  reason: number;
  description: string | null;
  image: string | null;                     // vẫn còn cột image nên giữ
  video: string | null;
  refund_bank_account: string | null;
  refund_bank_name: string | null;
  refund_bank_customer_name: string | null;
  refund_amount: string | null;             // decimal từ backend
  refunded_at: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  order_status: number;
  images: OrderReturnImage[];               // new
  order: Order;                             // new
}
