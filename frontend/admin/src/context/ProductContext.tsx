import React, { createContext, useContext, useState } from 'react';

interface AttributeSelection {
  attribute_id: number;
  attribute_value_id: number;
}

interface Variant {
  price: number;
  stock: number;
  image?: File | string | null;
  attributes: AttributeSelection[];
}

interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  discount_percent?: string;
  product_type: "simple" | "variable";
  status: "active" | "inactive";
  category_id: string;
  stock: number;
  image?: File | null;
  selected_attributes: AttributeSelection[];
  variants: Variant[];
}

interface ProductContextType {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [product, setProduct] = useState<Product>({
    name: "",
    price: 0,
    discount_percent: "",
    product_type: "simple",
    status: "active",
    category_id: "",
    stock: 1,
    image: null,
    description: "",
    selected_attributes: [],
    variants: [],
  });

  return (
    <ProductContext.Provider value={{ product, setProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}; 