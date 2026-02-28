/**
 * config/musica.config.ts
 * ──────────────────────────────────────────────────────────────
 * Lista de tracks/mixes de música local.
 *
 * ► CÓMO AGREGAR MÚSICA:
 *   1. Copia tus archivos MP3 a la carpeta  public/musica/
 *   2. Agrega una entrada aquí con el título y nombre del archivo
 *
 * ► Los archivos deben estar en  public/musica/
 *   y el campo `file` debe coincidir con el nombre exacto.
 */

export interface MusicTrack {
  /** Título que se muestra en el reproductor */
  title: string;
  /** Nombre del archivo dentro de public/musica/ */
  file: string;
  /** Artista o descripción (opcional) */
  artist?: string;
}

/**
 * ═══════════════════════════════════════════
 *  EDITA ESTA LISTA CON TUS CANCIONES
 * ═══════════════════════════════════════════
 *
 * Ejemplo:
 *   { title: "Cumbias Mix",  file: "cumbias-mix.mp3",  artist: "DJ Radio Sisid" },
 *   { title: "Nacional Mix",  file: "nacional.mp3",     artist: "Radio Sisid" },
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  // ─── Agrega tus tracks aquí ──────────────────────────────
  { title: "Radio Sisid Ecuador - Comparte para sus seguidores 2026", file: "Radio Sisid Ecuador la comparte para sus seguidores 2026.mp3", artist: "Radio Sisid Ecuador" },
  { title: "Sueñomix", file: "Sueño Kañary Mix 2016 Solo lo mejor.mp3", artist: "Radio Sisid Ecuador" },
  { title: "Gigantes del Ecuador - Mix de Oro (Puro Sentimiento)", file: "Radio Sisid Ecuador 🇪🇨 GIGANTES DEL ECUADOR_ Mix de Oro (Puro Sentimiento) 💔🍺2026 [zkccNtAX0A4].mp3", artist: "Radio Sisid Ecuador" },
];

/** Facebook Page ID para el embed de video en vivo */
export const FACEBOOK_PAGE_ID = "100067331525448";

/** URL de la página de Facebook para el Page Plugin */
export const FACEBOOK_PAGE_URL = `https://www.facebook.com/profile.php?id=${FACEBOOK_PAGE_ID}`;
