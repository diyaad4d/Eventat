import React, { useState, useEffect } from 'react';
import { 
  Plus, ChevronRight, Edit2, Trash2, ShieldAlert, X, UploadCloud
} from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import useCategoriesStore from '../../store/categoriesStore';

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminCategories() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryStatus,
  } = useCategoriesStore();
  const [expandedIds, setExpandedIds] = useState([]);
  
  // Modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [showSubModal, setShowSubModal] = useState(null); // stores parent category id
  const [editingSubcat, setEditingSubcat] = useState(null);
  
  // Highlight state for new items
  const [highlightedId, setHighlightedId] = useState(null);

  // Delete confirmations (inline)
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);
  const [confirmDeleteSub, setConfirmDeleteSub] = useState(null); // { catId, subId }

  // ─── Stats ───
  const activeCats = categories.filter(c => c.isActive).length;
  const inactiveCats = categories.length - activeCats;
  const totalSubcats = categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0);
  const totalServices = categories.reduce((sum, cat) => sum + cat.servicesCount, 0);

  // ─── Toggle Expand ───
  const toggleExpand = (id) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // ─── Category Handlers ───
  const handleSaveCategory = (catData) => {
    const isEdit = !!editingCategory;
    if (isEdit) {
      updateCategory(catData);
      setHighlightedId(catData.id);
    } else {
      const newCat = {
        ...catData,
        id: `cat_${Date.now()}`,
        servicesCount: 0,
        subcategories: []
      };
      addCategory(newCat);
      setHighlightedId(newCat.id);
    }
    
    setTimeout(() => setHighlightedId(null), 1000);
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleToggleCatStatus = (id) => {
    toggleCategoryStatus(id);
  };

  const handleDeleteCategory = (id) => {
    deleteCategory(id);
    setConfirmDeleteCat(null);
  };

  // ─── Subcategory Handlers ───
  const handleSaveSubcategory = (catId, subData) => {
    const isEdit = !!editingSubcat;
    if (isEdit) {
      updateSubcategory(catId, subData);
      setHighlightedId(subData.id);
    } else {
      const newSub = {
        ...subData,
        id: `sub_${Date.now()}`,
        servicesCount: 0
      };
      addSubcategory(catId, newSub);
      setHighlightedId(newSub.id);
      if (!expandedIds.includes(catId)) toggleExpand(catId);
    }

    setTimeout(() => setHighlightedId(null), 1000);
    setShowSubModal(null);
    setEditingSubcat(null);
  };

  const handleToggleSubStatus = (catId, subId) => {
    toggleSubcategoryStatus(catId, subId);
  };

  const handleDeleteSubcategory = (catId, subId) => {
    deleteSubcategory(catId, subId);
    setConfirmDeleteSub(null);
  };

  return (
    <PageTransition className="min-h-screen bg-[#0F1117] p-6 lg:p-8 font-sans">
      <div className="max-w-[1000px] mx-auto space-y-8">
        
        {/* ══ SECTION 1: PAGE HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-[0.18em] mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Category Management
            </h1>
            <p className="text-sm text-[#8B8FA8] mt-1">
              Manage service categories and subcategories across the platform.
            </p>
          </div>
          <button 
            onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-[var(--color-gold)] hover:bg-[#b08d43] text-[#0F1117] text-sm font-extrabold rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>

        {/* ══ SECTION 2: SUMMARY STRIP ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#2A2D3A] pb-8">
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-1">Total Categories</p>
            <p className="text-2xl font-black text-white">
              {categories.length} <span className="text-xs font-semibold text-emerald-400 ml-2">({activeCats} active)</span>
            </p>
          </div>
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-1">Total Subcategories</p>
            <p className="text-2xl font-black text-white">{totalSubcats}</p>
          </div>
          <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-4 flex flex-col justify-center">
            <p className="text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-1">Total Services</p>
            <p className="text-2xl font-black text-white">{totalServices}</p>
          </div>
        </div>

        {/* ══ SECTION 3: CATEGORIES LIST ══ */}
        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const isExpanded = expandedIds.includes(cat.id);
            const isConfirmDelete = confirmDeleteCat === cat.id;
            const isHighlighted = highlightedId === cat.id;

            return (
              <div 
                key={cat.id} 
                className={`bg-[#1A1D27] border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isHighlighted ? 'border-[var(--color-gold)] shadow-[0_0_15px_rgba(201,162,77,0.2)]' : 'border-[#2A2D3A]'
                }`}
              >
                {/* ─── Category Row ─── */}
                {isConfirmDelete ? (
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-500/10 border-l-4 border-red-500">
                    <div className="flex items-center gap-3 text-red-400">
                      <ShieldAlert size={20} />
                      <div>
                        <span className="text-sm font-bold block">Delete "{cat.name}" category?</span>
                        <span className="text-xs block mt-0.5 opacity-80">This action cannot be undone.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => setConfirmDeleteCat(null)}
                        className="flex-1 sm:flex-none px-4 py-2 min-h-[44px] bg-[#2A2D3A] hover:bg-[#3b3f54] text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="flex-1 sm:flex-none px-4 py-2 min-h-[44px] bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer hover:bg-[#22253A] transition-colors group"
                    onClick={(e) => {
                      // Prevent expanding if clicking actions
                      if (e.target.closest('.actions-area')) return;
                      toggleExpand(cat.id);
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <ChevronRight size={20} className={`text-[#8B8FA8] transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                      <div className="w-10 h-10 rounded-full bg-[#0F1117] flex items-center justify-center text-xl shadow-inner border border-[#2A2D3A]">
                        {cat.icon}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                        <span className="text-lg font-extrabold text-white group-hover:text-[var(--color-gold)] transition-colors">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2A2D3A] text-[#8B8FA8]">
                            {cat.subcategories?.length || 0} subcategories
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
                            {cat.servicesCount} services
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="actions-area flex items-center gap-4 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2A2D3A]">
                      <div className="flex items-center gap-2">
                        <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-wider ${cat.isActive ? 'text-emerald-400' : 'text-[#8B8FA8]'}`}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={cat.isActive} onChange={() => handleToggleCatStatus(cat.id)} />
                          <div className="w-9 h-5 bg-[#2A2D3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                      <div className="w-px h-5 bg-[#2A2D3A]"></div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); setShowCategoryModal(true); }}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8B8FA8] hover:text-white transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteCat(cat.id); }}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8B8FA8] hover:text-red-400 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── Subcategories Area ─── */}
                <div 
                  className="transition-all duration-350 ease-in-out overflow-hidden"
                  style={{ maxHeight: isExpanded ? '1000px' : '0px' }}
                >
                  <div className="bg-[#22253A] border-t border-[#2A2D3A] p-4 sm:p-6 sm:pl-20">
                    <div className="flex flex-col gap-2">
                      {cat.subcategories?.map(sub => {
                        const isSubConfirmDelete = confirmDeleteSub?.subId === sub.id;
                        const isSubHighlighted = highlightedId === sub.id;

                        if (isSubConfirmDelete) {
                          return (
                            <div key={sub.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                              <span className="text-sm font-bold text-red-400">Delete "{sub.name}"?</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setConfirmDeleteSub(null)} className="px-3 py-1.5 bg-[#2A2D3A] hover:bg-[#3b3f54] text-white text-xs font-bold rounded-md transition-colors">Cancel</button>
                                <button onClick={() => handleDeleteSubcategory(cat.id, sub.id)} className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-md transition-colors">Confirm Delete</button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={sub.id} 
                            className={`flex items-center justify-between gap-4 p-3 rounded-xl transition-all ${
                              isSubHighlighted ? 'bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30' : 'bg-[#1A1D27] border border-[#2A2D3A] hover:border-[#3b3f54]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#8B8FA8]" />
                              <span className="text-sm font-bold text-white">{sub.name}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2A2D3A] text-[#8B8FA8]">
                                {sub.servicesCount} services
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <label className="relative inline-flex items-center cursor-pointer" title={sub.isActive ? 'Active' : 'Inactive'}>
                                <input type="checkbox" className="sr-only peer" checked={sub.isActive} onChange={() => handleToggleSubStatus(cat.id, sub.id)} />
                                <div className="w-7 h-4 bg-[#2A2D3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                              </label>
                              <div className="w-px h-4 bg-[#2A2D3A]"></div>
                              <button onClick={() => { setEditingSubcat(sub); setShowSubModal(cat.id); }} className="text-[#8B8FA8] hover:text-white transition-colors"><Edit2 size={14} /></button>
                              <button onClick={() => setConfirmDeleteSub({ catId: cat.id, subId: sub.id })} className="text-[#8B8FA8] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        );
                      })}
                      
                      <button 
                        onClick={() => { setEditingSubcat(null); setShowSubModal(cat.id); }}
                        className="mt-2 w-full py-3 rounded-xl border-2 border-dashed border-[#2A2D3A] hover:border-[var(--color-gold)]/50 text-[var(--color-gold)] text-sm font-bold flex items-center justify-center gap-2 transition-colors bg-[#1A1D27]/50 hover:bg-[#1A1D27]"
                      >
                        <Plus size={16} /> Add Subcategory
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ SECTION 4: ADD/EDIT CATEGORY MODAL ══ */}
      {showCategoryModal && (
        <CategoryModal 
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
        />
      )}

      {/* ══ SECTION 5: ADD/EDIT SUBCATEGORY MODAL ══ */}
      {showSubModal && (
        <SubcategoryModal 
          parentCategory={categories.find(c => c.id === showSubModal)}
          subcategory={editingSubcat}
          onSave={(data) => handleSaveSubcategory(showSubModal, data)}
          onClose={() => { setShowSubModal(null); setEditingSubcat(null); }}
        />
      )}
    </PageTransition>
  );
}

// ─────────────────────────────────────────────────────────────
//  MODAL COMPONENTS
// ─────────────────────────────────────────────────────────────

function CategoryModal({ category, onSave, onClose }) {
  const [name, setName] = useState(category ? category.name : '');
  const [icon, setIcon] = useState(category ? category.icon : '');
  const [isActive, setIsActive] = useState(category ? category.isActive : true);
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(category?.coverImage || null);
  const isEdit = !!category;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (previewUrl && !category?.coverImage) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [onClose, previewUrl, category]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !icon.trim()) return;
    onSave({
      ...(isEdit ? category : {}),
      name: name.trim(),
      slug: generateSlug(name),
      icon: icon.trim(),
      isActive,
      coverImage
    });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-10 sm:pt-16 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col bg-[#1A1D27] border border-[#2A2D3A] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="shrink-0 flex items-center justify-between p-6 border-b border-[#2A2D3A]">
          <h2 className="text-lg font-extrabold text-white">{isEdit ? 'Edit Category' : 'Add New Category'}</h2>
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8B8FA8] hover:text-white hover:bg-[#2A2D3A] rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-2">Category Name</label>
              <input 
                type="text" 
                required
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Venue, Catering..."
                className="w-full px-4 py-3 bg-[#0F1117] border border-[#2A2D3A] text-white rounded-xl outline-none focus:border-[var(--color-gold)] transition-colors"
              />
              {name && (
                <p className="text-[11px] text-[#8B8FA8] mt-1.5 ml-1 flex items-center gap-1">
                  Slug: <span className="font-mono text-[var(--color-gold)]/80">{generateSlug(name)}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-2">Icon (Emoji)</label>
              <input 
                type="text" 
                required
                maxLength={2}
                value={icon} 
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🎵 — paste an emoji"
                className="w-full px-4 py-3 bg-[#0F1117] border border-[#2A2D3A] text-white rounded-xl outline-none focus:border-[var(--color-gold)] transition-colors text-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-2">Cover Image</label>
              <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-[#2A2D3A] bg-[#0F1117] hover:border-[var(--color-gold)]/50 transition-colors flex flex-col items-center justify-center overflow-hidden cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="relative z-0 flex flex-col items-center text-white drop-shadow-md">
                      <UploadCloud size={24} className="mb-2" />
                      <span className="text-sm font-bold">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-[#8B8FA8] group-hover:text-white transition-colors">
                    <UploadCloud size={24} className="mb-2" />
                    <span className="text-sm font-bold">Click to upload cover image</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0F1117] border border-[#2A2D3A] rounded-xl">
              <div>
                <p className="text-sm font-bold text-white">Active Status</p>
                <p className="text-xs text-[#8B8FA8] mt-0.5">Visible to users and vendors</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <div className="w-11 h-6 bg-[#2A2D3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

          </div>
          <div className="shrink-0 p-6 border-t border-[#2A2D3A] bg-[#1A1D27] flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 min-h-[44px] bg-[#2A2D3A] hover:bg-[#3b3f54] text-white font-bold rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-3 min-h-[44px] bg-[var(--color-gold)] hover:bg-[#b08d43] text-[#0F1117] font-extrabold rounded-xl transition-colors">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubcategoryModal({ parentCategory, subcategory, onSave, onClose }) {
  const [name, setName] = useState(subcategory ? subcategory.name : '');
  const [isActive, setIsActive] = useState(subcategory ? subcategory.isActive : true);
  const isEdit = !!subcategory;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...(isEdit ? subcategory : {}),
      name: name.trim(),
      slug: generateSlug(name),
      isActive
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl w-[calc(100vw-2rem)] sm:w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#2A2D3A]">
          <h2 className="text-lg font-extrabold text-white">{isEdit ? 'Edit Subcategory' : 'Add Subcategory'}</h2>
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8B8FA8] hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="bg-[#0F1117] border border-[#2A2D3A] p-4 rounded-xl flex items-center gap-3">
            <span className="text-xl">{parentCategory?.icon}</span>
            <div>
              <p className="text-[10px] font-bold text-[#8B8FA8] uppercase tracking-wider">Parent Category</p>
              <p className="text-sm font-bold text-white mt-0.5">{parentCategory?.name}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-2">Subcategory Name</label>
            <input 
              type="text" 
              required
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Indoor Halls..."
              className="w-full px-4 py-3 bg-[#0F1117] border border-[#2A2D3A] text-white rounded-xl outline-none focus:border-[var(--color-gold)] transition-colors"
            />
            {name && (
              <p className="text-[11px] text-[#8B8FA8] mt-1.5 ml-1 flex items-center gap-1">
                Slug: <span className="font-mono text-[var(--color-gold)]/80">{generateSlug(name)}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0F1117] border border-[#2A2D3A] rounded-xl">
            <div>
              <p className="text-sm font-bold text-white">Active Status</p>
              <p className="text-xs text-[#8B8FA8] mt-0.5">Visible to users and vendors</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <div className="w-11 h-6 bg-[#2A2D3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#2A2D3A] hover:bg-[#3b3f54] text-white font-bold rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-[var(--color-gold)] hover:bg-[#b08d43] text-[#0F1117] font-extrabold rounded-xl transition-colors">Save Subcategory</button>
          </div>
        </form>
      </div>
    </div>
  );
}
