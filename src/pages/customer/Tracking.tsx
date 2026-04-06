import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Search, Package, MapPin, CheckCircle, XCircle, RotateCcw, Clock } from 'lucide-react';

export default function Tracking() {
  const { orders } = useStore();
  const [code, setCode] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<typeof orders[0] | null>(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!searchedOrder?.issuedAt) {
      setTimeLeft('');
      return;
    }
    const interval = setInterval(() => {
      const deadline = searchedOrder.issuedAt + 5 * 24 * 60 * 60 * 1000;
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setTimeLeft('0 дней');
        return;
      }
      const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
      const getDaysText = (days: number) => {
    if (days === 0) return '0 дней';
    if (days === 1) return '1 день';
    if (days >= 2 && days <= 4) return `${days} дня`;
    return `${days} дней`;
  };
      setTimeLeft(getDaysText(days));
    }, 1000);
    return () => clearInterval(interval);
  }, [searchedOrder?.issuedAt]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) {
      setError('Код должен состоять из 4 цифр');
      return;
    }
    const order = orders.find(o => o.code === code);
    if (order) {
      setSearchedOrder(order);
      setError('');
    } else {
      setSearchedOrder(null);
      setError('Заказ не найден');
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'in_transit': return { label: 'В пути', color: 'text-blue-500', bg: 'bg-blue-50', icon: Package };
      case 'arrived': return { label: 'Готов к выдаче', color: 'text-green-500', bg: 'bg-green-50', icon: MapPin };
      case 'issued': return { label: 'Выдан', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
      case 'rejected': return { label: 'Отменен', color: 'text-orange-600', bg: 'bg-orange-100', icon: XCircle };
      case 'returned': return { label: 'Возвращен', color: 'text-red-600', bg: 'bg-red-100', icon: RotateCcw };
      default: return { label: 'Завершен', color: 'text-gray-500', bg: 'bg-gray-50', icon: CheckCircle };
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center py-20 px-6 min-h-[calc(100vh-73px)]">
      <div className="max-w-md w-full text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Где мой заказ?</h1>
        <p className="text-gray-500 mb-8">Введите 4-значный код, который вы получили при оформлении.</p>

        <form onSubmit={handleSearch} className="flex flex-col gap-4 relative">
          <div className="relative">
            <input
              type="text"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="0000"
              className="w-full text-center text-4xl tracking-[1em] font-bold bg-white border-2 border-[#F0F0F0] rounded-3xl py-6 px-4 outline-none focus:border-[#2D3436] transition-colors shadow-sm placeholder-gray-200"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button
            type="submit"
            className="bg-[#2D3436] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <Search className="w-5 h-5" />
            Найти
          </button>
        </form>
      </div>

      {searchedOrder && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 border border-[#F0F0F0] shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Заказ {searchedOrder.code}</h2>
            </div>
            
            {(() => {
              const status = getStatusDisplay(searchedOrder.status);
              const StatusIcon = status.icon;
              return (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${status.bg} ${status.color}`}>
                  <StatusIcon className="w-5 h-5" />
                  {status.label}
                </div>
              );
            })()}
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500 w-24">Оформлен:</span>
              <span className="font-medium">{new Date(searchedOrder.createdAt).toLocaleString('ru-RU')}</span>
            </div>
            
            {searchedOrder.status === 'arrived' && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500 w-24">Готов:</span>
                <span className="font-medium text-green-600">{new Date(searchedOrder.archivedAt || searchedOrder.createdAt).toLocaleString('ru-RU')}</span>
              </div>
            )}
            
            {searchedOrder.status === 'issued' && searchedOrder.issuedAt && (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 w-24">Выдан:</span>
                  <span className="font-medium text-green-600">{new Date(searchedOrder.issuedAt).toLocaleString('ru-RU')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm bg-orange-50 p-3 rounded-xl">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <span className="text-gray-500">На возврат осталось: </span>
                    <span className="font-bold text-orange-600">{timeLeft}</span>
                  </div>
                </div>
              </>
            )}
            
            {searchedOrder.status === 'returned' && searchedOrder.archivedAt && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500 w-24">Возвращен:</span>
                <span className="font-medium text-red-600">{new Date(searchedOrder.archivedAt).toLocaleString('ru-RU')}</span>
              </div>
            )}
            
            {searchedOrder.status === 'rejected' && searchedOrder.archivedAt && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500 w-24">Отменен:</span>
                <span className="font-medium text-orange-600">{new Date(searchedOrder.archivedAt).toLocaleString('ru-RU')}</span>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
            {searchedOrder.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center p-4 rounded-2xl border bg-gray-50/50 border-[#F0F0F0]">
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-[#F0F0F0]">
                  {item.product.image ? (
                     <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{item.product.name}</h4>
                  <div className="text-sm text-gray-500 mt-1">
                    {item.quantity} шт. × {item.product.price} ₽
                    {item.selectedSize && <span className="ml-2 bg-[#2D3436]/10 px-2 py-0.5 rounded text-xs">Размер: {item.selectedSize}</span>}
                  </div>
                </div>
                <div className="font-bold text-lg">
                  {item.product.price * item.quantity} ₽
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[#F0F0F0]">
            <span className="text-gray-500 font-medium">К оплате</span>
            <span className="text-3xl font-black text-[#2D3436]">{searchedOrder.totalAmount} ₽</span>
          </div>

          {searchedOrder.status === 'arrived' && (
            <div className="mt-8 bg-green-50 text-green-700 p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <p className="font-medium">Ваш заказ готов к выдаче! Подойдите к кассе.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}