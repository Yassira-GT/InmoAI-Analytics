
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { PropertyInput, PropertyRecord, AnalysisReport } from './types';
import { saveProperty, getProperties } from './services/dataService';
import { triggerN8NAnalysis } from './services/n8nService';
import { analyzeProperty as analyzeWithGeminiDirect } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { PropertyForm } from './components/PropertyForm';
import { ReportView } from './components/ReportView';
import { ChatInterface } from './components/ChatInterface';
import { Button } from './components/Button';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight">InmoAI Analytics</span>
            </div>
            <div className="flex space-x-4">
              {location.pathname !== '/dashboard' && (
                 <Button variant="secondary" onClick={() => navigate('/dashboard')} className="text-xs">
                    Mis Informes
                 </Button>
              )}
               {location.pathname !== '/' && (
                 <Button variant="primary" onClick={() => navigate('/')} className="text-xs">
                    Nuevo Análisis
                 </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <p className="text-slate-800 font-bold text-lg mb-3 italic px-4 leading-relaxed">
            "Donde la potencia de los agentes inteligentes transforma datos complejos en decisiones estratégicas, <br className="hidden md:block" />
            convirtiendo cada inmueble en una oportunidad de inversión segura, rentable y proyectada al éxito."
          </p>
          <div className="h-1 w-20 bg-blue-500 mx-auto mb-4 rounded-full opacity-50"></div>
          <p className="text-slate-500 text-sm font-medium">
            &copy; 2024 InmoAI Analytics. Orquestación avanzada con n8n, Gemini & Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
};

const MainContent = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<PropertyRecord | null>(null);

  useEffect(() => {
    const load = async () => {
        const data = await getProperties();
        setProperties(data);
    };
    load();
  }, []);

  const handleCreateAnalysis = async (input: PropertyInput) => {
    setLoading(true);
    let finalReport: AnalysisReport | null = null;

    try {
      console.log("Iniciando análisis con Agente Primario (n8n)...");
      const n8nData = await triggerN8NAnalysis(input);
      
      // Validación flexible de la respuesta de n8n
      const hasContent = n8nData && (n8nData.htmlContent || n8nData.content || n8nData.report || typeof n8nData === 'string');
      
      if (!hasContent) {
        throw new Error("La respuesta de n8n no contiene un informe válido.");
      }

      // Mapeo inteligente de campos (acepta nombres planos o anidados)
      const metrics = n8nData.metrics || {
        roi: n8nData.roi || 0,
        capRate: n8nData.capRate || 0,
        monthlyCashflow: n8nData.monthlyCashflow || 0,
        estimatedRenovationCost: n8nData.estimatedRenovationCost || 0,
        suggestedOfferPrice: n8nData.suggestedOfferPrice || input.price,
        appreciationForecast: n8nData.appreciationForecast || 0
      };

      const marketData = n8nData.marketData || {
        priceEvolution: n8nData.priceEvolution || [],
        similarListings: n8nData.similarListings || []
      };

      finalReport = {
        id: crypto.randomUUID(),
        propertyId: input.id || 'temp',
        metrics: metrics,
        marketData: marketData,
        viabilityScore: n8nData.viabilityScore || 70,
        recommendation: n8nData.recommendation || 'HOLD',
        htmlContent: typeof n8nData === 'string' ? n8nData : (n8nData.htmlContent || n8nData.content || n8nData.report || "Análisis completado satisfactoriamente."),
        createdAt: new Date().toISOString()
      };

      console.log("Informe de n8n generado con éxito.");

    } catch (err) {
      console.warn("Agente Primario falló. Activando Agente de Respaldo Directo (Gemini SDK)...", err);
      
      try {
        finalReport = await analyzeWithGeminiDirect(input);
      } catch (fallbackErr) {
        console.error("Fallo crítico en ambos agentes:", fallbackErr);
        alert("Lo sentimos, no pudimos generar el análisis. Verifica la configuración de n8n o tu API Key.");
        setLoading(false);
        return;
      }
    }

    if (finalReport) {
      try {
        const savedRecord = await saveProperty(input, finalReport);
        setProperties(prev => [savedRecord, ...prev]);
        setCurrentProperty(savedRecord);
        navigate('/report');
      } catch (saveErr) {
        console.error("Error al guardar el informe:", saveErr);
        const tempRecord: PropertyRecord = { ...input, id: finalReport.id, userId: 'temp', createdAt: new Date().toISOString(), report: finalReport };
        setCurrentProperty(tempRecord);
        navigate('/report');
      }
    }
    
    setLoading(false);
  };

  const handleSelectProperty = (prop: PropertyRecord) => {
    setCurrentProperty(prop);
    navigate('/report');
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Evaluación Inmobiliaria Inteligente</h1>
            <p className="text-slate-500">Ingresa los datos del inmueble para recibir un informe profesional de viabilidad orquestado por IA.</p>
          </div>
          <PropertyForm onSubmit={handleCreateAnalysis} isLoading={loading} />
        </div>
      } />
      
      <Route path="/dashboard" element={
        <Dashboard 
          properties={properties} 
          onSelect={handleSelectProperty} 
          onNew={() => navigate('/')} 
        />
      } />

      <Route path="/report" element={
        currentProperty && currentProperty.report ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ReportView property={currentProperty} report={currentProperty.report} />
            </div>
            <div className="lg:col-span-1">
               <div className="sticky top-24">
                 <ChatInterface property={currentProperty} report={currentProperty.report} />
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500">No hay reporte seleccionado. Ve al <a href="#/" className="text-blue-600 underline">Inicio</a>.</p>
          </div>
        )
      } />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <MainContent />
      </Layout>
    </Router>
  );
}

export default App;
