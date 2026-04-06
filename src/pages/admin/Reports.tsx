import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Package, TrendingUp, XCircle, Star } from 'lucide-react';

export default function Reports() {
  const orders = useStore(state => state.orders);
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>('all');
  const [animatedRevenue, setAnimatedRevenue] = useState(0);
  const [animatedOrders, setAnimatedOrders] = useState(0);

  const completedOrders = orders.filter(o => 
    o.status === 'issued' || o.status === 'rejected' || o.status === 'returned'
  );

  const getFilteredOrders = () => {
    if (period === 'all') return completedOrders;
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    return completedOrders.filter(o => {
      const date = o.archivedAt || o.createdAt;
      if (period === 'week') return date >= weekAgo;
      if (period === 'month') return date >= monthAgo;
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  let totalRevenue = 0;
  let totalOrders = 0;
  
  filteredOrders.forEach(order => {
    if (order.status === 'returned') {
      totalRevenue -= order.totalAmount;
    } else if (order.status === 'issued') {
      totalRevenue += order.totalAmount;
      totalOrders++;
    } else if (order.status === 'rejected') {
      totalOrders++;
    }
  });
  
  const rejectedOrders = filteredOrders.filter(o => o.status === 'rejected').length;

  useEffect(() => {
    setAnimatedRevenue(0);
    setAnimatedOrders(0);
    
    const duration = 800;
    const steps = 25;
    
    const revenueStep = totalRevenue / steps;
    const ordersStep = totalOrders / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedRevenue(Math.round(revenueStep * currentStep));
      setAnimatedOrders(Math.round(ordersStep * currentStep));
      if (currentStep >= steps) clearInterval(timer);
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [period, totalRevenue, totalOrders]);

  const productStats: Record<string, { name: string; count: number; image: string; price: number }> = {};
  filteredOrders.forEach(order => {
    if (order.status === 'returned') return;
    order.items.forEach(item => {
      if (!productStats[item.product.id]) {
        productStats[item.product.id] = { name: item.product.name, count: 0, image: item.product.image, price: item.product.price };
      }
      productStats[item.product.id].count += item.quantity;
    });
  });

  const topProducts = Object.entries(productStats).sort((a, b) => b[1].count - a[1].count).slice(0, 10);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Отчёты</h1>
          <p className="text-gray-500 text-sm">Статистика продаж</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-[#F0F0F0]">
          {(['all', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p 
                  ? 'bg-[#2D3436] text-white' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p === 'all' && 'За всё время'}
              {p === 'week' && 'За неделю'}
              {p === 'month' && 'За месяц'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F0F0F0]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-gray-500 font-medium">Всего заказов</span>
          </div>
          <p className="text-3xl font-bold">{animatedOrders}</p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F0F0F0]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-gray-500 font-medium">Выручка</span>
          </div>
          <p className="text-3xl font-bold text-[#2D3436]">{animatedRevenue.toLocaleString()} ₽</p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F0F0F0]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-gray-500 font-medium">Отказов</span>
          </div>
          <p className="text-3xl font-bold">{rejectedOrders}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F0F0F0]">
        <h2 className="text-lg font-bold mb-6">Топ 10 товаров</h2>
        
        <div className="space-y-3">
          {topProducts.map(([id, data], index) => (
            <div 
              key={id} 
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 border border-[#F0F0F0] hover:border-gray-300 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-[#2D3436] text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-gray-300 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {data.image ? (
                  <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{data.name}</h4>
                <p className="text-sm text-gray-500">{data.price.toLocaleString()} ₽</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{data.count}</p>
                <p className="text-xs text-gray-400">продаж</p>
              </div>
            </div>
          ))}

          {topProducts.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Нет данных за выбранный период</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}