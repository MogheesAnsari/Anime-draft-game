import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Trophy, Crown, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
// ✅ Make sure this path points to your draftUtils correctly
import { getRankTier } from "../../features/Draft/utils/draftUtils";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // 🔥 Pointed to the correct Backend API Server
        const res = await axios.get("http://localhost:5000/api/leaderboard");
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
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center p-4 md:p-8 uppercase font-sans selection:bg-[#ff8c32] relative overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-[#050505] to-[#050505]" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-[#ff8c32] transition-colors"
          >
            <ArrowLeft size={16} /> RETURN
          </button>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-[9px] font-black text-red-500 tracking-widest animate-pulse">
            <Activity size={12} /> LIVE_SYNC
          </div>
        </div>

        <div className="text-center mb-12">
          <Trophy
            size={48}
            className="mx-auto text-[#ff8c32] mb-4 drop-shadow-[0_0_20px_rgba(255,140,50,0.5)]"
          />
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
            GLOBAL <span className="text-[#ff8c32]">RANKINGS</span>
          </h1>
          <p className="text-xs font-black text-gray-500 tracking-[0.4em] mt-2">
            TOP 50 ELITE COMMANDERS
          </p>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-[40px] p-4 md:p-8 shadow-2xl relative overflow-hidden">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 font-black italic text-xl gap-4">
              <Trophy size={40} className="animate-bounce text-gray-700" />
              DECRYPTING SERVER DATA...
            </div>
          ) : leaders.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 font-black text-sm tracking-widest">
              NO COMBAT DATA FOUND
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 pb-10">
              {leaders.map((player, idx) => {
                const rankInfo = getRankTier(player.wins);

                return (
                  <div
                    key={player._id || idx}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-transform hover:scale-[1.01] ${idx === 0 ? "bg-[#ff8c32]/10 border-2 border-[#ff8c32]/50" : idx === 1 ? "bg-gray-300/10 border border-gray-300/30" : idx === 2 ? "bg-amber-700/10 border border-amber-700/30" : "bg-white/5 border border-white/5 hover:bg-white/10"}`}
                  >
                    {/* Rank Number & Avatar */}
                    <div className="flex items-center gap-4 md:gap-6">
                      <div
                        className={`w-10 text-center font-black italic text-2xl md:text-3xl ${idx === 0 ? "text-[#ff8c32]" : idx === 1 ? "text-gray-300" : idx === 2 ? "text-amber-600" : "text-gray-600"}`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="relative">
                        <img
                          src={player.avatar || "/zoro.svg"}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/10 bg-black"
                          alt=""
                        />
                        {idx === 0 && (
                          <Crown
                            size={18}
                            className="absolute -top-3 left-1/2 -translate-x-1/2 text-[#ff8c32] drop-shadow-md"
                          />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-sm md:text-lg font-black italic truncate max-w-[120px] md:max-w-[200px] ${idx === 0 ? "text-[#ff8c32]" : "text-white"}`}
                        >
                          {player.username}
                        </div>
                        <div
                          className={`text-[8px] md:text-[10px] font-black tracking-widest ${rankInfo.color}`}
                        >
                          {rankInfo.title}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 md:gap-8 text-right">
                      <div className="hidden sm:block">
                        <div className="text-[8px] font-black text-gray-500 tracking-widest mb-1">
                          WIN RATE
                        </div>
                        <div className="text-sm font-black text-white">
                          {player.totalGames > 0
                            ? Math.round(
                                (player.wins / player.totalGames) * 100,
                              )
                            : 0}
                          %
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] font-black text-[#ff8c32] tracking-widest mb-1">
                          VICTORIES
                        </div>
                        <div className="text-xl md:text-2xl font-black italic text-white leading-none">
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
