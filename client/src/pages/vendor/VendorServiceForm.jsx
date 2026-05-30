import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Upload, X, CheckCircle2, 
  Info, MapPin, ImageIcon, Save, Users, AlertCircle 
} from 'lucide-react';
import { toastSuccess, toastWarning } from '../../utils/toast';

const MOCK_CATEGORIES = {
  'Venue':                   ['Hotels', 'Halls', 'Farms', 'Indoor', 'Outdoor'],
  'Event Planning':          ['Full-Service Planner', 'Day-Of Coordinator', 'Corporate Events'],
  'Catering':                ['Buffet', 'Plated Dinner', 'Food Trucks', 'Finger Food'],
  'Cakes & Desserts':        ['Wedding Cakes', 'Custom Cakes', 'Dessert Tables', 'Cupcakes'],
  'Photography & Videography': ['Wedding Photography', 'Portrait', 'Drone/Aerial', 'Videography'],
  'Decoration':              ['Floral', 'Lighting', 'Themed', 'Balloons'],
  'Music & Entertainment':   ['Live Band', 'DJ', 'Zaffa', 'Cultural Performers'],
  'Makeup & Beauty':         ['Bridal Makeup', 'Hair Styling', 'Group Packages'],
  'Transportation':          ['Luxury Cars', 'Buses', 'Motorcycles', 'Valet'],
  'Invitations & Prints':    ['Digital Invitations', 'Printed Cards', 'Menus & Programs'],
};

const CITIES = [
  'Amman', 'Irbid', 'Zarqa', 'Balqa (Salt)', 'Madaba', 'Karak', 
  'Tafilah', 'Ma\'an', 'Aqaba', 'Mafraq', 'Jerash', 'Ajloun', 
  'Dead Sea', 'Petra', 'Wadi Rum'
];
const PRICING_UNITS = ['per_event', 'per_hour', 'per_person', 'per_day'];

