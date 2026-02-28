import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { APP_CONFIG } from "@/config";
import { MUSIC_TRACKS } from "@/config/musica.config";

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";
export type PlayerMode = "live" | "music";

export interface AudioPlayerState {
  status: PlayerStatus;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  volume: number;
  isMuted: boolean;
  mode: PlayerMode;
  trackTitle: string;
  trackArtist: string;
}

export interface AudioPlayerControls {
  toggle: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
}

const POLL_INTERVAL = 30_000;

// ─── Lógica de simulación de "Radio" ─────────────────────────
// Definimos una "programación" fija basada en duraciones estimadas
// Si la primera canción dura unos ~60 mins y la segunda X mins, el bucle total dura Y.
// Para propósitos de este demo "sin interrupciones", asumiremos un ciclo de 2 horas.
const CYCLE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas de ciclo continuo

function getSimulatedPlaybackState() {
  const now = Date.now();
  // Posición del milisegundo dentro de nuestro ciclo infinito de X horas
  const cycleTimeMs = now % CYCLE_DURATION_MS;

  // Calculamos en qué punto de nuestra "playlist virtual" estamos.
  // Como no tenemos duraciones exactas le daremos a todas las canciones una misma tajada hipotética del pastel
  // o asumimos duraciones fijas.
  const timePerTrackMs = CYCLE_DURATION_MS / Math.max(1, MUSIC_TRACKS.length);

  const currentTrackIndex = Math.floor(cycleTimeMs / timePerTrackMs);
  const currentTimeMsInTrack = cycleTimeMs % timePerTrackMs;

  // Convertimos a segundos (lo que consume del Audio.currentTime)
  return {
    trackIndex: Math.min(currentTrackIndex, MUSIC_TRACKS.length - 1), // safety boundary
    progressTimeSeconds: currentTimeMsInTrack / 1000
  };
}


/**
 * Hook personalizado para controlar el reproductor de audio.
 *
 * SIMULACIÓN EN VIVO:
 *   - Obtiene el Timestamp actual.
 *   - Usa módulo matemático para "engancharse" a una parte de la canción correspondiente al minuto exacto actual en un bucle cerrado de varias horas, logrando que siempre al darle play entres a una zona de programación que coincidiría con la radio de fondo o la emisora general.
 */
