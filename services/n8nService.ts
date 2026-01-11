
import { PropertyInput, AnalysisReport } from '../types';

const N8N_WEBHOOK_URL = "https://yassira.app.n8n.cloud/webhook/dcda166a-21a4-4946-aa01-3b78863bf0c1";

/**
 * Función de utilidad para extraer el contenido real de una respuesta de n8n
 */
const extractPayload = (data: any) => {
  // 1. Si es un array, tomamos el primer elemento (común en n8n)
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return null;

  // 2. n8n suele envolver la respuesta en .json, .body o .data dependiendo del nodo de salida
  const content = item.json || item.body || item.data || item;
  
  // 3. Si el contenido es un string que parece JSON, intentamos parsearlo
  if (typeof content === 'string' && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
    try {
      return JSON.parse(content);
    } catch (e) {
      return content;
    }
  }
  
  return content;
};

export const triggerN8NAnalysis = async (input: PropertyInput): Promise<any> => {
  try {
    console.log("Enviando datos a n8n:", input);
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new Error(`Error en el Webhook de n8n: ${response.status}`);
    }

    const rawData = await response.json();
    console.log("Respuesta bruta de n8n:", rawData);

    const processedData = extractPayload(rawData);
    console.log("Datos procesados de n8n:", processedData);

    return processedData;
  } catch (error) {
    console.error("Fallo de conexión con n8n:", error);
    throw error;
  }
};
