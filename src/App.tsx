import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import CustomerApp from './pages/customer/CustomerApp';
import AdminApp from './pages/admin/AdminApp';
import AdminLogin from './pages/admin/AdminLogin';
import { useStore } from './store';

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAdminAuthenticated = useStore((state) => state.isAdminAuthenticated);

  return (
    <div className="min-h-screen bg-white text-[#2D3436] font-sans selection:bg-gray-200">
      {/* Admin/Client Switcher */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="bg-white/90 backdrop-blur border border-[#F0F0F0] rounded-full shadow-sm flex overflow-hidden text-xs">
          <Link
            to="/customer"
            className={`px-3 py-2 font-medium ${!isAdmin ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Клиент
          </Link>
          <Link
            to={isAdminAuthenticated ? '/admin' : '/admin/login'}
            className={`px-3 py-2 font-medium ${isAdmin ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Админ
          </Link>
        </div>
      </div>

      <Routes>
        <Route path="/customer/*" element={<CustomerApp />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<CustomerApp />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}

export default App;
