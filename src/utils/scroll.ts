/**
 * utils/scroll.ts — Scroll suave a sección por ID.
 */
const HEADER_OFFSET = 88;

export function scrollToSection(id: string, offset = HEADER_OFFSET): void {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}
