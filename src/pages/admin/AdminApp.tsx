import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Package, Box, Settings, User, BarChart3, Store } from 'lucide-react';
import { useStore } from '../../store';
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import POS from './POS';
import SettingsPage from './Settings';
import Reports from './Reports';

export default function AdminApp() {
  const location = useLocation();
  const { isAdminAuthenticated, logoutAdmin } = useStore();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { path: '/admin', label: 'Заказы', icon: Package },
    { path: '/admin/inventory', label: 'Инвентарь', icon: Box },
    { path: '/admin/pos', label: 'Терминал (POS)', icon: Store },
    { path: '/admin/reports', label: 'Отчёты', icon: BarChart3 },
    { path: '/admin/settings', label: 'Настройки', icon: User },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#F0F0F0] flex flex-col p-6 shadow-sm z-10 relative">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-[#2D3436] p-2 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold">Панель Админа</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                location.pathname === path
                  ? 'bg-gray-100 text-[#2D3436] shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D3436]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
