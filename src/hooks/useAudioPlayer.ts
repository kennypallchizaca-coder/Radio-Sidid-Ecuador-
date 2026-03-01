/**
 * useAudioPlayer — Reproduce un stream en vivo (API pública EC + fallback).
 * Estrategia universal: funciona en iOS, Android, Samsung, Huawei y Desktop.
 *
 * Patrón: src → load() → esperar canplay → play()
 * Este orden es el único que funciona de forma fiable en TODOS los móviles.
 */

import { useRef, useState, useCallback, useEffect } from "react";
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

export function useAudioPlayer(): [AudioPlayerState, AudioPlayerControls] {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [volume, setVolumeState] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  const statusRef = useRef(status);
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);
  const streamUrlRef = useRef<string>(APP_CONFIG.STREAM_URL);
  const resolvingStreamRef = useRef<Promise<string> | null>(null);
  const playRequestIdRef = useRef(0);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // ── Resolver URL del stream ──────────────────────────────────────────────
  const resolveStreamUrl = useCallback(async (): Promise<string> => {
    if (!APP_CONFIG.USE_PUBLIC_RADIO_API) return APP_CONFIG.STREAM_URL;
    if (resolvingStreamRef.current) return resolvingStreamRef.current;

    const pending = (async () => {
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
        } catch { /* siguiente servidor */ }
      }
      streamUrlRef.current = APP_CONFIG.STREAM_URL;
      return APP_CONFIG.STREAM_URL;
    })().finally(() => { resolvingStreamRef.current = null; });

    resolvingStreamRef.current = pending;
    return pending;
  }, []);

  // ── Reintentos con backoff exponencial ───────────────────────────────────
  const scheduleRetry = useCallback((url: string, requestId: number) => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    const count = retryCountRef.current;
    if (count >= 5) return; // máximo 5 reintentos
    const delay = Math.min(1500 * Math.pow(2, count), 20000); // 1.5s → 3s → 6s → 12s → 20s
    retryCountRef.current += 1;
    retryTimerRef.current = setTimeout(() => {
      if (playRequestIdRef.current === requestId && statusRef.current !== "paused") {
        startPlayback(url, requestId);
      }
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Motor de reproducción universal ─────────────────────────────────────
  // Patrón: src → load() → esperar canplay → play()
  // Funciona en iOS Safari, Chrome Android, Samsung Internet, Huawei Browser y Desktop.
  const startPlayback = useCallback((url: string, requestId: number) => {
    if (playRequestIdRef.current !== requestId) return;

    // Crear elemento <audio> fresco para evitar estado residual de la reproducción anterior
    const prev = audioRef.current;
    if (prev) { prev.pause(); prev.src = ""; }

    const a = document.createElement("audio");
    a.preload = "none";
    a.setAttribute("playsinline", "true");
    a.setAttribute("webkit-playsinline", "true"); // Samsung Internet legacy
    a.volume = isMutedRef.current ? 0 : volumeRef.current;
    audioRef.current = a;

    const onCanPlay = () => {
      if (playRequestIdRef.current !== requestId) return;
      a.play().catch((err: DOMException) => {
        // AbortError: una operación posterior canceló esta — ignorar
        if (err.name === "AbortError") return;
        // NotAllowedError: el navegador exige gesto del usuario (muy raro en toggle)
        if (err.name === "NotAllowedError") { setStatus("idle"); return; }
        setStatus("error");
        scheduleRetry(url, requestId);
      });
    };

    a.addEventListener("canplay", onCanPlay, { once: true });
    a.addEventListener("playing", () => {
      if (playRequestIdRef.current !== requestId) return;
      retryCountRef.current = 0;
      setStatus("playing");
    });
    a.addEventListener("waiting", () => setStatus("loading"));
    a.addEventListener("pause", () => {
      // Ignorar pauses transitorias durante la carga
      if (statusRef.current === "loading") return;
      if (!a.src) return; // pausado intencionalmente (src vaciado en toggle)
      setStatus("paused");
    });
    a.addEventListener("error", () => {
      if (playRequestIdRef.current !== requestId) return;
      setStatus("error");
      scheduleRetry(url, requestId);
    });
    a.addEventListener("ended", () => {
      // Los streams en vivo no terminan — reconectar de inmediato
      if (playRequestIdRef.current === requestId) startPlayback(url, requestId);
    });
    a.addEventListener("stalled", () => {
      if (statusRef.current === "paused") return;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        if (statusRef.current !== "paused" && playRequestIdRef.current === requestId) {
          startPlayback(url, requestId);
        }
      }, 4000);
    });

    // Asignar src y disparar load() — el orden correcto para todos los navegadores
    a.src = url;
    a.load();
  }, [scheduleRetry]);

  // ── Actualizar volumen en tiempo real ───────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // ── Recuperar reproducción al volver a la app (pantalla bloqueada) ──────
  useEffect(() => {
    const onVisibilityChange = () => {
      const a = audioRef.current;
      if (!a) return;
      if (
        document.visibilityState === "visible" &&
        statusRef.current === "playing" &&
        a.paused && a.src
      ) {
        a.play().catch(() => {
          if (a.src) startPlayback(a.src, playRequestIdRef.current);
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [startPlayback]);

  // ── Toggle play/pause ───────────────────────────────────────────────────
  const toggle = useCallback(() => {
    const a = audioRef.current;

    if (status === "playing" || status === "loading") {
      playRequestIdRef.current += 1;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryCountRef.current = 0;
      if (a) { a.pause(); a.src = ""; }
      setStatus("paused");
      return;
    }

    playRequestIdRef.current += 1;
    const requestId = playRequestIdRef.current;
    retryCountRef.current = 0;
    setStatus("loading");

    void (async () => {
      const url = await resolveStreamUrl();
      startPlayback(url, requestId);
    })();
  }, [status, resolveStreamUrl, startPlayback]);

  // ── Pre-resolver URL al montar ───────────────────────────────────────────
  useEffect(() => { void resolveStreamUrl(); }, [resolveStreamUrl]);

  // ── Media Session API (controles en pantalla bloqueada) ─────────────────
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
      navigator.mediaSession.playbackState =
        (status === "playing" || status === "loading") ? "playing" : "paused";
      navigator.mediaSession.setActionHandler("play", toggle);
      navigator.mediaSession.setActionHandler("pause", toggle);
      navigator.mediaSession.setActionHandler("stop", toggle);
    } catch { /* ignore */ }
  }, [status, toggle]);

  // ── Título de página ─────────────────────────────────────────────────────
  useEffect(() => {
    document.title = `${APP_CONFIG.RADIO_NAME} — ${APP_CONFIG.SLOGAN}`;
  }, []);

  // ── Controles de volumen ─────────────────────────────────────────────────
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.min(1, Math.max(0, vol));
    setVolumeState(clamped);
    if (clamped > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  const state: AudioPlayerState = {
    status,
    isPlaying: status === "playing",
    isLoading: status === "loading",
    hasError: status === "error",
    errorMessage: "No se pudo conectar. Reintentando…",
    volume,
    isMuted,
  };

  return [state, { toggle, setVolume, toggleMute }];
}
