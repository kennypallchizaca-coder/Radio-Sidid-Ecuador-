/**
 * config/social.config.ts
 * ──────────────────────────────────────────────────────────────
 * Datos de contacto y redes sociales.
 *
 * ► EDITA este archivo para actualizar tus datos de contacto.
 *   Todos los componentes de la app obtienen estos datos desde aquí.
 */

export const SOCIAL_CONFIG = {
  // ── WhatsApp ─────────────────────────────────────────────────
  // ► Número con código de país, sin + ni espacios (ej: 593987654321)
  WHATSAPP_NUMBER: "16124625233",
  WHATSAPP_DISPLAY: "+1 (612) 462-5233",
  WHATSAPP_MESSAGE: "Hola, me comunico desde la web de Radio Sisid Ecuador",

  // ── Email ────────────────────────────────────────────────────
  EMAIL: "liberatoguaman5815@gmail.com",

  // ── Redes sociales ───────────────────────────────────────────
  // ► Reemplaza con las URLs reales de tus páginas
  FACEBOOK_URL: "https://www.facebook.com/profile.php?id=100067331525448",
  INSTAGRAM_URL: "https://www.instagram.com/radiosisidecuador/",
  YOUTUBE_URL: "https://www.youtube.com/@liberatoGuaman-td3wv",
  TWITTER_URL: "",   // Dejar vacío para ocultar el botón
  TIKTOK_URL: "",   // Dejar vacío para ocultar el botón
} as const;

/** Devuelve la URL completa de WhatsApp con el mensaje preformateado */
export function getWhatsAppUrl(
  number = SOCIAL_CONFIG.WHATSAPP_NUMBER,
  message = SOCIAL_CONFIG.WHATSAPP_MESSAGE
): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export type SocialConfig = typeof SOCIAL_CONFIG;
