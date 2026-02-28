import { useRef, useEffect, useCallback } from "react";
import type { AudioPlayerState, AudioPlayerControls } from "@/hooks";
import { APP_CONFIG } from "@/config";
import { PlayIcon, PauseIcon, SpeakerLoudIcon, SpeakerQuietIcon } from "@radix-ui/react-icons";

interface PlayerProps {
  playerState: AudioPlayerState;
  controls: AudioPlayerControls;
}

/* ─────────────────────────────────────────────────────────────────
 * SoundWave — Animated canvas waveform
 * ───────────────────────────────────────────────────────────────── */

const BAR_COUNT = 32;
const BAR_GAP = 2;
const BAR_MIN = 2;
const BAR_RADIUS = 2;
const LERP_UP = 0.12;   // velocidad de subida
const LERP_DOWN = 0.06;   // velocidad de bajada (más lento = más suave)

/** Genera un array de alturas "objetivo" aleatorias simulando frecuencias */
function randomTargets(count: number, maxH: number): Float32Array {
  const t = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // las barras del centro tienden a ser más altas (efecto de campana)
    const center = Math.abs(i - count / 2) / (count / 2);
    const base = 1 - center * 0.55;
    t[i] = (Math.random() * 0.6 + 0.4) * base * maxH;
  }
  return t;
}

interface SoundWaveProps {
  isPlaying: boolean;
  width?: number;
  height?: number;
}

