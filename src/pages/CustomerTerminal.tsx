import { useState } from 'react';
import { useAppStore, Order } from '../store';
import { ShoppingCart, ArrowLeft, Plus, Minus, Package, Search } from 'lucide-react';

function Catalog({ 
  onNavigateToCart, 
  cart, 
  addToCart, 
  removeFromCart 
}: { 
  onNavigateToCart: () => void,
  cart: { productId: string, quantity: number }[],
  addToCart: (id: string) => void,
  removeFromCart: (id: string) => void
}) {
  const { categories, products } = useAppStore();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);

  const filteredProducts = products.filter(p => p.categoryId === activeCategory);

  const getQuantity = (productId: string) => {
    return cart.find(item => item.productId === productId)?.quantity || 0;
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="nav">
        <div className="nav__container">
          <h1 className="nav__brand">Каталог</h1>
          <button 
            onClick={() => onNavigateToCart()} 
            className="btn btn--primary btn--sm"
          >
            <ShoppingCart size={20} />
            <span>Корзина ({totalItems})</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-4 hide-scrollbar">
          {categories.map((c, index) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`category-pill ${activeCategory === c.id ? 'category-pill--active' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="product-card"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="product-card__image">
                <img src={product.image} alt={product.name} />
                {product.hasDiscount && (
                  <div className="product-card__badge">
                    -{(1 - (product.salePrice || 0) / product.price * 100).toFixed(0)}%
                  </div>
                )}
              </div>
              <div className="product-card__content">
                <h3 className="product-card__title">{product.name}</h3>
                <div className="product-card__price">
                  {product.hasDiscount ? (
                    <>
                      <div className="product-card__price-original">{product.price.toLocaleString()} ₽</div>
                      <div className="product-card__price-current product-card__price--sale">
                        {product.salePrice?.toLocaleString()} ₽
                      </div>
                    </>
                  ) : (
                    <div className="product-card__price-current">{product.price.toLocaleString()} ₽</div>
                  )}
                </div>
                
                <div className="mt-4">
                  {getQuantity(product.id) > 0 ? (
                    <div className="quantity-controls">
                      <button 
                        onClick={() => removeFromCart(product.id)} 
                        className="quantity-controls__btn"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="quantity-controls__value">{getQuantity(product.id)}</span>
                      <button 
                        onClick={() => addToCart(product.id)} 
                        className="quantity-controls__btn"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(product.id)}
                      className="counter-btn w-full"
                    >
                      <Plus size={22} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CartView({ onBack, cart, onCheckout }: { onBack: () => void; cart: any[]; onCheckout: () => void }) {
  const { products } = useAppStore();
  
  const getProduct = (id: string) => products.find(p => p.id === id);
  
  const totalAmount = cart.reduce((acc: number, item: any) => {
    const product = getProduct(item.productId);
    if (!product) return acc;
    const price = product.hasDiscount && product.salePrice ? product.salePrice : product.price;
    return acc + (price * item.quantity);
  }, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="empty-state">
          <div className="empty-state__icon">
            <ShoppingCart size={36} />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-4">Корзина пуста</h2>
          <p className="text-secondary mb-8">Добавьте товары из каталога</p>
          <button onClick={onBack} className="btn btn--primary">
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="nav">
        <div className="nav__container">
          <button onClick={onBack} className="icon-btn">
            <ArrowLeft size={28} />
          </button>
          <h1 className="nav__brand">Корзина</h1>
          <div style={{ width: 44 }}></div>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-6 max-w-2xl mx-auto w-full">
        <div className="card">
          {cart.map((item: any, index: number) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            const price = product.hasDiscount && product.salePrice ? product.salePrice : product.price;
            
            return (
              <div 
                key={item.productId} 
                className="cart-item"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img src={product.image} alt={product.name} className="cart-item__image" />
                <div className="cart-item__details">
                  <h3 className="cart-item__title">{product.name}</h3>
                  <div className="cart-item__meta">{price.toLocaleString()} ₽ × {item.quantity}</div>
                </div>
                <div className="cart-item__total">{(price * item.quantity).toLocaleString()} ₽</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="total-bar">
        <div>
          <div className="total-bar__label">Итого к оплате</div>
          <div className="total-bar__value">{totalAmount.toLocaleString()} ��</div>
        </div>
        <button 
          onClick={onCheckout}
          className="btn btn--primary btn--lg"
        >
          Оформить заказ
        </button>
      </div>
    </div>
  );
}

function TrackingView({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const { orders, products } = useAppStore();

  const handleSearch = () => {
    const found = orders.find(o => o.code === code && o.status === 'ACTIVE');
    if (found) {
      setOrder(found);
    } else {
      alert('Заказ не найден или уже завершен');
    }
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  if (order) {
    const statusMap: Record<string, { text: string; class: string }> = {
      IN_TRANSIT: { text: 'В пути', class: 'status-badge--in-transit' },
      ARRIVED: { text: 'Прибыл', class: 'status-badge--arrived' },
      PICKED_UP: { text: 'Выдан', class: 'status-badge--picked-up' },
      REJECTED: { text: 'Отказ', class: 'status-badge--rejected' }
    };

    const remainingItems = order.items.filter(i => i.status === 'IN_TRANSIT' || i.status === 'ARRIVED');
    const owedAmount = remainingItems.reduce((acc, item) => {
      const p = getProduct(item.productId);
      if (!p) return acc;
      const price = p.hasDiscount && p.salePrice ? p.salePrice : p.price;
      return acc + (price * item.quantity);
    }, 0);

    return (
      <div className="min-h-screen flex flex-col">
        <header className="nav">
          <div className="nav__container">
            <button onClick={() => setOrder(null)} className="icon-btn">
              <ArrowLeft size={28} />
            </button>
            <h1 className="nav__brand">Заказ #{order.code}</h1>
            <div style={{ width: 44 }}></div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 max-w-2xl mx-auto w-full">
          <div className="card">
            {order.items.map((item, index) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              
              return (
                <div 
                  key={item.id} 
                  className="cart-item"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img src={product.image} alt={product.name} className="cart-item__image" style={{ width: 64, height: 64 }} />
                  <div className="cart-item__details">
                    <h3 className="cart-item__title">{product.name}</h3>
                    <div className="cart-item__meta">Количество: {item.quantity}</div>
                  </div>
                  <span className={`status-badge ${statusMap[item.status]?.class || ''}`}>
                    {statusMap[item.status]?.text}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="card flex justify-between items-center mt-6">
            <span className="text-lg font-medium">К оплате:</span>
            <span className="text-2xl font-bold">{owedAmount.toLocaleString()} ₽</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <button onClick={onBack} className="absolute top-6 left-6 icon-btn">
        <ArrowLeft size={28} />
      </button>
      <div className="empty-state">
        <div className="empty-state__icon">
          <Package size={36} />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-3">Отследить заказ</h2>
        <p className="text-secondary mb-8">Введите код из 4 цифр</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <input 
            type="text" 
            placeholder="Код заказа" 
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            className="input text-center text-2xl tracking-widest"
          />
          <button 
            onClick={handleSearch}
            className="btn btn--primary"
          >
            <Search size={20} />
            Найти
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerTerminal() {
  const [view, setView] = useState<'catalog' | 'cart' | 'tracking' | 'success'>('catalog');
  const [lastCode, setLastCode] = useState('');
  
  const [cart, setCart] = useState<{ productId: string, quantity: number }[]>([]);
  const { createOrder } = useAppStore();

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.productId !== productId);
    });
  };

  const handleCheckout = () => {
    const code = createOrder(cart);
    setLastCode(code);
    setCart([]);
    setView('success');
  };

  if (view === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="order-success">
          <div className="order-success__icon">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary">Ваш заказ оформлен</h2>
          <p className="text-secondary mt-2">Сохраните код для получения:</p>
          <div className="order-success__code">{lastCode}</div>
          <button 
            onClick={() => setView('catalog')}
            className="btn btn--primary btn--lg"
          >
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  if (view === 'tracking') return <TrackingView onBack={() => setView('catalog')} />;

  if (view === 'cart') return <CartView onBack={() => setView('catalog')} cart={cart} onCheckout={handleCheckout} />;

  return (
    <div className="relative">
      <Catalog 
        onNavigateToCart={() => setView('cart')} 
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
      />
      <button 
        onClick={() => setView('tracking')}
        className="floating-btn"
      >
        <Package size={22} />
        <span>Отследить заказ</span>
      </button>
    </div>
  );
}