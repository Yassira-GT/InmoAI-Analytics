
import React, { useState, useEffect } from 'react';
import { PropertyInput, AnalysisReport } from '../types';
import { Button } from './Button';
import { getBotInfo, generateTelegramLink, TelegramBotInfo } from '../services/telegramService';

interface ChatInterfaceProps {
  property: PropertyInput;
  report: AnalysisReport;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ property, report }) => {
  const [botInfo, setBotInfo] = useState<TelegramBotInfo | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBot = async () => {
      const info = await getBotInfo();
      setBotInfo(info);
      setLoading(false);
    };
    fetchBot();
  }, []);

  const handleOpenTelegram = () => {
    if (!botInfo) return;

    const initialContext = `Hola! Vengo de InmoAI Analytics. Quisiera consultar sobre el inmueble: "${property.title}" en ${property.location}. Mi duda es: ${userQuery || '¿Es una buena inversión?'}`;
    
    const link = generateTelegramLink(botInfo.username, initialContext);
    window.open(link, '_blank');
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header Telegram Style */}
      <div className="bg-[#0088cc] p-5 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.41-1.39-.87.03-.24.37-.48 1.02-.73 3.99-1.73 6.66-2.88 8.01-3.44 3.81-1.58 4.6-1.85 5.12-1.86.11 0 .37.03.54.17.14.12.18.28.2.44.02.13.02.27.01.41z"/>
            </svg>
          </div>
          <div>
            <h4 className="font-bold leading-none">Asistente Telegram</h4>
            <p className="text-xs text-blue-100 mt-1">
              {loading ? 'Conectando...' : `@${botInfo?.username || 'InmoBot'}`}
            </p>
          </div>
        </div>
        {!loading && (
            <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase opacity-80">En línea</span>
            </div>
        )}
      </div>
      
      <div className="p-6 bg-slate-50">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            "Hola <strong>{property.userInfo.firstName}</strong>, soy tu consultor personal en Telegram. He revisado el análisis de <strong>{property.title}</strong> y estoy listo para resolver cualquier duda financiera o técnica en tiempo real."
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">ROI: {report.metrics.roi}%</span>
            <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold uppercase">Score: {report.viabilityScore}/100</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            ¿Qué quieres preguntar?
          </label>
          <textarea
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ej: ¿Es buen momento para negociar el precio? ¿Cómo afecta el garaje a la rentabilidad?"
            className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0088cc] focus:outline-none text-sm resize-none shadow-inner"
          />
          
          <Button 
            onClick={handleOpenTelegram} 
            disabled={loading}
            className="w-full bg-[#0088cc] hover:bg-[#0077b5] py-4 text-lg shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.13 7.19c-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.41-1.39-.87.03-.24.37-.48 1.02-.73 3.99-1.73 6.66-2.88 8.01-3.44 3.81-1.58 4.6-1.85 5.12-1.86.11 0 .37.03.54.17.14.12.18.28.2.44.02.13.02.27.01.41z"/>
            </svg>
            <span>Consultar en Telegram</span>
          </Button>

          <p className="text-[10px] text-center text-slate-400 font-medium">
            Al pulsar, se abrirá la aplicación de Telegram con tu consulta.
          </p>
        </div>
      </div>

      <div className="bg-slate-100 p-4 border-t border-slate-200">
         <div className="flex items-center justify-center space-x-2 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Integración Oficial</span>
            <div className="h-3 w-px bg-slate-300"></div>
            <span className="text-[10px] font-bold text-[#0088cc] uppercase">Telegram Bot API</span>
         </div>
      </div>
    </div>
  );
};