function SoundWave({ isPlaying, width = 160, height = 36 }: SoundWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const currentH = useRef<Float32Array>(new Float32Array(BAR_COUNT));
  const targetH = useRef<Float32Array>(new Float32Array(BAR_COUNT));
  const tickRef = useRef(0);
  const playingRef = useRef(isPlaying);
  const drawRef = useRef<(() => void) | null>(null);

  // mantener ref sincronizada sin re-renderizar
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // ajustar resolución real una sola vez si cambió
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);

    const barW = (w - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT;

    // cada ~6 frames, generar nuevos targets
    tickRef.current++;
    if (tickRef.current % 6 === 0 && playingRef.current) {
      targetH.current = randomTargets(BAR_COUNT, h - 2);
    }

    // si no está reproduciendo, los targets bajan a mínimo
    if (!playingRef.current) {
      for (let i = 0; i < BAR_COUNT; i++) {
        targetH.current[i] = BAR_MIN;
      }
    }

    // gradiente vertical: colores ecuador
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, "rgba(237, 28, 36, 0.9)");   // rojo (ed1c24)
    grad.addColorStop(0.5, "rgba(0, 51, 160, 0.8)");  // azul (0033a0)
    grad.addColorStop(1, "rgba(255, 204, 0, 0.9)");   // amarillo (ffcc00)

    ctx.fillStyle = grad;

    for (let i = 0; i < BAR_COUNT; i++) {
      const target = targetH.current[i];
      const cur = currentH.current[i];
      const lerp = target > cur ? LERP_UP : LERP_DOWN;
      currentH.current[i] = cur + (target - cur) * lerp;

      const barH = Math.max(BAR_MIN, currentH.current[i]);
      const x = i * (barW + BAR_GAP);
      const y = h - barH;

      // barra con esquinas redondeadas
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, BAR_RADIUS);
      ctx.fill();
    }

    // glow sutil sobre las barras más altas cuando reproduce
    if (playingRef.current) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.filter = "blur(4px)";
      for (let i = 0; i < BAR_COUNT; i++) {
        const barH = Math.max(BAR_MIN, currentH.current[i]);
        if (barH > h * 0.45) {
          const x = i * (barW + BAR_GAP);
          const y = h - barH;
          ctx.beginPath();
          ctx.roundRect(x, y, barW, barH, BAR_RADIUS);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(() => drawRef.current?.());
  }, []);

  useEffect(() => {
    drawRef.current = draw;
    rafRef.current = requestAnimationFrame(() => drawRef.current?.());
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="sound-wave-canvas"
      style={{ width, height, display: "block" }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────
 * SoundWaveMini — Versión compacta animada para mobile
 * ───────────────────────────────────────────────────────────────── */
const MINI_BARS = [
  { h: 14, delay: "0s" },
  { h: 20, delay: "0.15s" },
  { h: 12, delay: "0.3s" },
  { h: 18, delay: "0.1s" },
  { h: 10, delay: "0.25s" },
  { h: 16, delay: "0.05s" },
  { h: 13, delay: "0.2s" },
];

function SoundWaveMini({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-5" aria-hidden="true">
      {MINI_BARS.map((bar, i) => (
        <div
          key={i}
          className="w-[2.5px] rounded-full"
          style={{
            height: isPlaying ? `${bar.h}px` : "3px",
            background: isPlaying
              ? "linear-gradient(to top, #ed1c24, #0033a0, #ffcc00)"
              : "rgba(255,255,255,0.15)",
            animation: isPlaying
              ? `wave-bar 0.6s ease-in-out ${bar.delay} infinite alternate`
              : "none",
            transition: "height 0.4s ease, background 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Player principal
 * ───────────────────────────────────────────────────────────────── */

export default function Player({ playerState, controls }: PlayerProps) {
  const { isPlaying, isLoading, isMuted, volume, hasError, errorMessage } = playerState;

  if (hasError) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] sm:w-auto">
        <div className="flex items-center gap-3 bg-red-950/90 border border-red-500/40 backdrop-blur-xl text-red-300 rounded-2xl px-5 py-3 shadow-2xl text-sm font-medium">
          <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
          <span className="truncate">{errorMessage}</span>
          <button
            className="ml-2 shrink-0 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            onClick={controls.toggle}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94vw] sm:w-auto transition-all duration-500 ease-out">

      {/* Glow ambiental bajo el reproductor */}
      {isPlaying && (
        <div
          aria-hidden="true"
          className="absolute -z-10 inset-x-4 -bottom-2 h-8 rounded-full bg-red-600/30 blur-2xl animate-pulse pointer-events-none"
        />
      )}

      <div
        className={[
          "relative flex items-center gap-3 sm:gap-4",
          "bg-black/70 backdrop-blur-2xl",
          "border border-white/10",
          "rounded-2xl sm:rounded-full",
          "px-3 py-2.5 sm:px-5 sm:py-3",
          "shadow-2xl",
          "transition-all duration-500",
          isPlaying ? "border-red-500/30 shadow-red-900/40" : "",
          "min-w-0 sm:min-w-[520px]",
        ].join(" ")}
      >
        {/* ── Botón Play/Pause con anillo giratorio ─────────── */}
        <div className="relative shrink-0">
          {/* Anillo exterior giratorio cuando reproduce */}
          {isPlaying && (
            <div
              className="absolute -inset-1.5 rounded-full pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, transparent 0%, #ffcc00 25%, transparent 50%, #0033a0 75%, transparent 85%, #ed1c24 100%)",
                animation: "spin 3s linear infinite",
                opacity: 0.7,
              }}
            />
          )}
          {/* Ondas de radio expandiéndose en Amarillo, Azul y Rojo (Visibles bajo z-20) */}
          {isPlaying && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              <span className="absolute -inset-2 rounded-full border border-[#ffcc00]/50 animate-[pulse-ring_2s_ease-out_infinite] shadow-[0_0_10px_rgba(255,204,0,0.5)]" />
              <span className="absolute -inset-4 rounded-full border border-[#0033a0]/50 animate-[pulse-ring_2.5s_ease-out_0.4s_infinite] shadow-[0_0_10px_rgba(0,51,160,0.5)]" />
              <span className="absolute -inset-6 rounded-full border border-[#ed1c24]/50 animate-[pulse-ring_3s_ease-out_0.8s_infinite] shadow-[0_0_10px_rgba(237,28,36,0.5)]" />
            </div>
          )}          {/* Etiqueta central del disco (Logo Siempre Visible e Interactivo) */}
          <div className={`absolute inset-[15%] rounded-full bg-gradient-to-tr from-yellow-300 via-blue-400 to-red-400 p-[2px] z-30 shadow-[0_4px_10px_rgba(0,0,0,0.5)] pointer-events-none transition-transform duration-500 ${isPlaying ? 'animate-[spin_4s_linear_infinite] scale-100' : 'scale-90 opacity-90'}`}>
            <div className="w-full h-full rounded-full bg-[#111] overflow-hidden flex items-center justify-center relative shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
              <img
                src={APP_CONFIG.LOGO_URL || "/logoradio.jpg"}
                alt="Logo Radio center"
                className="w-full h-full object-cover scale-110 opacity-100"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 pointer-events-none" />
            </div>
          </div>
          <button
            aria-label={isPlaying ? "Pausar radio" : "Reproducir radio"}
            onClick={controls.toggle}
            disabled={isLoading}
            className={[
              "relative flex items-center justify-center z-40 overflow-hidden",
              "w-12 h-12 sm:w-14 sm:h-14 rounded-full",
              "font-bold text-white",
              "transition-all duration-300 active:scale-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500",
              isLoading
                ? "bg-black/50 cursor-not-allowed border border-white/20"
                : isPlaying
                  ? "bg-transparent hover:bg-black/20"
                  : "bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/10",
            ].join(" ")}
          >
            {isLoading ? (
              <span className="loading loading-spinner text-white loading-sm drop-shadow-lg" />
            ) : isPlaying ? (
              <PauseIcon className="w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            ) : (
              <PlayIcon className="w-6 h-6 ml-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            )}
          </button>
        </div>

        {/* ── Info + mini wave (mobile) ───────────────────────── */}
        <div className="flex flex-col min-w-0 flex-1 px-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white tracking-tight leading-tight truncate">
              {APP_CONFIG.RADIO_NAME}
            </span>
            {/* Mini wave para mobile */}
            <div className="flex sm:hidden">
              <SoundWaveMini isPlaying={isPlaying} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isPlaying ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                  TRANSMISIÓN EN VIVO
                </span>
              </>
            ) : (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/20" />
                </span>
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Pulsa para escuchar</span>
              </>
            )}
          </div>
        </div>

        {/* ── Ondas de sonido (canvas, desktop) ──────────────── */}
        <div className="hidden sm:flex shrink-0 items-center wave-tricolor">
          <SoundWave isPlaying={isPlaying} width={140} height={32} />
        </div>

        {/* ── Control de volumen (desktop) ────────────────────── */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 pl-1 z-50">
          <button
            aria-label={isMuted || volume === 0 ? "Activar sonido" : "Silenciar"}
            onClick={controls.toggleMute}
            className="relative z-50 flex items-center justify-center w-7 h-7 rounded-full text-white hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {isMuted || volume === 0
              ? <SpeakerQuietIcon className="w-4 h-4" />
              : <SpeakerLoudIcon className="w-4 h-4" />}
          </button>

          <input
            type="range"
            aria-label="Volumen"
            min={0}
            max={1}
            step={0.02}
            value={isMuted ? 0 : volume}
            onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
            className="w-20 relative z-50 cursor-pointer appearance-none bg-transparent outline-none
      [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full
      [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-yellow-400 [&::-webkit-slider-runnable-track]:via-blue-500 [&::-webkit-slider-runnable-track]:to-red-500
      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
      hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
          />
        </div>

      </div>
    </div>
  );
}

