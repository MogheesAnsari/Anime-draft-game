import React, { useState, useEffect } from "react";
import { api } from "../engine";
import { Trophy, ArrowLeft } from "lucide-react";

export default function Leaderboard({ onBack }) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await api.getLeaderboard();
        setRankings(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6 flex flex-col items-center uppercase font-sans">
      <div className="w-full max-w-4xl flex justify-between items-center mb-12">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-black italic"
        >
          <ArrowLeft size={16} /> BACK TO LOBBY
        </button>
        <h2 className="text-3xl font-black italic text-[#ff8c32] tracking-tighter">
          GLOBAL RANKINGS
        </h2>
        <div className="w-20"></div>
      </div>

      <div className="w-full max-w-2xl bg-[#111113] border border-white/5 rounded-[32px] overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-500 font-black animate-pulse">
            LOADING RANKINGS...
          </div>
        ) : (
          <div className="flex flex-col">
            {rankings.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-6 border-b border-white/5 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-6">
                  <span
                    className={`text-2xl font-black italic ${index === 0 ? "text-yellow-400" : "text-gray-700"}`}
                  >
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-black italic text-lg text-white">
                      {player.username}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold">
                      GAMES: {player.totalGames}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black italic text-orange-500">
                    {player.wins} WINS
                  </p>
                  <p className="text-[10px] text-gray-600 font-bold">
                    WIN RATE:{" "}
                    {Math.round((player.wins / player.totalGames) * 100)}%
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
