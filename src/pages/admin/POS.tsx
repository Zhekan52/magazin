import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Search, Package, X, Plus, Minus } from 'lucide-react';
import type { Order } from '../../store';

type Tab = {
  id: string;
  code: string;
  order: Order | null;
  cashGiven: number;
};

export default function POS() {
  const orders = useStore(state => state.orders);
  const updateOrderItemFulfillment = useStore(state => state.updateOrderItemFulfillment);
  const updateOrderStatus = useStore(state => state.updateOrderStatus);
  const archiveOrder = useStore(state => state.archiveOrder);
  
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', code: '', order: null, cashGiven: 0 }]);
  const [activeTabId, setActiveTabId] = useState('1');

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const addTab = () => {
    const newId = Date.now().toString();
    setTabs([...tabs, { id: newId, code: '', order: null, cashGiven: 0 }]);
    setActiveTabId(newId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) setActiveTabId(newTabs[0].id);
  };

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs(tabs.map(t => t.id === tabId ? { ...t, ...updates } : t));
  };

  const handleSearch = (e: React.FormEvent, tabId: string) => {
    e.preventDefault();
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.code.length !== 4) return;
    const found = orders.find(o => o.code === tab.code);
    if (found) updateTab(tabId, { order: found });
  };

  const handleFulfill = (index: number, status: 'accepted' | 'returned', tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.order) return;
    updateOrderItemFulfillment(tab.order.id, index, status);
    updateTab(tabId, { 
      order: { ...tab.order, items: tab.order.items.map((item, i) => i === index ? { ...item, fulfillmentStatus: status } : item) } as Order 
    });
  };

  const total = activeTab.order?.items.reduce((sum, item) => {
    if (item.fulfillmentStatus !== 'returned') {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0) || 0;

  const handlePayment = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.order) return;
    const hasItems = tab.order.items.some(i => i.fulfillmentStatus);
    if (!hasItems) return;
    
    const hasReturned = tab.order.items.some(i => i.fulfillmentStatus === 'returned');
    const hasAccepted = tab.order.items.some(i => i.fulfillmentStatus === 'accepted');

    if (tab.order.status === 'issued') {
      updateOrderStatus(tab.order.id, 'returned');
    } else if (hasReturned && hasAccepted) {
      archiveOrder(tab.order.id, 'issued');
    } else if (hasReturned && !hasAccepted) {
      archiveOrder(tab.order.id, 'rejected');
    } else {
      archiveOrder(tab.order.id, 'issued');
    }

    updateTab(tabId, { order: null, code: '', cashGiven: 0 });
  };

  const change = activeTab.cashGiven - total;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Tab bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTabId(tab.id)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab.id === activeTabId ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <span className="max-w-[60px] truncate">{tab.order?.code || 'Новый'}</span>
            {tabs.length > 1 && <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} />}
          </button>
        ))}
        <button onClick={addTab} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 flex gap-4 p-6 overflow-hidden">
        {/* Left - Order */}
        <div className="flex-1 flex flex-col gap-4">
          <form onSubmit={(e) => handleSearch(e, activeTabId)} className="flex gap-2">
            <input
              type="text"
              maxLength={4}
              value={activeTab.code}
              onChange={(e) => updateTab(activeTabId, { code: e.target.value.replace(/\D/g, '') })}
              placeholder="Код заказа"
              className="flex-1 text-2xl tracking-[0.3em] font-bold bg-white border border-gray-200 rounded-2xl py-4 px-6 outline-none focus:border-black transition-colors"
            />
            <button type="submit" disabled={activeTab.code.length !== 4} 
              className="px-8 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-50">
              Поиск
            </button>
          </form>

          {activeTab.order && (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Заказ {activeTab.order.code}</h2>
                  <p className="text-sm text-gray-400">{activeTab.order.items.length} товаров</p>
                </div>
                <div className="text-2xl font-black">{total} ₽</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeTab.order.items.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl ${
                    item.fulfillmentStatus === 'accepted' ? 'bg-green-50' :
                    item.fulfillmentStatus === 'returned' ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden">
                      {item.product.image && <img src={item.product.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-gray-400 text-xs">{item.quantity} × {item.product.price} ₽</p>
                    </div>
                    <div className="flex gap-1">
                      {activeTab.order.status !== 'issued' && !item.fulfillmentStatus && (
                        <>
                          <button onClick={() => handleFulfill(idx, 'accepted', activeTabId)} 
                            className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600">
                            Да
                          </button>
                          <button onClick={() => handleFulfill(idx, 'returned', activeTabId)} 
                            className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600">
                            Нет
                          </button>
                        </>
                      )}
                      {item.fulfillmentStatus === 'accepted' && <span className="px-3 py-2 bg-green-500 text-white text-xs font-bold rounded-lg">✓</span>}
                      {item.fulfillmentStatus === 'returned' && <span className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg">✗</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!activeTab.order && (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-lg">
              Введите код заказа
            </div>
          )}
        </div>

        {/* Right - Payment */}
        <div className="w-80 bg-black text-white rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-4">Оплата</h3>

          {activeTab.order ? (
            <>
              <div className="flex-1">
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <p className="text-gray-400 text-xs mb-1">К оплате</p>
                  <p className="text-3xl font-bold">{total} ₽</p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Да</span><span>{activeTab.order.items.filter(i => i.fulfillmentStatus === 'accepted').length}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Нет</span><span>{activeTab.order.items.filter(i => i.fulfillmentStatus === 'returned').length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-white rounded-xl p-3">
                  <span className="text-gray-400">Наличные</span>
                  <input
                    type="number"
                    value={activeTab.cashGiven || ''}
                    onChange={(e) => updateTab(activeTabId, { cashGiven: parseInt(e.target.value) || 0 })}
                    className="flex-1 bg-transparent text-right text-xl font-bold outline-none"
                    placeholder="0"
                  />
                </div>
                {activeTab.cashGiven > 0 && (
                  <div className="flex justify-between text-lg pt-2 border-t border-white/10">
                    <span className="text-gray-400">Сдача</span>
                    <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>{change} ₽</span>
                  </div>
                )}
                <button 
                  onClick={() => handlePayment(activeTabId)}
                  disabled={activeTab.cashGiven < total || !activeTab.order?.items.some(i => i.fulfillmentStatus)}
                  className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Завершить
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Выберите заказ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}