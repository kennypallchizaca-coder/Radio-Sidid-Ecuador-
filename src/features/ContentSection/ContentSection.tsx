import { PlayIcon, PauseIcon, ValueIcon } from "@radix-ui/react-icons";
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
  // values control height of the graphic bars; larger numbers = taller bars
  const bars = [6, 10, 8, 12, 9, 11, 10, 14, 6, 10, 8, 12, 9, 11, 10, 14];

  return (
    <section aria-label="Audio y video" className="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto grid max-w-[1180px] grid-cols-2 grid-rows-[120px_220px] gap-3 sm:gap-4 md:grid-rows-[150px_320px]">
        <Panel>
          <div className="flex h-full flex-col rounded-lg border border-[#275be0]/70 bg-gradient-to-b from-[#081a57] to-[#030b28] px-2 py-1">
            <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.1em] text-white/80">
              <span>Left</span>
              <span>Right</span>
            </div>

            <div className="mt-0.5 h-[38px] overflow-hidden sm:h-[50px] md:h-[120px]">
              <div className="grid h-full grid-cols-[repeat(16,minmax(0,1fr))] items-end gap-[2px]">
                {bars.map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className={`rounded-sm ${playerState.isPlaying ? "bg-gradient-to-t from-red-400 via-yellow-300 to-green-400" : "bg-white/25"}`}
                    style={{
                      height: `${height}px`,
                      animation: playerState.isPlaying ? `equalizer 1s cubic-bezier(.25,.1,.25,1) ${index * 0.03}s infinite` : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-white/10 pt-1">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={controls.toggle}
                  disabled={playerState.isLoading}
                  aria-label={playerState.isPlaying ? "Pausar radio" : "Reproducir radio"}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#ff9629]/80 bg-gradient-to-br from-[#f3932c] to-[#cd5710] text-white transition hover:brightness-110 disabled:opacity-60 sm:h-[24px] sm:w-[24px] md:h-[28px] md:w-[28px]"
                >
                  {playerState.isLoading ? (
                    <span className="h-2 w-2 animate-spin rounded-full border border-white border-t-transparent" />
                  ) : playerState.isPlaying ? (
                    <PauseIcon className="h-[9px] w-[9px] sm:h-[10px] sm:w-[10px]" />
                  ) : (
                    <PlayIcon className="h-[9px] w-[9px] translate-x-[1px] sm:h-[10px] sm:w-[10px]" />
                  )}
                </button>

                <div className="min-w-0 flex-1 text-center">
                  <p className="truncate font-display text-[11px] leading-none text-white sm:text-xs md:text-base">{APP_CONFIG.RADIO_NAME}</p>
                  <p className="text-[6px] font-semibold uppercase tracking-[0.09em] text-yellow-300/90 sm:text-[7px]">
                    {playerState.isPlaying ? "En vivo" : "Presiona play"}
                  </p>
                </div>

                <span className="shrink-0 text-[6px] font-semibold uppercase tracking-[0.09em] text-white/50 sm:text-[7px]">00:00</span>
                <div className="flex shrink-0 items-center gap-1">
                  <ValueIcon className="h-3 w-3 text-white/70 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <div className="flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={playerState.volume}
                      onChange={(e) => controls.setVolume(+e.target.value)}
                      aria-label="Volumen"
                      className="radio-volume-slider w-[44px] sm:w-[72px] md:w-[120px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <div className="row-span-2">
          <Panel>
            <div className="relative aspect-[16/10] h-full overflow-hidden rounded-lg border border-white/10 md:aspect-auto">
              <img src="/img/image3.png" alt="Promocion de radio" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04091fd6] via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                <p className="font-display text-xl leading-none text-white sm:text-2xl md:text-4xl">Siempre Contigo</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-yellow-300 sm:text-[10px] md:text-xs">Radio en vivo</p>
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
