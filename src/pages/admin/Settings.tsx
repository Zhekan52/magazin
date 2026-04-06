import { useState } from 'react';
import { useStore } from '../../store';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, LogOut, Trash2, DoorClosed, DoorOpen, X, Tag, Package, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { adminPassword, setAdminPassword, logoutAdmin, resetAllData, orders, storeClosed, storeClosedReason, setStoreClosed, openingBanner, setOpeningBanner, promoCodes, addPromoCode, deletePromoCode } = useStore();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [closeReason, setCloseReason] = useState(storeClosedReason);
  const [resetOptions, setResetOptions] = useState({ products: false, orders: false });
  
  // Promo code form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(10);
  const [newPromoMaxUses, setNewPromoMaxUses] = useState(100);
  const [newPromoExpires, setNewPromoExpires] = useState('');

  const handleAddPromo = () => {
    if (!newPromoCode.trim()) return;
    addPromoCode({
      code: newPromoCode.toUpperCase(),
      discount: newPromoDiscount,
      maxUses: newPromoMaxUses || undefined,
      expiresAt: newPromoExpires ? new Date(newPromoExpires).getTime() : undefined,
      usedCount: 0,
    });
    setNewPromoCode('');
    setNewPromoDiscount(10);
  };

  const handleReset = () => {
    if (resetOptions.products) {
      useStore.setState((state) => ({ products: [] }));
    }
    if (resetOptions.orders) {
      useStore.setState((state) => ({ orders: [], usedCodes: [] }));
    }
    setShowResetConfirm(false);
    alert('Данные сброшены');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (currentPassword !== adminPassword) {
      setMessage({ type: 'error', text: 'Неверный текущий пароль' });
      return;
    }

    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'Новый пароль должен быть не менее 4 символов' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' });
      return;
    }

    setAdminPassword(newPassword);
    setMessage({ type: 'success', text: 'Пароль успешно изменен' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Настройки</h1>
          <p className="text-gray-500">Управление аккаунтом администратора</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 shadow-sm border border-blue-100 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium">Доступно кодов</p>
            <p className="text-3xl font-black text-[#2D3436]">{9000 - orders.length}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-600 text-sm font-medium">Использовано</p>
            <p className="text-2xl font-bold text-[#2D3436]">{orders.length}</p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
<div 
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (orders.length / 9000) * 100)}%` }}
            />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#F0F0F0]">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#F0F0F0]">
          <div className="w-12 h-12 bg-[#2D3436] rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Смена пароля</h2>
            <p className="text-gray-500 text-sm">Обновите пароль для входа в админ-панель</p>
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-2xl mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Текущий пароль</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Введите текущий пароль"
                className="w-full bg-gray-50 border border-[#F0F0F0] rounded-2xl py-4 px-5 pr-14 outline-none focus:border-[#2D3436] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Новый пароль</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Введите новый пароль"
                className="w-full bg-gray-50 border border-[#F0F0F0] rounded-2xl py-4 px-5 pr-14 outline-none focus:border-[#2D3436] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Подтвердите пароль</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите новый пароль"
              className="w-full bg-gray-50 border border-[#F0F0F0] rounded-2xl py-4 px-5 outline-none focus:border-[#2D3436] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D3436] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-colors mt-4"
          >
            Изменить пароль
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-[#F0F0F0]">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${storeClosed ? 'bg-red-50' : 'bg-green-50'}`}>
              {storeClosed ? <DoorClosed className="w-6 h-6 text-red-500" /> : <DoorOpen className="w-6 h-6 text-green-500" />}
            </div>
            <div>
              <h2 className="text-xl font-bold">Магазин</h2>
              <p className="text-gray-500 text-sm">{storeClosed ? 'Временно закрыт' : 'Открыт для заказов'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Причина закрытия (необязательно)</label>
              <input
                type="text"
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="Например: инвентаризация"
                className="w-full bg-gray-50 border border-[#F0F0F0] rounded-2xl py-4 px-5 outline-none focus:border-[#2D3436] transition-colors"
              />
            </div>

            {storeClosed ? (
              <button
                onClick={() => setStoreClosed(false, '')}
                className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition-colors"
              >
                Открыть магазин
              </button>
            ) : (
              <button
                onClick={() => setStoreClosed(true, closeReason)}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-600 transition-colors"
              >
                Закрыть магазин
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#F0F0F0]">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${openingBanner ? 'bg-orange-50' : 'bg-gray-50'}`}>
              <Tag className={`w-6 h-6 ${openingBanner ? 'text-orange-500' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Баннер открытия</h2>
              <p className="text-gray-500 text-sm">{openingBanner ? 'Показывается -50% скидка' : 'Выключен'}</p>
            </div>
          </div>

          <button
            onClick={() => setOpeningBanner(!openingBanner)}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-colors ${
              openingBanner 
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {openingBanner ? 'Выключить баннер' : 'Включить баннер'}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-[#F0F0F0]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Сброс данных</h2>
              <p className="text-gray-500 text-sm">Выберите что удалить</p>
            </div>
          </div>

          {showResetConfirm ? (
            <div className="bg-red-50 p-4 rounded-2xl space-y-4">
              <label className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-50">
                <input 
                  type="checkbox" 
                  checked={resetOptions.products}
                  onChange={(e) => setResetOptions({ ...resetOptions, products: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <Package className="w-5 h-5 text-gray-500" />
                <span>Товары</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-50">
                <input 
                  type="checkbox" 
                  checked={resetOptions.orders}
                  onChange={(e) => setResetOptions({ ...resetOptions, orders: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <FileText className="w-5 h-5 text-gray-500" />
                <span>Заказы</span>
              </label>
              <p className="text-red-600 text-sm">Выберите хотя бы один вариант</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-white text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleReset}
                  disabled={!resetOptions.products && !resetOptions.orders}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-50"
                >
                  Сбросить
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-100 transition-colors"
            >
              Сбросить данные
            </button>
          )}
        </div>

        {/* Промокоды */}
        <div className="bg-white p-6 rounded-3xl border border-[#F0F0F0] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-5 h-5" />
            <h2 className="text-xl font-bold">Промокоды</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            {promoCodes.map(promo => (
              <div key={promo.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <span className="font-bold">{promo.code}</span>
                  <span className="ml-2 text-green-600">-{promo.discount}%</span>
                  <span className="ml-2 text-gray-400 text-sm">
                    ({promo.usedCount}{promo.maxUses ? `/${promo.maxUses}` : '∞'}) 
                    {promo.expiresAt && ` до ${new Date(promo.expiresAt).toLocaleDateString('ru-RU')}`}
                  </span>
                </div>
                <button
                  onClick={() => deletePromoCode(promo.code)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {promoCodes.length === 0 && (
              <p className="text-gray-400 text-center py-4">Нет промокодов</p>
            )}
          </div>

          <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="text"
              value={newPromoCode}
              onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
              placeholder="Код (например: SAVE10)"
              className="w-full bg-white border border-[#F0F0F0] rounded-xl py-3 px-4 outline-none focus:border-[#2D3436]"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Скидка %</label>
                <input
                  type="number"
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full bg-white border border-[#F0F0F0] rounded-xl py-2 px-3 outline-none focus:border-[#2D3436]"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Лимит использований</label>
                <input
                  type="number"
                  value={newPromoMaxUses}
                  onChange={(e) => setNewPromoMaxUses(Number(e.target.value))}
                  min={1}
                  className="w-full bg-white border border-[#F0F0F0] rounded-xl py-2 px-3 outline-none focus:border-[#2D3436]"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Истекает</label>
                <input
                  type="date"
                  value={newPromoExpires}
                  onChange={(e) => setNewPromoExpires(e.target.value)}
                  className="w-full bg-white border border-[#F0F0F0] rounded-xl py-2 px-3 outline-none focus:border-[#2D3436]"
                />
              </div>
            </div>
            <button
              onClick={handleAddPromo}
              disabled={!newPromoCode.trim()}
              className="w-full bg-[#2D3436] text-white py-3 rounded-xl font-bold hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить промокод
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}