import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import BackgroundManager from "./BackgroundManager";

const animeMediaDesktop = [
  "/satoru-gojo-shattered-sky.3840x2160.mp4",
  "/shadows-army-solo-leveling.3840x2160.mp4",
  "/madara-uchiha2.3840x2160.mp4",
  "/itachi-uchiha-collage.3840x2160.mp4",
  "/obito-uchiha-jutsu.1920x1080.mp4",
  "/naruto-luffy-and-son-goku-in-the-ruined-city.1920x1080.mp4",
  "/tanjiro-and-nezuko-kamado.3840x2160.mp4",
  "/sakura-ronin-frostlit-blossom.3840x2160.mp4",
  "/anime-girls-holding-hands.3840x2160.mp4",
];

const animeMediaMobile = [
  "/luffy-gear-5th.720x1280.mp4",
  "/golden-zenitsu.720x1280.mp4",
  "/super-saiyan-goku-dragon-ball.720x1280.mp4",
  "/naruto-in-fall.720x1280.mp4",
];

const sportsMedia = ["/football_bg.mp4", "/cricket_bg.mp4"];

export default function Layout({ user, setUser, children }) {
  const location = useLocation();
  const bgmRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 768;
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentDomainState = location.state?.domain;
  const lastDomain =
    currentDomainState ||
    localStorage.getItem("animeDraft_lastDomain") ||
    "anime";

  const forceVideoScreens = ["/", "/domain"];
  const isVideoScreen = forceVideoScreens.includes(location.pathname);
  const isAnime = isVideoScreen || lastDomain === "anime";

  const activeAnimeMedia = isMobile ? animeMediaMobile : animeMediaDesktop;
  const globalMedia = isAnime ? activeAnimeMedia : sportsMedia;

  useEffect(() => {
    const handleVolumeChange = () => {
      if (bgmRef.current) {
        const storedBgmVol = localStorage.getItem("bgmVolume");
        bgmRef.current.volume =
          storedBgmVol !== null ? parseFloat(storedBgmVol) : 0.25;
      }
    };
    window.addEventListener("volumeChange", handleVolumeChange);
    return () => window.removeEventListener("volumeChange", handleVolumeChange);
  }, []);

  useEffect(() => {
    const startAudio = () => {
      if (bgmRef.current && bgmRef.current.paused) {
        const storedBgmVol = localStorage.getItem("bgmVolume");
        bgmRef.current.volume =
          storedBgmVol !== null ? parseFloat(storedBgmVol) : 0.25;

        bgmRef.current.play().catch((err) => {
          console.log(
            "Browser is actively blocking playback. Click anywhere to start.",
          );
        });
      }
    };

    document.body.addEventListener("click", startAudio);
    startAudio();

    return () => document.body.removeEventListener("click", startAudio);
  }, []);

  // 🚀 The Navbar is hidden entirely during gameplay to maximize immersion
  const immersiveScreens = ["/hub", "/draft", "/battle", "/result", "/login"];
  const hideNavbar = immersiveScreens.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex flex-col font-sans uppercase relative overflow-hidden">
      <audio ref={bgmRef} src="/anime_bgm.mp3" loop preload="auto" />

      <BackgroundManager images={globalMedia} intervalDuration={10000} />

      {/* Navbar sits structurally at the top, perfectly aligning everything below it */}
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}

      {/* 🚀 FIXED: Removed the top padding entirely. Flex-col handles it natively! */}
      <main className="flex-1 w-full relative z-10 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
