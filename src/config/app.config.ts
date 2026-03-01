/**
 * config/app.config.ts
 * ──────────────────────────────────────────────────────────────
 * Configuración de identidad y contenido de la radio.
 *
 * ► EDITA ESTE ARCHIVO para cambiar nombre, slogan, stream, etc.
 * ► No importes este archivo directamente en componentes,
 *   usa siempre src/config/index.ts para mantener un único punto
 *   de entrada de configuración.
 */

export const APP_CONFIG = {
  // ── Nombre e identidad ──────────────────────────────────────
  RADIO_NAME: "Radio Sisid Ecuador",
  SLOGAN: "La voz del pueblo cañari",

  // ── Logo ────────────────────────────────────────────────────
  // ► Para usar tu propio logo:
  //   1. Copia el archivo a /public/logo.png (o .svg)
  //   2. Cambia este valor a "/logo.png"
  //   Dejar vacío ("") usa el logo SVG embebido por defecto.
  LOGO_URL: "/logoradio.jpg",
  // Imagen opcional para el banner principal (personaje/micrófono). Dejar "" para solo gradiente.
  BANNER_IMAGE_URL: "",

  // ── Stream de audio ─────────────────────────────────────────
  // ► Fallback si la API pública no encuentra estaciones.
  //   Se usa Radio Browser API (código abierto, GPL, uso libre).
  STREAM_URL: "",

  // ── Opciones de API pública de radio ────────────────────────
  // Radio Browser API: proyecto open-source (GPL), API pública gratuita.
  // Las estaciones se registran voluntariamente en el directorio.
  // https://www.radio-browser.info — Uso libre, sin restricciones legales.
  USE_PUBLIC_RADIO_API: true,
  RADIO_API_BASE_URL: "https://de1.api.radio-browser.info/json",
  // Servidores de respaldo (failover automático)
  RADIO_API_FALLBACK_URLS: [
    "https://de2.api.radio-browser.info/json",
    "https://nl1.api.radio-browser.info/json",
    "https://at1.api.radio-browser.info/json",
  ] as const,
  RADIO_API_COUNTRY_CODE: "EC",
  RADIO_API_PREFERRED_STATIONS: [] as const,
  // Solo tomará emisoras que coincidan con al menos 1 palabra clave.
  RADIO_API_GENRE_KEYWORDS: [
    "chicha",
    "kanari",
    "canari",
    "cañari",
    "cumbia",
    "sisid",
    "ecuatoriana",
    "folklorica",
    "andina",
    "sanjuanito",
    "pasillo",
    "bomba",
    "kichwa",
    "quechua",
  ] as const,
  // Opcional: palabras a excluir (ejemplo: "rock", "cumbia").
  RADIO_API_EXCLUDED_KEYWORDS: [] as const,

  // ── Enlaces externos (estilo Ecualatina: TuneIn, Android, iPhone) ─
  // Dejar vacío "" para ocultar el botón correspondiente.
  TUNEIN_URL: "", // ej: "https://tunein.com/radio/.../
  ANDROID_APP_URL: "https://play.google.com/store/apps/details?id=com.radiosisidecuador.host",
  IPHONE_APP_URL: "", // ej: "https://apps.apple.com/.../id..."

  // ── SEO / Meta ───────────────────────────────────────────────
  OG_IMAGE_URL: "/img/seo-banner.png",

  // ── Video embed (YouTube, Twitch, etc.) ──────────────────────
  // URL que se incrustará en el panel de video. Dejar vacío para ocultar.
  VIDEO_EMBED_URL: "https://www.youtube.com/embed/63jsVp1NKxE",

  // ── opciones de radio API se incluyen como valores por defecto arriba
} as const;
