/**
 * utils/scroll.ts
 * ──────────────────────────────────────────────────────────────
 * Utilidades de scroll y navegación en la página.
 * Funciones puras — no dependen de React ni del estado de la app.
 */

/** Offset en píxeles para compensar el header fijo */
const HEADER_OFFSET = 80;

/**
 * Hace scroll animado hacia una sección por su ID,
 * compensando la altura del header fijo.
 */
export function scrollToSection(id: string, offset = HEADER_OFFSET): void {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

/**
 * Crea un IntersectionObserver para detectar qué sección
 * está actualmente en el viewport.
 *
 * @param sectionIds  IDs de las secciones a observar
 * @param onActive    Callback invocado con el ID de la sección activa
 * @returns           Función de cleanup para desconectar el observer
 */
export function observeSections(
  sectionIds: string[],
  onActive: (id: string) => void
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) onActive(entry.target.id);
      });
    },
    {
      threshold:  0.3,
      rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`,
    }
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  return () => observer.disconnect();
}

/** Devuelve true si el usuario ha hecho scroll más allá del umbral dado */
export function isScrolledPast(threshold = 20): boolean {
  return window.scrollY > threshold;
}
