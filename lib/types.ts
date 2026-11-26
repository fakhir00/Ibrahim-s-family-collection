export type Category = 'Women' | 'Men' | 'Kids' | 'Abaya';

export interface Product {
  id: string;
  name: string;
  price: number;
  compareAt?: number;
  category: Category;
  sizes: string[];
  colours: string[];
  stock: number;
  image: string;
  badge?: string;
  description: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  size: string;
  colour: string;
  image: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Settings {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}

export const DELIVERY_FEE = 250;
export const FREE_DELIVERY_THRESHOLD = 5000;

export function formatPKR(n: number): string {
  return 'PKR ' + n.toLocaleString('en-PK');
}
