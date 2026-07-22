import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { TRANSLATIONS } from '../data/translations';
import { Product } from '../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FolderPlus, 
  X, 
  Check, 
  Tag, 
  Image as ImageIcon 
} from 'lucide-react';

export const CatalogManager: React.FC = () => {
  const { products, settings, addProduct, updateProduct, deleteProduct, clearCatalog } = useStore();
  const t = TRANSLATIONS[settings.language];

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal/Form management state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Extract unique categories from products
  const uniqueCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleOpenAddForm = () => {
    setEditingItem(null);
    setName('');
    setPrice('');
    setCategory('');
    setDescription('');
    setImageUrl('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod: Product) => {
    setEditingItem(prod);
    setName(prod.name);
    setPrice(prod.price.toString());
    setCategory(prod.category);
    setDescription(prod.description);
    setImageUrl(prod.image_url || '');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price) || 0;
    const finalCategory = category.trim() || 'General';

    if (editingItem) {
      updateProduct(editingItem.id, {
        name: name.trim(),
        price: priceNum,
        category: finalCategory,
        description: description.trim(),
        image_url: imageUrl.trim() || undefined
      });
    } else {
      addProduct({
        name: name.trim(),
        price: priceNum,
        category: finalCategory,
        description: description.trim(),
        image_url: imageUrl.trim() || undefined
      });
    }
    handleCloseForm();
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isRtl = settings.language === 'ar';

  return (
    <div className="space-y-6" id="catalog-manager-container" dir={isRtl ? 'rtl' : 'ltr'} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* Search, Filter & Actions Top Bar */}
      <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-soft flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Search Input */}
        <div className="relative w-full lg:max-w-md group">
          <div className="absolute inset-0 bg-slate-900/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center">
            <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-4' : 'left-4'} group-focus-within:text-slate-900 transition-colors`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-wider focus:outline-none focus:border-slate-900 transition-all text-slate-900 placeholder:text-slate-400`}
            />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto w-full lg:w-auto py-1 no-scrollbar scroll-smooth">
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-slate-950 border-slate-950 text-white shadow-xl shadow-slate-200'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-950 hover:border-slate-300'
              }`}
            >
              {cat === 'All' ? t.categoryAll : cat}
            </button>
          ))}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={handleOpenAddForm}
            className="flex-1 lg:flex-initial bg-slate-950 hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t.addProductBtn}
          </button>
          
          {products.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your entire product list? This is irreversible.')) {
                  clearCatalog();
                }
              }}
              className="p-4 border border-rose-100 bg-rose-50/30 hover:bg-rose-50 rounded-2xl text-rose-500 transition-all cursor-pointer active:scale-90"
              title="Clear Catalog"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Catalog Listing */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(prod => (
            <div key={prod.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between group">
              <div>
                {/* Product Image Area */}
                <div className="aspect-[16/10] bg-slate-50 relative border-b border-slate-100 overflow-hidden shrink-0">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-slate-300">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">No Image Supplied</span>
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-slate-200 px-2.5 py-1 rounded-full shadow-sm text-[10px] font-bold text-slate-700`}>
                    <Tag className="w-3 h-3 text-amber-500" />
                    <span>{prod.category}</span>
                  </div>
                </div>

                {/* Info block */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2.5 mb-1.5">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">{prod.name}</h4>
                    <span className="font-extrabold text-amber-600 text-sm shrink-0">
                      {settings.currencySymbol}
                      {prod.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{prod.description || '—'}</p>
                </div>
              </div>

              {/* Action operations foot */}
              <div className="p-4 pt-0 border-t border-slate-50 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditForm(prod)}
                  className="flex-1 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-xs py-3 sm:py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  {t.editProductBtn}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${prod.name}?`)) {
                      deleteProduct(prod.id);
                    }
                  }}
                  className="p-3 sm:p-2.5 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-slate-800 text-base mb-1">No products found</h4>
          <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            {products.length === 0 ? t.noProductsYet : "No products match your search keyword or selected category filter."}
          </p>
          {products.length === 0 && (
            <button
              onClick={handleOpenAddForm}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.addProductBtn}
            </button>
          )}
        </div>
      )}

      {/* Floating Modal Overlay Form for Add / Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn my-auto">
            {/* Header */}
            <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                {editingItem ? 'Edit Product details' : 'Add New Product to Store'}
              </h4>
              <button
                onClick={handleCloseForm}
                className="w-8 h-8 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                  {t.formName} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-slate-800"
                  placeholder="e.g. Espresso Tiramisu Classico"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                    {t.formPrice} ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-slate-800"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                    {t.formCategory} *
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    list="existing-categories"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-slate-800"
                    placeholder="e.g. Beverages, Desserts"
                  />
                  <datalist id="existing-categories">
                    {uniqueCategories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                  {t.formImageUrl}
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-slate-800"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                  {t.formDescription} *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-slate-800 resize-none"
                  placeholder="Tell clients about ingredients, size, materials, or features."
                />
              </div>

              {/* Action footer inside Modal */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-xs font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
