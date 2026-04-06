import { useState } from 'react';
import { useStore, Category, Product } from '../../store';
import { Plus, Pencil, Trash2, Image as ImageIcon, X, Upload } from 'lucide-react';

export default function Inventory() {
  const { categories, products, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [isEditingProduct, setIsEditingProduct] = useState<Product | Partial<Product> | null>(null);
  const [isEditingCategory, setIsEditingCategory] = useState<Category | Partial<Category> | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newSize, setNewSize] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setIsEditingProduct({ ...isEditingProduct, image: canvas.toDataURL('image/jpeg', 0.8) });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addSize = () => {
    if (!newSize.trim() || !isEditingProduct) return;
    const currentSizes = isEditingProduct.sizes || [];
    if (!currentSizes.includes(newSize.trim())) {
      setIsEditingProduct({ ...isEditingProduct, sizes: [...currentSizes, newSize.trim()] });
    }
    setNewSize('');
  };

  const removeSize = (size: string) => {
    if (!isEditingProduct) return;
    setIsEditingProduct({ ...isEditingProduct, sizes: (isEditingProduct.sizes || []).filter(s => s !== size) });
  };

  const saveProduct = () => {
    if (!isEditingProduct || !isEditingProduct.name || !isEditingProduct.categoryId) return;
    if (isEditingProduct.id) {
      updateProduct(isEditingProduct.id, isEditingProduct as Product);
    } else {
      addProduct({ ...isEditingProduct, id: Math.random().toString(36).substr(2, 9) } as Product);
    }
    setIsEditingProduct(null);
    setShowAddProduct(false);
  };

  const saveCategory = () => {
    if (!isEditingCategory || !isEditingCategory.name) return;
    if (isEditingCategory.id) {
      updateCategory(isEditingCategory.id, isEditingCategory as Category);
    } else {
      addCategory({ ...isEditingCategory, id: Math.random().toString(36).substr(2, 9) } as Category);
    }
    setIsEditingCategory(null);
    setShowAddCategory(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Инвентарь</h1>
          <p className="text-gray-500">Товары и категории</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('products')} className={`px-6 py-3 rounded-2xl font-bold ${activeTab === 'products' ? 'bg-[#2D3436] text-white' : 'bg-white text-gray-500'}`}>
          Товары ({products.length})
        </button>
        <button onClick={() => setActiveTab('categories')} className={`px-6 py-3 rounded-2xl font-bold ${activeTab === 'categories' ? 'bg-[#2D3436] text-white' : 'bg-white text-gray-500'}`}>
          Категории ({categories.length})
        </button>
      </div>

      {activeTab === 'products' && (
        <div>
          <button onClick={() => { setIsEditingProduct({ name: '', description: '', price: 0, categoryId: categories[0]?.id || '', image: '' }); setShowAddProduct(true); }} className="flex items-center gap-2 bg-[#2D3436] text-white px-6 py-3 rounded-2xl font-bold mb-6">
            <Plus className="w-5 h-5" /> Добавить товар
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#F0F0F0]">
                <div className="w-full h-40 bg-gray-100 rounded-2xl mb-4 overflow-hidden">
                  {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-300" /></div>}
                </div>
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{product.description}</p>
<p className="text-xs text-gray-400 mb-3">{categories.find(c => c.id === product.categoryId)?.name}</p>
                {product.discount && product.discount > 0 && (!product.discountEndDate || product.discountEndDate > Date.now()) ? (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-green-600">{Math.round(product.price * (1 - product.discount / 100))} ₽</span>
                    <span className="text-sm text-gray-400 line-through">{product.price} ₽</span>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">-{product.discount}%</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{product.price} ₽</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => { setIsEditingProduct(product); setShowAddProduct(true); }} className="p-2 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteProduct(product.id)} className="p-2 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <button onClick={() => { setIsEditingCategory({ name: '' }); setShowAddCategory(true); }} className="flex items-center gap-2 bg-[#2D3436] text-white px-6 py-3 rounded-2xl font-bold mb-6">
            <Plus className="w-5 h-5" /> Добавить категорию
          </button>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0F0F0]">
                <h3 className="font-bold text-lg mb-4">{cat.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => { setIsEditingCategory(cat); setShowAddCategory(true); }} className="flex-1 p-2 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="flex-1 p-2 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(showAddProduct || isEditingProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{isEditingProduct?.id ? 'Редактировать' : 'Новый'} товар</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Фото</label>
                <div className="w-full h-40 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  {isEditingProduct?.image ? <img src={isEditingProduct.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-gray-300" />}
                </div>
                <label className="flex items-center justify-center gap-2 mt-2 text-sm text-blue-500 cursor-pointer">
                  <Upload className="w-4 h-4" /> Загрузить фото
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <input value={isEditingProduct?.name || ''} onChange={e => setIsEditingProduct({ ...isEditingProduct, name: e.target.value })} placeholder="Название" className="w-full border p-3 rounded-xl" />
              <textarea value={isEditingProduct?.description || ''} onChange={e => setIsEditingProduct({ ...isEditingProduct, description: e.target.value })} placeholder="Описание" className="w-full border p-3 rounded-xl" />
              <input type="number" value={isEditingProduct?.price || 0} onChange={e => setIsEditingProduct({ ...isEditingProduct, price: Number(e.target.value) })} placeholder="Цена" className="w-full border p-3 rounded-xl" />
              <select value={isEditingProduct?.categoryId || ''} onChange={e => setIsEditingProduct({ ...isEditingProduct, categoryId: e.target.value })} className="w-full border p-3 rounded-xl">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <label className="block text-sm font-medium mb-2 text-green-700">Скидка (%)</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={isEditingProduct?.discount || 0} 
                    onChange={e => setIsEditingProduct({ ...isEditingProduct, discount: Number(e.target.value) })} 
                    placeholder="0" 
                    className="flex-1 border p-3 rounded-xl"
                    min={0}
                    max={100}
                  />
                  <span className="flex items-center text-sm text-gray-500">%</span>
                </div>
                <label className="block text-sm font-medium mb-2 text-green-700 mt-3">Скидка до (дата)</label>
                <input 
                  type="datetime-local"
                  value={isEditingProduct?.discountEndDate ? new Date(isEditingProduct.discountEndDate).toLocaleString('sv-SE').slice(0, 16) : ''}
                  onChange={e => {
                    if (e.target.value) {
                      const date = new Date(e.target.value);
                      setIsEditingProduct({ ...isEditingProduct, discountEndDate: date.getTime() });
                    } else {
                      setIsEditingProduct({ ...isEditingProduct, discountEndDate: undefined });
                    }
                  }} 
                  className="w-full border p-3 rounded-xl"
                />
                {(isEditingProduct?.discount || 0) > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    Цена со скидкой: {Math.round((isEditingProduct.price || 0) * (1 - (isEditingProduct.discount || 0) / 100))} ₽
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Размеры (для одежды)</label>
                <div className="flex gap-2">
                  <input 
                    value={newSize} 
                    onChange={e => setNewSize(e.target.value)} 
                    placeholder="XS, S, M, L, XL..." 
                    className="flex-1 border p-3 rounded-xl"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  />
                  <button type="button" onClick={addSize} className="px-4 bg-gray-100 rounded-xl hover:bg-gray-200">Добавить</button>
                </div>
                {isEditingProduct?.sizes && isEditingProduct.sizes.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {isEditingProduct.sizes.map(size => (
                      <span key={size} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-sm">
                        {size}
                        <button type="button" onClick={() => removeSize(size)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => { setIsEditingProduct(null); setShowAddProduct(false); }} className="flex-1 py-3 border rounded-xl">Отмена</button>
              <button onClick={saveProduct} className="flex-1 py-3 bg-[#2D3436] text-white rounded-xl font-bold">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {(showAddCategory || isEditingCategory) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">{isEditingCategory?.id ? 'Редактировать' : 'Новая'} категория</h2>
            <div className="space-y-4">
              <input value={isEditingCategory?.name || ''} onChange={e => setIsEditingCategory({ ...isEditingCategory, name: e.target.value })} placeholder="Название" className="w-full border p-3 rounded-xl" />
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => { setIsEditingCategory(null); setShowAddCategory(false); }} className="flex-1 py-3 border rounded-xl">Отмена</button>
              <button onClick={saveCategory} className="flex-1 py-3 bg-[#2D3436] text-white rounded-xl font-bold">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}