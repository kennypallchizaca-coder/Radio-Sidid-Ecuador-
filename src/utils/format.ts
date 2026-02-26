/**
 * utils/format.ts
 * ──────────────────────────────────────────────────────────────
 * Funciones de formato y transformación de datos.
 * Funciones puras — no dependen de React ni del estado de la app.
 */

/**
 * Devuelve el año actual como string.
 * Utilizado en el Footer para el copyright automático.
 */
export function currentYear(): number {
  return new Date().getFullYear();
}

/**
 * Trunca un texto a un número máximo de caracteres,
 * agregando "..." al final si fue cortado.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Formatea un número de volumen (0.0 – 1.0) a porcentaje (0 – 100).
 */
export function volumeToPercent(volume: number): number {
  return Math.round(Math.min(1, Math.max(0, volume)) * 100);
}

/**
 * Genera una URL de WhatsApp con número y mensaje pre-escrito.
 * (También disponible desde src/config/social.config.ts)
 */
export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Convierte un string ISO 8601 a fecha legible en español.
 * Ej: "2026-02-25T14:30:00Z" → "25 de febrero de 2026"
 */
export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
  }).format(new Date(isoString));
}

/**
 * Comprueba si una URL está definida y no es el placeholder.
 */
export function isValidUrl(url: string | undefined): url is string {
  return !!url && url.length > 0 && !url.includes("TU_");
}