export function useAudioPlayer(): [AudioPlayerState, AudioPlayerControls] {
  // ─── Elemento Audio ─────────────────────────────────────────
  const audio = useMemo(() => {
    const a = new Audio();
    a.preload = "none";
    a.crossOrigin = "anonymous";
    return a;
  }, []);

  const audioRef = useRef(audio);

  // ── Estado ─────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [volume, setVolumeState] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const safePlay = useCallback((a: HTMLAudioElement) => {
    const p = a.play();
    if (p !== undefined) {
      p.catch((err: DOMException) => {
        if (err.name === "AbortError") return;
        if (err.name === "NotAllowedError") {
          setStatus("idle");
          return;
        }
        setStatus("error");
      });
    }
  }, []);

  const [mode, setMode] = useState<PlayerMode>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("live") === "true") return "live";
    if (params.get("live") === "false") return "music";
    return "music";
  });

  // Inicializamos con simulación actual
  const [trackIndex, setTrackIndex] = useState(() => getSimulatedPlaybackState().trackIndex);

  // Refs
  const modeRef = useRef(mode);
  const trackIndexRef = useRef(trackIndex);
  const statusRef = useRef(status);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { trackIndexRef.current = trackIndex; }, [trackIndex]);
  useEffect(() => { statusRef.current = status; }, [status]);

  // ─── Polling de live status ─────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("live") === "true" || params.get("live") === "false") {
      return;
    }

    let mounted = true;

    const checkLive = async () => {
      try {
        const res = await fetch("/live-status.json", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const newMode: PlayerMode = data.live ? "live" : "music";
          if (mounted) setMode(newMode);
        }
      } catch {
        if (mounted) setMode("music");
      }
    };

    checkLive();
    const interval = setInterval(checkLive, POLL_INTERVAL);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // ─── Cambio entre Live / Local ─────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    const wasPlaying = statusRef.current === "playing" || statusRef.current === "loading";

    if (!wasPlaying) return;

    if (mode === "live") {
      a.src = APP_CONFIG.STREAM_URL;
      setStatus("loading");
      safePlay(a);
    } else {
      const simulatedState = getSimulatedPlaybackState();
      setTrackIndex(simulatedState.trackIndex);

      const track = MUSIC_TRACKS[simulatedState.trackIndex];
      if (track) {
        a.src = `/musica/${encodeURIComponent(track.file)}`;

        const applySeek = () => {
          // Si pasamos la duracion el audio terminará, validamos.
          if (a.duration && a.duration > simulatedState.progressTimeSeconds) {
            a.currentTime = simulatedState.progressTimeSeconds;
          } else if (a.duration) {
            // Si el cálculo dió más segundos de los que tiene la canción,
            // hacemos un módulo interno con la duracion de la canción.
            a.currentTime = simulatedState.progressTimeSeconds % a.duration;
          }
          setStatus("loading");
          safePlay(a);
          a.removeEventListener("loadedmetadata", applySeek);
        };
        a.addEventListener("loadedmetadata", applySeek);
        a.load();
      }
    }
  }, [mode, safePlay]);

  // ─── Sincronizar volumen ────────────────────────────────────
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, audioRef]);

  // ─── Event listeners ───────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;

    const handleWaiting = () => setStatus("loading");
    const handlePlaying = () => setStatus("playing");
    const handlePause = () => setStatus("paused");

    const handleError = () => {
      if (modeRef.current === "music" && MUSIC_TRACKS.length > 1) {
        setTrackIndex((prev) => (prev < MUSIC_TRACKS.length - 1 ? prev + 1 : 0));
        return;
      }
      setStatus("error");
      a.src = "";
    };

    // Al acabar canción local avanzas secuencialmente de forma real
    const handleEnded = () => {
      if (modeRef.current === "music") {
        const currentIdx = trackIndexRef.current;
        const nextIdx = currentIdx < MUSIC_TRACKS.length - 1 ? currentIdx + 1 : 0;

        setTrackIndex(nextIdx);

        const track = MUSIC_TRACKS[nextIdx];
        if (track) {
          a.src = `/musica/${encodeURIComponent(track.file)}`;
          a.currentTime = 0;
          safePlay(a);
        }
      }
    };

    a.addEventListener("waiting", handleWaiting);
    a.addEventListener("playing", handlePlaying);
    a.addEventListener("pause", handlePause);
    a.addEventListener("error", handleError);
    a.addEventListener("ended", handleEnded);

    return () => {
      a.removeEventListener("waiting", handleWaiting);
      a.removeEventListener("playing", handlePlaying);
      a.removeEventListener("pause", handlePause);
      a.removeEventListener("error", handleError);
      a.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, safePlay]);

  // ─── Toggle play/pause (Sincronización Mágica) ────────────
  const toggle = useCallback(() => {
    const a = audioRef.current;

    if (status === "playing" || status === "loading") {
      a.pause();
      if (modeRef.current === "live") a.src = "";
      setStatus("paused");
    } else {
      if (modeRef.current === "live") {
        a.src = APP_CONFIG.STREAM_URL;
        setStatus("loading");
        safePlay(a);
      } else {
        // Obtenemos la programación virtual JUSTO AL DARLE AL PLAY
        const simulatedState = getSimulatedPlaybackState();
        setTrackIndex(simulatedState.trackIndex);

        const track = MUSIC_TRACKS[simulatedState.trackIndex];
        if (track) {
          const expectedSrc = `/musica/${encodeURIComponent(track.file)}`;

          if (!a.src.includes(encodeURIComponent(track.file))) {
            a.src = expectedSrc;
          }

          // Tratamos de buscar la metadata para ajustar el cabezal de reproduccion antes de emitir sonido
          if (a.readyState >= 1) { // 1 = HAVE_METADATA
            if (a.duration && a.duration > simulatedState.progressTimeSeconds) {
              a.currentTime = simulatedState.progressTimeSeconds;
            } else if (a.duration) {
              a.currentTime = simulatedState.progressTimeSeconds % a.duration;
            }
            setStatus("loading");
            safePlay(a);
          } else {
            // Si el buffer no se ha cargado hay que esperar el loadedmetadata
            const applySeek = () => {
              if (a.duration && a.duration > simulatedState.progressTimeSeconds) {
                a.currentTime = simulatedState.progressTimeSeconds;
              } else if (a.duration) {
                a.currentTime = simulatedState.progressTimeSeconds % a.duration;
              }
              setStatus("loading");
              safePlay(a);
              a.removeEventListener("loadedmetadata", applySeek);
            };
            a.addEventListener("loadedmetadata", applySeek);
            a.load();
          }
        }
      }
    }
  }, [status, audioRef, safePlay]);



  /** Ajusta el volumen (0.0 – 1.0) */
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.min(1, Math.max(0, vol));
    setVolumeState(clamped);
    if (clamped > 0) setIsMuted(false);
  }, []);

  /** Silenciar / desilenciar */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // ─── Info del track constante (Live Radio Mode) ───────────────
  const trackTitle = APP_CONFIG.RADIO_NAME;
  const trackArtist = "TRANSMISIÓN EN VIVO";

  const state: AudioPlayerState = {
    status,
    isPlaying: status === "playing",
    isLoading: status === "loading",
    hasError: status === "error",
    errorMessage: mode === "live"
      ? "La radio está fuera del aire. Intenta más tarde."
      : "No se pudo reproducir la música. Intenta de nuevo.",
    volume,
    isMuted,
    mode,
    trackTitle,
    trackArtist,
  };

  return [state, { toggle, setVolume, toggleMute }];
}
