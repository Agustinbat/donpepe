export type Category =
  | "promociones"
  | "pizzas"
  | "empanadas"
  | "calzones"
  | "faina"
  | "bebidas";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  available: boolean;
  sort_order: number;
}

export interface Settings {
  whatsapp_number: string;
  business_name: string;
  address: string;
  phone: string;
  tagline: string;
}

export interface ProductChoice {
  productId: string;
  quantity: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  choices?: ProductChoice[];
}

export interface StoreData {
  products: Product[];
  settings: Settings;
}
