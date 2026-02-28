/**
 * pages/Home/HomePage.tsx — Página principal (SPA de una sola ruta).
 *
 * Secciones: Gallery → Hero → AppPromo → Contact → Footer
 */

import { SECTION_IDS } from "@/constants/routes";
import { useAudio } from "@/context/AudioContext";
import { Hero, Gallery, Contact, AppPromo } from "@/features";
import { Footer } from "@/components/layout";

export default function HomePage() {
  const { playerState, controls } = useAudio();

  return (
    <>
      {/* Sección 1 — Galería (Carrusel de fotos) primero tras Navbar (Nav/Header es estático general) */}
      <Gallery />

      {/* Ancla para "Escúchanos en Vivo" */}
      <div id={SECTION_IDS.ESCUCHANOS} />

      {/* Sección 2 — Hero con botón de play gigante */}
      <Hero playerState={playerState} controls={controls} />

      {/* Sección 3 — Nuestra App (Promocional) */}
      <AppPromo />

      {/* Sección 4 — Contacto y Escríbenos */}
      <Contact />

      {/* Footer */}
      <Footer />
    </>
  );
}
