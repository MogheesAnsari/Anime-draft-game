import React, { useState, useEffect } from "react";

export default function BackgroundManager({
  images = [],
  intervalDuration = 10000,
}) {
  const [shuffledImages, setShuffledImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🚀 FIXED: Randomize the playlist every time the app loads or domain switches
  useEffect(() => {
    if (images && images.length > 0) {
      // Shuffles the array randomly
      const shuffled = [...images].sort(() => 0.5 - Math.random());
      setShuffledImages(shuffled);
      setCurrentIndex(0); // Start at the first item of the newly shuffled list
    } else {
      setShuffledImages([]);
    }
  }, [images]);

  // Handle the timed transitions
  useEffect(() => {
    if (shuffledImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledImages.length);
    }, intervalDuration);
    return () => clearInterval(interval);
  }, [shuffledImages, intervalDuration]);

  if (shuffledImages.length === 0) return null;

  // Smart Pre-loading Logic (Only renders 3 videos at a time to save CPU)
  const safeIndex = currentIndex >= shuffledImages.length ? 0 : currentIndex;
  const prevIndex =
    (safeIndex - 1 + shuffledImages.length) % shuffledImages.length;
  const nextIndex = (safeIndex + 1) % shuffledImages.length;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#030305] pointer-events-none">
      {shuffledImages.map((src, idx) => {
        // Render only active, prev, and next to save memory
        if (idx !== safeIndex && idx !== prevIndex && idx !== nextIndex)
          return null;

        const isActive = idx === safeIndex;
        const isVideo = src.match(/\.(mp4|webm|ogg)$/i);

        return (
          <div
            key={src}
            className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {isVideo ? (
              <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                ref={(el) => {
                  if (el && isActive) {
                    el.play().catch(() =>
                      console.log("Video playback suspended by browser"),
                    );
                  }
                }}
              />
            ) : (
              <img src={src} alt="bg" className="w-full h-full object-cover" />
            )}
          </div>
        );
      })}

      {/* Dark overlay so the text remains readable */}
      <div
        className="absolute inset-0 bg-black/60 z-20"
        style={{ transform: "translateZ(0)" }}
      />
    </div>
  );
}
