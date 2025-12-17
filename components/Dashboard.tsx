import React from 'react';
import { PropertyRecord } from '../types';
import { Button } from './Button';

interface DashboardProps {
  properties: PropertyRecord[];
  onSelect: (prop: PropertyRecord) => void;
  onNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ properties, onSelect, onNew }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mis Inmuebles</h1>
          <p className="text-slate-500 mt-1">Gestiona y analiza tus oportunidades de inversión.</p>
        </div>
        <Button onClick={onNew}>+ Nuevo Análisis</Button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="mx-auto h-12 w-12 text-slate-300 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-slate-900">No hay inmuebles</h3>
          <p className="mt-1 text-sm text-slate-500">Comienza analizando tu primera oportunidad.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div 
              key={prop.id} 
              onClick={() => onSelect(prop)}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="h-2 bg-blue-500 w-full" />
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{prop.propertyType}</span>
                    {prop.report && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            prop.report.viabilityScore > 75 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            Score: {prop.report.viabilityScore}
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 truncate">{prop.title}</h3>
                <p className="text-slate-500 text-sm mb-4 truncate">{prop.location}</p>
                
                <div className="flex justify-between items-center text-sm font-medium text-slate-700 border-t border-slate-100 pt-4">
                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: prop.currency }).format(prop.price)}</span>
                    <span className="text-slate-400">{prop.sizeM2} m²</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
