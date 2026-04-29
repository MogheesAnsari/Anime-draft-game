import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BrainCircuit, ShieldAlert, Skull, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AuctionDifficulty() {
  const navigate = useNavigate();
  const { state } = useLocation(); // Receives the universe from previous step

  const difficulties = [
    {
      id: "EASY",
      label: "NOVICE CPU",
      desc: "Random bids. Random team selection. Best for learning the auction.",
      icon: <BrainCircuit size={40} />,
      color: "from-blue-500 to-cyan-600",
      border: "border-blue-500/50 hover:border-blue-400",
    },
    {
      id: "MEDIUM",
      label: "VETERAN CPU",
      desc: "Calculated bids based on tiers. Will try to build a decent squad.",
      icon: <ShieldAlert size={40} />,
      color: "from-orange-500 to-red-600",
      border: "border-orange-500/50 hover:border-orange-400",
    },
    {
      id: "HARD",
      label: "SUPREME AI",
      desc: "Aggressive bidding on S+ cards. Perfect synergy team building.",
      icon: <Skull size={40} />,
      color: "from-purple-600 to-pink-700",
      border: "border-purple-500/50 hover:border-purple-400",
    },
  ];

  const selectDifficulty = (diffId) => {
    localStorage.removeItem("auction_temp_roster");
    navigate("/auction-room", {
      state: { ...state, difficulty: diffId },
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] flex flex-col items-center justify-center p-6 uppercase font-sans relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-500/5 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <button
        onClick={() => navigate("/modes")}
        className="absolute top-8 left-8 flex items-center gap-2 text-[10px] text-gray-500 hover:text-white font-black tracking-widest transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-full z-20"
      >
        <ArrowLeft size={14} /> ABORT AUCTION
      </button>

      <div className="text-center mb-12 relative z-10 mt-16">
        <h2 className="text-4xl md:text-6xl font-black italic text-white tracking-tighter drop-shadow-lg mb-2">
          AUCTION <span className="text-yellow-500">DIFFICULTY</span>
        </h2>
        <p className="text-[10px] md:text-xs text-gray-400 font-black tracking-[0.3em]">
          SELECT YOUR OPPONENT'S INTELLIGENCE LEVEL
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl relative z-10">
        {difficulties.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring" }}
            onClick={() => selectDifficulty(d.id)}
            className={`group relative p-8 rounded-[40px] border-[2px] bg-[#0a0a0c]/80 backdrop-blur-md hover:-translate-y-2 transition-all duration-300 overflow-hidden shadow-xl ${d.border}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${d.color} opacity-0 group-hover:opacity-15 transition-opacity duration-500`}
            ></div>

            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div
                className={`p-5 bg-black/60 rounded-3xl border border-white/10 group-hover:scale-110 transition-transform text-white`}
              >
                {d.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black italic text-white tracking-widest mb-2">
                  {d.label}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 normal-case leading-relaxed">
                  {d.desc}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
