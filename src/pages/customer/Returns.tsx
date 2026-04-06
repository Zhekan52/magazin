import { useState } from 'react';
import { useStore } from '../../store';
import { Search, Package, ArrowLeftRight, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

export default function Returns() {
  const { orders, returnOrder } = useStore();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [orderInfo, setOrderInfo] = useState<typeof orders[0] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) {
      setResult({ success: false, message: 'Код должен состоять из 4 цифр' });
      return;
    }
    
    const order = orders.find(o => o.code === code);
    if (!order) {
      setOrderInfo(null);
      setResult({ success: false, message: 'Заказ не найден' });
      return;
    }
    
    if (order.status === 'completed' || order.status === 'archived' || order.status === 'returned') {
      setOrderInfo(null);
      setResult({ success: false, message: 'Заказ уже завершен или возвращен' });
      return;
    }
    
    if (order.status !== 'issued') {
      setOrderInfo(null);
      setResult({ success: false, message: 'Заказ еще не выдан. Возврат возможен только после получения заказа.' });
      return;
    }
    
    setOrderInfo(order);
    setResult(null);
  };

  const handleReturn = () => {
    if (!orderInfo) return;
    const returnResult = returnOrder(orderInfo.id, orderInfo.code);
    setResult(returnResult);
    if (returnResult.success) {
      setOrderInfo(null);
      setCode('');
    }
  };

  const getDaysRemaining = (createdAt: number, issuedAt?: number) => {
    const issueDate = issuedAt || createdAt;
    const daysPassed = (Date.now() - issueDate) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.floor(5 - daysPassed));
  };

  const getOrderDisplay = (status: string) => {
    switch(status) {
      case 'in_transit': return { label: 'В пути', color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'arrived': return { label: 'Готов к выдаче', color: 'text-green-500', bg: 'bg-green-50' };
      default: return { label: status, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center py-20 px-6 min-h-[calc(100vh-73px)]">
      <div className="max-w-md w-full text-center mb-12">
        <div className="w-16 h-16 bg-[#2D3436] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ArrowLeftRight className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Возврат товара</h1>
        <p className="text-gray-500 mb-8">Введите 4-значный код заказа для оформления возврата в течение 5 дней</p>

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
          {result && !orderInfo && (
            <div className={`flex items-center justify-center gap-2 p-4 rounded-2xl ${result.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium text-sm">{result.message}</span>
            </div>
          )}
          <button
            type="submit"
            className="bg-[#2D3436] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <Search className="w-5 h-5" />
            Найти заказ
          </button>
        </form>
      </div>

      {orderInfo && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 border border-[#F0F0F0] shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-6 mb-6">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Код заказа</p>
              <h2 className="text-3xl font-black tracking-widest">{orderInfo.code}</h2>
              {orderInfo.issuedAt && (
                <p className="text-sm text-green-600 mt-1">Выдан: {new Date(orderInfo.issuedAt).toLocaleString('ru-RU')}</p>
              )}
            </div>
            <div className={`px-4 py-2 rounded-xl font-bold ${getOrderDisplay(orderInfo.status).bg} ${getOrderDisplay(orderInfo.status).color}`}>
              {getOrderDisplay(orderInfo.status).label}
            </div>
          </div>

          <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2">
            {orderInfo.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center p-4 rounded-2xl bg-gray-50/50 border border-[#F0F0F0]">
                <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shrink-0 border border-[#F0F0F0]">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{item.product.name}</h4>
                  <div className="text-sm text-gray-500">{item.quantity} шт. × {item.product.price} ₽</div>
                </div>
                <div className="font-bold">
                  {item.product.price * item.quantity} ₽
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[#F0F0F0] mb-6">
            <span className="text-gray-500 font-medium">Сумма к возврату</span>
            <span className="text-2xl font-black text-[#2D3436]">{orderInfo.totalAmount} ₽</span>
          </div>

          <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 shrink-0" />
            <p className="font-medium">Осталось дней для возврата: <span className="font-bold">{getDaysRemaining(orderInfo.createdAt, orderInfo.issuedAt)}</span></p>
          </div>

          {result && (
            <div className={`flex items-center gap-2 p-4 rounded-2xl mb-6 ${result.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium text-sm">{result.message}</span>
            </div>
          )}

          {result && (
            <div className={`flex items-center gap-2 p-4 rounded-2xl mb-6 ${result.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium text-sm">{result.message}</span>
            </div>
          )}

          <button
            onClick={handleReturn}
            className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Оформить возврат
          </button>
        </div>
      )}
    </div>
  );
}