/**
 * useAudioPlayer — Reproduce un stream en vivo (API pública EC + fallback).
 * Estado y controles expuestos para el reproductor global.
 */

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { APP_CONFIG } from "@/config";
import { resolveEcuadorRadioStream } from "@/services/radioBrowser";

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface AudioPlayerState {
  status: PlayerStatus;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  volume: number;
  isMuted: boolean;
}

export interface AudioPlayerControls {
  toggle: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
}

/** Detecta iOS Safari (necesita play() sin load()) */
const isIOS = () =>
  /iP(hone|ad|od)/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/** Detecta Android (necesita load() antes de play()) */
const isAndroid = () => /Android/i.test(navigator.userAgent);

export function useAudioPlayer(): [AudioPlayerState, AudioPlayerControls] {
  const audio = useMemo(() => {
    const a = new Audio();
    a.preload = "none"; // Android: evitar carga automática antes de tocar play
    a.setAttribute("playsinline", "true");
    a.setAttribute("webkit-playsinline", "true"); // Samsung Internet legacy
    return a;
  }, []);

  const audioRef = useRef(audio);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [volume, setVolumeState] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const statusRef = useRef(status);
  const streamUrlRef = useRef<string>(APP_CONFIG.STREAM_URL);
  const resolvingStreamRef = useRef<Promise<string> | null>(null);
  const playRequestIdRef = useRef(0);

  useEffect(() => { statusRef.current = status; }, [status]);

  const resolveStreamUrl = useCallback(async (): Promise<string> => {
    if (!APP_CONFIG.USE_PUBLIC_RADIO_API) return APP_CONFIG.STREAM_URL;
    if (resolvingStreamRef.current) return resolvingStreamRef.current;

    const pending = (async () => {
      // Intentar servidor principal + fallbacks
      const servers = [
        APP_CONFIG.RADIO_API_BASE_URL,
        ...APP_CONFIG.RADIO_API_FALLBACK_URLS,
      ];

      for (const baseUrl of servers) {
        try {
          const resolved = await resolveEcuadorRadioStream({
            baseUrl,
            countryCode: APP_CONFIG.RADIO_API_COUNTRY_CODE,
            preferredStations: APP_CONFIG.RADIO_API_PREFERRED_STATIONS,
            genreKeywords: APP_CONFIG.RADIO_API_GENRE_KEYWORDS,
            excludedKeywords: APP_CONFIG.RADIO_API_EXCLUDED_KEYWORDS,
            limit: 60,
          });

          if (resolved) {
            streamUrlRef.current = resolved.streamUrl;
            return resolved.streamUrl;
          }
        } catch {
          // intentar siguiente servidor
        }
      }

      streamUrlRef.current = APP_CONFIG.STREAM_URL;
      return APP_CONFIG.STREAM_URL;
    })().finally(() => {
      resolvingStreamRef.current = null;
    });

    resolvingStreamRef.current = pending;
    return pending;
  }, []);

  const safePlay = useCallback((a: HTMLAudioElement, withLoad = false) => {
    const doPlay = () => {
      a.play().catch((err: DOMException) => {
        if (err.name === "AbortError") {
          // Android: load() interrumpió una llamada play() anterior — reintentar
          setTimeout(() => safePlay(a), 300);
          return;
        }
        if (err.name === "NotAllowedError") {
          setStatus("idle");
          return;
        }
        if (err.name === "NotSupportedError") {
          setStatus("error");
          return;
        }
        setStatus("error");
      });
    };

    if (withLoad || isAndroid()) {
      // Android/Samsung: load() es obligatorio para iniciar un stream nuevo
      a.load();
      a.addEventListener("canplay", doPlay, { once: true });
    } else if (isIOS()) {
      // iOS Safari: NO llamar load() — provoca AbortError
      if (a.readyState >= 2) {
        doPlay();
      } else {
        a.addEventListener("canplay", doPlay, { once: true });
      }
    } else {
      // Desktop / otros navegadores
      doPlay();
    }
  }, []);

  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const a = audioRef.current;

    const onWaiting = () => setStatus("loading");
    const onPlaying = () => setStatus("playing");
    const onPause = () => {
      // En iOS el sistema puede pausar el audio (llamada, bloqueo de pantalla)
      // Solo marcar como paused si no estamos en proceso de carga
      if (statusRef.current !== "loading") setStatus("paused");
    };

    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    const onError = () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      setStatus("error");
      // Reintentar automáticamente después de 4s (conexión móvil inestable)
      reconnectTimeout = setTimeout(() => {
        if (statusRef.current === "error") {
          a.src = streamUrlRef.current || APP_CONFIG.STREAM_URL;
          safePlay(a);
        }
      }, 4000);
    };

    const onProgress = () => {
      if (a.buffered.length > 0) {
        const end = a.buffered.end(a.buffered.length - 1);
        const delay = end - a.currentTime;
        if (delay > 3) a.currentTime = end - 0.5;
      }
    };

    let stallTimeout: ReturnType<typeof setTimeout> | null = null;
    const onStalled = () => {
      if (statusRef.current === "playing" || statusRef.current === "loading") {
        stallTimeout = setTimeout(() => {
          if (statusRef.current !== "paused") {
            a.src = streamUrlRef.current || APP_CONFIG.STREAM_URL;
            safePlay(a);
          }
        }, 3500);
      }
    };

    // Android/Samsung: el stream nunca debería terminar, pero si ocurre — reconectar
    const onEnded = () => {
      if (streamUrlRef.current) {
        a.src = streamUrlRef.current;
        safePlay(a);
      }
    };

    // Android: pantalla bloqueada puede pausar el audio sin disparar evento pause
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" &&
          statusRef.current === "playing" && a.paused) {
        safePlay(a);
      }
    };

    a.addEventListener("waiting", onWaiting);
    a.addEventListener("playing", onPlaying);
    a.addEventListener("pause", onPause);
    a.addEventListener("error", onError);
    a.addEventListener("progress", onProgress);
    a.addEventListener("stalled", onStalled);
    a.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (stallTimeout) clearTimeout(stallTimeout);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("error", onError);
      a.removeEventListener("progress", onProgress);
      a.removeEventListener("stalled", onStalled);
      a.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [safePlay]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    playRequestIdRef.current += 1;
    const requestId = playRequestIdRef.current;

    if (status === "playing" || status === "loading") {
      a.pause();
      a.src = "";
      setStatus("paused");
      return;
    }

    setStatus("loading");
    void (async () => {
      const streamUrl = await resolveStreamUrl();
      if (playRequestIdRef.current !== requestId) return;

      const currentAudio = audioRef.current;
      currentAudio.src = streamUrl;
      safePlay(currentAudio);
    })();
  }, [status, safePlay, resolveStreamUrl]);

  useEffect(() => {
    void resolveStreamUrl();
  }, [resolveStreamUrl]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.min(1, Math.max(0, vol));
    setVolumeState(clamped);
    if (clamped > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: APP_CONFIG.RADIO_NAME,
        artist: APP_CONFIG.SLOGAN,
        album: "",
        artwork: [
          { src: APP_CONFIG.LOGO_URL || "/logoradio.jpg", sizes: "512x512", type: "image/jpeg" },
        ],
      });
      navigator.mediaSession.playbackState = (status === "playing" || status === "loading") ? "playing" : "paused";
      navigator.mediaSession.setActionHandler("play", toggle);
      navigator.mediaSession.setActionHandler("pause", toggle);
    } catch {
      // ignore
    }
  }, [status, toggle]);

  useEffect(() => {
    document.title = `${APP_CONFIG.RADIO_NAME} — ${APP_CONFIG.SLOGAN}`;
  }, []);

  const state: AudioPlayerState = {
    status,
    isPlaying: status === "playing",
    isLoading: status === "loading",
    hasError: status === "error",
    errorMessage: "No se pudo conectar. Intenta más tarde.",
    volume,
    isMuted,
  };

  return [state, { toggle, setVolume, toggleMute }];
}
