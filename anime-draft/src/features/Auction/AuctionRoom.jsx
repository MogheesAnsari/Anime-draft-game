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
      <div className="h-[100dvh] w-full bg-[#050505] flex flex-col items-center justify-center font-black italic text-[#ff8c32] tracking-widest uppercase">
        <Gavel size={48} className="mb-4 animate-bounce" />
        PREPARING AUCTION HOUSE...
      </div>
    );
  }

  if (auctionComplete) {
    return (
      <div className="h-[100dvh] w-full bg-[#050505] flex flex-col items-center justify-center text-white font-sans uppercase p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a0a0c] border border-yellow-500/50 p-10 rounded-[40px] text-center shadow-[0_0_50px_rgba(234,179,8,0.2)] max-w-2xl w-full"
        >
          <Gavel size={64} className="text-yellow-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-4">
            AUCTION CONCLUDED
          </h1>
          <p className="text-xs md:text-sm text-gray-400 tracking-[0.2em] font-bold mb-10">
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
            className="w-full bg-yellow-500 text-black py-5 rounded-2xl font-black italic text-xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 transition-all"
          >
            SQUAD BUILDER <ArrowRight size={24} />
          </button>
        </motion.div>
      </div>
    );
  }

  const myRosterCards = rosters[0];
  const isMyRosterFull = myRosterCards.length >= 8;

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white flex flex-col items-center pt-24 pb-32 px-4 uppercase font-sans relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <div className="absolute top-6 right-6 bg-white/10 border border-white/20 px-4 py-2 rounded-full font-black text-xs tracking-widest text-gray-300 flex items-center gap-2 shadow-lg z-20">
        <Layers size={16} className="text-yellow-500" /> LOTS REMAINING:{" "}
        <span className="text-white">{lotsRemaining}/32</span>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
        {purses.map((purse, idx) => {
          const isMe = idx === 0;
          const isLeading = highestBidder === idx;
          const cardsWon = rosters[idx].length;
          const limit = isMe ? 8 : 6;

          return (
            <div
              key={idx}
              className={`p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center shadow-lg relative ${
                isLeading
                  ? "bg-yellow-500/20 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-105"
                  : isMe
                    ? "bg-white/10 border-white/20"
                    : "bg-black/60 border-white/5"
              }`}
            >
              <div className="absolute -top-2 -right-2 bg-black border border-white/20 px-2 py-0.5 rounded-full text-[10px] font-black">
                {cardsWon}/{limit}
              </div>

              <div className="flex items-center gap-2 mb-2">
                {isMe ? (
                  <User size={16} className="text-[#ff8c32]" />
                ) : (
                  <Bot size={16} className="text-gray-500" />
                )}
                <span
                  className={`text-[10px] font-black tracking-widest ${isMe ? "text-[#ff8c32]" : "text-gray-400"}`}
                >
                  {isMe ? "YOU" : `CPU 0${idx}`}
                </span>
                {isLeading && (
                  <span className="ml-1 text-[8px] bg-yellow-500 text-black px-1.5 rounded font-black">
                    LEAD
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Coins
                  size={18}
                  className={isMe ? "text-yellow-400" : "text-gray-500"}
                />
                <span
                  className={`text-2xl font-black italic ${isMe ? "text-white" : "text-gray-300"}`}
                >
                  {purse}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative z-10">
        <div className="w-full md:w-1/2 flex justify-center h-[400px]">
          <AnimatePresence mode="wait">
            {!currentLot ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-full max-w-[300px] aspect-[3/4] rounded-[40px] border-2 border-dashed border-white/20 flex items-center justify-center text-gray-500 bg-black/40"
              >
                <div className="text-center">
                  <Gavel size={40} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xs font-black tracking-[0.2em]">
                    PREPARING NEXT LOT...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentLot.id || currentLot._id || "active-lot"}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full flex justify-center"
              >
                <AnimeCardDisplay
                  currentCard={currentLot}
                  skips={0}
                  universe={universe}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-4">
          <div className="bg-[#0a0a0c]/90 border border-white/10 p-8 rounded-[40px] w-full shadow-2xl relative overflow-hidden">
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${timer <= 1 && isAuctionActive ? "bg-red-500/20 opacity-100" : "opacity-0"}`}
            />

            <div className="relative z-10 flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] text-gray-500 font-black tracking-widest mb-1">
                  CURRENT BID
                </p>
                <div className="text-5xl md:text-6xl font-black italic text-white flex items-center gap-3">
                  <Coins size={36} className="text-yellow-500" /> {currentBid}
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="text-[10px] text-gray-500 font-black tracking-widest mb-1">
                  TIME LEFT
                </p>
                <div
                  className={`text-4xl font-black italic flex items-center gap-2 ${timer <= 1 ? "text-red-500 animate-pulse" : "text-emerald-400"}`}
                >
                  <TimerIcon size={24} /> {timer}s
                </div>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex gap-4">
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
                    className="flex-1 bg-white/5 border border-white/10 py-5 rounded-2xl text-lg font-black italic hover:bg-white/10 hover:border-white/30 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    +{increment}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  disabled={!isAuctionActive || isMyRosterFull}
                  onClick={skipCurrentLot}
                  className="flex-1 bg-gray-800/50 border border-gray-600/50 text-gray-400 py-4 rounded-2xl text-sm font-black italic hover:bg-gray-700 hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  <SkipForward size={18} /> SKIP LOT
                </button>

                <button
                  disabled={
                    !isAuctionActive ||
                    purses[0] <= currentBid ||
                    highestBidder === 0 ||
                    isMyRosterFull
                  }
                  onClick={() => placeBid(0, purses[0])}
                  className="flex-1 bg-red-600/20 border border-red-500/50 text-red-500 py-4 rounded-2xl text-sm font-black italic hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-[0_0_20px_rgba(220,38,38,0.2)] flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={18} /> ALL IN ({purses[0]})
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isMyRosterFull && isAuctionActive && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={finishAuctionEarly}
                className="w-full bg-yellow-500 text-black py-4 rounded-2xl text-lg font-black italic flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all animate-pulse"
              >
                <FastForward size={20} /> FINISH AUCTION EARLY
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-white/10 py-4 px-4 flex justify-center z-50">
        <div className="w-full max-w-5xl flex items-center gap-4">
          <div className="text-[10px] text-gray-500 font-black tracking-widest uppercase">
            YOUR SECURED
            <br />
            ASSETS
          </div>
          <div className="flex flex-1 gap-2 overflow-x-auto custom-scrollbar pb-2">
            {[...Array(8)].map((_, i) => {
              const char = myRosterCards[i];
              return (
                <div
                  key={i}
                  className={`w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-xl border-2 flex items-center justify-center bg-black/50 overflow-hidden ${char ? "border-[#ff8c32]" : "border-white/10 border-dashed"}`}
                >
                  {char ? (
                    <img
                      src={char.img}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <span className="text-[8px] text-gray-600 font-black">
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
