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
  trackTitle: string;
  trackArtist: string;
}

export interface AudioPlayerControls {
  toggle: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
}

export function useAudioPlayer(): [AudioPlayerState, AudioPlayerControls] {
  const audio = useMemo(() => {
    const a = new Audio();
    a.preload = "metadata";
    a.setAttribute("playsinline", "true");
    return a;
  }, []);

  const audioRef = useRef(audio);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [volume, setVolumeState] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [trackTitle, setTrackTitle] = useState<string>(APP_CONFIG.RADIO_NAME);
  const statusRef = useRef(status);
  const streamUrlRef = useRef<string>(APP_CONFIG.STREAM_URL);
  const resolvingStreamRef = useRef<Promise<string> | null>(null);
  const playRequestIdRef = useRef(0);

  useEffect(() => { statusRef.current = status; }, [status]);

  const resolveStreamUrl = useCallback(async (): Promise<string> => {
    if (!APP_CONFIG.USE_PUBLIC_RADIO_API) return APP_CONFIG.STREAM_URL;
    if (resolvingStreamRef.current) return resolvingStreamRef.current;

    const pending = (async () => {
      try {
        const resolved = await resolveEcuadorRadioStream({
          baseUrl: APP_CONFIG.RADIO_API_BASE_URL,
          countryCode: APP_CONFIG.RADIO_API_COUNTRY_CODE,
          preferredStations: APP_CONFIG.RADIO_API_PREFERRED_STATIONS,
          genreKeywords: APP_CONFIG.RADIO_API_GENRE_KEYWORDS,
          excludedKeywords: APP_CONFIG.RADIO_API_EXCLUDED_KEYWORDS,
          limit: 60,
        });

        if (resolved) {
          streamUrlRef.current = resolved.streamUrl;
          setTrackTitle(resolved.stationName);
          return resolved.streamUrl;
        }
      } catch {
        // fallback silencioso
      }

      streamUrlRef.current = APP_CONFIG.STREAM_URL;
      setTrackTitle(APP_CONFIG.RADIO_NAME);
      return APP_CONFIG.STREAM_URL;
    })().finally(() => {
      resolvingStreamRef.current = null;
    });

    resolvingStreamRef.current = pending;
    return pending;
  }, []);

  const safePlay = useCallback((a: HTMLAudioElement) => {
    a.play().catch((err: DOMException) => {
      if (err.name === "AbortError") return;
      if (err.name === "NotAllowedError") {
        setStatus("idle");
        return;
      }
      setStatus("error");
    });
  }, []);

  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const a = audioRef.current;

    const onWaiting = () => setStatus("loading");
    const onPlaying = () => setStatus("playing");
    const onPause = () => setStatus("paused");
    const onError = () => {
      setStatus("error");
      a.src = "";
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
      if (statusRef.current === "playing") {
        stallTimeout = setTimeout(() => {
          if (!a.paused) {
            a.src = streamUrlRef.current || APP_CONFIG.STREAM_URL;
            a.load();
            safePlay(a);
          }
        }, 2500);
      }
    };

    a.addEventListener("waiting", onWaiting);
    a.addEventListener("playing", onPlaying);
    a.addEventListener("pause", onPause);
    a.addEventListener("error", onError);
    a.addEventListener("progress", onProgress);
    a.addEventListener("stalled", onStalled);

    return () => {
      if (stallTimeout) clearTimeout(stallTimeout);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("error", onError);
      a.removeEventListener("progress", onProgress);
      a.removeEventListener("stalled", onStalled);
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
      currentAudio.load();
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
        title: trackTitle,
        artist: "En vivo",
        album: APP_CONFIG.SLOGAN,
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
  }, [status, toggle, trackTitle]);

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
    trackTitle,
    trackArtist: "En vivo",
  };

  return [state, { toggle, setVolume, toggleMute }];
}
