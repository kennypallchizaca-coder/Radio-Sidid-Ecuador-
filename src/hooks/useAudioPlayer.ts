import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { APP_CONFIG } from "@/config";
import { MUSIC_TRACKS } from "@/config/musica.config";

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

/** Modo de reproducción: stream en vivo o playlist local */
export type PlayerMode = "live" | "music";

export interface AudioPlayerState {
  status: PlayerStatus;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  volume: number;
  isMuted: boolean;
  /** Modo actual: "live" = stream real, "music" = playlist local */
  mode: PlayerMode;
  /** Nombre del track actual (o nombre de la radio si es live) */
  trackTitle: string;
  /** Artista del track actual */
  trackArtist: string;
}

export interface AudioPlayerControls {
  toggle: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
}

// ── Intervalo de polling para live-status.json (30 seg) ─────
const POLL_INTERVAL = 30_000;

// ── Claves de sessionStorage para persistir reproducción ─────
const SS_TRACK_INDEX = "radio_trackIndex";
const SS_CURRENT_TIME = "radio_currentTime";
const SS_WAS_PLAYING = "radio_wasPlaying";
const SS_MODE = "radio_mode";

/** Guardar estado de reproducción en sessionStorage */
function savePlaybackState(trackIndex: number, currentTime: number, mode: PlayerMode) {
  try {
    sessionStorage.setItem(SS_TRACK_INDEX, String(trackIndex));
    sessionStorage.setItem(SS_CURRENT_TIME, String(currentTime));
    sessionStorage.setItem(SS_WAS_PLAYING, "true");
    sessionStorage.setItem(SS_MODE, mode);
  } catch { /* quota exceeded, ignore */ }
}

/** Leer estado guardado */
function loadPlaybackState(): { trackIndex: number; currentTime: number; wasPlaying: boolean; mode: PlayerMode } | null {
  try {
    const wasPlaying = sessionStorage.getItem(SS_WAS_PLAYING) === "true";
    if (!wasPlaying) return null;
    const trackIndex = parseInt(sessionStorage.getItem(SS_TRACK_INDEX) ?? "0", 10);
    const currentTime = parseFloat(sessionStorage.getItem(SS_CURRENT_TIME) ?? "0");
    const mode = (sessionStorage.getItem(SS_MODE) as PlayerMode) ?? "music";
    return { trackIndex, currentTime, wasPlaying, mode };
  } catch { return null; }
}

/** Limpiar estado guardado */
function clearPlaybackState() {
  try {
    sessionStorage.removeItem(SS_TRACK_INDEX);
    sessionStorage.removeItem(SS_CURRENT_TIME);
    sessionStorage.removeItem(SS_WAS_PLAYING);
    sessionStorage.removeItem(SS_MODE);
  } catch { /* ignore */ }
}

