export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  sizes?: string[];
  discount?: number;
  discountEndDate?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
  selectedSize?: string;
};

export type OrderItem = CartItem & {
  fulfillmentStatus?: 'accepted' | 'returned';
};

export type OrderStatus = 'in_transit' | 'arrived' | 'completed' | 'archived' | 'issued' | 'rejected' | 'returned';

export type Order = {
  id: string;
  code: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: number;
  archivedAt?: number;
  issuedAt?: number;
};