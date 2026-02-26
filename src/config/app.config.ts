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
  LOCATION: "Minneapolis, Minnesota, EE.UU.",
  COUNTRY_CODE: "US",

  // ── Logo ────────────────────────────────────────────────────
  // ► Para usar tu propio logo:
  //   1. Copia el archivo a /public/logo.png (o .svg)
  //   2. Cambia este valor a "/logo.png"
  //   Dejar vacío ("") usa el logo SVG embebido por defecto.
  LOGO_URL: "/logoradio.jpg",

  // ── Stream de audio ─────────────────────────────────────────
  // ► REEMPLAZA esta URL con la dirección real de tu servidor
  //   de streaming (Icecast, Shoutcast, Azuracast, etc.)
  //   Formatos soportados: MP3 stream, AAC, HLS (.m3u8)
  STREAM_URL: "https://TU_STREAM_AQUI/stream",

  // ── SEO / Meta ───────────────────────────────────────────────
  META_DESCRIPTION: "Radio Sisid Ecuador — La voz del pueblo cañari. Desde Minneapolis, Minnesota hacia el mundo.",
  META_KEYWORDS: "radio, ecuador, cañari, en vivo, streaming, minneapolis, minnesota, radio online",
  OG_IMAGE_URL: "/og-image.jpg",
} as const;

export type AppConfig = typeof APP_CONFIG;
