import { useState } from 'react';
import { useAppStore, Product } from '../store';
import { Plus, Edit2, Trash2, Tag, LayoutGrid, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      addCategory(newName.trim());
      setNewName('');
    }
  };

  const handleUpdate = (id: string) => {
    if (editName.trim()) {
      updateCategory(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6 text-[#2D3436]">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <LayoutGrid className="text-purple-500" />
        Категории
      </h2>

      <div className="flex gap-4 mb-8">
        <input 
          type="text" 
          value={newName} 
          onChange={e => setNewName(e.target.value)}
          placeholder="Новая категория"
          className="flex-1 bg-[#F9FAFB] border border-[#F0F0F0] rounded-xl px-4 py-3 focus:outline-none focus:border-black"
        />
        <button onClick={handleAdd} className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Plus size={20} />
          Добавить
        </button>
      </div>

      <div className="space-y-4">
        {categories.map(c => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-[#F0F0F0]">
            {editingId === c.id ? (
              <div className="flex flex-1 gap-4 mr-4">
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)}
                  className="flex-1 border border-[#F0F0F0] rounded-lg px-3 py-2 focus:outline-none focus:border-black"
                />
                <button onClick={() => handleUpdate(c.id)} className="text-green-600 font-medium">Сохранить</button>
                <button onClick={() => setEditingId(null)} className="text-gray-500">Отмена</button>
              </div>
            ) : (
              <div className="text-lg font-medium">{c.name}</div>
            )}
            
            {editingId !== c.id && (
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingId(c.id); setEditName(c.name); }} className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-200">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => deleteCategory(c.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductManager() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useAppStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const resetForm = () => {
    setEditingId(null);
    setFormData({});
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData(p);
  };

  const handleSave = () => {
    if (!formData.name || !formData.categoryId || !formData.price || !formData.image) {
      alert('Заполните все обязательные поля');
      return;
    }

    if (editingId === 'new') {
      addProduct({
        name: formData.name,
        categoryId: formData.categoryId,
        price: Number(formData.price),
        image: formData.image,
        hasDiscount: formData.hasDiscount || false,
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined
      });
    } else if (editingId) {
      updateProduct(editingId, {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined
      });
    }
    resetForm();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F0F0F0] p-6 text-[#2D3436]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="text-purple-500" />
          Товары
        </h2>
        {!editingId && (
          <button 
            onClick={() => { setEditingId('new'); setFormData({ hasDiscount: false }); }}
            className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Добавить товар
          </button>
        )}
      </div>

      {editingId && (
        <div className="mb-8 bg-[#F9FAFB] border border-[#F0F0F0] p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-lg mb-4">{editingId === 'new' ? 'Новый товар' : 'Редактирование товара'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Название *</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-[#F0F0F0] rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Категория *</label>
              <select value={formData.categoryId || ''} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border border-[#F0F0F0] rounded-lg px-3 py-2 bg-white">
                <option value="">Выберите...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Изображение (URL или файл) *</label>
              <div className="flex gap-2">
                <input type="text" placeholder="URL картинки" value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className="flex-1 border border-[#F0F0F0] rounded-lg px-3 py-2" />
                <label className="bg-gray-100 hover:bg-gray-200 cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center">
                  Загрузить
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({...formData, image: reader.result as string});
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Цена (₽) *</label>
              <input type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-[#F0F0F0] rounded-lg px-3 py-2" />
            </div>
            
            <div className="col-span-1 md:col-span-2 flex items-center gap-2 bg-white p-3 rounded-lg border border-[#F0F0F0]">
              <input type="checkbox" id="hasDiscount" checked={formData.hasDiscount || false} onChange={e => setFormData({...formData, hasDiscount: e.target.checked})} className="w-5 h-5 accent-black" />
              <label htmlFor="hasDiscount" className="font-medium cursor-pointer">Временная скидка (Sale)</label>
            </div>
            
            {formData.hasDiscount && (
              <div>
                <label className="block text-sm font-medium text-red-500 mb-1">Цена со скидкой (₽) *</label>
                <input type="number" value={formData.salePrice || ''} onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})} className="w-full border border-red-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500" />
              </div>
            )}
          </div>
          
          <div className="flex gap-4 pt-4 mt-4 border-t border-[#F0F0F0]">
            <button onClick={handleSave} className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">Сохранить</button>
            <button onClick={resetForm} className="px-6 py-2 rounded-lg font-medium text-gray-500 hover:bg-gray-100 transition-colors">Отмена</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="border border-[#F0F0F0] rounded-xl overflow-hidden flex flex-col group relative">
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => startEdit(p)} className="p-2 bg-white rounded-lg shadow hover:text-black text-gray-600"><Edit2 size={16} /></button>
              <button onClick={() => deleteProduct(p.id)} className="p-2 bg-white rounded-lg shadow hover:text-red-500 text-gray-600"><Trash2 size={16} /></button>
            </div>
            
            <div className="aspect-square bg-gray-100 relative">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              {p.hasDiscount && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">SALE</div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs text-gray-400 mb-1">{categories.find(c => c.id === p.categoryId)?.name}</div>
              <h3 className="font-medium text-lg leading-tight mb-2">{p.name}</h3>
              <div className="mt-auto">
                {p.hasDiscount ? (
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">{p.salePrice?.toLocaleString()} ₽</span>
                    <span className="text-gray-400 line-through text-sm">{p.price.toLocaleString()} ₽</span>
                  </div>
                ) : (
                  <span className="font-bold">{p.price.toLocaleString()} ₽</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState<'categories' | 'products'>('categories');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <header className="bg-white border-b border-[#F0F0F0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Админ-панель</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setTab('categories')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${tab === 'categories' ? 'bg-black text-white' : 'bg-[#F9FAFB] text-gray-600 hover:bg-gray-100'}`}
          >
            Категории
          </button>
          <button 
            onClick={() => setTab('products')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${tab === 'products' ? 'bg-black text-white' : 'bg-[#F9FAFB] text-gray-600 hover:bg-gray-100'}`}
          >
            Товары
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        {tab === 'categories' ? <CategoryManager /> : <ProductManager />}
      </main>
    </div>
  );
}