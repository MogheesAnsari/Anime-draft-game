import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuctionLogic } from "./hooks/useAuctionLogic";
import AnimeCardDisplay from "../Draft/Anime/components/AnimeCardDisplay";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Timer as TimerIcon,
  Gavel,
  User,
  Bot,
  AlertTriangle,
  ArrowRight,
  Layers,
  FastForward,
  SkipForward,
} from "lucide-react";

export default function AuctionRoom({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const difficulty = state?.difficulty || "MEDIUM";
  const universe = state?.universe || "all";

  const {
    dbLoading,
    characterPool,
    currentIndex,
    currentLot,
    purses,
    currentBid,
    highestBidder,
    timer,
    isAuctionActive,
    auctionComplete,
    rosters,
    placeBid,
    startNextLot,
    lotsRemaining,
    skipCurrentLot,
    finishAuctionEarly,
  } = useAuctionLogic(universe, difficulty);

  const hasStarted = useRef(false);

  useEffect(() => {
    if (
      !dbLoading &&
      !hasStarted.current &&
      !auctionComplete &&
      characterPool.length > 0
    ) {
      hasStarted.current = true;
      const delay = setTimeout(() => {
        startNextLot();
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [dbLoading, auctionComplete, characterPool.length, startNextLot]);

  if (dbLoading) {
    return (
      <div className="h-[100dvh] w-full bg-[#050505] flex flex-col items-center justify-center font-black italic text-[#ff8c32] tracking-widest uppercase relative z-10">
        <Gavel size={48} className="mb-4 animate-bounce" />
        PREPARING AUCTION HOUSE...
      </div>
    );
  }

  if (auctionComplete) {
    return (
      <div className="h-[100dvh] w-full bg-[#050505] flex flex-col items-center justify-center text-white font-sans uppercase p-4 md:p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a0a0c] border border-yellow-500/50 p-6 md:p-10 rounded-[24px] md:rounded-[40px] text-center shadow-[0_0_50px_rgba(234,179,8,0.2)] max-w-2xl w-full"
        >
          <Gavel
            size={48}
            md:size={64}
            className="text-yellow-500 mx-auto mb-4 md:mb-6"
          />
          <h1 className="text-2xl md:text-6xl font-black italic tracking-tighter text-white mb-2 md:mb-4">
            AUCTION CONCLUDED
          </h1>
          <p className="text-[10px] md:text-sm text-gray-400 tracking-[0.2em] font-bold mb-6 md:mb-10">
            ALL ASSETS HAVE BEEN SECURED. PROCEED TO SQUAD CONFIGURATION.
          </p>
          <button
            onClick={() =>
              navigate("/auction-build", {
                state: {
                  ...state,
                  rosters,
                  purses,
                  characterPool,
                  currentIndex,
                },
              })
            }
            className="w-full bg-yellow-500 text-black py-4 md:py-5 rounded-xl md:rounded-2xl font-black italic text-base md:text-xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 transition-all"
          >
            SQUAD BUILDER <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  const myRosterCards = rosters[0];
  const isMyRosterFull = myRosterCards.length >= 8;

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex flex-col uppercase font-sans relative overflow-hidden z-10">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-yellow-500/5 blur-[100px] md:blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-red-600/5 blur-[100px] md:blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* HEADER ROW */}
      <div className="shrink-0 w-full flex justify-end px-4 pt-4 md:pt-6 relative z-20">
        <div className="bg-white/10 border border-white/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-black text-[9px] md:text-xs tracking-widest text-gray-300 flex items-center gap-2 shadow-lg">
          <Layers size={14} className="text-yellow-500 md:w-4 md:h-4" /> LOTS:{" "}
          <span className="text-white">{lotsRemaining}/32</span>
        </div>
      </div>

      {/* ULTRA-COMPACT 4-COLUMN WALLETS ON MOBILE */}
      <div className="shrink-0 w-full max-w-6xl grid grid-cols-4 gap-1.5 md:gap-4 px-2 md:px-8 mx-auto mt-3 md:mt-4 relative z-10">
        {purses.map((purse, idx) => {
          const isMe = idx === 0;
          const isLeading = highestBidder === idx;
          const cardsWon = rosters[idx].length;
          const limit = isMe ? 8 : 6;

          return (
            <div
              key={idx}
              className={`p-1.5 md:p-4 rounded-lg md:rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center shadow-lg relative ${
                isLeading
                  ? "bg-yellow-500/20 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] md:scale-105"
                  : isMe
                    ? "bg-white/10 border-white/20"
                    : "bg-black/60 border-white/5"
              }`}
            >
              <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-black border border-white/20 px-1 md:px-2 py-0.5 rounded-full text-[7px] md:text-[10px] font-black z-10">
                {cardsWon}/{limit}
              </div>

              <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
                {isMe ? (
                  <User
                    size={10}
                    className="text-[#ff8c32] md:w-4 md:h-4 hidden md:block"
                  />
                ) : (
                  <Bot
                    size={10}
                    className="text-gray-500 md:w-4 md:h-4 hidden md:block"
                  />
                )}
                <span
                  className={`text-[7px] md:text-xs font-black tracking-widest ${isMe ? "text-[#ff8c32]" : "text-gray-400"}`}
                >
                  {isMe ? "YOU" : `CPU 0${idx}`}
                </span>
                {isLeading && (
                  <span className="ml-0.5 text-[6px] md:text-[8px] bg-yellow-500 text-black px-1 rounded font-black hidden md:block">
                    LEAD
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Coins
                  size={12}
                  className={
                    isMe
                      ? "text-yellow-400 md:w-5 md:h-5"
                      : "text-gray-500 md:w-5 md:h-5"
                  }
                />
                <span
                  className={`text-sm md:text-2xl font-black italic leading-none ${isMe ? "text-white" : "text-gray-300"}`}
                >
                  {purse}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ARENA LAYOUT */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 px-2 md:px-8 py-2 relative z-10 min-h-0">
        {/* 🚀 FIXED: BULLETPROOF CARD DISPLAY - Explicit Widths + Aspect Ratio prevents 0px collapse! */}
        <div className="flex-1 min-h-0 w-full flex justify-center items-center py-2">
          <AnimatePresence mode="wait">
            {!currentLot ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-[180px] sm:w-[220px] md:w-[280px] aspect-[3/4] rounded-[20px] md:rounded-[40px] border-2 border-dashed border-white/20 flex items-center justify-center text-gray-500 bg-black/40 shadow-2xl"
              >
                <div className="text-center">
                  <Gavel
                    size={24}
                    className="mx-auto mb-2 opacity-50 md:w-10 md:h-10 md:mb-4"
                  />
                  <p className="text-[9px] md:text-xs font-black tracking-[0.2em] px-2">
                    PREPARING LOT...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentLot.id || currentLot._id || "active-lot"}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -30 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-[180px] sm:w-[220px] md:w-[280px] aspect-[3/4] flex justify-center items-center drop-shadow-2xl relative"
              >
                {/* 🚀 FIXED: Absolute inset forces the inner component to perfectly fill the defined shape */}
                <div className="absolute inset-0 w-full h-full">
                  <AnimeCardDisplay
                    currentCard={currentLot}
                    skips={0}
                    universe={universe}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BIDDING CONTROLS */}
        <div className="shrink-0 w-full md:w-[400px] flex flex-col items-center mx-auto px-1 md:px-0 mb-1 md:mb-0">
          <div className="bg-[#0a0a0c]/90 border border-white/10 p-3 md:p-8 rounded-[16px] md:rounded-[32px] w-full shadow-2xl relative overflow-hidden">
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${timer <= 1 && isAuctionActive ? "bg-red-500/20 opacity-100" : "opacity-0"}`}
            />

            <div className="relative z-10 flex justify-between items-end mb-3 md:mb-8">
              <div>
                <p className="text-[7px] md:text-xs text-gray-500 font-black tracking-widest mb-0.5 md:mb-1">
                  CURRENT BID
                </p>
                <div className="text-2xl md:text-5xl font-black italic text-white flex items-center gap-1.5 md:gap-3 leading-none">
                  <Coins size={16} className="text-yellow-500 md:w-8 md:h-8" />{" "}
                  {currentBid}
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="text-[7px] md:text-xs text-gray-500 font-black tracking-widest mb-0.5 md:mb-1">
                  TIME LEFT
                </p>
                <div
                  className={`text-xl md:text-4xl font-black italic flex items-center gap-1 md:gap-2 leading-none ${timer <= 1 ? "text-red-500 animate-pulse" : "text-emerald-400"}`}
                >
                  <TimerIcon size={14} className="md:w-6 md:h-6" /> {timer}s
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-2 md:gap-4">
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                {[10, 50].map((increment) => (
                  <button
                    key={increment}
                    disabled={
                      !isAuctionActive ||
                      purses[0] < currentBid + increment ||
                      highestBidder === 0 ||
                      isMyRosterFull
                    }
                    onClick={() => placeBid(0, currentBid + increment)}
                    className="bg-white/5 border border-white/10 py-2.5 md:py-5 rounded-lg md:rounded-2xl text-xs md:text-lg font-black italic hover:bg-white/10 hover:border-white/30 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    +{increment}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <button
                  disabled={!isAuctionActive || isMyRosterFull}
                  onClick={skipCurrentLot}
                  className="bg-gray-800/50 border border-gray-600/50 text-gray-400 py-2 md:py-4 rounded-lg md:rounded-xl text-[9px] md:text-sm font-black italic hover:bg-gray-700 hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 md:gap-2"
                >
                  <SkipForward size={12} className="md:w-[16px]" /> SKIP LOT
                </button>

                <button
                  disabled={
                    !isAuctionActive ||
                    purses[0] <= currentBid ||
                    highestBidder === 0 ||
                    isMyRosterFull
                  }
                  onClick={() => placeBid(0, purses[0])}
                  className="bg-red-600/20 border border-red-500/50 text-red-500 py-2 md:py-4 rounded-lg md:rounded-xl text-[9px] md:text-sm font-black italic hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-[0_0_20px_rgba(220,38,38,0.2)] flex items-center justify-center gap-1.5 md:gap-2"
                >
                  <AlertTriangle size={12} className="md:w-[16px]" /> ALL IN (
                  {purses[0]})
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isMyRosterFull && isAuctionActive && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={finishAuctionEarly}
                className="w-full mt-2 md:mt-4 bg-yellow-500 text-black py-2.5 md:py-4 rounded-lg md:rounded-2xl text-[10px] md:text-sm font-black italic flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all animate-pulse"
              >
                <FastForward size={14} className="md:w-4 md:h-4" /> FINISH
                AUCTION EARLY
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM INVENTORY */}
      <div className="shrink-0 w-full bg-black/90 border-t border-white/10 py-3 md:py-4 px-2 md:px-8 flex justify-center z-50">
        <div className="w-full max-w-6xl flex items-center gap-2 md:gap-4">
          <div className="text-[7px] md:text-xs text-gray-500 font-black tracking-widest uppercase leading-tight shrink-0">
            YOUR SECURED
            <br />
            ASSETS
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-1.5 md:gap-3 overflow-x-auto custom-scrollbar pb-1">
            {[...Array(8)].map((_, i) => {
              const char = myRosterCards[i];
              return (
                <div
                  key={i}
                  className={`w-10 h-10 md:w-16 md:h-16 shrink-0 rounded-lg md:rounded-xl border-2 flex items-center justify-center bg-black/50 overflow-hidden ${
                    char ? "border-[#ff8c32]" : "border-white/10 border-dashed"
                  }`}
                >
                  {char ? (
                    <img
                      src={char.img}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <span className="text-[6px] md:text-[8px] text-gray-600 font-black">
                      EMPTY
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
