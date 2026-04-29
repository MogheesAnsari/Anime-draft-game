import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Monitor, Users, Swords, Gavel } from "lucide-react";

export default function ModeSelection({ user }) {
  const navigate = useNavigate();

  const modes = [
    {
      id: "PVE",
      name: "PLAYER VS CPU",
      desc: "Test your squad against a high-tier bot.",
      icon: <Monitor size={32} />,
      color:
        "border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 text-blue-400",
      action: () => navigate("/domain", { state: { mode: "PVE" } }),
    },
    {
      id: "PVP",
      name: "PLAYER VS PLAYER",
      desc: "1v1 local or online tactical clash.",
      icon: <User size={32} />,
      color:
        "border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-500/10 text-emerald-400",
      action: () => navigate("/domain", { state: { mode: "PVP" } }),
    },
    {
      id: "AUCTION",
      name: "ANIME AUCTION",
      desc: "Bid on cards. Build a squad. Smart CPU.",
      icon: <Gavel size={32} />,
      color:
        "border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-500/10 text-yellow-400",
      // 🚀 FIXED: Now routes to Universe Selection first!
      action: () => navigate("/domain", { state: { mode: "AUCTION" } }),
    },
    {
      id: "TEAM BATTLE",
      name: "TEAM BATTLE",
      desc: "2v2 Co-op. Combine your synergies.",
      icon: <Users size={32} />,
      color:
        "border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 text-purple-400",
      action: () => navigate("/domain", { state: { mode: "TEAM BATTLE" } }),
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center pt-24 pb-32 px-4 uppercase font-sans selection:bg-[#ff8c32] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
      </div>

      <div className="text-center mb-12 md:mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[10px] md:text-xs font-black text-gray-400 tracking-[0.3em] mb-4 shadow-lg backdrop-blur-sm"
        >
          COMMANDER: <span className="text-[#ff8c32]">{user?.username}</span>
        </motion.div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          SELECT DIRECTIVE
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-5xl relative z-10 px-2 md:px-0">
        {modes.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            onClick={mode.action}
            className={`group relative bg-[#0a0a0c]/80 backdrop-blur-md border-[2px] p-6 md:p-8 rounded-[32px] text-left overflow-hidden transition-all duration-300 ${mode.color} shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
          >
            <div className="flex items-center gap-5 md:gap-6 relative z-10">
              <div className="p-4 bg-black/60 rounded-2xl border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                {mode.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-black italic uppercase text-white leading-none mb-2">
                  {mode.name}
                </h3>
                <p className="text-[10px] md:text-xs text-gray-400 normal-case font-bold tracking-wide leading-tight">
                  {mode.desc}
                </p>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-white pointer-events-none transform group-hover:rotate-12 duration-500">
              {mode.icon}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
