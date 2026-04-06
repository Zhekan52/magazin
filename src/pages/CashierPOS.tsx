import { useState } from 'react';
import { useAppStore, Order } from '../store';
import { Check, X, ArrowLeft, CreditCard, RussianRuble } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CashierPOS() {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedForPickup, setSelectedForPickup] = useState<string[]>([]);
  const [showPOS, setShowPOS] = useState(false);
  const navigate = useNavigate();

  const { orders, products, updateOrderItemStatus, completeOrderIfDone } = useAppStore();

  const handleSearch = () => {
    const found = orders.find(o => o.code === code && o.status === 'ACTIVE');
    if (found) {
      setOrder(found);
      setSelectedForPickup([]);
    } else {
      alert('Активный заказ не найден');
    }
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  const handleMarkArrived = (itemId: string) => {
    if (order) {
      updateOrderItemStatus(order.id, itemId, 'ARRIVED');
      setOrder(orders.find(o => o.id === order.id) || null);
    }
  };

  const handleReject = (itemId: string) => {
    if (order && confirm('Отменить этот товар?')) {
      updateOrderItemStatus(order.id, itemId, 'REJECTED');
      completeOrderIfDone(order.id);
      setOrder(orders.find(o => o.id === order.id) || null);
    }
  };

  const toggleSelectForPickup = (itemId: string) => {
    setSelectedForPickup(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleCashReceived = () => {
    if (order) {
      selectedForPickup.forEach(itemId => {
        updateOrderItemStatus(order.id, itemId, 'PICKED_UP');
      });
      completeOrderIfDone(order.id);
      setOrder(orders.find(o => o.id === order.id) || null);
      setSelectedForPickup([]);
      setShowPOS(false);
      
      // Check if order is fully completed now
      const updatedOrder = orders.find(o => o.id === order.id);
      if (updatedOrder?.status === 'COMPLETED') {
        alert('Заказ полностью завершен!');
        setOrder(null);
        setCode('');
      }
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#2D3436] p-8">
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 p-3 hover:bg-gray-100 rounded-2xl transition-colors">
          <ArrowLeft size={32} />
        </button>
        <CreditCard size={64} className="text-gray-300 mb-8" />
        <h2 className="text-3xl font-bold mb-8 text-center">Касса / Выдача заказов</h2>
        <div className="w-full max-w-sm flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Код клиента (4 цифры)" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={4}
            className="text-center text-3xl tracking-widest px-6 py-4 bg-[#F9FAFB] border border-[#F0F0F0] rounded-2xl focus:outline-none focus:border-black"
          />
          <button 
            onClick={handleSearch}
            className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-xl w-full"
          >
            Найти заказ
          </button>
        </div>
      </div>
    );
  }

  const pickupAmount = selectedForPickup.reduce((acc, itemId) => {
    const item = order.items.find(i => i.id === itemId);
    if (!item) return acc;
    const p = getProduct(item.productId);
    if (!p) return acc;
    const price = p.hasDiscount && p.salePrice ? p.salePrice : p.price;
    return acc + (price * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col text-[#2D3436]">
      <header className="bg-white px-8 py-6 border-b border-[#F0F0F0] flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => { setOrder(null); setCode(''); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-2xl font-bold">Управление заказом #{order.code}</h1>
        </div>
        {selectedForPickup.length > 0 && (
          <button 
            onClick={() => setShowPOS(true)}
            className="bg-green-500 text-white px-8 py-3 rounded-2xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
          >
            Выдать выбранное ({selectedForPickup.length}) на {pickupAmount.toLocaleString()} ₽
          </button>
        )}
      </header>

      <div className="flex-1 overflow-auto p-8 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
              <tr>
                <th className="p-4 font-medium text-gray-500 w-12">Выбор</th>
                <th className="p-4 font-medium text-gray-500">Товар</th>
                <th className="p-4 font-medium text-gray-500 text-center">Кол-во</th>
                <th className="p-4 font-medium text-gray-500">Цена</th>
                <th className="p-4 font-medium text-gray-500">Статус</th>
                <th className="p-4 font-medium text-gray-500 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {order.items.map(item => {
                const product = getProduct(item.productId);
                if (!product) return null;
                const price = product.hasDiscount && product.salePrice ? product.salePrice : product.price;
                const isArrived = item.status === 'ARRIVED';
                const isSelected = selectedForPickup.includes(item.id);
                
                return (
                  <tr key={item.id} className={`transition-colors ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                    <td className="p-4 text-center">
                      {isArrived && (
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelectForPickup(item.id)}
                          className="w-5 h-5 accent-green-600 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">{item.quantity}</td>
                    <td className="p-4">{(price * item.quantity).toLocaleString()} ₽</td>
                    <td className="p-4">
                      {item.status === 'IN_TRANSIT' && <span className="text-blue-500 font-medium">В пути</span>}
                      {item.status === 'ARRIVED' && <span className="text-green-500 font-medium bg-green-100 px-3 py-1 rounded-full text-sm">Готов к выдаче</span>}
                      {item.status === 'PICKED_UP' && <span className="text-gray-400 font-medium">Выдан</span>}
                      {item.status === 'REJECTED' && <span className="text-red-500 font-medium">Отказ</span>}
                    </td>
                    <td className="p-4 text-right">
                      {item.status === 'IN_TRANSIT' && (
                        <button onClick={() => handleMarkArrived(item.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg mr-2">
                          Отметить прибытие
                        </button>
                      )}
                      {(item.status === 'IN_TRANSIT' || item.status === 'ARRIVED') && (
                        <button onClick={() => handleReject(item.id)} className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 px-3 py-2 rounded-lg">
                          Отказ
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPOS && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setShowPOS(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-800">
                <RussianRuble size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Оплата заказа</h2>
              <p className="text-gray-500">Только наличные</p>
            </div>
            
            <div className="bg-[#F9FAFB] rounded-2xl p-6 mb-8 border border-[#F0F0F0]">
              <div className="flex justify-between items-center mb-4 text-gray-600">
                <span>Выбрано товаров:</span>
                <span className="font-medium text-black">{selectedForPickup.length} шт.</span>
              </div>
              <div className="flex justify-between items-center border-t border-[#F0F0F0] pt-4">
                <span className="text-lg">К оплате:</span>
                <span className="text-3xl font-black">{pickupAmount.toLocaleString()} ₽</span>
              </div>
            </div>
            
            <button 
              onClick={handleCashReceived}
              className="w-full bg-black text-white py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-transform active:scale-95"
            >
              <Check size={24} />
              Наличные получены
            </button>
          </div>
        </div>
      )}
    </div>
  );
}