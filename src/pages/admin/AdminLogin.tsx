import { useState } from 'react';
import { useStore } from '../../store';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

export default function AdminLogin() {
  const { loginAdmin, isAdminAuthenticated } = useStore();
  const navigate = useNavigate();
  
  if (isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!password) {
      setError('Введите пароль');
      setIsLoading(false);
      return;
    }

    const success = loginAdmin(password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Неверный пароль');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#2D3436] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#2D3436] mb-2">Вход в админ-панель</h1>
          <p className="text-gray-500">Введите пароль для доступа</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-[#F0F0F0]">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl mb-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full bg-gray-50 border border-[#F0F0F0] rounded-2xl py-4 px-5 pr-14 outline-none focus:border-[#2D3436] transition-colors text-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2D3436] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Проверка...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}