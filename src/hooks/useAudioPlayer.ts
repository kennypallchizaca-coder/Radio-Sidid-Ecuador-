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

  // Convertimos a segundos y aplicamos el offset de 20 segundos solicitado por el usuario
  const startOffsetSeconds = 20;

  return {
    trackIndex: Math.min(currentTrackIndex, MUSIC_TRACKS.length - 1), // safety boundary
    progressTimeSeconds: (currentTimeMsInTrack / 1000) + startOffsetSeconds
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
    // Propiedades vitales en móvil para evitar retrasos y pantallas completas (iOS)
    a.setAttribute("playsinline", "true");
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
          // Acá es seguro pedir un nuevo frame para no lidiar con latencia del evento anterior
          const freshState = getSimulatedPlaybackState();
          if (a.duration && a.duration > freshState.progressTimeSeconds) {
            a.currentTime = freshState.progressTimeSeconds;
          } else if (a.duration) {
            a.currentTime = freshState.progressTimeSeconds % a.duration;
          }
          setStatus("loading");
          safePlay(a);
          a.removeEventListener("loadedmetadata", applySeek);
        };
        a.addEventListener("loadedmetadata", applySeek);
        a.load();
      }
    }
  }, [mode, safePlay, setStatus, setTrackIndex]);

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

          // El usuario desea que las canciones empiecen en el segundo 20
          const startOffset = 20;

          const onMetadata = () => {
            if (a.duration && a.duration > startOffset) {
              a.currentTime = startOffset;
            } else {
              a.currentTime = 0;
            }
            safePlay(a);
            a.removeEventListener("loadedmetadata", onMetadata);
          };

          a.addEventListener("loadedmetadata", onMetadata);
          a.load();
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
        // En celular, a veces ni siquiera se ha cargado metadata (porque preload="none"). 
        // Primero forzamos la pista correcta:
        const initialSimulatedState = getSimulatedPlaybackState();
        setTrackIndex(initialSimulatedState.trackIndex);

        const track = MUSIC_TRACKS[initialSimulatedState.trackIndex];
        if (track) {
          const expectedSrc = `/musica/${encodeURIComponent(track.file)}`;

          if (!a.src.includes(encodeURIComponent(track.file))) {
            a.src = expectedSrc;
          }

          if (a.readyState >= 1) { // Escritorio: usualmente ya tiene info
            // Ojo: volvemos a calcular el estado JUSTO AQUÍ, en lugar del tomado al clickear
            const freshState = getSimulatedPlaybackState();
            if (a.duration && a.duration > freshState.progressTimeSeconds) {
              a.currentTime = freshState.progressTimeSeconds;
            } else if (a.duration) {
              a.currentTime = freshState.progressTimeSeconds % a.duration;
            }
            setStatus("loading");
            safePlay(a);
          } else {
            // Móvil: va a tener que descargar un trocito de la pista por el internet para empezar
            const applySeek = () => {
              // ESTO ES LO CRÍTICO: Recalculamos el tiempo AHORA QUE YA DESCARGÓ (pudo tardar 2 seg)
              const lazyState = getSimulatedPlaybackState();
              if (a.duration && a.duration > lazyState.progressTimeSeconds) {
                a.currentTime = lazyState.progressTimeSeconds;
              } else if (a.duration) {
                a.currentTime = lazyState.progressTimeSeconds % a.duration;
              }
              setStatus("loading");
              safePlay(a);
              a.removeEventListener("loadedmetadata", applySeek);
            };
            a.addEventListener("loadedmetadata", applySeek);
            a.load(); // Forzamos carga
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
  const trackTitle = mode === "music" ? (MUSIC_TRACKS[trackIndex]?.title || APP_CONFIG.RADIO_NAME) : APP_CONFIG.RADIO_NAME;
  const trackArtist = mode === "music" ? (MUSIC_TRACKS[trackIndex]?.artist || "Radio Sisid") : "TRANSMISIÓN EN VIVO";

  // ─── Media Session API (Para Móvil/Escritorio) ─────────────
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    try {
      // Configuramos Metadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: trackTitle,
        artist: trackArtist,
        album: APP_CONFIG.SLOGAN,
        artwork: [
          { src: APP_CONFIG.LOGO_URL || "/logoradio.jpg", sizes: "512x512", type: "image/jpeg" },
          { src: APP_CONFIG.LOGO_URL || "/logoradio.jpg", sizes: "192x192", type: "image/jpeg" },
        ],
      });

      // Estado de reproducción
      navigator.mediaSession.playbackState = (status === "playing" || status === "loading") ? "playing" : "paused";

      // Manejadores de control (Lock Screen / Notificaciones)
      navigator.mediaSession.setActionHandler("play", () => toggle());
      navigator.mediaSession.setActionHandler("pause", () => toggle());

      // Si es radio en vivo, quitamos los botones de adelante/atrás para reforzar que es Live
      if (mode === "live") {
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      } else {
        // Podríamos mapear siguiente/anterior si quisiéramos en modo música
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      }
    } catch (e) {
      console.error("MediaSession error:", e);
    }

    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      }
    };
  }, [trackTitle, trackArtist, status, mode, toggle]);

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
