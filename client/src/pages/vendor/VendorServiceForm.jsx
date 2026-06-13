import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Upload, X, CheckCircle2, 
  Info, MapPin, ImageIcon, Save, Users, AlertCircle 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toastSuccess, toastWarning, toastError } from '../../utils/toast';
import vendorService from '../../services/vendor.service';

import { getCategories, getEventTypes } from '../../services/services.service';

const CITIES = [
  'Amman', 'Irbid', 'Zarqa', 'Balqa (Salt)', 'Madaba', 'Karak', 
  'Tafilah', "Ma'an", 'Aqaba', 'Mafraq', 'Jerash', 'Ajloun', 
  'Dead Sea', 'Petra', 'Wadi Rum'
];
const PRICING_UNITS = ['per_event', 'per_hour', 'per_person', 'per_day', 'per_item'];

// ── Empty form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', category: '', subcategory: '', description: '',
  pricingUnit: 'per_event', basePrice: '',
  city: 'Amman', capacity: '', tags: [], isActive: true,
  coverImage: null,
  galleryImages: [],
  eventTypes: [],
};

function VendorServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const queryClient = useQueryClient();

  const [step,     setStep]     = useState(1);
  const [tagInput, setTagInput] = useState('');
  const [errors,   setErrors]   = useState({});
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formInitialized, setFormInitialized] = useState(false);

  const coverInputRef   = useRef(null);
  const galleryInputRef = useRef(null);

  // ── Query: load service for edit mode ─────────────────────────────────────
  // No single-service endpoint exists; fetch list and find by id.
  const { data: editServiceData, isLoading: editLoading } = useQuery({
    queryKey: ['vendor-service-edit', id],
    queryFn: async () => {
      const result = await vendorService.getMyServices({ limit: 100 });
      const service = (result?.services ?? []).find(
        (s) => String(s.service_id) === String(id),
      );
      return service ?? null;
    },
    enabled: isEditMode,
    staleTime: 1000 * 60 * 5,
  });

  // Pre-populate form when edit data arrives
  useEffect(() => {
    if (isEditMode && editServiceData && !formInitialized) {
      setFormData({
        title:            editServiceData.title           ?? '',
        category:         editServiceData.category_id     ? String(editServiceData.category_id) : '',
        subcategory:      editServiceData.subcategory_id  ? String(editServiceData.subcategory_id) : '',
        description:      editServiceData.description      ?? '',
        pricingUnit:      editServiceData.pricing_unit     ?? 'per_event',
        basePrice:        String(editServiceData.base_price ?? ''),
        city:             editServiceData.city             ?? 'Amman',
        capacity:         String(editServiceData.capacity  ?? ''),
        tags:             [],
        isActive:         editServiceData.is_active        ?? true,
        coverImage:       editServiceData.primary_image_url
          ? { id: 'existing', url: editServiceData.primary_image_url, file: null }
          : null,
        galleryImages:    [],
        eventTypes:       editServiceData.event_types?.map(e => e.event_type_id) ?? [],
      });
      setFormInitialized(true);
    }
  }, [editServiceData, isEditMode, formInitialized]);

  // ── Mutation: create service ───────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload) => vendorService.createService(payload),
    onSuccess: async (data) => {
      const newServiceId = data?.service?.service_id;

      // Upload images after service creation
      const filesToUpload = [
        formData.coverImage?.file,
        ...formData.galleryImages.map((img) => img.file),
      ].filter(Boolean);

      if (filesToUpload.length > 0 && newServiceId) {
        try {
          const imgFormData = new FormData();
          filesToUpload.forEach((file) => imgFormData.append('images', file));
          await vendorService.uploadServiceImages(newServiceId, imgFormData);
        } catch (imgErr) {
          // Non-fatal: service was created, image upload failed
          toastError('Service created, but some images failed to upload.');
        }
      }

      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-analytics'] });
      toastSuccess('Service published successfully!');
      navigate('/vendor/services');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to create service.');
    },
  });

  // ── Mutation: update service ───────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (payload) => vendorService.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-service-edit', id] });
      toastSuccess('Service updated successfully!');
      navigate('/vendor/services');
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Failed to update service.');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ── Build API payload ─────────────────────────────────────────────────────
  const buildPayload = () => {
    const payload = {
      title:        formData.title.trim(),
      description:  formData.description.trim(),
      base_price:   parseFloat(formData.basePrice),
      pricing_unit: formData.pricingUnit,
      city:         formData.city,
      is_active:    formData.isActive,
      category_id:  parseInt(formData.category, 10),
      event_types:  formData.eventTypes,
    };
    if (formData.subcategory) {
      payload.subcategory_id = parseInt(formData.subcategory, 10);
    }
    if (formData.capacity) {
      payload.capacity = parseInt(formData.capacity, 10);
    }
    return payload;
  };

  // ── handleSubmit ──────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e?.preventDefault();
    const payload = buildPayload();
    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  // ── Step navigation / validation ──────────────────────────────────────────
  const handleNext = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim())
        newErrors.title = 'Service title is required';
      if (!formData.category)
        newErrors.category = 'Please select a category';
      if (!formData.basePrice || Number(formData.basePrice) <= 0)
        newErrors.basePrice = 'Please enter a valid price';
      if (formData.description.trim().length < 50)
        newErrors.description = `Description too short (${formData.description.trim().length}/50 chars)`;
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
    setStep((s) => Math.min(s + 1, 4));
  };
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  // ── Tag handlers ──────────────────────────────────────────────────────────
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };
  const removeTag = (tagToRemove) =>
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tagToRemove) });

  // ── Image handlers ────────────────────────────────────────────────────────
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        coverImage: { id: Date.now(), url: URL.createObjectURL(file), file },
      });
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.galleryImages.length + files.length > 8)
      return toastWarning('Maximum 8 gallery images allowed.');
    const newImages = files.map((file, i) => ({
      id: Date.now() + i,
      url: URL.createObjectURL(file),
      file,
    }));
    setFormData({ ...formData, galleryImages: [...formData.galleryImages, ...newImages] });
  };

  const removeGalleryImage = (imgId) =>
    setFormData({ ...formData, galleryImages: formData.galleryImages.filter((img) => img.id !== imgId) });

  // ── Edit loading state ────────────────────────────────────────────────────
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60,
  });
  const categoriesList = categoriesData?.data?.categories ?? [];

  const { data: eventTypesData } = useQuery({
    queryKey: ['event-types'],
    queryFn: getEventTypes,
    staleTime: 1000 * 60 * 60,
  });
  const eventTypesList = eventTypesData?.data?.eventTypes ?? [];

  if (isEditMode && editLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto pb-12 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--color-gold)] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold">Loading service data...</p>
        </div>
      </div>
    );
  }

  const STEP_LABELS = ['Basic Info', 'Details', 'Media', 'Review'];

  const selectedCatObj = categoriesList.find(c => String(c.category_id) === String(formData.category));
  const subcategoriesList = selectedCatObj?.subcategories ?? [];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 relative pb-10">
      <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full">
        <div className="h-full bg-[var(--color-gold)] rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }} />
      </div>
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="relative flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${step >= num ? 'bg-[var(--color-gold)] border-white text-white shadow-md' : 'bg-gray-100 border-white text-gray-400'}`}>
            {num === 4 ? <CheckCircle2 size={18} /> : num}
          </div>
          <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap ${step >= num ? 'text-[var(--color-gold)]' : 'text-gray-400'} ${step === num ? 'block' : 'hidden sm:block'}`}>
            {STEP_LABELS[num - 1]}
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
          onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (errors.title) setErrors((prev) => ({ ...prev, title: undefined })); }}
          placeholder="e.g., Grand Royal Ballroom"
          className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm transition-all ${errors.title ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
        />
        {errors.title && <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => { setFormData({ ...formData, category: e.target.value, subcategory: '' }); if (errors.category) setErrors((prev) => ({ ...prev, category: undefined })); }}
            className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm bg-white transition-all ${errors.category ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
          >
            <option value="">Select Category</option>
            {categoriesList.map((cat) => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
          </select>
          {errors.category && <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.category}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Subcategory</label>
          <select
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            disabled={!formData.category || subcategoriesList.length === 0}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm bg-white disabled:bg-gray-50"
          >
            <option value="">Select Subcategory</option>
            {subcategoriesList.map((sub) => <option key={sub.subcategory_id} value={sub.subcategory_id}>{sub.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          Description <span className="text-gray-400 font-normal normal-case">Min 50 characters</span>
        </label>
        <textarea
          rows="4"
          value={formData.description}
          onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors((prev) => ({ ...prev, description: undefined })); }}
          placeholder="Describe your service in detail..."
          className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm resize-none transition-all ${errors.description ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
        />
        {errors.description && <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Pricing Unit</label>
          <select
            value={formData.pricingUnit}
            onChange={(e) => setFormData({ ...formData, pricingUnit: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm bg-white mb-2"
          >
            {PRICING_UNITS.map((unit) => {
              let label = unit.replace('_', ' ');
              if (unit === 'per_item') label = 'per piece';
              if (unit === 'per_person') label = 'per guest';
              return (
                <option key={unit} value={unit}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Base Price (JOD)</label>
          <input
            type="number"
            value={formData.basePrice}
            onChange={(e) => { setFormData({ ...formData, basePrice: e.target.value }); if (errors.basePrice) setErrors((prev) => ({ ...prev, basePrice: undefined })); }}
            placeholder="0.00"
            className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm transition-all ${errors.basePrice ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
          />
          {errors.basePrice && <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.basePrice}</p>}
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">City / Location</label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm bg-white"
          >
            {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  const getCapacityUnitLabel = () => {
    switch (formData.pricingUnit) {
      case 'per_person': return 'guests';
      case 'per_hour':   return 'hours';
      case 'per_day':    return 'days';
      case 'per_event':  return 'events';
      case 'per_item':   return 'pieces';
      default:           return 'units';
    }
  };

  const renderStep2 = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-extrabold text-[var(--color-dark)] border-b border-gray-100 pb-4">Details & Capacity</h2>
      
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Max Capacity ({getCapacityUnitLabel()})
        </label>
        <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} placeholder="e.g., 500 (Leave blank if not applicable)" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm" />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Applicable Event Types</label>
        <p className="text-xs text-gray-500 mb-3">Select the events your service is perfectly suited for.</p>
        <div className="flex flex-wrap gap-2">
          {eventTypesList.map((et) => {
            const isSelected = formData.eventTypes.includes(et.event_type_id);
            return (
              <button
                key={et.event_type_id}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    eventTypes: isSelected 
                      ? prev.eventTypes.filter(id => id !== et.event_type_id)
                      : [...prev.eventTypes, et.event_type_id]
                  }));
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  isSelected 
                    ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)]' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {et.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tags / Keywords</label>
        <div className="p-3 border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-[var(--color-gold)] transition-all">
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">
                {tag} <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
              </span>
            ))}
          </div>
          <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Type a tag and press Enter" className="w-full outline-none text-sm bg-transparent" />
        </div>
      </div>

      <div className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50/50 mt-4">
        <div>
          <h3 className="font-bold text-[var(--color-dark)]">Service Status</h3>
          <p className="text-xs text-gray-500 mt-1">If inactive, this service will be hidden from the marketplace.</p>
        </div>
        <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
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
              <button type="button" onClick={() => setFormData({ ...formData, coverImage: null })} className="px-4 py-2 min-h-[44px] bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">Remove Cover</button>
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
        {errors.coverImage && <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1"><AlertCircle size={12} /> {errors.coverImage}</p>}
      </div>

      {/* Gallery Images Section */}
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-xl font-extrabold text-[var(--color-dark)]">Gallery Images</h2>
          <span className="text-sm font-normal text-gray-500">{formData.galleryImages.length} / 8</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Add smaller images to show off different details of your service.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {formData.galleryImages.map((img) => (
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
    let finalPricingUnit = formData.pricingUnit.replace('_', ' ');
    if (formData.pricingUnit === 'per_item') finalPricingUnit = 'per piece';
    if (formData.pricingUnit === 'per_person') finalPricingUnit = 'per guest';
    
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
              <span className="px-2.5 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] text-xs font-bold uppercase tracking-wider rounded-md">{selectedCatObj?.name || 'Category'}</span>
              {formData.subcategory && <span className="px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-md">{subcategoriesList.find(s => String(s.subcategory_id) === String(formData.subcategory))?.name || 'Subcategory'}</span>}
            </div>
            <h3 className="text-2xl font-extrabold text-[var(--color-dark)] mb-2 truncate">{formData.title || 'Untitled Service'}</h3>
            <p className="text-xl font-black text-[var(--color-dark)] mb-4">{formData.basePrice || '0'} JOD <span className="text-sm font-medium text-gray-500 normal-case">/ {finalPricingUnit}</span></p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {formData.city}</div>
              {formData.capacity && <div className="flex items-center gap-1.5"><Users size={16} className="text-gray-400" /> Up to {formData.capacity} {getCapacityUnitLabel()}</div>}
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                {formData.isActive ? 'Active Listing' : 'Inactive Listing'}
              </div>
            </div>
          </div>
        </div>

        {isSubmitting && (
          <div className="flex items-center gap-3 p-4 bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20 rounded-xl text-sm font-semibold text-[var(--color-gold-dark)]">
            <div className="w-4 h-4 rounded-full border-2 border-[var(--color-gold)] border-t-transparent animate-spin" />
            {isEditMode ? 'Updating service...' : 'Publishing service...'}
          </div>
        )}
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[var(--color-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-gold-dark)] shadow-[0_4px_14px_rgba(201,162,77,0.3)] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> {isEditMode ? 'Updating...' : 'Publishing...'}</>
                ) : (
                  <><Save size={18} /> {isEditMode ? 'Update Service' : 'Publish Service'}</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default VendorServiceForm;
