import { GoogleGenAI, Type } from "@google/genai";
import { PropertyInput, AnalysisReport } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const ANALYSIS_SYSTEM_INSTRUCTION = `
Actúa como un Analista de Inversiones Inmobiliarias de Clase Mundial.
Tu objetivo es evaluar inmuebles para inversores basándote en los datos proporcionados.

Requisitos de salida:
1. Idioma: Estrictamente ESPAÑOL.
2. Formato de texto: HTML limpio y profesional. 
   - Estructura el contenido con bloques claros.
   - Usa <h3> para títulos de sección.
   - Usa <ul> y <li> para listas.
   - Usa <strong> para resaltar lo importante.
   - NO uses markdown, no uses etiquetas como <html>, <body> o <head>.
3. Datos estructurados: JSON estricto para las métricas y gráficas.
4. Tono: Directo y simple. Evita jerga financiera compleja sin explicarla.

Sé conservador en tus estimaciones financieras.
Dirígete al usuario por su nombre.
`;

export const analyzeProperty = async (property: PropertyInput): Promise<AnalysisReport> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    Prepara un análisis de inversión inmobiliaria para: ${property.userInfo.firstName} ${property.userInfo.lastName}.
    CONTEXTO TEMPORAL: Asume que la fecha de consulta actual es Diciembre de 2025.
    
    Detalles del Inmueble:
    Tipo: ${property.propertyType}
    Ubicación: ${property.location}
    Precio: ${property.currency} ${property.price}
    Tamaño: ${property.sizeM2} m2
    Habitaciones: ${property.bedrooms}
    Baños: ${property.bathrooms}
    Garaje: ${property.garage} plazas
    Descripción: ${property.description || "Inmueble residencial estándar en buen estado."}

    Genera lo siguiente en el JSON:
    1. Métricas Financieras (ROI, Cap Rate, Cashflow Mensual, etc.).
    2. Datos de Mercado Ficticios (pero realistas) para gráficas. 
       - Para "priceEvolution", genera datos estrictamente para los últimos 5 años finalizando en 2025 (es decir: 2021, 2022, 2023, 2024, 2025).
    3. Score de viabilidad y Recomendación.
    4. "htmlContent": Un informe HTML optimizado para lectura rápida.
       - INICIO: Crea un <div> con un "Resumen Ejecutivo" de 3-4 líneas.
       - CUERPO: Secciones claras como "Análisis de Rentabilidad", "Puntos Fuertes" y "Riesgos".
       - FINAL: Conclusión clara sobre si comprar o no.
       - Menciona explícitamente si el garaje añade valor significativo.
       - En el informe escrito, haz referencia a que el análisis es válido a fecha de Diciembre 2025.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metrics: {
              type: Type.OBJECT,
              properties: {
                roi: { type: Type.NUMBER, description: "ROI anual estimado (%)" },
                capRate: { type: Type.NUMBER, description: "Tasa de capitalización (%)" },
                monthlyCashflow: { type: Type.NUMBER, description: "Beneficio neto mensual estimado" },
                estimatedRenovationCost: { type: Type.NUMBER, description: "Costo estimado de reformas" },
                suggestedOfferPrice: { type: Type.NUMBER, description: "Precio de oferta recomendado" },
                appreciationForecast: { type: Type.NUMBER, description: "Apreciación anual esperada (%)" },
              },
              required: ["roi", "capRate", "monthlyCashflow", "estimatedRenovationCost", "suggestedOfferPrice", "appreciationForecast"]
            },
            marketData: {
              type: Type.OBJECT,
              properties: {
                priceEvolution: {
                  type: Type.ARRAY,
                  description: "Evolución del precio m2 últimos 5 años (2021-2025)",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING, description: "Año (ej: 2025)" },
                      value: { type: Type.NUMBER, description: "Precio promedio m2" }
                    }
                  }
                },
                similarListings: {
                  type: Type.ARRAY,
                  description: "Cantidad de viviendas similares en oferta actual",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING, description: "Categoría (ej: Misma Zona)" },
                      value: { type: Type.NUMBER, description: "Cantidad" }
                    }
                  }
                }
              },
              required: ["priceEvolution", "similarListings"]
            },
            viabilityScore: { type: Type.NUMBER, description: "Puntuación 0 a 100" },
            recommendation: { type: Type.STRING, enum: ["BUY", "HOLD", "PASS"] },
            htmlContent: { type: Type.STRING, description: "Informe completo en formato HTML simple" },
          },
          required: ["metrics", "marketData", "viabilityScore", "recommendation", "htmlContent"]
        }
      }
    });

    if (!response.text) throw new Error("No response from AI");

    const data = JSON.parse(response.text);
    
    return {
      id: crypto.randomUUID(),
      propertyId: property.id || 'temp',
      metrics: data.metrics,
      marketData: data.marketData,
      viabilityScore: data.viabilityScore,
      recommendation: data.recommendation,
      htmlContent: data.htmlContent,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("Analysis Failed", error);
    throw error;
  }
};

export const chatAboutProperty = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: history,
        config: {
            systemInstruction: "Eres un asistente inmobiliario útil. Estás discutiendo una propiedad específica basada en un informe generado previamente. Asume que la fecha actual es Diciembre de 2025. Mantén las respuestas concisas, profesionales y en ESPAÑOL."
        }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
};