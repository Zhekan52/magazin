import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Search, CheckCircle, XCircle, Banknote, User, Package, ArrowRight, Clock, RotateCcw, Plus, X, Clock3 } from 'lucide-react';
import type { Order } from '../../store';

type Tab = {
  id: string;
  code: string;
  order: Order | null;
  showPayment: boolean;
  cashReceived: string;
  error: string;
};

export default function POS() {
  const orders = useStore(state => state.orders);
  const updateOrderItemFulfillment = useStore(state => state.updateOrderItemFulfillment);
  const updateOrderStatus = useStore(state => state.updateOrderStatus);
  const archiveOrder = useStore(state => state.archiveOrder);
  
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', code: '', order: null, showPayment: false, cashReceived: '', error: '' }]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [timeLeft, setTimeLeft] = useState('');

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (!activeTab.order?.issuedAt) {
      setTimeLeft('');
      return;
    }
    const interval = setInterval(() => {
      const deadline = activeTab.order!.issuedAt + 5 * 24 * 60 * 60 * 1000;
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
  }, [activeTab.order?.issuedAt]);

  const addTab = () => {
    const newId = Date.now().toString();
    setTabs([...tabs, { id: newId, code: '', order: null, showPayment: false, cashReceived: '', error: '' }]);
    setActiveTabId(newId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs(tabs.map(t => t.id === tabId ? { ...t, ...updates } : t));
  };

  const handleSearch = (e: React.FormEvent, tabId: string) => {
    e.preventDefault();
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.code.length !== 4) return;
    
    const found = orders.find(o => o.code === tab.code);
    if (found) {
      updateTab(tabId, { order: found, error: '' });
    } else {
      updateTab(tabId, { error: 'Заказ не найден' });
    }
  };

  const handleFulfill = (index: number, status: 'accepted' | 'returned', tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.order) return;
    updateOrderItemFulfillment(tab.order.id, index, status);
    updateTab(tabId, { 
      order: { ...tab.order, items: tab.order.items.map((item, i) => i === index ? { ...item, fulfillmentStatus: status } : item) } as Order 
    });
    if (status === 'accepted') {
      const newItems = tab.order.items.map((item, i) => i === index ? { ...item, fulfillmentStatus: status } : item);
      const allAccepted = newItems.every(i => i.fulfillmentStatus === 'accepted');
      if (allAccepted && tab.order.status === 'in_transit') {
        updateOrderStatus(tab.order.id, 'arrived');
      }
    }
  };

  const calculateTotal = (tab: Tab) => {
    if (!tab.order) return 0;
    return tab.order.items.reduce((sum, item) => {
      if (item.fulfillmentStatus !== 'returned') {
        const hasDiscount = item.product.discount && item.product.discount > 0 &&
          (!item.product.discountEndDate || item.product.discountEndDate > Date.now());
        const price = hasDiscount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
        return sum + (price * item.quantity);
      }
      return sum;
    }, 0);
  };

  const handlePayment = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.order) return;
    
    const hasAny = tab.order.items.some(item => item.fulfillmentStatus === 'accepted' || item.fulfillmentStatus === 'returned');
    if (!hasAny) {
      updateTab(tabId, { error: 'Выберите товар' });
      return;
    }

    const hasRejected = tab.order.items.some(item => item.fulfillmentStatus === 'returned');
    const hasAccepted = tab.order.items.some(item => item.fulfillmentStatus === 'accepted');

    if (tab.order.status === 'issued') {
      updateOrderStatus(tab.order.id, 'returned');
    } else if (hasRejected && hasAccepted) {
      archiveOrder(tab.order.id, 'issued');
    } else if (hasRejected && !hasAccepted) {
      archiveOrder(tab.order.id, 'rejected');
    } else {
      archiveOrder(tab.order.id, 'issued');
    }

    updateTab(tabId, { order: null, code: '', showPayment: false, cashReceived: '' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24)) bg-gray-50">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <div key={tab.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            tab.id === activeTabId ? 'bg-[#2D3436] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
            <button onClick={() => setActiveTabId(tab.id)} className="flex items-center gap-2">
              {tab.order ? <Package className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}
              {tab.order?.code || 'Новый'}
            </button>
            {tabs.length > 1 && (
              <button onClick={() => closeTab(tab.id)} className="hover:bg-white/20 rounded p-0.5">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addTab} className="p-2 hover:bg-gray-100 rounded-lg">
          <Plus className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content for active tab */}
      <div className="flex-1 flex gap-6 p-8 overflow-hidden">
        <div className="flex-1 flex flex-col gap-6">
          {/* Search */}
          <div className="bg-white rounded-[2rem] p-6 border border-[#F0F0F0] shadow">
            <form onSubmit={(e) => handleSearch(e, activeTabId)} className="flex gap-4">
              <input
                type="text"
                maxLength={4}
                value={activeTab.code}
                onChange={(e) => updateTab(activeTabId, { code: e.target.value.replace(/\D/g, '') })}
                placeholder="Код заказа"
                className="flex-1 text-2xl tracking-[0.5em] font-bold bg-gray-50 border-2 border-[#E8E8E8] rounded-2xl py-4 px-6 outline-none focus:border-[#2D3436]"
              />
              <button type="submit" disabled={activeTab.code.length !== 4} className="bg-[#2D3436] text-white px-8 rounded-2xl font-bold hover:bg-black disabled:opacity-50">
                <Search className="w-5 h-5" />
              </button>
            </form>
            {activeTab.error && <p className="text-red-500 font-medium mt-3">{activeTab.error}</p>}
          </div>

          {/* Order items */}
          {activeTab.order && activeTab.order.status === 'in_transit' && !activeTab.order.items.every(i => i.fulfillmentStatus) && (
            <div className="flex-1 bg-yellow-50 rounded-[2rem] border-2 border-yellow-200 p-8 flex items-center justify-center">
              <p className="text-xl font-bold text-yellow-800">Выберите товары</p>
              <p className="text-sm text-yellow-600 mt-2">Нажмите "Выдать" или "Отказ" для каждого товара</p>
            </div>
          )}

          {activeTab.order && (
            ((activeTab.order.status === 'in_transit' && activeTab.order.items.every(i => i.fulfillmentStatus)) ||
             activeTab.order.status === 'arrived' ||
             activeTab.order.status === 'issued'
            ) && activeTab.order.items.every(i => i.fulfillmentStatus) && (
              <div className="flex-1 bg-white rounded-[2rem] p-6 border border-[#F0F0F0] shadow overflow-y-auto">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-dashed border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold">Сборка заказа {activeTab.order.code}</h2>
                    {activeTab.order.status === 'issued' && activeTab.order.issuedAt && (
                      <p className="text-sm text-orange-600 mt-1">На возврат осталось: {timeLeft}</p>
                    )}
                  </div>
                  <div className="text-3xl font-black bg-gray-100 px-6 py-3 rounded-xl">{activeTab.order.code}</div>
                </div>

                <div className="space-y-4">
                  {activeTab.order.items.map((item, index) => {
                    const isPending = !item.fulfillmentStatus;
                    const isAccepted = item.fulfillmentStatus === 'accepted';
                    return (
                      <div key={index} className={`flex gap-4 p-4 rounded-xl border-2 ${
                        item.fulfillmentStatus === 'returned' ? 'bg-red-50 border-red-200' : isAccepted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                          {item.product.image && <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{item.product.name}</h4>
                          <p className="text-gray-500">{item.quantity} шт. × {item.product.price} ₽</p>
                        </div>
                        <div className="flex gap-2">
                          {activeTab.order.status !== 'issued' && isPending && (
                            <button onClick={() => handleFulfill(index, 'accepted', activeTabId)} className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600">
                              Выдать
                            </button>
                          )}
                          {activeTab.order.status !== 'issued' && isPending && (
                            <button onClick={() => handleFulfill(index, 'returned', activeTabId)} className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600">
                              Отказ
                            </button>
                          )}
                          {isAccepted && <span className="px-4 py-2 bg-green-100 text-green-600 rounded-lg font-bold">Выдан</span>}
                          {item.fulfillmentStatus === 'returned' && <span className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold">Возврат</span>}
                        </div>
                        <div className="font-bold text-xl">{item.product.price * item.quantity} ₽</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {!activeTab.order && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>Введите код заказа</p>
            </div>
          )}
        </div>

        {/* Payment panel */}
        <div className="w-80 bg-[#2D3436] text-white rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-400" /> Оплата
          </h3>

          {activeTab.order && (activeTab.order.status === 'arrived' || activeTab.order.status === 'issued' || (activeTab.order.status === 'in_transit' && activeTab.order.items.every(i => i.fulfillmentStatus))) ? (
            <>
              <div className="flex-1">
                <div className="bg-white/10 p-6 rounded-xl mb-4">
                  <span className="text-sm text-gray-400 block mb-2">К оплате</span>
                  <span className="text-4xl font-black text-green-400">{calculateTotal(activeTab)} ₽</span>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between"><span>Выдано</span><span>{activeTab.order.items.filter(i => i.fulfillmentStatus !== 'returned').length} шт.</span></div>
                  <div className="flex justify-between"><span>Возврат</span><span>{activeTab.order.items.filter(i => i.fulfillmentStatus === 'returned').length} шт.</span></div>
                </div>
              </div>

              {!activeTab.showPayment ? (
                <button onClick={() => updateTab(activeTabId, { showPayment: true })} className="w-full bg-green-500 py-4 rounded-xl font-bold hover:bg-green-600">
                  Принять оплату
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    type="number"
                    value={activeTab.cashReceived}
                    onChange={(e) => updateTab(activeTabId, { cashReceived: e.target.value })}
                    placeholder="Получено"
                    className="w-full bg-white text-black text-2xl font-bold py-4 px-4 rounded-xl text-center"
                    autoFocus
                  />
                  {parseInt(activeTab.cashReceived) > 0 && (
                    <div className="flex justify-between text-lg">
                      <span>Сдача:</span>
                      <span className={`font-bold ${parseInt(activeTab.cashReceived) - calculateTotal(activeTab) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(parseInt(activeTab.cashReceived) - calculateTotal(activeTab))} ₽
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => updateTab(activeTabId, { showPayment: false, cashReceived: '' })} className="flex-1 bg-white/10 py-3 rounded-xl font-bold">Отмена</button>
                    <button onClick={() => handlePayment(activeTabId)} disabled={parseInt(activeTab.cashReceived || '0') < calculateTotal(activeTab)} className="flex-1 bg-green-500 py-3 rounded-xl font-bold disabled:opacity-50">Готово</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-gray-400">
              <p>Выберите заказ для оплаты</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}