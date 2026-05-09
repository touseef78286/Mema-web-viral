"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";

type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export function useAudioGain(
  audioRef: RefObject<HTMLAudioElement | null>,
  gainValue = 4,
) {
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const connectGain = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || typeof window === "undefined") return;

    const AudioContextCtor =
      window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!contextRef.current) {
      contextRef.current = new AudioContextCtor();
    }

    if (!sourceRef.current || !gainRef.current) {
      const gainNode = contextRef.current.createGain();
      gainNode.gain.value = gainValue;

      const source = contextRef.current.createMediaElementSource(audio);
      source.connect(gainNode);
      gainNode.connect(contextRef.current.destination);

      sourceRef.current = source;
      gainRef.current = gainNode;
    } else {
      gainRef.current.gain.value = gainValue;
    }

    if (contextRef.current.state === "suspended") {
      await contextRef.current.resume();
    }
  }, [audioRef, gainValue]);

  useEffect(() => {
    return () => {
      sourceRef.current?.disconnect();
      gainRef.current?.disconnect();
      void contextRef.current?.close();
    };
  }, []);

  return connectGain;
}
