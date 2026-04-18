import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Trophy, ArrowLeft, Medal, Users } from "lucide-react";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await axios.get(
          "https://anime-draft-game-1.onrender.com/api/leaderboard",
        );
        setRankings(res.data);
      } catch (error) {
        console.error("RANKING_FETCH_ERROR:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  return (
    <div className="h-[100dvh] bg-[#050505] flex flex-col p-4 md:p-10 overflow-hidden font-sans uppercase">
      {/* 🛰️ HEADER BAR */}
      <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-10 shrink-0">
        <button
          onClick={() => navigate("/modes")}
          className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-[#ff8c32] transition-colors tracking-widest"
        >
          <ArrowLeft size={16} /> RETURN_LOBBY
        </button>
        <h2 className="text-3xl md:text-5xl font-black italic text-white tracking-tighter">
          GLOBAL <span className="text-[#ff8c32]">RANKINGS</span>
        </h2>
        <div className="hidden md:flex items-center gap-2 text-[#ff8c32]/50">
          <Users size={20} />
          <span className="text-[10px] font-black">LIVE_DATA</span>
        </div>
      </div>

      {/* 📊 RANKING LIST */}
      <div className="flex-1 w-full max-w-3xl mx-auto bg-[#0c0c0e] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col mb-6">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-t-[#ff8c32] border-white/5 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black tracking-[0.5em] text-gray-500">
              SYNCING_TERMINAL...
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {rankings.map((player, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-6 border-b border-white/5 transition-all hover:bg-white/2 ${
                  index < 3 ? "bg-[#ff8c32]/5" : ""
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-lg ${
                      index === 0
                        ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                        : index === 1
                          ? "bg-gray-300 text-black"
                          : index === 2
                            ? "bg-orange-600 text-black"
                            : "bg-white/5 text-gray-600"
                    }`}
                  >
                    {index + 1 === 1 ? <Medal size={20} /> : index + 1}
                  </div>

                  {/* Player Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={player.avatar || "/zoro.svg"}
                      className="w-10 h-10 rounded-full border border-white/10 object-cover"
                      alt=""
                    />
                    <div>
                      <p className="font-black italic text-white text-sm md:text-base tracking-tight">
                        {player.username}
                      </p>
                      <p className="text-[8px] text-gray-500 font-bold tracking-widest">
                        GAMES: {player.totalGames}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score Stats */}
                <div className="text-right">
                  <p className="text-xl md:text-2xl font-black italic text-[#ff8c32]">
                    {player.wins} WINS
                  </p>
                  <p className="text-[8px] text-gray-600 font-black">
                    WIN_RATE:{" "}
                    {player.totalGames > 0
                      ? Math.round((player.wins / player.totalGames) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
