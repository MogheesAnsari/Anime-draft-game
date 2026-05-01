import React, { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Crown, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getRankTier } from "../../features/Draft/Anime/utils/draftUtils";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/leaderboard");
        setLeaders(res.data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    // 🚀 FIXED: bg-transparent
    <div className="h-full w-full bg-transparent text-white flex flex-col items-center p-4 md:p-8 uppercase font-sans selection:bg-[#ff8c32] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6 md:mb-10 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#ff8c32] transition-colors bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-white/10"
          >
            <ArrowLeft size={16} /> RETURN
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-full text-[9px] font-black text-red-500 tracking-widest animate-pulse">
            <Activity size={12} /> LIVE_SYNC
          </div>
        </div>

        <div className="text-center mb-8 md:mb-12 shrink-0">
          <Trophy
            size={40}
            className="mx-auto text-[#ff8c32] mb-3 drop-shadow-[0_0_20px_rgba(255,140,50,0.5)]"
          />
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
            GLOBAL <span className="text-[#ff8c32]">RANKINGS</span>
          </h1>
        </div>

        <div className="flex-1 bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-4 md:p-6 shadow-2xl relative overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 font-black italic text-lg gap-4">
              <Trophy size={32} className="animate-bounce text-gray-600" />
              DECRYPTING DATA...
            </div>
          ) : leaders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 font-black text-sm tracking-widest">
              NO COMBAT DATA FOUND
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {leaders.map((player, idx) => {
                const rankInfo = getRankTier(player.wins);
                return (
                  <div
                    key={player._id || idx}
                    className={`flex items-center justify-between p-3 md:p-4 rounded-2xl transition-transform hover:scale-[1.01] ${idx === 0 ? "bg-[#ff8c32]/20 border border-[#ff8c32]/50 shadow-[0_0_15px_rgba(255,140,50,0.2)]" : idx === 1 ? "bg-gray-300/20 border border-gray-300/30" : idx === 2 ? "bg-amber-700/20 border border-amber-700/30" : "bg-black/60 border border-white/10 hover:bg-white/10"}`}
                  >
                    <div className="flex items-center gap-3 md:gap-5">
                      <div
                        className={`w-8 text-center font-black italic text-xl md:text-2xl ${idx === 0 ? "text-[#ff8c32]" : idx === 1 ? "text-gray-300" : idx === 2 ? "text-amber-500" : "text-gray-500"}`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="relative">
                        <img
                          src={player.avatar || "/zoro.svg"}
                          className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-white/10 bg-black"
                          alt=""
                        />
                        {idx === 0 && (
                          <Crown
                            size={16}
                            className="absolute -top-2 left-1/2 -translate-x-1/2 text-[#ff8c32] drop-shadow-md"
                          />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-xs md:text-base font-black italic truncate max-w-[100px] md:max-w-[180px] ${idx === 0 ? "text-[#ff8c32]" : "text-white"}`}
                        >
                          {player.username}
                        </div>
                        <div
                          className={`text-[7px] md:text-[9px] font-black tracking-widest ${rankInfo.color}`}
                        >
                          {rankInfo.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 md:gap-8 text-right">
                      <div className="hidden sm:block">
                        <div className="text-[7px] font-black text-gray-500 tracking-widest mb-0.5">
                          WIN RATE
                        </div>
                        <div className="text-xs font-black text-white">
                          {player.totalGames > 0
                            ? Math.round(
                                (player.wins / player.totalGames) * 100,
                              )
                            : 0}
                          %
                        </div>
                      </div>
                      <div>
                        <div className="text-[7px] font-black text-[#ff8c32] tracking-widest mb-0.5">
                          VICTORIES
                        </div>
                        <div className="text-lg md:text-xl font-black italic text-white leading-none">
                          {player.wins}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
