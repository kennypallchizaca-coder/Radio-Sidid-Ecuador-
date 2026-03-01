import { useContext } from "react";
import { AudioContext } from "./audio-context";
import type { AudioContextValue } from "./audio-context";

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio debe usarse dentro de <AudioProvider>");
  return ctx;
}
