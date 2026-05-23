import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_FILTERS } from '../components/Services/FilterSidebar';

export function useUrlFilters(lockedEventType = null) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState(() => {
    const initial = { ...DEFAULT_FILTERS };
    
    if (searchParams.has('keyword')) initial.keyword = searchParams.get('keyword');
    if (searchParams.has('eventType')) initial.eventType = searchParams.get('eventType');
    if (searchParams.has('categories')) initial.categories = searchParams.get('categories').split(',');
    if (searchParams.has('subcategory')) initial.subcategory = searchParams.get('subcategory');
    if (searchParams.has('minPrice')) initial.minPrice = Number(searchParams.get('minPrice'));
    if (searchParams.has('maxPrice')) initial.maxPrice = Number(searchParams.get('maxPrice'));
    if (searchParams.has('cities')) initial.cities = searchParams.get('cities').split(',');
    if (searchParams.has('rating')) initial.rating = Number(searchParams.get('rating'));
    if (searchParams.has('date')) initial.date = searchParams.get('date');
    
    if (lockedEventType) {
      initial.eventType = lockedEventType;
    }
    
    return initial;
  });

  const debounceRef = useRef(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (isInternalUpdate.current) {
       isInternalUpdate.current = false;
       return;
    }
    
    const nextFilters = { ...DEFAULT_FILTERS };
    if (searchParams.has('keyword')) nextFilters.keyword = searchParams.get('keyword');
    if (searchParams.has('eventType')) nextFilters.eventType = searchParams.get('eventType');
    if (searchParams.has('categories')) nextFilters.categories = searchParams.get('categories').split(',');
    if (searchParams.has('subcategory')) nextFilters.subcategory = searchParams.get('subcategory');
    if (searchParams.has('minPrice')) nextFilters.minPrice = Number(searchParams.get('minPrice'));
    if (searchParams.has('maxPrice')) nextFilters.maxPrice = Number(searchParams.get('maxPrice'));
    if (searchParams.has('cities')) nextFilters.cities = searchParams.get('cities').split(',');
    if (searchParams.has('rating')) nextFilters.rating = Number(searchParams.get('rating'));
    if (searchParams.has('date')) nextFilters.date = searchParams.get('date');
    
    if (lockedEventType) {
      nextFilters.eventType = lockedEventType;
    }
    
    setFilters(nextFilters);
  }, [searchParams, lockedEventType]);

  const updateFilter = useCallback((field, value) => {
    if (lockedEventType && field === 'eventType') return;

    setFilters(prev => {
      const next = { ...prev, [field]: value };
      
      const applyToUrl = () => {
        isInternalUpdate.current = true;
        setSearchParams(current => {
          const newParams = new URLSearchParams();
          
          Object.entries(next).forEach(([k, v]) => {
            if (lockedEventType && k === 'eventType') return;
            
            if (v !== DEFAULT_FILTERS[k] && v !== '') {
              if (Array.isArray(v)) {
                if (v.length > 0) newParams.set(k, v.join(','));
              } else {
                newParams.set(k, String(v));
              }
            }
          });
          
          return newParams;
        }, { replace: ['minPrice', 'maxPrice', 'keyword'].includes(field) });
      };

      if (['minPrice', 'maxPrice', 'keyword'].includes(field)) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(applyToUrl, 400);
      } else {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        applyToUrl();
      }

      return next;
    });
  }, [setSearchParams, lockedEventType]);

  const clearFilters = useCallback(() => {
    const reset = { ...DEFAULT_FILTERS };
    if (lockedEventType) reset.eventType = lockedEventType;
    setFilters(reset);
    
    isInternalUpdate.current = true;
    setSearchParams(new URLSearchParams(), { replace: false });
  }, [lockedEventType, setSearchParams]);

  return { filters, updateFilter, clearFilters };
}
