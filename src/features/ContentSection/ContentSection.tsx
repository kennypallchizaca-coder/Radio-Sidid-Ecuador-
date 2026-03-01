import { PlayIcon, PauseIcon, SpeakerLoudIcon, SpeakerOffIcon } from "@radix-ui/react-icons";
import { useState, type ReactNode } from "react";
import { APP_CONFIG } from "@/config";
import { useAudio } from "@/context";

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <article className={`h-full overflow-hidden rounded-xl border border-[#123da8]/75 bg-[#020718] p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.35)] ${className}`}>
      {children}
    </article>
  );
}

export default function ContentSection() {
  const { playerState, controls } = useAudio();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const bars = [4, 8, 6, 12, 7, 14, 9, 16, 5, 11, 8, 13, 6, 15, 10, 12, 7, 14, 9, 11, 6, 13, 8, 10];

  return (
    <section aria-label="Audio y video" className="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 grid-rows-[200px_280px_220px] gap-3 sm:grid-cols-2 sm:grid-rows-[200px_280px] sm:gap-4 lg:grid-rows-[240px_400px]">
        {/* ── Player Panel ── */}
        <Panel>
          <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-[#1e3fa8]/60 bg-gradient-to-b from-[#0a1d5e] via-[#060f38] to-[#020820]">
            {/* Ambient glow */}
            <div className={`pointer-events-none absolute -top-8 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-700 ${playerState.isPlaying ? "bg-[#f3932c]/30 opacity-100" : "opacity-0"}`} />

            {/* ── Equalizer ── */}
            <div className="relative flex flex-1 items-end justify-center px-3 pb-1 pt-2 sm:px-4 lg:px-5">
              <div className="grid h-full w-full grid-cols-[repeat(24,minmax(0,1fr))] items-end gap-[3px] sm:gap-1">
                {bars.map((height, index) => (
                  <span
                    key={`bar-${index}`}
                    className={`rounded-t-sm transition-colors duration-300 ${
                      playerState.isPlaying
                        ? "player-bar-active"
                        : "bg-white/10"
                    }`}
                    style={{
                      height: playerState.isPlaying ? undefined : `${height}px`,
                      animation: playerState.isPlaying
                        ? `equalizer ${0.8 + (index % 5) * 0.15}s cubic-bezier(.25,.1,.25,1) ${index * 0.04}s infinite`
                        : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── Controls bar ── */}
            <div className="relative z-10 border-t border-white/[0.07] bg-black/30 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-2.5 lg:px-5 lg:py-3">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Play / Pause button */}
                <button
                  type="button"
                  onClick={controls.toggle}
                  disabled={playerState.isLoading}
                  aria-label={playerState.isPlaying ? "Pausar radio" : "Reproducir radio"}
                  className={`group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 sm:h-11 sm:w-11 lg:h-12 lg:w-12 ${
                    playerState.isPlaying
                      ? "border-[#f3932c] bg-gradient-to-br from-[#f3932c] to-[#cd5710] shadow-[0_0_18px_rgba(243,147,44,0.45)]"
                      : "border-white/30 bg-white/10 hover:border-[#f3932c]/70 hover:bg-[#f3932c]/20"
                  }`}
                >
                  {playerState.isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : playerState.isPlaying ? (
                    <PauseIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px] lg:h-5 lg:w-5" />
                  ) : (
                    <PlayIcon className="h-4 w-4 translate-x-[1px] sm:h-[18px] sm:w-[18px] lg:h-5 lg:w-5" />
                  )}
                </button>

                {/* Status indicator */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {playerState.isPlaying && (
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                      </span>
                    )}
                    <p className={`text-xs font-semibold uppercase tracking-[0.12em] sm:text-sm lg:text-base ${
                      playerState.isPlaying ? "text-red-400" : "text-white/40"
                    }`}>
                      {playerState.isPlaying ? "En vivo" : playerState.isLoading ? "Conectando..." : "Presiona play"}
                    </p>
                  </div>
                </div>

                {/* Volume control */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={controls.toggleMute}
                    aria-label={playerState.isMuted ? "Activar sonido" : "Silenciar"}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 lg:h-8 lg:w-8"
                  >
                    {playerState.isMuted || playerState.volume === 0 ? (
                      <SpeakerOffIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    ) : (
                      <SpeakerLoudIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={playerState.isMuted ? 0 : playerState.volume}
                    onChange={(e) => controls.setVolume(+e.target.value)}
                    aria-label="Volumen"
                    className="radio-volume-slider w-[50px] sm:w-[72px] lg:w-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <div className="sm:row-span-2">
          <Panel>
            <div className="relative aspect-[16/10] h-full overflow-hidden rounded-lg border border-white/10 md:aspect-auto">
              <img src="/img/image3.png" alt="Promocion de radio" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04091fd6] via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                <p className="font-display text-xl leading-none text-white sm:text-2xl lg:text-4xl">Siempre Contigo</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-yellow-300 sm:text-[10px] lg:text-xs">Radio en vivo</p>
              </div>
            </div>
          </Panel>
        </div>

        <Panel className="!p-1.5">
          {APP_CONFIG.VIDEO_EMBED_URL ? (
            <div className="relative aspect-[16/10] h-full w-full overflow-hidden rounded-lg border border-white/10 bg-black md:aspect-auto">
              <iframe
                src={APP_CONFIG.VIDEO_EMBED_URL}
                title="Video en vivo"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                className="absolute inset-0 h-full w-full bg-black"
                style={{
                  backgroundColor: "#000",
                  touchAction: "pan-y",
                  overscrollBehavior: "contain",
                }}
                onLoad={() => {
                  window.setTimeout(() => setVideoLoaded(true), 800);
                }}
                loading="lazy"
              />
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-500 ${
                  videoLoaded ? "opacity-20" : "opacity-100"
                }`}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-white/10 bg-black">
              <button
                type="button"
                onClick={controls.toggle}
                aria-label="Reproducir"
                className="flex h-11 w-16 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white"
              >
                <PlayIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </Panel>

      </div>
    </section>
  );
}
