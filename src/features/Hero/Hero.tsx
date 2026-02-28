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
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500">
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

        {/* ── CTA principal: disco de vinilo y ondas ────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
          className="relative flex flex-col items-center gap-6 mt-6"
        >
          {/* Contenedor del disco con ondas */}
          <div className="relative flex items-center justify-center group">
            {/* ── Ondas multicolores que pulsan hacia afuera ── */}
            {isPlaying && (
              <>
                {/* Onda 1 — Amarillo */}
                <span
                  aria-hidden="true"
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: "100%", height: "100%",
                    border: "3px solid #ffcc00",
                    boxShadow: "0 0 20px #ffcc00, inset 0 0 20px #ffcc00",
                    animation: "hero-wave 2.5s cubic-bezier(0.4,0,0.2,1) infinite",
                  }}
                />
                {/* Onda 2 — Azul */}
                <span
                  aria-hidden="true"
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: "100%", height: "100%",
                    border: "3px solid #0033a0",
                    boxShadow: "0 0 20px #0033a0, inset 0 0 20px #0033a0",
                    animation: "hero-wave 2.5s cubic-bezier(0.4,0,0.2,1) 0.6s infinite",
                  }}
                />
                {/* Onda 3 — Rojo */}
                <span
                  aria-hidden="true"
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: "100%", height: "100%",
                    border: "3px solid #ed1c24",
                    boxShadow: "0 0 20px #ed1c24, inset 0 0 20px #ed1c24",
                    animation: "hero-wave 2.5s cubic-bezier(0.4,0,0.2,1) 1.2s infinite",
                  }}
                />
                {/* Onda 4 — Combinada (amarillo) */}
                <span
                  aria-hidden="true"
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: "100%", height: "100%",
                    border: "3px solid #ffcc00",
                    boxShadow: "0 0 20px #ffcc00, inset 0 0 20px #ffcc00",
                    animation: "hero-wave 2.5s cubic-bezier(0.4,0,0.2,1) 1.8s infinite",
                  }}
                />
              </>
            )}

            {/* ── Botón en forma de disco de vinilo ──────────────── */}
            <button
              onClick={controls.toggle}
              disabled={isLoading}
              aria-label={isPlaying ? "Pausar radio" : "Reproducir radio en vivo"}
              className={[
                "relative flex items-center justify-center w-36 h-36 sm:w-48 sm:h-48 rounded-full",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:ring-[#ffcc00]",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                !isPlaying ? "hover:scale-105 transition-transform duration-300" : ""
              ].join(" ")}
            >
              {/* Background Glow */}
              {isPlaying && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-[#ffcc00] via-[#0033a0] to-[#ed1c24] blur-2xl opacity-40 animate-pulse"
                />
              )}

              {/* Disco Vinyl (Rota) */}
              <div
                className={[
                  "absolute inset-0 rounded-full shadow-2xl overflow-hidden bg-black",
                  "border-[4px] sm:border-[6px] border-[#1a1a1a]",
                  isPlaying ? "animate-[spin_3s_linear_infinite]" : ""
                ].join(" ")}
                style={{
                  background: "radial-gradient(circle, #2a2a2a 0%, #0a0a0a 100%)"
                }}
              >
                {/* Mezcla difusa de colores en el fondo del vinilo */}
                <div className="absolute inset-0 opacity-20 mix-blend-color"
                  style={{ background: "conic-gradient(from 0deg, #ffcc00, #0033a0, #ed1c24, #ffcc00)" }}
                />

                {/* Surcos del vinilo (Grooves) */}
                <div className="absolute inset-2 sm:inset-3 rounded-full border border-white/5" />
                <div className="absolute inset-4 sm:inset-6 rounded-full border border-white/10" />
                <div className="absolute inset-8 sm:inset-10 rounded-full border border-white/5" />
                <div className="absolute inset-12 sm:inset-14 rounded-full border border-white/10" />

                {/* Reflejos de luz */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent origin-center rotate-45" />
                <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-transparent origin-center -rotate-45" />

                {/* Etiqueta central colorida (Logo) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center overflow-hidden border border-[#222] bg-[#111] shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] z-10">
                  <img src={APP_CONFIG.LOGO_URL || "/logoradio.jpg"} alt="Logo Radio center" className="w-full h-full object-cover scale-110 opacity-90" />
                  <div className="absolute w-[15%] h-[15%] rounded-full bg-black/80 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] z-20 border border-white/10" />
                </div>
              </div>

              {/* Overlay de Interacción (Iconos estáticos sin rotar) */}
              <div className={`absolute inset-0 z-10 flex items-center justify-center rounded-full transition-all duration-300 ${(isPlaying && !isLoading)
                ? "bg-black/0 hover:bg-black/40 backdrop-blur-none hover:backdrop-blur-sm opacity-0 hover:opacity-100"
                : "bg-black/40 backdrop-blur-[2px] opacity-100"
                }`}>
                {isLoading ? (
                  <span className="loading loading-spinner loading-lg text-white" />
                ) : isPlaying ? (
                  <PauseIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white drop-shadow-2xl" />
                ) : (
                  <PlayIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white translate-x-1 sm:translate-x-1.5 drop-shadow-2xl" />
                )}
              </div>
            </button>
          </div>

          <p className="text-xs sm:text-sm font-bold text-base-content/50 uppercase tracking-[0.2em] mt-4">
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


