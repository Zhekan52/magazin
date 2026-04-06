import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Monitor, Shield, CreditCard } from 'lucide-react';

import CustomerTerminal from './pages/CustomerTerminal';
import AdminPanel from './pages/AdminPanel';
import CashierPOS from './pages/CashierPOS';

function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-4xl font-extrabold text-primary mb-4">Retail Terminal</h1>
          <p className="text-lg text-secondary">Выберите интерфейс для работы</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/terminal')} 
            className="card card--interactive flex flex-col items-center gap-4 text-center animate-fade-in-up stagger-1"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-primary-light text-primary rounded-2xl">
              <Monitor size={32} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Терминал</h2>
              <p className="text-sm text-secondary">Интерфейс покупателя для заказа</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/admin')} 
            className="card card--interactive flex flex-col items-center gap-4 text-center animate-fade-in-up stagger-2"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-purple-100 text-purple-600 rounded-2xl">
              <Shield size={32} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Админ-панель</h2>
              <p className="text-sm text-secondary">Управление товарами и скидками</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/pos')} 
            className="card card--interactive flex flex-col items-center gap-4 text-center animate-fade-in-up stagger-3"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-green-100 text-green-600 rounded-2xl">
              <CreditCard size={32} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Касса (Выдача)</h2>
              <p className="text-sm text-secondary">Оплата и выдача заказов</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/terminal/*" element={<CustomerTerminal />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/pos" element={<CashierPOS />} />
      </Routes>
    </Router>
  );
}

export default App;