import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Loader2, X, AlertTriangle } from "lucide-react";
import useGameStore from "../../store/useGameStore";
import { io } from "socket.io-client";

// 🚀 LIVE BACKEND URL
const SOCKET_URL = "https://anime-draft-game-1.onrender.com";

export default function Lobby() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = useGameStore((state) => state.user);

  const domain = state?.domain || "anime";
  const mode = state?.mode || "Player vs Player";
  const universe = state?.universe || "all";

  const [timeWaiting, setTimeWaiting] = useState(0);
  const [matchStatus, setMatchStatus] = useState("SEARCHING FOR COMMANDERS");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit("join_matchmaking", {
      user,
      domain,
      mode,
      universe,
    });

    newSocket.on("match_ready", (data) => {
      setMatchStatus("OPPONENT FOUND! INITIATING...");

      // 🚀 STRICT TURN ASSIGNMENT LOGIC
      const myPlayerIndex =
        data.players.findIndex(
          (p) => p.username.toLowerCase() === user.username.toLowerCase(),
        ) + 1;
      const opp = data.players.find(
        (p) => p.username.toLowerCase() !== user.username.toLowerCase(),
      );

      setTimeout(() => {
        const draftRoute =
          domain === "sports" ? "/draft/sports" : "/draft/anime";
        navigate(draftRoute, {
          state: {
            mode,
            universe,
            domain,
            isOnline: true,
            roomId: data.roomId,
            players: data.players,
            myPlayerIndex: myPlayerIndex || 1,
            opponentName: opp ? opp.username : "OPPONENT",
            matchSeed: data.matchSeed, // 🚀 CRITICAL FIX: Pass the seed to the Draft Manager!
          },
        });
      }, 2000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [domain, mode, universe, user, navigate]);

  useEffect(() => {
    if (matchStatus !== "SEARCHING FOR COMMANDERS") return;

    const timer = setInterval(() => {
      setTimeWaiting((prev) => prev + 1);
    }, 1000);

    if (timeWaiting >= 30) {
      clearInterval(timer);
      setMatchStatus("NETWORK TIMEOUT. DEPLOYING CPU BOT...");

      if (socket) socket.disconnect();

      setTimeout(() => {
        const draftRoute =
          domain === "sports" ? "/draft/sports" : "/draft/anime";
        navigate(draftRoute, {
          state: { mode, universe, domain, isOnline: false, botFill: true },
        });
      }, 2000);
    }

    return () => clearInterval(timer);
  }, [timeWaiting, matchStatus, domain, mode, universe, navigate, socket]);

  const handleCancel = () => {
    if (socket) socket.disconnect();
    navigate("/hub", { state: { isOnline: true, domain } });
  };

  const themeColor = domain === "anime" ? "text-[#ff8c32]" : "text-emerald-400";
  const themeBorder =
    domain === "anime" ? "border-[#ff8c32]" : "border-emerald-500";
  const isFound = matchStatus.includes("FOUND") || matchStatus.includes("CPU");

  return (
    <div className="h-[100dvh] w-full bg-[#050505] flex flex-col items-center justify-center uppercase font-sans relative overflow-hidden text-white">
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-32 h-32 rounded-full border ${themeBorder}`}
        />
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.5, 0, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
          className={`absolute w-32 h-32 rounded-full border ${themeBorder}`}
        />
      </div>

      <div className="z-10 flex flex-col items-center text-center bg-black/60 p-10 rounded-[32px] border border-white/10 backdrop-blur-md w-full max-w-lg transition-all duration-500">
        <AnimatePresence mode="wait">
          {!isFound ? (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <Globe size={48} className={`${themeColor} mb-6 animate-pulse`} />
              <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-8">
                TRANSMITTING <br /> SIGNALS...
              </h1>
            </motion.div>
          ) : (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <AlertTriangle
                size={48}
                className="text-yellow-400 mb-6 animate-bounce"
              />
              <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-8 text-yellow-400">
                ENGAGEMENT <br /> CONFIRMED
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border w-full mb-8 transition-colors ${isFound ? "border-yellow-400/50 bg-yellow-400/10" : "border-white/10"}`}
        >
          <Loader2
            size={24}
            className={`${isFound ? "text-yellow-400" : themeColor} animate-spin`}
          />
          <div className="flex-1 text-left">
            <div
              className={`text-sm font-black tracking-widest ${isFound ? "text-yellow-400" : "text-white"}`}
            >
              {matchStatus}
            </div>
            {!isFound && (
              <div className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">
                T-MINUS: {30 - timeWaiting > 0 ? 30 - timeWaiting : 0}S UNTIL
                BOT ASSIST
              </div>
            )}
          </div>
        </div>

        {!isFound && (
          <button
            onClick={handleCancel}
            className="flex items-center justify-center gap-2 text-xs font-black tracking-widest text-red-500 hover:text-white border border-red-500/30 hover:bg-red-500/20 px-8 py-3 rounded-full transition-all cursor-pointer z-50"
          >
            <X size={16} /> ABORT SEARCH
          </button>
        )}
      </div>
    </div>
  );
}
