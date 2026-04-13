import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trophy, Medal, Swords } from "lucide-react";

export default function Leaderboard({ onBack }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Assuming your backend has a leaderboard route
        const res = await axios.get(
          "https://anime-draft-game-1.onrender.com/api/leaderboard",
        );
        // Backend returns array like: [{ username: 'A', wins: 10, totalGames: 12 }, ...]
        setLeaders(res.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans uppercase min-h-screen">
      <header className="flex justify-between items-center py-6 border-b border-white/5 mb-10">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-yellow-400 flex items-center gap-3">
            <Trophy size={36} /> GLOBAL RANKINGS.
          </h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1">
            THE STRONGEST COMMANDERS
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-all"
        >
          ← BACK TO ARENA
        </button>
      </header>

      {loading ? (
        <div className="text-center py-20 text-yellow-400 font-black italic tracking-widest text-xs animate-pulse">
          FETCHING GLOBAL SIGNATURES...
        </div>
      ) : (
        <div className="bg-[#111113] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/5 bg-black/40 text-[10px] text-gray-500 font-black tracking-widest">
            <div className="col-span-1">RANK</div>
            <div className="col-span-1">COMMANDER</div>
            <div className="col-span-1 text-center">WINS</div>
            <div className="col-span-1 text-center">WIN RATE</div>
          </div>

          <div className="p-6 space-y-4">
            {leaders.length > 0 ? (
              leaders.map((player, idx) => {
                const winRate =
                  player.totalGames > 0
                    ? Math.round((player.wins / player.totalGames) * 100)
                    : 0;

                // Top 3 colors
                const rankColor =
                  idx === 0
                    ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/5"
                    : idx === 1
                      ? "text-gray-300 border-gray-300/20 bg-gray-300/5"
                      : idx === 2
                        ? "text-[#cd7f32] border-[#cd7f32]/20 bg-[#cd7f32]/5"
                        : "text-white border-white/5 bg-black/40";

                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-4 gap-4 items-center p-5 border rounded-2xl ${rankColor} transition-all hover:scale-[1.01]`}
                  >
                    <div className="col-span-1 font-black italic text-2xl flex items-center gap-2">
                      #{idx + 1} {idx < 3 && <Medal size={20} />}
                    </div>
                    <div className="col-span-1 font-black truncate">
                      {player.username}
                    </div>
                    <div className="col-span-1 text-center font-black italic text-xl">
                      {player.wins}
                    </div>
                    <div className="col-span-1 text-center font-bold text-xs">
                      {winRate}%
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-gray-700 font-black italic tracking-widest text-xs">
                NO COMMANDERS FOUND IN DATABASE
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
