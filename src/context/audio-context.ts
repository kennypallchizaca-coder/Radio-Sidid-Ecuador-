import { createContext } from "react";
import type { AudioPlayerControls, AudioPlayerState } from "@/hooks";

export interface AudioContextValue {
  playerState: AudioPlayerState;
  controls: AudioPlayerControls;
}

export const AudioContext = createContext<AudioContextValue | null>(null);
