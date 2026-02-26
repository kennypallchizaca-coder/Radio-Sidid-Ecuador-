/**
 * App.tsx — Componente raíz de Radio Sisid Ecuador
 *
 * Estructura:
 *   Header  (fijo)  — barra de navegación
 *   Hero    (#inicio) — bienvenida + play
 *   Gallery — carrusel de fotos
 *   AppPromo — promoción de la app
 *   Contact (#contacto) — redes sociales
 *   Footer
 *   Player  (fijo)  — reproductor persistente
 */

import { AudioProvider, useAudio } from "@/context/AudioContext";
import { useActiveSection } from "@/hooks/useActiveSection";
import { Header, Player } from "@/components/layout";
import HomePage from "@/pages/Home/HomePage";
import { lazy, Suspense } from "react";

const ThreeBackground = lazy(() => import("@/components/ThreeBackground/ThreeBackground"));

// ── Shell interno (debe estar dentro del AudioProvider) ─────
function AppShell() {
  const activeSection = useActiveSection();
  const { playerState, controls } = useAudio();

  return (
    <div className="flex flex-col min-h-screen relative w-full font-sans antialiased text-base-content">
      {/* Fondo 3D animado — capa más baja (z-0) */}
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      {/* Todo el contenido visible sobre el fondo 3D */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header fijo — muestra el ítem activo del menú */}
        <Header activeSection={activeSection} />

        {/* Página actual */}
        <main id="main-content" className="flex-grow w-full" role="main">
          <HomePage />
        </main>

        {/* Reproductor fijo — siempre montado para no interrumpir el audio */}
        <Player playerState={playerState} controls={controls} />
      </div>
    </div>
  );
}

// ── Raíz con Provider ────────────────────────────────────────
export default function App() {
  return (
    <AudioProvider>
      <AppShell />
    </AudioProvider>
  );
}

