
export const TELEGRAM_BOT_TOKEN = "8521254788:AAHJRdx3bYswmvos3JIFm-uUsHX0D8RCyek";

export interface TelegramBotInfo {
  username: string;
  first_name: string;
}

/**
 * Obtiene la información básica del bot para construir los enlaces t.me
 */
export const getBotInfo = async (): Promise<TelegramBotInfo | null> => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const data = await response.json();
    if (data.ok) {
      return {
        username: data.result.username,
        first_name: data.result.first_name
      };
    }
    return null;
  } catch (error) {
    console.error("Error al conectar con Telegram API:", error);
    return null;
  }
};

/**
 * Genera un enlace profundo (Deep Link) para Telegram con mensaje pre-llenado
 */
export const generateTelegramLink = (botUsername: string, text: string): string => {
  const encodedText = encodeURIComponent(text);
  return `https://t.me/${botUsername}?text=${encodedText}`;
};
