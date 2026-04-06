import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { CheckCircle2, ChevronLeft, Tag, X } from 'lucide-react';

export default function Checkout() {
  const { cart, addOrder, clearCart, applyPromoCode, removePromoCode, appliedPromoCode } = useStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const getItemPrice = (item: typeof cart[0]) => {
    const hasDiscount = item.product.discount && item.product.discount > 0 && (!item.product.discountEndDate || item.product.discountEndDate > Date.now());
    return hasDiscount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
  };

  const subtotal = cart.reduce((sum, item) => {
    const hasDiscount = item.product.discount && item.product.discount > 0 && (!item.product.discountEndDate || item.product.discountEndDate > Date.now());
    const price = hasDiscount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const promoDiscount = appliedPromoCode ? (subtotal * appliedPromoCode.discount / 100) : 0;
  const total = subtotal - promoDiscount;

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    if (!promoInput.trim()) return;
    const result = applyPromoCode(promoInput);
    if (result.success) {
      setPromoSuccess(result.message);
    } else {
      setPromoError(result.message);
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoInput('');
    setPromoSuccess('');
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = addOrder({
        code: '', 
        items: cart,
        totalAmount: total,
        status: 'in_transit'
      });
      
      clearCart();
      setSuccessCode(result.code);
      setIsProcessing(false);
    }, 1500);
  };

  if (successCode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-73px)] bg-gray-50/50 p-6">
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-[#F0F0F0] max-w-md w-full text-center flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold">Заказ оформлен!</h2>
          <p className="text-gray-500">Покажите этот код на кассе при получении заказа.</p>
          
          <div className="bg-gray-100 px-8 py-6 rounded-3xl mt-4 w-full">
            <span className="text-sm text-gray-500 font-medium uppercase tracking-wider block mb-2">Ваш код</span>
            <span className="text-6xl font-black tracking-widest text-[#2D3436]">{successCode}</span>
          </div>

          <button
            onClick={() => navigate('/customer/tracking')}
            className="w-full bg-[#2D3436] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-colors mt-6"
          >
            Отследить заказ
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !successCode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-73px)]">
        <p className="text-gray-500 mb-4">Ваша корзина пуста</p>
        <button onClick={() => navigate('/customer')} className="text-[#2D3436] font-medium underline">
          Вернуться в каталог
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <button 
        onClick={() => navigate('/customer')}
        className="flex items-center gap-2 text-gray-500 hover:text-[#2D3436] mb-8 transition-colors font-medium"
      >
        <ChevronLeft className="w-5 h-5" />
        Назад в каталог
      </button>

      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Promo Code */}
        <div className="bg-white p-6 rounded-3xl border border-[#F0F0F0] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold">Промокод</h2>
          </div>
          
          {appliedPromoCode ? (
            <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl">
              <div>
                <span className="font-bold text-green-600">{appliedPromoCode.code}</span>
                <span className="text-green-600 ml-2">-{appliedPromoCode.discount}%</span>
              </div>
              <button onClick={handleRemovePromo} className="p-2 hover:bg-green-100 rounded-lg">
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Введите промокод"
                className="flex-1 bg-gray-50 border border-[#F0F0F0] rounded-xl py-3 px-4 outline-none focus:border-[#2D3436]"
              />
              <button
                onClick={handleApplyPromo}
                disabled={!promoInput.trim()}
                className="bg-[#2D3436] text-white px-6 rounded-xl font-bold hover:bg-black disabled:opacity-50"
              >
                Применить
              </button>
            </div>
          )}
          {promoError && <p className="text-red-500 text-sm mt-2">{promoError}</p>}
          {promoSuccess && <p className="text-green-600 text-sm mt-2">{promoSuccess}</p>}
        </div>

        {/* Summary */}
        <div className="bg-white p-8 rounded-3xl border border-[#F0F0F0] shadow-sm flex flex-col h-fit">
          <h2 className="text-xl font-bold mb-6">Ваш заказ</h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
            {cart.map(item => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-[#F0F0F0]">
                  {item.product.image && (
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <div className="text-sm text-gray-500">
                    {item.quantity} шт × {getItemPrice(item)} ₽
                    {item.product.discount && item.product.discount > 0 && (!item.product.discountEndDate || item.product.discountEndDate > Date.now()) && (
                      <span className="ml-1 text-green-600">(-{item.product.discount}%)</span>
                    )}
                    {item.selectedSize && <span className="ml-2 bg-[#2D3436]/10 px-2 py-0.5 rounded text-xs">Размер: {item.selectedSize}</span>}
                  </div>
                </div>
                <div className="font-bold flex items-center">{getItemPrice(item)} ₽</div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#F0F0F0] pt-6 mb-6">
            <div className="flex justify-between items-center mb-2 text-gray-500">
              <span>Товары ({cart.length})</span>
              <span>{subtotal} ₽</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between items-center mb-2 text-green-600">
                <span>Скидка по промокоду</span>
                <span>-{promoDiscount} ₽</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xl font-bold mt-4">
              <span>Итого к оплате</span>
              <span>{total} ₽</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              isProcessing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#2D3436] text-white hover:bg-black active:scale-[0.98]'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                Обработка...
              </>
            ) : (
              'Подтвердить заказ'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}