/**
 * Hook personalizado para controlar el reproductor de audio.
 *
 * COMPORTAMIENTO:
 *   - Consulta /live-status.json cada 30 seg
 *   - Si { "live": true }  → conecta al STREAM_URL real
 *   - Si { "live": false } → reproduce música de public/musica/ en playlist
 *   - El usuario NO nota la diferencia, siempre ve "En vivo"
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

  // ─── Estado ─────────────────────────────────────────────────
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [volume, setVolumeState] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const savedState = useMemo(() => loadPlaybackState(), []);

  const [mode, setMode] = useState<PlayerMode>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("live") === "true") return "live";
    if (params.get("live") === "false") return "music";
    if (savedState) return savedState.mode;
    return "music";
  });
  const [trackIndex, setTrackIndex] = useState(() => savedState?.trackIndex ?? 0);

  // Refs para acceso estable en callbacks
  const modeRef = useRef(mode);
  const trackIndexRef = useRef(trackIndex);
  const statusRef = useRef(status);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { trackIndexRef.current = trackIndex; }, [trackIndex]);
  useEffect(() => { statusRef.current = status; }, [status]);

  // ─── Polling de live status ─────────────────────────────────
  useEffect(() => {
    // Si viene forzado por URL, no hacer polling
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

  // ─── Cuando cambia el modo mientras reproduce → cambiar fuente ──
  useEffect(() => {
    const a = audioRef.current;
    const wasPlaying = statusRef.current === "playing" || statusRef.current === "loading";

    if (!wasPlaying) return; // si no estaba reproduciendo, no hacer nada

    if (mode === "live") {
      // Cambiar al stream real
      a.src = APP_CONFIG.STREAM_URL;
      a.play().catch(() => {/* waiting/error events handle status */});
    } else {
      // Cambiar a música local
      const track = MUSIC_TRACKS[trackIndexRef.current];
      if (track) {
        a.src = `/musica/${encodeURIComponent(track.file)}`;
        a.play().catch(() => {/* waiting/error events handle status */});
      }
    }
  }, [mode]);

  // ─── Sincronizar volumen ────────────────────────────────────
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, audioRef]);

  // ─── Event listeners ───────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;

    const handleWaiting = () => setStatus("loading");
    const handlePlaying = () => setStatus("playing");
    const handlePause   = () => setStatus("paused");
    const handleError   = () => {
      // En modo música, intentar siguiente track en vez de error
      if (modeRef.current === "music" && MUSIC_TRACKS.length > 1) {
        setTrackIndex((prev) =>
          prev < MUSIC_TRACKS.length - 1 ? prev + 1 : 0
        );
        return;
      }
      setStatus("error");
      a.src = "";
    };
    const handleStalled = () => setStatus("loading");
    const handleEnded = () => {
      // Solo en modo música: avanzar al siguiente track
      if (modeRef.current === "music") {
        setTrackIndex((prev) =>
          prev < MUSIC_TRACKS.length - 1 ? prev + 1 : 0
        );
      }
    };

    /** Guardar posición cada 2 segundos mientras reproduce */
    const handleTimeUpdate = () => {
      if (modeRef.current === "music" && a.currentTime > 0) {
        savePlaybackState(trackIndexRef.current, a.currentTime, modeRef.current);
      }
    };

    a.addEventListener("waiting", handleWaiting);
    a.addEventListener("playing", handlePlaying);
    a.addEventListener("pause",   handlePause);
    a.addEventListener("error",   handleError);
    a.addEventListener("stalled", handleStalled);
    a.addEventListener("ended",   handleEnded);
    a.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      a.removeEventListener("waiting", handleWaiting);
      a.removeEventListener("playing", handlePlaying);
      a.removeEventListener("pause",   handlePause);
      a.removeEventListener("error",   handleError);
      a.removeEventListener("stalled", handleStalled);
      a.removeEventListener("ended",   handleEnded);
      a.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef]);

  // ─── Auto-play siguiente track en modo música ──────────────
  useEffect(() => {
    if (modeRef.current !== "music") return;
    const a = audioRef.current;
    const wasPlaying = statusRef.current === "playing" || statusRef.current === "loading";
    const track = MUSIC_TRACKS[trackIndex];
    if (!track || !wasPlaying) return;

    a.src = `/musica/${encodeURIComponent(track.file)}`;
    a.load();
    a.play().catch(() => {/* browser policy */});
  }, [trackIndex]);

  // ─── Restaurar reproducción tras recarga ────────────────────
  useEffect(() => {
    if (!savedState || !savedState.wasPlaying) return;
    const a = audioRef.current;

    if (savedState.mode === "live") {
      // En vivo: reconectar al stream (no hay posición que restaurar)
      a.src = APP_CONFIG.STREAM_URL;
      setStatus("loading");
      a.play().catch(() => setStatus("error"));
    } else {
      // Música: restaurar track y posición exacta
      const track = MUSIC_TRACKS[savedState.trackIndex];
      if (track) {
        a.src = `/musica/${encodeURIComponent(track.file)}`;
        a.load();

        const handleCanPlay = () => {
          a.currentTime = savedState.currentTime;
          setStatus("loading");
          a.play().catch(() => setStatus("error"));
          a.removeEventListener("canplay", handleCanPlay);
        };
        a.addEventListener("canplay", handleCanPlay);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Toggle play/pause ─────────────────────────────────────
  const toggle = useCallback(() => {
    const a = audioRef.current;

    if (status === "playing" || status === "loading") {
      a.pause();
      if (modeRef.current === "live") {
        a.src = ""; // liberar conexión al stream
      }
      clearPlaybackState();
      setStatus("paused");
    } else {
      if (modeRef.current === "live") {
        // Conectar al stream real
        a.src = APP_CONFIG.STREAM_URL;
      } else {
        // Reproducir música local
        const track = MUSIC_TRACKS[trackIndexRef.current];
        if (track) {
          // Solo asignar src si está vacío o es diferente
          const expectedSrc = `/musica/${encodeURIComponent(track.file)}`;
          if (!a.src || !a.src.includes(encodeURIComponent(track.file))) {
            a.src = expectedSrc;
          }
        } else {
          setStatus("error");
          return;
        }
      }
      setStatus("loading");
      const playPromise = a.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setStatus("error"));
      }
    }
  }, [status, audioRef]);

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

  // ─── Info del track actual ─────────────────────────────────
  const currentTrack = MUSIC_TRACKS[trackIndex];
  const trackTitle = mode === "live"
    ? APP_CONFIG.RADIO_NAME
    : (currentTrack?.title ?? APP_CONFIG.RADIO_NAME);
  const trackArtist = mode === "live"
    ? APP_CONFIG.SLOGAN
    : (currentTrack?.artist ?? "Radio Sisid Ecuador");

  // ─── Estado derivado ────────────────────────────────────────
  const state: AudioPlayerState = {
    status,
    isPlaying: status === "playing",
    isLoading: status === "loading",
    hasError:  status === "error",
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
