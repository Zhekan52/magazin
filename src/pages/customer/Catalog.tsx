import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { ShoppingCart, Plus, Minus, Trash2, Search, ArrowUpDown, X, ZoomIn, Percent } from 'lucide-react';

export default function Catalog() {
  const { categories, products, cart, addToCart, updateCartQuantity, removeFromCart, storeClosed, storeClosedReason, openingBanner } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const navigate = useNavigate();

  const getDiscountedPrice = (product: typeof products[0]) => {
    if (product.discount && product.discount > 0) {
      if (product.discountEndDate && product.discountEndDate < Date.now()) return product.price;
      return Math.round(product.price * (1 - product.discount / 100));
    }
    return product.price;
  };

  const filteredProducts = useMemo(() => {
    let filtered = activeCategory === 'all' 
      ? products 
      : products.filter(p => p.categoryId === activeCategory);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query)
      );
    }
    
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
  }, [products, activeCategory, searchQuery, sortBy]);

  const getItemPrice = (item: typeof cart[0]) => {
    if (item.product.discount && item.product.discount > 0) {
      if (item.product.discountEndDate && item.product.discountEndDate < Date.now()) return item.product.price;
      return Math.round(item.product.price * (1 - item.product.discount / 100));
    }
    return item.product.price;
  };

  const cartTotal = cart.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {storeClosed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-md text-center m-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Магазин закрыт</h2>
            {storeClosedReason ? (
              <p className="text-gray-500 mb-4">{storeClosedReason}</p>
            ) : (
              <p className="text-gray-500 mb-4">Мы временно приостановили прием заказов. Приносим извинения за неудобства.</p>
            )}
            <p className="text-sm text-gray-400">Попробуйте позже</p>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
        {openingBanner && (
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white text-center py-4 px-4 rounded-2xl mb-6 shadow-lg animate-pulse">
            <div className="flex items-center justify-center gap-3 font-bold text-lg">
              <Percent className="w-6 h-6" />
              В честь открытия -50% скидка на все товары!
              <Percent className="w-6 h-6" />
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E8E8E8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2D3436]/20 focus:border-[#2D3436] transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#E8E8E8] shadow-sm">
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                sortBy === 'name' ? 'bg-[#2D3436] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              По названию
            </button>
            <button
              onClick={() => setSortBy('price-asc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'price-asc' ? 'bg-[#2D3436] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Дешевле
            </button>
            <button
              onClick={() => setSortBy('price-desc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'price-desc' ? 'bg-[#2D3436] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Дороже
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            key="all"
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-3 rounded-2xl whitespace-nowrap font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-[#2D3436] to-[#1a1f21] text-white shadow-lg shadow-[#2D3436]/30'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#F0F0F0]'
            }`}
          >
            Все товары
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-2xl whitespace-nowrap font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-[#2D3436] to-[#1a1f21] text-white shadow-lg shadow-[#2D3436]/30'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#F0F0F0]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mb-6 text-sm text-gray-500">
          Найдено товаров: <span className="font-semibold text-[#2D3436]">{filteredProducts.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="group bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#F0F0F0] hover:border-[#2D3436]/20 flex flex-col animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl mb-4 overflow-hidden relative cursor-pointer" onClick={() => product.image && setZoomImage(product.image)}>
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#1a1a1a] group-hover:text-[#2D3436] transition-colors">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
              {product.sizes && product.sizes.length > 0 && (
                <div className="flex gap-1 mb-3 flex-wrap">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: size }))}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        selectedSizes[product.id] === size
                          ? 'bg-[#2D3436] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  {(product.discount && product.discount > 0 && (!product.discountEndDate || product.discountEndDate > Date.now())) ? (
                    <>
                      <span className="font-bold text-2xl text-[#2D3436]">{getDiscountedPrice(product)} ₽</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 line-through">{product.price} ₽</span>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{product.discount}%</span>
                      </div>
                    </>
                  ) : (
                    <span className="font-bold text-2xl text-[#2D3436]">{product.price} ₽</span>
                  )}
                </div>
                <button
                  onClick={() => !storeClosed && addToCart(product, selectedSizes[product.id])}
                  disabled={storeClosed || (product.sizes && product.sizes.length > 0 && !selectedSizes[product.id])}
                  className="bg-gradient-to-r from-[#2D3436] to-[#1a1f21] text-white p-4 rounded-2xl hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-[#2D3436]/30 group-hover:rotate-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Товары не найдены</p>
            <p className="text-sm">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>

      <div className="w-96 bg-white border-l border-[#F0F0F0] flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] relative z-10">
        <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between bg-gradient-to-r from-white to-gray-50/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#2D3436]" />
            <span className="bg-gradient-to-r from-[#2D3436] to-[#1a1f21] bg-clip-text text-transparent">Корзина</span>
          </h2>
          <span className="bg-[#2D3436]/10 text-[#2D3436] px-3 py-1 rounded-full text-sm font-medium">
            {cart.length} товаров
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 animate-pulse">
              <ShoppingCart className="w-16 h-16 opacity-30" />
              <p className="text-lg font-medium">Корзина пуста</p>
              <p className="text-sm">Добавьте товары из каталога</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-[#F0F0F0] hover:border-[#2D3436]/20 hover:shadow-md transition-all duration-300 group">
                <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0 border-2 border-[#F0F0F0] group-hover:border-[#2D3436]/20 transition-colors">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0 overflow-hidden">
                  <div className="flex justify-between gap-2 items-start">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-[#1a1a1a] line-clamp-2">{item.product.name}</h4>
                      {item.selectedSize && (
                        <span className="inline-block bg-[#2D3436]/10 text-[#2D3436] text-xs font-bold px-2 py-1 rounded-lg mt-1">
                          Размер: {item.selectedSize}
                        </span>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(item.product.id, item.selectedSize)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {(item.product.discount && item.product.discount > 0 && (!item.product.discountEndDate || item.product.discountEndDate > Date.now())) ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D3436]">{getItemPrice(item)} ₽</span>
                        <span className="text-xs text-gray-400 line-through">{item.product.price} ₽</span>
                        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">-{item.product.discount}%</span>
                      </div>
                    ) : (
                      <span className="font-bold text-[#2D3436]">{getItemPrice(item)} ₽</span>
                    )}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E8E8E8] shadow-sm">
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) updateCartQuantity(item.product.id, item.quantity - 1, item.selectedSize);
                          else removeFromCart(item.product.id, item.selectedSize);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-[#F0F0F0] bg-gradient-to-b from-white to-gray-50/50">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed border-[#E8E8E8]">
            <span className="text-gray-500 font-medium">Итого</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-[#2D3436]">{cartTotal} ₽</span>
            </div>
          </div>
          <button
            disabled={cart.length === 0 || storeClosed}
            onClick={() => navigate('/customer/checkout')}
            className="w-full bg-gradient-to-r from-[#2D3436] to-[#1a1f21] text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-[#2D3436]/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            Оформить заказ
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8" onClick={() => setZoomImage(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20">
            <X className="w-6 h-6 text-white" />
          </button>
          <img src={zoomImage} alt="Zoom" className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}