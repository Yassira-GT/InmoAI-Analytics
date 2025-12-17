import React, { useState, useEffect, useRef } from 'react';
import { PropertyInput, PropertyType } from '../types';
import { Button } from './Button';

interface PropertyFormProps {
  onSubmit: (data: PropertyInput) => void;
  isLoading: boolean;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ onSubmit, isLoading }) => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [formData, setFormData] = useState({
    propertyType: PropertyType.APARTMENT,
    price: '', // Keep as string for formatting logic
    location: '',
    sizeM2: '',
    bedrooms: '',
    bathrooms: '',
    garage: '',
    description: '',
    condition: 'Bueno' // Default
  });

  // Autocomplete states
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce logic for location search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (showSuggestions && formData.location.length > 2) {
        try {
          // Append 'Madrid' to ensure results are relevant to the requested region
          const query = encodeURIComponent(`${formData.location} Madrid`);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5&countrycodes=es`
          );
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data);
          }
        } catch (error) {
          console.error("Error fetching location suggestions", error);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.location, showSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Format price with thousand separators
  const formatPrice = (value: string) => {
    // Remove non-numeric characters
    const number = value.replace(/\D/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('de-DE').format(Number(number)); // de-DE uses dots for thousands commonly used in EU
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '');
    if (!isNaN(Number(rawValue))) {
      setFormData({ ...formData, price: formatPrice(rawValue) });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, location: e.target.value });
    setShowSuggestions(true);
  };

  const handleSelectLocation = (address: string) => {
    setFormData({ ...formData, location: address });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct the final object
    const finalData: PropertyInput = {
      userInfo,
      title: `${formData.propertyType} en ${formData.location}`, // Auto-generate title
      description: formData.description,
      price: Number(formData.price.replace(/\./g, '')),
      currency: 'EUR',
      location: formData.location,
      sizeM2: Number(formData.sizeM2),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      garage: Number(formData.garage),
      propertyType: formData.propertyType as PropertyType,
      ageYears: 5, // Default average if not asked
      condition: formData.condition
    };

    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      
      {/* Sección 1: Datos del Usuario */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Datos del Solicitante</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
            <input
              required
              name="firstName"
              value={userInfo.firstName}
              onChange={handleUserChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Juan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
            <input
              required
              name="lastName"
              value={userInfo.lastName}
              onChange={handleUserChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Pérez"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              required
              type="email"
              name="email"
              value={userInfo.email}
              onChange={handleUserChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="juan.perez@email.com"
            />
            <p className="text-xs text-slate-400 mt-1">El informe generado se asociará a este correo.</p>
          </div>
        </div>
      </div>

      {/* Sección 2: Datos de la Propiedad */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Datos del Inmueble</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Vivienda */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Vivienda *</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={PropertyType.APARTMENT}>Apartamento</option>
              <option value={PropertyType.HOUSE}>Casa</option>
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Precio (€) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400">€</span>
              <input
                required
                type="text"
                name="price"
                value={formData.price}
                onChange={handlePriceChange}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Ubicación con Autocomplete */}
          <div className="col-span-1 md:col-span-2 relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación (Madrid) *</label>
            <input
              required
              type="text"
              name="location"
              value={formData.location}
              onChange={handleLocationInput}
              autoComplete="off"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Barrio de Salamanca, Calle Mayor..."
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-20 w-full bg-white mt-1 rounded-lg shadow-xl border border-slate-200 max-h-60 overflow-y-auto">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectLocation(item.display_name)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-none flex items-start"
                  >
                    <svg className="w-4 h-4 text-slate-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{item.display_name}</span>
                  </li>
                ))}
              </ul>
            )}
             {showSuggestions && formData.location.length > 2 && suggestions.length === 0 && (
                <div className="absolute z-20 w-full bg-white mt-1 rounded-lg shadow-lg border border-slate-200 p-3 text-sm text-slate-500 text-center">
                    Buscando en Madrid...
                </div>
             )}
          </div>

          {/* Detalles Numéricos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-1 md:col-span-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metros (m²)</label>
              <input 
                required
                type="number" 
                name="sizeM2" 
                value={formData.sizeM2} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Habitaciones</label>
              <input 
                required
                type="number" 
                name="bedrooms" 
                value={formData.bedrooms} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Baños</label>
              <input 
                required
                type="number" 
                name="bathrooms" 
                value={formData.bathrooms} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Garaje</label>
              <input 
                required
                type="number" 
                name="garage" 
                value={formData.garage} 
                onChange={handleChange} 
                placeholder="Plazas"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-xs text-slate-500 italic">* Datos obligatorios</span>
        <Button type="submit" isLoading={isLoading} className="w-full md:w-auto text-lg py-3 px-8">
          Analizar Inmueble
        </Button>
      </div>
    </form>
  );
};