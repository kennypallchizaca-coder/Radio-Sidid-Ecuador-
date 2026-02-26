/**
 * hooks/useActiveSection.ts
 * ──────────────────────────────────────────────────────────────
 * Hook que detecta cuál sección está actualmente visible
 * usando IntersectionObserver.
 *
 * Extraído de App.tsx para mantenerlo limpio.
 * Utiliza las utilidades de src/utils/scroll.ts
 */

import { useState, useEffect } from "react";
import { observeSections }     from "../utils/scroll";
import { SECTION_IDS }         from "../constants/routes";

/** IDs de las secciones observadas (en orden de aparición) */
const OBSERVED_SECTIONS = Object.values(SECTION_IDS);

/**
 * Devuelve el ID de la sección que está actualmente en el viewport.
 * Útil para resaltar el ítem activo del menú de navegación.
 *
 * @example
 *   const activeSection = useActiveSection();
 *   // activeSection === "programacion" cuando esa sección es visible
 */
export function useActiveSection(): string {
  const [activeSection, setActiveSection] = useState<string>(
    SECTION_IDS.INICIO
  );

  useEffect(() => {
    const cleanup = observeSections(OBSERVED_SECTIONS, setActiveSection);
    return cleanup;
  }, []);

  return activeSection;
}
