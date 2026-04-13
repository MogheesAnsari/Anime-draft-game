import React from "react";

export default function Dashboard({ user, onBack }) {
  return (
    <div className="p-6 max-w-5xl mx-auto font-sans uppercase">
      {/* Header */}
      <header className="flex justify-between items-center py-6 border-b border-white/5 mb-10">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-[#ff8c32]">
            PLAYER PROFILE.
          </h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1">
            COMMANDER: {user.username}
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-[#ff8c32] hover:text-black transition-all"
        >
          ← BACK TO ARENA
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#111113] border border-white/5 p-8 rounded-[32px] text-center">
          <p className="text-[10px] text-gray-500 font-black mb-2 tracking-widest">
            TOTAL WINS
          </p>
          <p className="text-5xl font-black text-[#ff8c32] italic">
            {user.wins || 0}
          </p>
        </div>
        <div className="bg-[#111113] border border-white/5 p-8 rounded-[32px] text-center">
          <p className="text-[10px] text-gray-500 font-black mb-2 tracking-widest">
            TOTAL GAMES
          </p>
          <p className="text-5xl font-black text-white italic">
            {user.totalGames || 0}
          </p>
        </div>
        <div className="bg-[#111113] border border-white/5 p-8 rounded-[32px] text-center">
          <p className="text-[10px] text-gray-500 font-black mb-2 tracking-widest">
            WIN RATE
          </p>
          <p className="text-5xl font-black text-blue-500 italic">
            {user.totalGames > 0
              ? Math.round((user.wins / user.totalGames) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Battle History Table */}
      <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8">
        <h2 className="text-xl font-black italic text-white mb-6 tracking-widest">
          RECENT ENGAGEMENTS
        </h2>
        <div className="space-y-4">
          {user.fullHistory && user.fullHistory.length > 0 ? (
            user.fullHistory.map((battle, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-5 bg-black/40 border border-white/5 rounded-2xl"
              >
                <div>
                  <p
                    className={`text-xs font-black italic ${battle.won ? "text-green-500" : "text-red-500"}`}
                  >
                    {battle.won ? "VICTORY" : "DEFEAT"}
                  </p>
                  <p className="text-[10px] text-gray-600 font-bold mt-1">
                    DATE: {new Date(battle.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-white italic">
                    SCORE: {battle.score}
                  </p>
                  <p className="text-[10px] text-gray-600 font-bold mt-1">
                    MODE: {battle.mode?.toUpperCase()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-gray-700 font-black italic tracking-widest text-xs uppercase">
                No combat logs found in the system
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
