import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Swords, Trophy, Ghost } from "lucide-react";

const DomainSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // ✅ Receives mode from previous screen

  const domains = [
    {
      id: "anime",
      label: "ANIME REALM",
      icon: <Swords size={32} />,
      path: "/universe",
      color: "from-orange-500 to-red-600",
    },
    {
      id: "comics",
      label: "COMIC MULTIVERSE",
      icon: <Ghost size={32} />,
      path: "/universe",
      color: "from-blue-600 to-indigo-700",
    },
    {
      id: "sports",
      label: "SPORTS ARENA",
      icon: <Trophy size={32} />,
      path: "/universe",
      color: "from-green-500 to-emerald-700",
    },
  ];

  return (
    <div className="h-[100dvh] bg-[#050505] flex flex-col items-center justify-center p-6 uppercase">
      <h2 className="text-4xl md:text-6xl font-black italic text-white mb-12 tracking-tighter">
        SELECT <span className="text-orange-500">DOMAIN</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {domains.map((d) => (
          <button
            key={d.id}
            // 🚀 CRITICAL FIX: Passing existing state forward
            onClick={() =>
              navigate(d.path, { state: { ...state, domain: d.id } })
            }
            className="group relative p-10 rounded-[40px] border border-white/5 bg-white/5 hover:scale-105 transition-all overflow-hidden"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${d.color} opacity-0 group-hover:opacity-10 transition-opacity`}
            ></div>
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="p-5 bg-black/40 rounded-3xl border border-white/5 group-hover:border-white/20 transition-all text-white">
                {d.icon}
              </div>
              <span className="text-xl font-black italic tracking-widest text-white">
                {d.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DomainSelection;
