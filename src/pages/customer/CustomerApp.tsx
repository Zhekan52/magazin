import { Routes, Route, Link } from 'react-router-dom';
import { ShoppingBag, Search, ArrowLeftRight } from 'lucide-react';
import Catalog from './Catalog';
import Checkout from './Checkout';
import Tracking from './Tracking';
import Returns from './Returns';

export default function CustomerApp() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] px-6 py-4 flex items-center justify-between shadow-sm">
        <Link to="/customer" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-[#2D3436] p-2 rounded-xl group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Терминал магазина</span>
        </Link>
        <nav className="flex gap-4">
          <Link to="/customer" className="px-4 py-2 rounded-xl hover:bg-gray-100 font-medium transition-colors">
            Каталог
          </Link>
          <Link to="/customer/tracking" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 font-medium transition-colors">
            <Search className="w-4 h-4" />
            Отследить заказ
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50/30">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/returns" element={<Returns />} />
        </Routes>
      </main>
    </div>
  );
}
