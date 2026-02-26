import { APP_CONFIG } from "@/config";
import type { AudioPlayerState, AudioPlayerControls } from "@/hooks";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import { scrollToSection } from "@/utils/scroll";
import { motion } from "framer-motion";

interface HeroProps {
  playerState: AudioPlayerState;
  controls: AudioPlayerControls;
}

export default function Hero({ playerState, controls }: HeroProps) {
  const { isPlaying, isLoading } = playerState;

  return (
    <section
      id="inicio"
      aria-label="Bienvenida a Radio Sisid Ecuador"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
    >
      {/* ── Fondos decorativos ───────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Mancha superior derecha */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-red-600/12 blur-[130px]" />
        {/* Mancha izquierda media */}
        <div className="absolute top-1/3 -left-24 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[100px]" />
        {/* Glow central suave en la parte inferior */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-red-600/6 blur-[100px]" />
        {/* Vignette overlay */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%)" }} />
      </div>

      {/* ── Contenido central ────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-8 flex flex-col items-center text-center gap-6 sm:gap-8">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <span className="section-eyebrow" {...(isPlaying ? { "data-nodot": "" } : {})}>
            {isPlaying ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                Transmitiendo en vivo
              </>
            ) : (
              "Radio online · Minneapolis, MN"
            )}
          </span>
        </motion.div>

        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="font-black leading-[0.95] tracking-tighter text-base-content"
          style={{ fontSize: "clamp(3rem, 10vw, 6.5rem)" }}
        >
          Rompiendo
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-orange-400">
            Fronteras
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="text-base-content/55 font-medium leading-relaxed max-w-xl"
          style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.2rem)" }}
        >
          {APP_CONFIG.SLOGAN}. Desde Minneapolis, Minnesota hacia el mundo.
        </motion.p>

        {/* ── CTA principal: botón play ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
          className="relative flex flex-col items-center gap-4 mt-2"
        >
          {/* Halo de glow cuando está activo */}
          {isPlaying && (
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 rounded-full bg-red-600/30 blur-3xl scale-[2] animate-pulse"
            />
          )}

          {/* Contenedor del botón con ondas */}
          <div className="relative flex items-center justify-center">
            {/* ── Ondas concéntricas que pulsan hacia afuera ── */}
            {isPlaying && (
              <>
                {/* Onda 1 — más cercana, más visible */}
                <span
                  aria-hidden="true"
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: "160%", height: "160%",
                    border: "2px solid rgba(239,68,68,0.35)",
                    animation: "hero-wave 2.4s cubic-bezier(0.4,0,0.2,1) infinite",
                  }}
                />
                {/* Onda 2 */}
                <span
                  aria-hidden="true"
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: "160%", height: "160%",
                    border: "1.5px solid rgba(239,68,68,0.25)",
                    animation: "hero-wave 2.4s cubic-bezier(0.4,0,0.2,1) 0.8s infinite",
                  }}
                />
                {/* Onda 3 — más lejana, más sutil */}
                <span
                  aria-hidden="true"
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: "160%", height: "160%",
                    border: "1px solid rgba(249,115,22,0.18)",
                    animation: "hero-wave 2.4s cubic-bezier(0.4,0,0.2,1) 1.6s infinite",
                  }}
                />
              </>
            )}

            {/* ── Glow suave detrás del botón ──────────────── */}
            {isPlaying && (
              <div
                aria-hidden="true"
                className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(239,68,68,0.25) 0%, transparent 70%)",
                  animation: "pulse 3s ease-in-out infinite",
                }}
              />
            )}

            <button
              onClick={controls.toggle}
              disabled={isLoading}
              aria-label={isPlaying ? "Pausar radio" : "Reproducir radio en vivo"}
              className={[
                "relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center",
                "text-white font-bold transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                isPlaying
                  ? "bg-gradient-to-br from-red-500 to-red-700 shadow-xl shadow-red-700/50"
                  : "bg-gradient-to-br from-red-500 to-red-800 shadow-xl shadow-red-900/40 hover:brightness-110",
              ].join(" ")}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-md" />
              ) : isPlaying ? (
                <PauseIcon className="w-9 h-9 sm:w-10 sm:h-10" />
              ) : (
                <PlayIcon className="w-9 h-9 sm:w-10 sm:h-10 translate-x-0.5" />
              )}
            </button>
          </div>

          <p className="text-xs font-semibold text-base-content/35 uppercase tracking-widest">
            {isLoading ? "Conectando…" : isPlaying ? "Haz clic para pausar" : "Toca para escuchar"}
          </p>
        </motion.div>


        {/* ── Flecha hacia abajo ───────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          onClick={() => scrollToSection("escuchanos")}
          aria-label="Ver más contenido"
          className="mt-4 flex flex-col items-center gap-1.5 text-base-content/25 hover:text-base-content/60 transition-colors animate-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded focus-visible:ring-offset-2"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest">Explorar</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

      </div>
    </section>
  );
}
