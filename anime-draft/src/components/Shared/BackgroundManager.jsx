import React, { useState, useEffect } from "react";

export default function BackgroundManager({
  images = [],
  intervalDuration = 10000,
}) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (images && images.length > 0)
      return Math.floor(Math.random() * images.length);
    return 0;
  });

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalDuration);
    return () => clearInterval(interval);
  }, [images, intervalDuration]);

  if (images.length === 0) return null;

  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  const nextIndex = (currentIndex + 1) % images.length;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#030305] pointer-events-none">
      {images.map((src, idx) => {
        if (idx !== currentIndex && idx !== prevIndex && idx !== nextIndex)
          return null;

        const isActive = idx === currentIndex;
        const isVideo = src.match(/\.(mp4|webm|ogg)$/i);

        return (
          <div
            key={src}
            className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {isVideo ? (
              // 🚀 CRITICAL MOBILE FIX: Added key={src} to force the video player to reload on mobile
              <video
                key={src}
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={src} alt="bg" className="w-full h-full object-cover" />
            )}
          </div>
        );
      })}

      <div
        className="absolute inset-0 bg-black/60 z-20"
        style={{ transform: "translateZ(0)" }}
      />
    </div>
  );
}
