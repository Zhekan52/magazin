import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type OrderItemStatus = 'IN_TRANSIT' | 'ARRIVED' | 'PICKED_UP' | 'REJECTED';

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
  hasDiscount: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  status: OrderItemStatus;
}

export interface Order {
  id: string;
  code: string;
  items: OrderItem[];
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: number;
}

interface AppState {
  categories: Category[];
  products: Product[];
  orders: Order[];
  
  // Actions
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  createOrder: (items: { productId: string; quantity: number }[]) => string; // Returns code
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItemStatus) => void;
  completeOrderIfDone: (orderId: string) => void;
}

const initialCategories: Category[] = [
  { id: 'c1', name: 'Одежда' },
  { id: 'c2', name: 'Обувь' },
  { id: 'c3', name: 'Аксессуары' }
];

const initialProducts: Product[] = [
  {
    id: 'p1',
    categoryId: 'c1',
    name: 'Футболка базовая',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400',
    price: 1500,
    hasDiscount: false
  },
  {
    id: 'p2',
    categoryId: 'c1',
    name: 'Худи оверсайз',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400',
    price: 4500,
    salePrice: 3500,
    hasDiscount: true
  },
  {
    id: 'p3',
    categoryId: 'c2',
    name: 'Кроссовки городские',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    price: 8000,
    hasDiscount: false
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      categories: initialCategories,
      products: initialProducts,
      orders: [],
      
      addCategory: (name) => set((state) => ({
    categories: [...state.categories, { id: uuidv4(), name }]
  })),
  
  updateCategory: (id, name) => set((state) => ({
    categories: state.categories.map(c => c.id === id ? { ...c, name } : c)
  })),
  
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id),
    products: state.products.filter(p => p.categoryId !== id)
  })),
  
  addProduct: (product) => set((state) => ({
    products: [...state.products, { ...product, id: uuidv4() }]
  })),
  
  updateProduct: (id, product) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...product } : p)
  })),
  
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),
  
  createOrder: (items) => {
    // Generate unique 4-digit code
    let code: string;
    const { orders } = get();
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (orders.some(o => o.code === code && o.status === 'ACTIVE'));
    
    const newOrder: Order = {
      id: uuidv4(),
      code,
      items: items.map(item => ({
        id: uuidv4(),
        productId: item.productId,
        quantity: item.quantity,
        status: 'IN_TRANSIT'
      })),
      status: 'ACTIVE',
      createdAt: Date.now()
    };
    
    set((state) => ({
      orders: [...state.orders, newOrder]
    }));
    
    return code;
  },
  
  updateOrderItemStatus: (orderId, itemId, status) => set((state) => {
    const orders = state.orders.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        items: o.items.map(i => i.id === itemId ? { ...i, status } : i)
      };
    });
    return { orders };
  }),
  
  completeOrderIfDone: (orderId) => set((state) => {
    const orders = state.orders.map(o => {
      if (o.id !== orderId) return o;
      const isDone = o.items.every(i => i.status === 'PICKED_UP' || i.status === 'REJECTED');
      return isDone ? { ...o, status: 'COMPLETED' as const } : o;
    });
    return { orders };
  })
    }),
    { name: 'retail-storage' }
  )
);