const MOCK_SERVICES_DATA = {
  's1': {
    title: 'Grand Royal Ballroom',
    category: 'Venue', subcategory: 'Hotels',
    description: 'Experience unparalleled luxury at the Grand Royal Ballroom. Perfect for grand weddings and prestigious corporate galas. Our venue features crystal chandeliers and state-of-the-art acoustic systems.',
    pricingUnit: 'per_event', customPricingUnit: '',
    basePrice: '1500', city: 'Amman', capacity: '500',
    tags: ['luxury', 'wedding', 'corporate'],
    isActive: true,
    coverImage: { 
      id: 1, 
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80' 
    },
    galleryImages: [
      { id: 2, url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&q=80' },
      { id: 3, url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80' },
    ],
  },
  's2': {
    title: 'Crystal Palace Venue',
    category: 'Venue', subcategory: 'Halls',
    description: 'Crystal Palace Venue offers a stunning setting for all types of events. With modern facilities and elegant design, we ensure your event is truly memorable and exceptional.',
    pricingUnit: 'per_hour', customPricingUnit: '',
    basePrice: '200', city: 'Amman', capacity: '200',
    tags: ['modern', 'elegant'],
    isActive: true,
    coverImage: { 
      id: 4, 
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80' 
    },
    galleryImages: [],
  },
  's3': {
    title: 'Outdoor Garden Setup',
    category: 'Decoration', subcategory: 'Floral',
    description: 'Transform any outdoor space into a magical garden event. We specialize in floral arrangements, lighting design, and complete outdoor event decoration packages.',
    pricingUnit: 'per_event', customPricingUnit: '',
    basePrice: '300', city: 'Amman', capacity: '',
    tags: ['outdoor', 'garden', 'floral'],
    isActive: false,
    coverImage: { 
      id: 5, 
      url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80' 
    },
    galleryImages: [],
  },
};

function VendorServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [step, setStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    if (isEditMode && MOCK_SERVICES_DATA[id]) {
      return MOCK_SERVICES_DATA[id];
    }
    return {
      title: '', category: '', subcategory: '', description: '',
      pricingUnit: 'per_event', customPricingUnit: '', basePrice: '',
      city: 'Amman', capacity: '', tags: [], isActive: true,
      coverImage: null,
      galleryImages: []
    };
  });

  const handleNext = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title.trim()) 
        newErrors.title = 'Service title is required';
      if (!formData.category) 
        newErrors.category = 'Please select a category';
      if (!formData.basePrice || Number(formData.basePrice) <= 0)
        newErrors.basePrice = 'Please enter a valid price';
      if (formData.description.trim().length < 100)
        newErrors.description = `Description too short (${formData.description.trim().length}/100 chars)`;
    }
    
    if (step === 3) {
      if (!formData.coverImage)
        newErrors.coverImage = 'A cover image is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(s => Math.min(s + 1, 4));
  };
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, coverImage: { id: Date.now(), url: URL.createObjectURL(file) } });
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.galleryImages.length + files.length > 8) return toastWarning("Maximum 8 gallery images allowed.");
    const newImages = files.map((file, i) => ({ id: Date.now() + i, url: URL.createObjectURL(file) }));
    setFormData({ ...formData, galleryImages: [...formData.galleryImages, ...newImages] });
  };

  const removeGalleryImage = (id) => setFormData({ ...formData, galleryImages: formData.galleryImages.filter(img => img.id !== id) });

  const handleSubmit = (e) => {
    e.preventDefault();
    toastSuccess("Service published successfully!");
    navigate('/vendor/services');
  };

  const STEP_LABELS = ['Basic Info', 'Details', 'Media', 'Review'];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 relative pb-10">
      <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full">
        <div className="h-full bg-[var(--color-gold)] rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }} />
      </div>
      {[1, 2, 3, 4].map(num => (
        <div key={num} className="relative flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${step >= num ? 'bg-[var(--color-gold)] border-white text-white shadow-md' : 'bg-gray-100 border-white text-gray-400'}`}>
            {num === 4 ? <CheckCircle2 size={18} /> : num}
          </div>
          <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap ${step >= num ? 'text-[var(--color-gold)]' : 'text-gray-400'} ${step === num ? 'block' : 'hidden sm:block'}`}>
            {STEP_LABELS[num-1]}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-extrabold text-[var(--color-dark)] border-b border-gray-100 pb-4">Basic Information</h2>
      
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Service Title</label>
        <input 
          type="text" 
          value={formData.title} 
          onChange={e => {
            setFormData({...formData, title: e.target.value});
            if (errors.title) setErrors(prev => ({...prev, title: undefined}));
          }} 
          placeholder="e.g., Grand Royal Ballroom" 
          className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm transition-all ${errors.title ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`} 
        />
        {errors.title && (
          <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
            <AlertCircle size={12}/> {errors.title}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category</label>
          <select 
            value={formData.category} 
            onChange={e => {
              setFormData({...formData, category: e.target.value, subcategory: ''});
              if (errors.category) setErrors(prev => ({...prev, category: undefined}));
            }} 
            className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm bg-white transition-all ${errors.category ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
          >
            <option value="">Select Category</option>
            {Object.keys(MOCK_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          {errors.category && (
            <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
              <AlertCircle size={12}/> {errors.category}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Subcategory</label>
          <select value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})} disabled={!formData.category} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm bg-white disabled:bg-gray-50">
            <option value="">Select Subcategory</option>
            {formData.category && MOCK_CATEGORIES[formData.category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          Description <span className="text-gray-400 font-normal normal-case">Min 100 characters</span>
        </label>
        <textarea 
          rows="4" 
          value={formData.description} 
          onChange={e => {
            setFormData({...formData, description: e.target.value});
            if (errors.description) setErrors(prev => ({...prev, description: undefined}));
          }} 
          placeholder="Describe your service in detail..." 
          className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm resize-none transition-all ${errors.description ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`} 
        />
        {errors.description && (
          <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
            <AlertCircle size={12}/> {errors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Pricing Unit</label>
          <select value={formData.pricingUnit} onChange={e => setFormData({...formData, pricingUnit: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm bg-white mb-2">
            {PRICING_UNITS.map(unit => <option key={unit} value={unit}>{unit.replace('_', ' ')}</option>)}
            <option value="other">Other (Custom)</option>
          </select>
          {formData.pricingUnit === 'other' && (
            <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-[var(--color-gold)] w-full bg-white">
              <span className="text-gray-500 text-sm font-bold mr-1">per</span>
              <input type="text" value={formData.customPricingUnit} onChange={e => setFormData({...formData, customPricingUnit: e.target.value})} placeholder="e.g. piece" className="w-full py-3 outline-none text-sm bg-transparent" />
            </div>
          )}
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Base Price (JOD)</label>
          <input 
            type="number" 
            value={formData.basePrice} 
            onChange={e => {
              setFormData({...formData, basePrice: e.target.value});
              if (errors.basePrice) setErrors(prev => ({...prev, basePrice: undefined}));
            }} 
            placeholder="0.00" 
            className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm transition-all ${errors.basePrice ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`} 
          />
          {errors.basePrice && (
            <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
              <AlertCircle size={12}/> {errors.basePrice}
            </p>
          )}
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">City / Location</label>
          <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm bg-white">
            {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-extrabold text-[var(--color-dark)] border-b border-gray-100 pb-4">Details & Capacity</h2>
      
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Max Capacity (Guests)</label>
        <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} placeholder="e.g., 500 (Leave blank if not applicable)" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm" />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tags / Keywords</label>
        <div className="p-3 border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-[var(--color-gold)] transition-all">
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">
                {tag} <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
              </span>
            ))}
          </div>
          <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Type a tag and press Enter" className="w-full outline-none text-sm bg-transparent" />
        </div>
      </div>

      <div className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50/50 mt-4">
        <div>
          <h3 className="font-bold text-[var(--color-dark)]">Service Status</h3>
          <p className="text-xs text-gray-500 mt-1">If inactive, this service will be hidden from the marketplace.</p>
        </div>
        <button type="button" onClick={() => setFormData({...formData, isActive: !formData.isActive})} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Cover Image Section */}
      <div>
        <h2 className="text-xl font-extrabold text-[var(--color-dark)] border-b border-gray-100 pb-4 mb-4">Cover Image</h2>
        <p className="text-sm text-gray-500 mb-4">This is the main large image displayed on your service page.</p>
        
        {formData.coverImage ? (
          <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-200 group">
            <img src={formData.coverImage.url} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button type="button" onClick={() => setFormData({...formData, coverImage: null})} className="px-4 py-2 min-h-[44px] bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">Remove Cover</button>
            </div>
          </div>
        ) : (
          <div onClick={() => coverInputRef.current?.click()} className="w-full h-64 border-2 border-dashed border-[var(--color-gold)] bg-[var(--color-gold)]/5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--color-gold)]/10 transition-colors">
            <Upload size={32} className="text-[var(--color-gold)] mb-3" />
            <h3 className="text-lg font-bold text-[var(--color-dark)]">Upload Cover Image</h3>
            <p className="text-sm text-gray-500 mt-1">Recommended size: 1200x600px</p>
            <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={handleCoverUpload} />
          </div>
        )}
        {errors.coverImage && (
          <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
            <AlertCircle size={12}/> {errors.coverImage}
          </p>
        )}
      </div>

      {/* Gallery Images Section */}
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-xl font-extrabold text-[var(--color-dark)]">Gallery Images</h2>
          <span className="text-sm font-normal text-gray-500">{formData.galleryImages.length} / 8</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Add smaller images to show off different details of your service.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {formData.galleryImages.map(img => (
            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
              <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeGalleryImage(img.id)} className="absolute top-2 right-2 w-11 h-11 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                <X size={14} />
              </button>
            </div>
          ))}
          
          {formData.galleryImages.length < 8 && (
            <div onClick={() => galleryInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Upload size={24} className="text-gray-400 mb-2" />
              <span className="text-xs font-bold text-gray-500">Add Image</span>
              <input type="file" multiple accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleGalleryUpload} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSummary = () => {
    const finalPricingUnit = formData.pricingUnit === 'other' ? `per ${formData.customPricingUnit}` : formData.pricingUnit.replace('_', ' ');
    
    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 className="text-xl font-extrabold text-[var(--color-dark)] border-b border-gray-100 pb-4">Review Summary</h2>
        
        <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 border border-gray-100">
          <div className="w-full sm:w-40 aspect-square rounded-xl bg-gray-200 overflow-hidden shrink-0">
            {formData.coverImage ? (
              <img src={formData.coverImage.url} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={32} /></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] text-xs font-bold uppercase tracking-wider rounded-md">{formData.category || 'Category'}</span>
              {formData.subcategory && <span className="px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-md">{formData.subcategory}</span>}
            </div>
            <h3 className="text-2xl font-extrabold text-[var(--color-dark)] mb-2 truncate">{formData.title || 'Untitled Service'}</h3>
            <p className="text-xl font-black text-[var(--color-dark)] mb-4">{formData.basePrice || '0'} JOD <span className="text-sm font-medium text-gray-500 normal-case">/ {finalPricingUnit}</span></p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {formData.city}</div>
              {formData.capacity && <div className="flex items-center gap-1.5"><Users size={16} className="text-gray-400" /> Up to {formData.capacity} guests</div>}
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                {formData.isActive ? 'Active Listing' : 'Inactive Listing'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">
          {isEditMode ? 'Edit Service' : 'Add New Service'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Provide detailed information to attract more customers.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderSummary()}

          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
            <button type="button" onClick={handlePrev} disabled={step === 1} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-0 flex items-center gap-2">
              <ChevronLeft size={18} /> Back
            </button>
            
            {step < 4 ? (
              <button type="button" onClick={handleNext} className="px-6 py-3 bg-[var(--color-dark)] text-white font-bold rounded-xl hover:bg-[#1a1a1a] shadow-md transition-all flex items-center gap-2">
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button type="submit" className="px-8 py-3 bg-[var(--color-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-gold-dark)] shadow-[0_4px_14px_rgba(201,162,77,0.3)] transition-all flex items-center gap-2">
                <Save size={18} /> {isEditMode ? 'Update Service' : 'Publish Service'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default VendorServiceForm;
