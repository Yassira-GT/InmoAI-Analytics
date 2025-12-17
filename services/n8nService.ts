
import { PropertyInput, AnalysisReport } from '../types';

const N8N_WEBHOOK_URL = "https://yassira.app.n8n.cloud/webhook/dcda166a-21a4-4946-aa01-3b78863bf0c1";

/**
 * Función de utilidad para reintentar peticiones fallidas
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      throw new Error(`Status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`Retrying fetch... Attempts left: ${retries}. Error: ${error}`);
    await new Promise(resolve => setTimeout(resolve, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}

export const triggerN8NAnalysis = async (input: PropertyInput): Promise<Partial<AnalysisReport> & { resultado?: string }> => {
  try {
    const response = await fetchWithRetry(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const responseData = await response.json();
    
    // n8n a veces devuelve [ { json: { ... } } ] o simplemente { ... }
    const firstItem = Array.isArray(responseData) ? responseData[0] : responseData;
    const rawContent = firstItem?.json || firstItem;
    
    // Si el contenido es un string (ej: bloque markdown), intentamos parsearlo
    if (typeof rawContent === 'string') {
      try {
        const cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        if (cleanContent.startsWith('{')) {
          return JSON.parse(cleanContent);
        }
        return { htmlContent: rawContent };
      } catch (e) {
        return { htmlContent: rawContent };
      }
    }

    // Retornamos el objeto procesado (que podría contener la clave 'resultado' si n8n falló)
    return (rawContent || {}) as any;
  } catch (error) {
    console.error("Fallo crítico en n8nService:", error);
    throw new Error("No se pudo establecer conexión con el agente de análisis.");
  }
};
