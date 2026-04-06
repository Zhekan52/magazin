import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Category, Product, Order, OrderStatus, CartItem, Product as ProductType } from './types';

export type CartItem = {
  product: ProductType;
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

export type PromoCode = {
  code: string;
  discount: number;
  expiresAt?: number;
  maxUses?: number;
  usedCount: number;
};

interface AppStateData {
  adminPassword: string;
  isAdminAuthenticated: boolean;
  categories: Category[];
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  usedCodes: string[];
  storeClosed: boolean;
  storeClosedReason: string;
  openingBanner: boolean;
  promoCodes: PromoCode[];
  appliedPromoCode?: PromoCode;
}

interface AppState extends AppStateData {
  setAdminPassword: (password: string) => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  setStoreClosed: (closed: boolean, reason?: string) => void;
  setOpeningBanner: (enabled: boolean) => void;
  addToCart: (product: Product, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addPromoCode: (promoCode: PromoCode) => void;
  deletePromoCode: (code: string) => void;
  applyPromoCode: (code: string) => { success: boolean; message: string; discount: number };
  removePromoCode: () => void;
  getAppliedPromo: () => PromoCode | undefined;
  
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderItemFulfillment: (orderId: string, itemIndex: number, status: 'accepted' | 'returned') => void;
  completeOrder: (id: string) => void;
  archiveOrder: (id: string, reason?: 'issued' | 'rejected') => void;
  returnOrder: (orderId: string, code: string) => { success: boolean; message: string };
  resetAllData: () => void;
  
  syncToFirebase: () => Promise<void>;
  loadFromFirebase: () => Promise<void>;
}

const initialCategories = [
  { id: '1', name: 'Кофе' },
  { id: '2', name: 'Выпечка' },
];

const initialProducts = [
  {
    id: '1',
    name: 'Эспрессо',
    description: 'Классический черный кофе, сваренный из свежеобжаренных зерен 100% арабики.',
    price: 150,
    categoryId: '1',
    image: 'coffee.jpg',
  },
  {
    id: '2',
    name: 'Круассан',
    description: 'Свежий классический французский круассан с хрустящей корочкой и нежным мякишем.',
    price: 120,
    categoryId: '2',
    image: 'croissant.jpg',
  }
];

const DATA_DOC = 'storeData';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      adminPassword: '1234',
      isAdminAuthenticated: false,
      categories: initialCategories,
      products: initialProducts,
      orders: [],
      cart: [],
      usedCodes: [],
      storeClosed: false,
      storeClosedReason: '',
      openingBanner: true,
      promoCodes: [],
      appliedPromoCode: undefined,
      
      syncToFirebase: async () => {
        const state = get();
        try {
          const productsClean = state.products.map(p => ({
            ...p,
            image: '' 
          }));
          const dataToSave: AppStateData = {
            adminPassword: state.adminPassword,
            isAdminAuthenticated: state.isAdminAuthenticated,
            categories: state.categories,
            products: productsClean,
            orders: state.orders,
            usedCodes: state.usedCodes,
            storeClosed: state.storeClosed,
            storeClosedReason: state.storeClosedReason,
            openingBanner: state.openingBanner,
            promoCodes: state.promoCodes,
            cart: [],
          };
          await setDoc(doc(db, DATA_DOC, 'main'), { ...dataToSave, updatedAt: Date.now() });
          console.log('✅ Synced to Firebase');
        } catch (e) {
          console.error('❌ Sync failed:', e);
        }
      },
      
      loadFromFirebase: async () => {
        try {
          const snap = await getDoc(doc(db, DATA_DOC, 'main'));
          if (snap.exists()) {
            const data = snap.data() as AppStateData;
            const currentState = useStore.getState();
            set({
              categories: data.categories || initialCategories,
              products: currentState.products,
              orders: data.orders || [],
              usedCodes: data.usedCodes || [],
              storeClosed: data.storeClosed || false,
              storeClosedReason: data.storeClosedReason || '',
              openingBanner: data.openingBanner ?? true,
              promoCodes: data.promoCodes || [],
            });
            console.log('✅ Loaded from Firebase');
          } else {
            console.log('📝 No Firebase data, using defaults');
            get().syncToFirebase();
          }
        } catch (e) {
          console.error('❌ Load failed:', e);
        }
      },
      
      setAdminPassword: (password) => set({ adminPassword: password }),
      
      loginAdmin: (password) => {
        const isValid = get().adminPassword === password;
        if (isValid) set({ isAdminAuthenticated: true });
        return isValid;
      },
      
      logoutAdmin: () => set({ isAdminAuthenticated: false }),
      
      setStoreClosed: (closed: boolean, reason: string = '') => { 
        set({ storeClosed: closed, storeClosedReason: reason });
        get().syncToFirebase();
      },
      
      setOpeningBanner: (enabled: boolean) => {
        set({ openingBanner: enabled });
        get().syncToFirebase();
      },
      
      addToCart: (product, selectedSize?: string) => set((state) => {
        const existing = state.cart.find(item => item.product.id === product.id && item.selectedSize === selectedSize);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.product.id === product.id && item.selectedSize === selectedSize ? { ...item, quantity: item.quantity + 1 } : item
            )
          };
        }
        return { cart: [...state.cart, { product, quantity: 1, selectedSize }] };
      }),
      removeFromCart: (productId, selectedSize?: string) => set((state) => ({
        cart: state.cart.filter(item => !(item.product.id === productId && item.selectedSize === selectedSize))
      })),
      updateCartQuantity: (productId, quantity, selectedSize?: string) => set((state) => ({
        cart: state.cart.map(item => 
          item.product.id === productId && item.selectedSize === selectedSize ? { ...item, quantity } : item
        )
      })),
      clearCart: () => set({ cart: [] }),
      
      addCategory: (category) => {
        set((state) => ({ categories: [...state.categories, category] }));
        get().syncToFirebase();
      },
      updateCategory: (id, categoryUpdate) => {
        set((state) => ({
          categories: state.categories.map((c) => c.id === id ? { ...c, ...categoryUpdate } : c)
        }));
        get().syncToFirebase();
      },
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          products: state.products.filter((p) => p.categoryId !== id)
        }));
        get().syncToFirebase();
      },
      
      addProduct: (product) => {
        set((state) => ({ products: [...state.products, product] }));
        get().syncToFirebase();
      },
      updateProduct: (id, productUpdate) => {
        set((state) => ({
          products: state.products.map((p) => p.id === id ? { ...p, ...productUpdate } : p)
        }));
        get().syncToFirebase();
      },
      deleteProduct: (id) => {
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
        get().syncToFirebase();
      },
      
      addPromoCode: (promoCode) => {
        set((state) => ({ promoCodes: [...state.promoCodes, { ...promoCode, usedCount: 0 }] }));
        get().syncToFirebase();
      },
      deletePromoCode: (code) => {
        set((state) => ({ promoCodes: state.promoCodes.filter((p) => p.code !== code) }));
        get().syncToFirebase();
      },
      applyPromoCode: (code) => {
        const state = useStore.getState();
        const promo = state.promoCodes.find(p => p.code === code.toUpperCase());
        if (!promo) return { success: false, message: 'Промокод не найден', discount: 0 };
        if (promo.expiresAt && promo.expiresAt < Date.now()) return { success: false, message: 'Срок действия истек', discount: 0 };
        if (promo.maxUses && promo.usedCount >= promo.maxUses) return { success: false, message: 'Лимит использований исчерпан', discount: 0 };
        set({ appliedPromoCode: promo });
        return { success: true, message: `Применен! -${promo.discount}%`, discount: promo.discount };
      },
      removePromoCode: () => {
        set({ appliedPromoCode: undefined });
      },
      getAppliedPromo: () => {
        return useStore.getState().appliedPromoCode;
      },
      
      addOrder: (orderData) => {
        const state = useStore.getState();
        
        let code: string;
        let attempts = 0;
        do {
          code = Math.floor(1000 + Math.random() * 9000).toString();
          attempts++;
          if (attempts > 100) break;
        } while (state.usedCodes.includes(code) || state.orders.some(o => o.code === code));
        
        const id = Math.random().toString(36).substring(2, 9);
        
        const appliedPromo = state.appliedPromoCode;
        
        const order: Order = {
          ...orderData,
          id,
          code: orderData.code || code,
          createdAt: Date.now(),
        };
        
        if (appliedPromo) {
          set((state) => ({ 
            orders: [...state.orders, order],
            usedCodes: [...state.usedCodes, orderData.code || code],
            promoCodes: state.promoCodes.map(p => 
              p.code === appliedPromo.code ? { ...p, usedCount: p.usedCount + 1 } : p
            ),
            appliedPromoCode: undefined,
          }));
        } else {
          set((state) => ({ 
            orders: [...state.orders, order],
            usedCodes: [...state.usedCodes, orderData.code || code]
          }));
        }
        get().syncToFirebase();
        return { id, code: orderData.code || code };
      },
      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => o.id === id ? { ...o, status } : o)
        }));
        get().syncToFirebase();
      },
      updateOrderItemFulfillment: (orderId, itemIndex, fulfillmentStatus) => set((state) => ({
        orders: state.orders.map((o) => {
          if (o.id === orderId) {
            const newItems = [...o.items];
            newItems[itemIndex] = { ...newItems[itemIndex], fulfillmentStatus };
            return { ...o, items: newItems };
          }
          return o;
        })
      })),
      completeOrder: (id) => {
        set((state) => ({
          orders: state.orders.map((o) => o.id === id ? { ...o, status: 'completed' } : o)
        }));
        get().syncToFirebase();
      },
      
      archiveOrder: (id, reason: 'issued' | 'rejected' = 'issued') => {
        set((state) => ({
          orders: state.orders.map((o) => o.id === id ? { 
            ...o, 
            status: reason, 
            archivedAt: Date.now(),
            issuedAt: reason === 'issued' ? Date.now() : o.issuedAt 
          } : o)
        }));
        get().syncToFirebase();
      },
      
      returnOrder: (orderId, code) => {
        const state = useStore.getState();
        const order = state.orders.find(o => o.id === orderId || o.code === code);
        
        if (!order) {
          return { success: false, message: 'Заказ не найден' };
        }
        
        if (order.status === 'in_transit' || order.status === 'arrived') {
          return { success: false, message: 'Заказ еще не выдан. Получите заказ в магазине.' };
        }
        
        if (order.status !== 'issued') {
          return { success: false, message: 'Заказ уже недоступен для возврата' };
        }
        
        set((state) => ({
          orders: state.orders.map((o) => o.id === order.id ? { ...o, status: 'returned', archivedAt: Date.now() } : o)
        }));
        get().syncToFirebase();
        
        return { success: true, message: `Заказ ${order.code} успешно возвращен. Сумма: ${order.totalAmount} ₽` };
      },

      resetAllData: () => {
        set({
          orders: [],
          cart: [],
          categories: initialCategories,
          products: initialProducts,
          usedCodes: [],
        });
        get().syncToFirebase();
      }
    }),
    {
      name: 'retail-storage',
    }
  )
);