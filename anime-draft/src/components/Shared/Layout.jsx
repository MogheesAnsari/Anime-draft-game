import React, { useState, useEffect } from "react";
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

const sportsMedia = ["/cricket_hero.png", "/football_hero.png"];

export default function Layout({ user, setUser, children }) {
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 768;
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const lastDomain = localStorage.getItem("animeDraft_lastDomain") || "anime";
  const isAnime = lastDomain === "anime";
  const activeAnimeMedia = isMobile ? animeMediaMobile : animeMediaDesktop;
  const globalMedia = isAnime ? activeAnimeMedia : sportsMedia;

  const immersiveScreens = ["/hub", "/draft", "/battle", "/result", "/login"];
  const hideNavbar = immersiveScreens.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    // 🚀 SCROLL FIX: h-[100dvh] locked with overflow-hidden
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex flex-col font-sans uppercase relative overflow-hidden">
      <BackgroundManager images={globalMedia} intervalDuration={10000} />

      {!hideNavbar && <Navbar user={user} setUser={setUser} />}

      {/* 🚀 SCROLL FIX: Removed overflow-y-auto. The children will dictate their own strict bounds now */}
      <main
        className={`flex-1 w-full relative z-10 overflow-hidden ${!hideNavbar ? "pt-16 md:pt-20" : ""}`}
      >
        {children}
      </main>
    </div>
  );
}
