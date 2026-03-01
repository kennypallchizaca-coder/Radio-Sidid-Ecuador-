/**
 * AudioContext — Estado global del reproductor (stream en vivo).
 * Uso: useAudio() → { playerState, controls }
 */
import type { ReactNode } from "react";
import { useAudioPlayer } from "@/hooks";
import { AudioContext } from "./audio-context";

export function AudioProvider({ children }: { children: ReactNode }) {
  const [playerState, controls] = useAudioPlayer();
  return (
    <AudioContext.Provider value={{ playerState, controls }}>
      {children}
    </AudioContext.Provider>
  );
}
