import React from 'react';
import { AnalysisReport, PropertyInput } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area
} from 'recharts';

interface ReportViewProps {
  property: PropertyInput;
  report: AnalysisReport;
}

export const ReportView: React.FC<ReportViewProps> = ({ property, report }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (val: number) => {
    // Force usage of dots for thousands and remove decimals for clarity
    return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: property.currency,
        maximumFractionDigits: 0 
    }).format(val);
  };

  // Translations for display
  const recommendationMap: Record<string, string> = {
    'BUY': 'COMPRAR',
    'HOLD': 'MANTENER',
    'PASS': 'DESCARTAR'
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{property.title}</h2>
          <p className="text-slate-500">{property.location}</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Viabilidad</div>
          <div className={`text-4xl font-extrabold ${getScoreColor(report.viabilityScore)}`}>
            {report.viabilityScore}/100
          </div>
          <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold mt-2 
            ${report.recommendation === 'BUY' ? 'bg-green-100 text-green-800' : 
              report.recommendation === 'HOLD' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
            {recommendationMap[report.recommendation] || report.recommendation}
          </span>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center transform transition hover:scale-105">
            <div className="text-sm text-blue-600 font-medium mb-1">ROI Anual</div>
            <div className="text-3xl font-bold text-blue-900 tracking-tight">{report.metrics.roi}%</div>
         </div>
         <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center transform transition hover:scale-105">
            <div className="text-sm text-purple-600 font-medium mb-1">Cashflow Mensual</div>
            <div className="text-3xl font-bold text-purple-900 tracking-tight">{formatCurrency(report.metrics.monthlyCashflow)}</div>
         </div>
         <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center transform transition hover:scale-105">
            <div className="text-sm text-emerald-600 font-medium mb-1">Precio Sugerido</div>
            <div className="text-3xl font-bold text-emerald-900 tracking-tight">{formatCurrency(report.metrics.suggestedOfferPrice)}</div>
         </div>
         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center transform transition hover:scale-105">
            <div className="text-sm text-slate-600 font-medium mb-1">Apreciación Est.</div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{report.metrics.appreciationForecast}%</div>
         </div>
      </div>

      {/* Graphs Section - Simplified for non-experts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Price Evolution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Evolución de Precios del Sector</h3>
          <p className="text-sm text-slate-500 mb-6">Comportamiento histórico del valor por m² en la zona.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.marketData?.priceEvolution || []}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`${value} €/m²`, 'Precio']}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-xs text-slate-400 font-medium bg-slate-50 py-2 rounded-lg">
             Tendencia de los últimos 5 años
          </div>
        </div>

        {/* Chart 2: Supply / Similar Listings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Oferta de Viviendas Similares</h3>
          <p className="text-sm text-slate-500 mb-6">Cantidad de inmuebles compitiendo con tu búsqueda.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.marketData?.similarListings || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="label" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} 
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {report.marketData?.similarListings.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-xs text-slate-400 font-medium bg-slate-50 py-2 rounded-lg">
             Competencia directa en el mercado actual
          </div>
        </div>

      </div>

      {/* HTML Report Content */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4">Informe de Viabilidad</h3>
        <div 
            className="prose prose-lg prose-slate max-w-none 
            prose-headings:font-bold prose-headings:text-slate-800 
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-blue-700
            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
            prose-strong:text-slate-900 prose-strong:font-bold
            prose-ul:list-disc prose-ul:pl-4 prose-li:text-slate-600 prose-li:mb-2 prose-li:marker:text-blue-500"
            dangerouslySetInnerHTML={{ __html: report.htmlContent }} 
        />
      </div>
    </div>
  );
};