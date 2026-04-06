import { useState } from 'react';
import { useStore } from '../../store';
import { Package, Truck, CheckCircle, Archive, Calendar, Check, X } from 'lucide-react';

export default function Dashboard() {
  const { orders, updateOrderStatus, updateOrderItemFulfillment } = useStore();
  const [filter, setFilter] = useState<'all' | 'in_transit' | 'arrived' | 'archived'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const activeOrders = orders
    .filter(o => o.status !== 'completed' && o.status !== 'issued' && o.status !== 'rejected' && o.status !== 'returned')
    .filter(o => filter === 'all' ? true : o.status === filter)
    .sort((a, b) => b.createdAt - a.createdAt);

  const archivedOrders = orders
    .filter(o => o.status === 'completed' || o.status === 'issued' || o.status === 'rejected' || o.status === 'returned')
    .filter(o => {
      if (!dateFrom && !dateTo) return true;
      const orderDate = o.archivedAt || o.createdAt;
      if (dateFrom && orderDate < new Date(dateFrom).getTime()) return false;
      if (dateTo && orderDate > new Date(dateTo).getTime() + 86400000) return false;
      return true;
    })
    .sort((a, b) => (b.archivedAt || b.createdAt) - (a.archivedAt || a.createdAt));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Обзор заказов</h1>
          <p className="text-gray-500">Управление статусами активных заказов</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-[#F0F0F0]">
          {(['all', 'in_transit', 'arrived', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === tab 
                  ? 'bg-[#2D3436] text-white' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab === 'all' && 'Все'}
              {tab === 'in_transit' && 'В пути'}
              {tab === 'arrived' && 'Ожидают выдачи'}
              {tab === 'archived' && 'Архив'}
            </button>
          ))}
        </div>
      </div>

      {filter === 'archived' ? (
        <div>
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-white border border-[#F0F0F0] rounded-xl py-2 px-4 outline-none focus:border-[#2D3436]"
              />
            </div>
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-white border border-[#F0F0F0] rounded-xl py-2 px-4 outline-none focus:border-[#2D3436]"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Очистить
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {archivedOrders.map(order => (
            <div key={order.id} className={`bg-white rounded-[2rem] p-6 shadow-sm border flex flex-col ${
              order.status === 'returned' ? 'border-red-200 bg-gradient-to-br from-white to-red-50' :
              order.status === 'rejected' ? 'border-orange-200 bg-gradient-to-br from-white to-orange-50' :
              'border-[#F0F0F0]'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div className="bg-gray-100 px-4 py-2 rounded-xl">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1">Код заказа</span>
                  <span className="text-2xl font-black text-[#2D3436] tracking-widest">{order.code}</span>
                </div>
                <div className="p-2 rounded-full bg-gray-100 text-gray-400">
                  <Archive className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1 overflow-y-auto max-h-48 pr-2">
                {order.items.map((item, idx) => {
                  const hasDiscount = item.product.discount && item.product.discount > 0 && 
                    (!item.product.discountEndDate || item.product.discountEndDate > Date.now());
                  const price = hasDiscount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
                  return (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-[#F0F0F0]">
                      {item.product.image && (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} шт.
                        {hasDiscount && <span className="ml-1 text-green-600">-{item.product.discount}%</span>}
                        {item.selectedSize && <span className="ml-1 text-[#2D3436]">Размер: {item.selectedSize}</span>}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {price} ₽
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="border-t border-[#F0F0F0] pt-4 mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Сумма</span>
                </div>
                <div className="text-2xl font-bold">
                  {(() => {
                    const total = order.items.reduce((sum, item) => {
                      const hasDiscount = item.product.discount && item.product.discount > 0 && 
                        (!item.product.discountEndDate || item.product.discountEndDate > Date.now());
                      const price = hasDiscount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
                      return sum + price * item.quantity;
                    }, 0);
                    return total;
                  })()} ₽
                </div>
              </div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Создан:</span>
                  <span>{new Date(order.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                {order.archivedAt && (
                  <div className={`flex justify-between ${
                    order.status === 'returned' ? 'text-red-500' :
                    order.status === 'rejected' ? 'text-orange-500' :
                    'text-green-500'
                  }`}>
                    <span className="font-medium">
                      {order.status === 'issued' ? 'Выдан:' : order.status === 'rejected' ? 'Отказ:' : 'Возврат:'}
                    </span>
                    <span>{new Date(order.archivedAt).toLocaleString('ru-RU')}</span>
                  </div>
                )}
              </div>

              <div className={`w-full py-3 rounded-xl font-bold text-center text-sm ${
                order.status === 'returned' 
                  ? 'bg-red-50 text-red-500' 
                  : order.status === 'rejected'
                  ? 'bg-orange-50 text-orange-500'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {order.status === 'returned' ? 'Возвращен' : order.status === 'rejected' ? 'Отказ' : order.status === 'issued' ? 'Выдан' : 'Завершен'}
              </div>
            </div>
          ))}

          {archivedOrders.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 gap-4">
              <Archive className="w-16 h-16 opacity-20" />
              <p className="text-lg">Архив пуст</p>
            </div>
          )}
        </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeOrders.map(order => (
          <div key={order.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F0F0F0] flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs text-gray-400 font-medium block">Заказ {order.code}</span>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
              </div>
              <div className={`p-2 rounded-full ${
                order.status === 'in_transit' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
              }`}>
                {order.status === 'in_transit' ? <Truck className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {order.items.map((item, idx) => {
                const hasDiscount = item.product.discount && item.product.discount > 0 && 
                  (!item.product.discountEndDate || item.product.discountEndDate > Date.now());
                const price = hasDiscount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
                const isAccepted = item.fulfillmentStatus === 'accepted';
                return (
                <div key={idx} className={`flex gap-2 items-center p-2 rounded-lg ${isAccepted ? 'bg-green-50' : 'bg-gray-50 opacity-60'}`}>
                  <button
                    onClick={() => updateOrderItemFulfillment(order.id, idx, isAccepted ? 'returned' : 'accepted')}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      isAccepted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 border">
                    {item.product.image && (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400">{item.quantity} шт. × {price} ₽</p>
                  </div>
                </div>
                );
              })}
            </div>

            <div className="mt-auto">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">К оплате</span>
                <span className="text-2xl font-black bg-gradient-to-r from-[#2D3436] to-[#1a1f21] bg-clip-text text-transparent">
                  {(() => {
                    const total = order.items.reduce((sum, item) => {
                      const hasDiscount = item.product.discount && item.product.discount > 0 && 
                        (!item.product.discountEndDate || item.product.discountEndDate > Date.now());
                      const price = hasDiscount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
                      return sum + price * item.quantity;
                    }, 0);
                    return total;
                  })()} ₽
                </span>
              </div>
            </div>

            {order.status === 'in_transit' && (
              <button
                onClick={() => {
                  order.items.forEach((_, idx) => {
                    if (order.items[idx].fulfillmentStatus !== 'accepted') {
                      updateOrderItemFulfillment(order.id, idx, 'accepted');
                    }
                  });
                  updateOrderStatus(order.id, 'arrived');
                }}
                className="w-full py-3 rounded-xl font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Принять все
              </button>
            )}
          </div>
        ))}

        {activeOrders.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 gap-4">
            <Package className="w-16 h-16 opacity-20" />
            <p className="text-lg">Нет активных заказов</p>
          </div>
        )}
        </div>
      )}
    </div>
  );
}
