/**
 * constants/routes.ts
 * ──────────────────────────────────────────────────────────────
 * IDs de secciones y rutas de la aplicación.
 *
 * Cuando integres React Router, añade aquí las rutas reales.
 * Los componentes que hacen scroll o navegan deben leer desde aquí,
 * nunca hardcodear strings de ID.
 */

// ── Secciones SPA (single page, scroll) ───────────────────────

export const SECTION_IDS = {
  GALERIA: "galeria",
  INICIO: "inicio",
  ESCUCHANOS: "escuchanos", // Mantener por compatibilidad si se usa en algún scroll manual
  CONTACTO: "contacto",
  FACEBOOK: "facebook",
  NUESTRA_APP: "nuestra_app",
} as const;

export type SectionId = typeof SECTION_IDS[keyof typeof SECTION_IDS];

// ── Ítems del menú de navegación ──────────────────────────────

export const NAV_ITEMS: { id: SectionId; label: string; isExternal?: boolean; url?: string }[] = [
  { id: SECTION_IDS.GALERIA, label: "Inicio" },
  { id: SECTION_IDS.INICIO, label: "Escúchanos en Vivo" },
  { id: SECTION_IDS.CONTACTO, label: "Escríbenos" },
  { id: SECTION_IDS.FACEBOOK, label: "Facebook", isExternal: true, url: "https://www.facebook.com/profile.php?id=100067331525448" },
  { id: SECTION_IDS.NUESTRA_APP, label: "Nuestra App" },
];

// ── Rutas futuras (React Router) ──────────────────────────────
// Cuando integres React Router, descomentar y ampliar:
//
// export const ROUTES = {
//   HOME:         "/",
//   SCHEDULE:     "/programacion",
//   NEWS:         "/noticias",
//   NEWS_DETAIL:  (id: number) => `/noticias/${id}`,
//   ADMIN:        "/admin",
//   ADMIN_LOGIN:  "/admin/login",
//   ADMIN_PANEL:  "/admin/panel",
// } as const;
