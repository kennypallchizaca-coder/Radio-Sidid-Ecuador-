/* eslint-disable react-refresh/only-export-components */
/**
 * context/AudioContext.tsx
 * ──────────────────────────────────────────────────────────────
 * Contexto global del reproductor de audio.
 *
 * POR QUÉ ES NECESARIO:
 *   Sin context, el estado del player se pasa como props desde
 *   App.tsx hacia abajo (prop drilling). Con AudioContext, cualquier
 *   componente puede acceder al reproductor sin importar su nivel.
 *
 * CÓMO USAR EN UN COMPONENTE:
 *   import { useAudio } from '@/context/AudioContext';
 *
 *   function AlgunComponente() {
 *     const { playerState, controls } = useAudio();
 *     return <button onClick={controls.toggle}>Play</button>;
 *   }
 *
 * JERARQUÍA:
 *   <AudioProvider>    ← en App.tsx
 *     <Player />       ← usa useAudio()
 *     <Hero />         ← usa useAudio()
 *     <NowPlaying />   ← usa useAudio()
 *   </AudioProvider>
 */

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import {
  useAudioPlayer,
  type AudioPlayerState,
  type AudioPlayerControls,
} from "../hooks/useAudioPlayer";

// ── Tipos del contexto ─────────────────────────────────────────

interface AudioContextValue {
  playerState: AudioPlayerState;
  controls:    AudioPlayerControls;
}

// ── Creación del contexto ──────────────────────────────────────

const AudioContext = createContext<AudioContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────

export function AudioProvider({ children }: { children: ReactNode }) {
  const [playerState, controls] = useAudioPlayer();

  return (
    <AudioContext.Provider value={{ playerState, controls }}>
      {children}
    </AudioContext.Provider>
  );
}

// ── Hook de consumo ────────────────────────────────────────────

/**
 * Accede al estado global del reproductor desde cualquier componente.
 * Lanza error si se usa fuera de <AudioProvider>.
 */
export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudio debe usarse dentro de <AudioProvider>");
  }
  return ctx;
}
