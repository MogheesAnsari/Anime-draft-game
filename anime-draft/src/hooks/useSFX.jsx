import { useCallback } from "react";

export function useSFX() {
  const playSFX = useCallback((soundPath, baseVolume = 0.5) => {
    try {
      const storedSFXVolume = localStorage.getItem("sfxVolume");
      const masterVolume =
        storedSFXVolume !== null ? parseFloat(storedSFXVolume) : 1.0;

      const audio = new Audio(soundPath);
      audio.volume = baseVolume * masterVolume;

      audio.play().catch((err) => {
        // Silently catch the error so it doesn't break the app if audio is blocked
      });
    } catch (e) {
      console.warn("SFX Error: ", e);
    }
  }, []);

  return playSFX;
}
