import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store';
import { Search, CheckCircle, XCircle, Banknote, User, Truck, Package, ArrowRight, RotateCwb, Clock } from 'lucide-react';

export default function POS() {
  const orders = useStore(state => state.orders);
  const updateOrderItemFulfillment = useStore(state => state.updateOrderItemFulfillment);
  const updateOrderStatus = useStore(state => state.updateOrderStatus);
  const archiveOrder = useStore(state => state.archiveOrder);
  const [code, setCode] = useState('');
  const [activeOrder, setActiveOrder] = useState<typeof orders[0] | null>(null);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!activeOrder?.issuedAt) {
      setTimeLeft('');
      return;
    }
    const interval = setInterval(() => {
      const deadline = activeOrder.issuedAt + 5 * 24 * 60 * 60 * 1000;
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setTimeLeft('0 дней');
        return;
      }
      const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
      const daysText = days === 1 ? '1 день' : days >= 2 && days <= 4 ? `${days} дня` : `${days} дней`;
      setTimeLeft(daysText);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeOrder?.issuedAt]);

  const order = orders.find(o => o.code === code);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) return;
    
    const found = orders.find(o => o.code === code);
    if (found) {
      setActiveOrder(found);
      setError('');
      setShowPayment(false);
    } else {
      setActiveOrder(null);
      setError('Заказ не найден');
    }
  };
  
  const handleFulfill = (index: number, status: 'accepted' | 'returned') => {
    if (!order) return;
    updateOrderItemFulfillment(order.id, index, status);
    setActiveOrder(prev => {
      if (!prev) return prev;
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], fulfillmentStatus: status };
      return { ...prev, items: newItems };
    });
  };

  const calculateTotal = () => {
    if (!activeOrder) return 0;
    return activeOrder.items.reduce((sum, item) => {
      if (item.fulfillmentStatus !== 'returned') {
        const hasDiscount = item.product.discount && item.product.discount > 0 && 
          (!item.product.discountEndDate || item.product.discountEndDate > Date.now());
        const price = hasDiscount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
        return sum + (price * item.quantity);
      }
      return sum;
    }, 0);
  };

  const handlePayment = () => {
    if (!activeOrder) return;
    
    const hasAny = activeOrder.items.some(item => item.fulfillmentStatus === 'accepted' || item.fulfillmentStatus === 'returned');
    
    if (!hasAny) {
      alert('Выберите товар');
      return;
    }
    
    const hasRejected = activeOrder.items.some(item => item.fulfillmentStatus === 'returned');
    const hasAccepted = activeOrder.items.some(item => item.fulfillmentStatus === 'accepted');
    
    if (order?.status === 'issued') {
      updateOrderStatus(activeOrder.id, 'returned');
      setActiveOrder(null);
      setCode('');
      setShowPayment(false);
      alert('Возврат оформлен.');
      return;
    }
    
    if (hasRejected && hasAccepted) {
      archiveOrder(activeOrder.id, 'issued');
    } else if (hasRejected && !hasAccepted) {
      archiveOrder(activeOrder.id, 'rejected');
    } else {
      archiveOrder(activeOrder.id, 'issued');
    }
    
    setActiveOrder(null);
    setCode('');
    setShowPayment(false);
    alert('Заказ завершен.');
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.24))] gap-6 p-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white rounded-[2rem] p-8 border border-[#F0F0F0] shadow-lg shadow-gray-200/50">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-[#2D3436] to-[#1a1f21] bg-clip-text text-transparent">Кассовый терминал</span>
          </h1>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Код заказа (0000)"
              className="flex-1 text-2xl tracking-[0.5em] font-bold bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-[#E8E8E8] rounded-2xl py-5 px-6 outline-none focus:border-[#2D3436] focus:ring-4 focus:ring-[#2D3436]/10 transition-all"
            />
            <button
              type="submit"
              disabled={code.length !== 4}
              className="bg-gradient-to-r from-[#2D3436] to-[#1a1f21] text-white px-8 rounded-2xl font-bold hover:shadow-xl hover:shadow-[#2D3436]/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Найти
            </button>
          </form>
          {error && <p className="text-red-500 font-medium mt-4 animate-pulse">{error}</p>}
        </div>

        {activeOrder && order?.status === 'in_transit' && (
          <div className="flex-1 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-[2rem] border-2 border-yellow-200 shadow-lg flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
              <Truck className="w-10 h-10 text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-yellow-800">Заказ еще в пути</p>
            <p className="text-sm text-yellow-600 bg-white/50 px-4 py-2 rounded-xl">Сначала примите заказ в разделе "Заказы"</p>
          </div>
        )}

        {activeOrder && (order?.status === 'rejected' || order?.status === 'returned') && (
          <div className="flex-1 bg-gradient-to-br from-red-50 to-rose-50 rounded-[2rem] border-2 border-red-200 shadow-lg flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center shadow-lg">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-800">Заказ уже возвращен</p>
            <p className="text-sm text-red-600 bg-white/50 px-4 py-2 rounded-xl">
              {order?.status === 'rejected' ? 'Клиент отказался от товара' : 'Клиент вернул заказ'}
            </p>
          </div>
        )}

        {activeOrder && order?.status !== 'in_transit' && order?.status !== 'rejected' && order?.status !== 'returned' && (
          <div className="bg-white rounded-[2rem] p-8 border border-[#F0F0F0] shadow-lg shadow-gray-200/50 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-dashed border-[#E8E8E8]">
              <div>
                <span className="text-sm text-gray-500 font-medium uppercase tracking-wider block mb-1 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Заказ #{activeOrder.id.toUpperCase()}
                </span>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2D3436] to-[#1a1f21] bg-clip-text text-transparent">Сборка заказа</h2>
                {order?.issuedAt && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg w-fit">
                    <CheckCircle className="w-4 h-4" />
                    Выдан: {new Date(order.issuedAt).toLocaleString('ru-RU')}
                  </p>
                )}
                {order?.status === 'issued' && order?.issuedAt && (
                  <p className="text-sm text-orange-600 mt-2 flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-lg w-fit">
                    <Clock className="w-4 h-4" />
                    На возврат осталось: {timeLeft}
                  </p>
                )}
              </div>
              <div className="bg-gradient-to-br from-[#2D3436] to-[#1a1f21] text-white px-6 py-3 rounded-2xl font-bold font-mono text-xl tracking-widest shadow-lg">
                {activeOrder.code}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {activeOrder.items.map((item, index) => {
                const isAccepted = item.fulfillmentStatus === 'accepted';
                const isPending = !item.fulfillmentStatus;
                return (
                <div 
                  key={index} 
                  className={`flex gap-5 p-5 rounded-2xl border-2 transition-all duration-300 ${
                    item.fulfillmentStatus === 'returned' 
                      ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 opacity-75' 
                      : isAccepted
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg shadow-green-200/30'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden shrink-0 border-2 border-[#F0F0F0] shadow-sm">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xl text-[#1a1a1a]">{item.product.name}</h4>
                      <p className="text-gray-500 font-medium">
                        {item.quantity} шт. × {item.product.price} ₽
                        {item.selectedSize && <span className="ml-2 bg-[#2D3436]/10 px-2 py-0.5 rounded text-xs">Размер: {item.selectedSize}</span>}
                      </p>
                    </div>
                    
                    <div className="flex gap-3 mt-3">
                      {order?.status !== 'issued' && !isPending && (
                        <button
                          type="button"
                          onClick={() => handleFulfill(index, 'accepted')}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Выдать
                        </button>
                      )}
                      {order?.status !== 'issued' && !isPending && (
                        <button
                          type="button"
                          onClick={() => handleFulfill(index, 'returned')}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95"
                        >
                          <XCircle className="w-4 h-4" />
                          Отказ
                        </button>
                      )}
                      {order?.status === 'issued' && isAccepted && (
                        <button
                          type="button"
                          onClick={() => handleFulfill(index, 'returned')}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Вернуть
                        </button>
                      )}
                      {isPending && (
                        <span className="text-sm text-gray-400 py-2.5">Не поступил</span>
                      )}
                    </div>
                  </div>

                  <div className="font-bold text-2xl flex items-center">
                    {(() => {
                      const hasDiscount = item.product.discount && item.product.discount > 0 && 
                        (!item.product.discountEndDate || item.product.discountEndDate > Date.now());
                      const price = hasDiscount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
                      return (
                        <span className={item.fulfillmentStatus === 'returned' ? 'line-through text-gray-400' : 'text-[#2D3436]'}>
                          {price * item.quantity} ₽
                          {hasDiscount && <span className="text-xs ml-1 text-green-600">(-{item.product.discount}%)</span>}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!activeOrder && (
          <div className="flex-1 bg-gradient-to-br from-white to-gray-50 rounded-[2rem] border-2 border-dashed border-[#E8E8E8] shadow-lg flex flex-col items-center justify-center text-gray-400 p-8 text-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
              <User className="w-12 h-12 opacity-30" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-500">Введите код заказа для начала работы</p>
              <p className="text-sm text-gray-400 mt-2">Код указан в чеке клиента</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-96 bg-gradient-to-br from-[#2D3436] to-[#1a1f21] text-white rounded-[2rem] p-8 flex flex-col shadow-2xl shadow-[#2D3436]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-gray-200 relative z-10">
          <Banknote className="w-6 h-6 text-green-400" />
          Оплата наличными
        </h3>

        {activeOrder && order?.status !== 'in_transit' && order?.status !== 'rejected' && order?.status !== 'returned' ? (
          <>
            <div className="flex-1 relative z-10">
              <div className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl mb-6 border border-white/10">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  К оплате
                </span>
                <span className="text-6xl font-black tabular-nums tracking-tight bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{calculateTotal()} ₽</span>
              </div>

              <div className="space-y-4 text-sm text-gray-400">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                  <span className="font-medium">Товаров принято</span>
                  <span className="text-white font-bold text-lg bg-green-500/20 px-3 py-1 rounded-lg">
                    {activeOrder.items.filter(i => i.fulfillmentStatus !== 'returned').reduce((acc, i) => acc + i.quantity, 0)} шт.
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                  <span className="font-medium">Отказ</span>
                  <span className="text-white font-bold text-lg bg-red-500/20 px-3 py-1 rounded-lg">
                    {activeOrder.items.filter(i => i.fulfillmentStatus === 'returned').reduce((acc, i) => acc + i.quantity, 0)} шт.
                  </span>
                </div>
              </div>
            </div>

            {!showPayment ? (
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 active:scale-[0.98] relative z-10"
              >
                Принять оплату
              </button>
            ) : (
              <div className="mt-6 space-y-4 animate-in slide-in-from-bottom-4 relative z-10">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 p-6 rounded-2xl text-center border border-green-500/30">
                  <p className="font-medium text-lg mb-2 text-white">Подтвердите получение</p>
                  <p className="text-3xl font-black text-green-400">{calculateTotal()} ₽</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-xl font-bold transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handlePayment}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 text-white py-4 rounded-xl font-bold transition-all shadow-lg"
                  >
                    Готово
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-30 text-center px-8 relative z-10">
            <p className="text-lg font-medium">Выберите заказ для проведения оплаты</p>
          </div>
        )}
      </div>
    </div>
  );
}