import { useEffect, useRef, useState, useCallback } from "react";

export function useAudio(audioDefs: Record<number, { src: string; volume: number }>) {
  const [soundOn, setSoundOn] = useState(true);
  const interactedRef = useRef(false);

  const refs = useRef(
    Object.fromEntries(
      Object.keys(audioDefs).map(k => [k, null as HTMLAudioElement | null])
    ) as Record<string, HTMLAudioElement | null>
  );

  const currentThemeRef = useRef<number | null>(null); 

  const ensure = (k: number) => {
    const def = audioDefs[k];
    if (!def) return null;
    if (!refs.current[k]) {
      const el = new Audio(def.src);
      el.loop = true;
      el.volume = def.volume;
      refs.current[k] = el;
    }
    return refs.current[k];
  };

  const stopAll = () => {
    Object.values(refs.current).forEach(a => {
      if (a) {
        a.pause(); 
      }
    });
  };

  const playForTheme = async (theme: number) => {
    if (!soundOn || !interactedRef.current) return;

    const current = currentThemeRef.current;
    const audio = ensure(theme);
    if (!audio) return;

    if (current === theme && audio.paused) {
      try {
        await audio.play();
        return;
      } catch (err) {
        console.warn("Audio resume failed:", err);
      }
    }

    if (current !== theme) {
      Object.values(refs.current).forEach(a => a?.pause());
      audio.currentTime = 0;
      try {
        await audio.play();
        currentThemeRef.current = theme;
      } catch (err) {
        console.warn("Audio playback failed:", err);
      }
    }
  };


  // first user gesture unlock (only once)
  useEffect(() => {
    const on = () => {
      interactedRef.current = true;
    };
    window.addEventListener("pointerdown", on, { once: true });
    return () => {
      window.removeEventListener("pointerdown", on);
      window.removeEventListener("keydown", on);
      window.removeEventListener("keypress", on);
    };
  }, []);

  return { soundOn, setSoundOn, playForTheme, stopAll, interactedRef };
}
