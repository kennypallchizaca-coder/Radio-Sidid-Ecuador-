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
    // 'metadata' permite cargar info inicial rapido sin descargar todo el stream.
    // Evita el retraso de "CONECTANDO..." eterno.
    a.preload = "metadata";

    // IMPORTANTE: Quitar crossOrigin="anonymous". 
    // Los servidores de streaming de radio rara vez soportan CORS.
    // Dejarlo activado causa que el stream se bloquee en producción.
    // a.crossOrigin = "anonymous"; 

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

    const handleSeeking = () => {
      if (modeRef.current === "music") {
        const freshState = getSimulatedPlaybackState();
        if (Math.abs(a.currentTime - freshState.progressTimeSeconds) > 2) {
          a.currentTime = freshState.progressTimeSeconds;
        }
      }
    };

    // ── Optimización de Latencia (Sincronización en Vivo) ──
    const handleProgress = () => {
      if (modeRef.current === "live" && a.buffered.length > 0) {
        const lastBuffered = a.buffered.end(a.buffered.length - 1);
        const delay = lastBuffered - a.currentTime;

        // Si el delay respecto al "borde en vivo" es mayor a 3 segundos, saltamos al final
        if (delay > 3) {
          // console.log("Catching up to live edge...", delay);
          a.currentTime = lastBuffered - 0.5; // Dejamos medio segundo de margen
        }
      }
    };

    // Recuperación de "stalled" (cuando el buffer se vacía en móvil/WhatsApp)
    let stallTimeout: any = null;
    const handleStalled = () => {
      // Si el stream se detiene por red móvil, esperamos 2 seg y reiniciamos
      if (statusRef.current === "playing") {
        // console.warn("Stream stalled, waiting for recovery...");
        if (stallTimeout) clearTimeout(stallTimeout);
        stallTimeout = setTimeout(() => {
          if (a.paused === false && modeRef.current === "live") {
            // console.log("Force reconnecting live stream due to stall");
            a.src = APP_CONFIG.STREAM_URL;
            a.load();
            safePlay(a);
          }
        }, 2500);
      }
    };

    const handleSuspend = () => {
      if (stallTimeout) clearTimeout(stallTimeout);
    };

    a.addEventListener("waiting", handleWaiting);
    a.addEventListener("playing", handlePlaying);
    a.addEventListener("pause", handlePause);
    a.addEventListener("error", handleError);
    a.addEventListener("ended", handleEnded);
    a.addEventListener("seeking", handleSeeking);
    a.addEventListener("progress", handleProgress);
    a.addEventListener("stalled", handleStalled);
    a.addEventListener("suspend", handleSuspend);

    return () => {
      if (stallTimeout) clearTimeout(stallTimeout);
      a.removeEventListener("waiting", handleWaiting);
      a.removeEventListener("playing", handlePlaying);
      a.removeEventListener("pause", handlePause);
      a.removeEventListener("error", handleError);
      a.removeEventListener("ended", handleEnded);
      a.removeEventListener("seeking", handleSeeking);
      a.removeEventListener("progress", handleProgress);
      a.removeEventListener("stalled", handleStalled);
      a.removeEventListener("suspend", handleSuspend);
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
        a.load(); // Fuerza al navegador a abrir la nueva conexión
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

  // ─── Info del track constante (Live Radio Look) ───────────────
  const trackTitle = APP_CONFIG.RADIO_NAME;
  const trackArtist = "TRANSMISIÓN EN VIVO";

  // ─── Media Session API (Para Móvil/Escritorio) ─────────────
  const updateMediaSession = useCallback(() => {
    if (!("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: trackTitle,
        artist: trackArtist,
        album: APP_CONFIG.SLOGAN,
        artwork: [
          { src: APP_CONFIG.LOGO_URL || "/logoradio.jpg", sizes: "512x512", type: "image/jpeg" },
          { src: APP_CONFIG.LOGO_URL || "/logoradio.jpg", sizes: "192x192", type: "image/jpeg" },
        ],
      });

      navigator.mediaSession.playbackState = (status === "playing" || status === "loading") ? "playing" : "paused";

      // Forzar el look "Live" eliminando reportes de posición y duración
      if ("setPositionState" in navigator.mediaSession) {
        try {
          // @ts-ignore
          navigator.mediaSession.setPositionState({
            duration: Infinity,
            playbackRate: 1,
            position: 0
          });
        } catch (e) {
          try {
            // @ts-ignore fallback para algunos Androids
            navigator.mediaSession.setPositionState(null);
          } catch (e2) { }
        }
      }

      navigator.mediaSession.setActionHandler("play", () => toggle());
      navigator.mediaSession.setActionHandler("pause", () => toggle());

      // Deshabilitar navegación y búsqueda completamente en la notificación
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("seekto", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);

    } catch (e) {
      console.error("MediaSession error:", e);
    }
  }, [trackTitle, trackArtist, status, toggle]);

  useEffect(() => {
    updateMediaSession();

    // Título estático para la pestaña (siempre el nombre de la radio)
    document.title = `${APP_CONFIG.RADIO_NAME} — ${APP_CONFIG.SLOGAN}`;

    const a = audioRef.current;
    const handleEvents = () => updateMediaSession();

    a.addEventListener("playing", handleEvents);
    a.addEventListener("durationchange", handleEvents);

    return () => {
      a.removeEventListener("playing", handleEvents);
      a.removeEventListener("durationchange", handleEvents);
    };
  }, [updateMediaSession, audioRef]);

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
