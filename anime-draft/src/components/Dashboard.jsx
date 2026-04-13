import React from "react";

export default function Dashboard({ stats }) {
  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[32px] shadow-lg hover:border-orange-500/50 transition-colors">
          <p className="text-[10px] text-slate-500 font-black tracking-widest mb-2 uppercase">
            Total Wins
          </p>
          <p className="text-5xl font-black italic text-orange-500">
            {stats.wins}
          </p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[32px] shadow-lg hover:border-blue-500/50 transition-colors">
          <p className="text-[10px] text-slate-500 font-black tracking-widest mb-2 uppercase">
            Win Rate
          </p>
          <p className="text-5xl font-black italic text-blue-400">
            {stats.total > 0
              ? ((stats.wins / stats.total) * 100).toFixed(0)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Match History Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] p-8 shadow-lg">
        <h3 className="font-black italic text-xl mb-6 tracking-tight uppercase">
          Match History
        </h3>

        {stats.history.length === 0 ? (
          <p className="text-slate-600 font-bold text-xs tracking-widest text-center py-10 uppercase">
            No battles recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {stats.history.map((h, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 hover:bg-white/5 px-4 rounded-xl transition-colors"
              >
                <span
                  className={`text-sm ${h.won ? "text-green-500 font-black" : "text-red-500 font-black"}`}
                >
                  {h.won ? "VICTORY" : "DEFEAT"}
                </span>
                <span className="font-black italic text-slate-300">
                  {h.score} PWR
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
