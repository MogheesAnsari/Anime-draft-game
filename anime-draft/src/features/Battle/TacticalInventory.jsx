import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api"; // 🛡️ USING CENTRAL API SERVICE
import {
  Briefcase,
  X,
  Zap,
  Brain,
  FastForward,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function TacticalInventory({ user, setUser, onDeployBoost }) {
  const [isOpen, setIsOpen] = useState(false);
  const [consumingItem, setConsumingItem] = useState(null);
  const [feedback, setFeedback] = useState("");

  // 🎒 Grouping items from the database inventory
  const groupedBoosts = useMemo(() => {
    const combatBoosts =
      user?.inventory?.filter(
        (item) => item?.id?.includes("boost") || item?.type === "BOOST",
      ) || [];
    const grouped = combatBoosts.reduce((acc, item) => {
      if (!acc[item.id]) acc[item.id] = { ...item, count: 0 };
      acc[item.id].count += 1;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [user?.inventory]);

  const handleConsumeItem = async (item) => {
    setConsumingItem(item.id);
    setFeedback("");

    try {
      // 🛡️ THE FIX: Using the central 'api' instance prevents 404 URL mistakes
      const res = await api.post("/user/consume-item", {
        username: user.username,
        itemId: item.id,
      });

      // Update global state
      setUser((prev) => ({ ...prev, inventory: res.data.newInventory }));

      // Trigger the "System Override" animation in the Arena
      onDeployBoost(item.id);

      setFeedback(`[${item.name}] DEPLOYED.`);

      setTimeout(() => {
        setFeedback("");
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Deploy Error:", err);
      setFeedback(
        err.response?.data?.error === "ITEM_NOT_FOUND_IN_INVENTORY"
          ? "ITEM ALREADY USED."
          : "🚨 KERNEL ERROR. DEPLOYMENT FAILED.",
      );
    } finally {
      setConsumingItem(null);
    }
  };

  const getBoostIcon = (id) => {
    if (id.includes("skip"))
      return <FastForward size={16} className="text-blue-400" />;
    if (id.includes("iq")) return <Brain size={16} className="text-cyan-400" />;
    if (id.includes("atk")) return <Zap size={16} className="text-red-400" />;
    return <ShieldCheck size={16} className="text-emerald-400" />;
  };

  return (
    <>
      {/* 🎒 RESPONSIVE ARMORY BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/3 md:top-1/2 -translate-y-1/2 bg-[#0a0a0c]/90 backdrop-blur-xl border-y-2 border-l-2 border-[#ff8c32]/50 text-[#ff8c32] p-2 md:p-3 rounded-l-2xl transition-all z-[8000] flex flex-col items-center gap-2 group shadow-[0_0_30px_rgba(255,140,50,0.3)] hover:pr-6"
      >
        <Briefcase
          size={24}
          className="group-hover:scale-110 transition-transform"
        />
        <span className="text-[8px] md:text-[10px] font-black tracking-widest [writing-mode:vertical-rl] group-hover:text-white transition-colors uppercase">
          ARMORY
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-[32px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0 uppercase">
                <h2 className="text-lg md:text-xl font-black italic text-white flex items-center gap-2 tracking-tighter">
                  <Briefcase size={20} className="text-[#ff8c32]" /> TACTICAL{" "}
                  <span className="text-[#ff8c32]">ARMORY</span>
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mb-4 text-[10px] font-black tracking-widest p-3 rounded-xl border flex items-center gap-2 uppercase ${feedback.includes("FAILED") || feedback.includes("ERROR") ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}`}
                  >
                    {feedback.includes("FAILED") ? (
                      <X size={14} />
                    ) : (
                      <ShieldCheck size={14} />
                    )}{" "}
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {groupedBoosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-gray-500 py-10 border border-dashed border-white/10 rounded-2xl">
                    <Briefcase size={40} className="mb-3 opacity-20" />
                    <p className="text-xs font-black tracking-widest uppercase">
                      NO TACTICAL BOOSTS DETECTED.
                    </p>
                    <p className="text-[10px] mt-1 uppercase">
                      ACQUIRE ITEMS FROM THE BLACK MARKET.
                    </p>
                  </div>
                ) : (
                  groupedBoosts.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-white/20 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 uppercase">
                          {getBoostIcon(item.id)}
                          <h3 className="text-sm font-black text-white">
                            {item.name}
                          </h3>
                          <span className="bg-[#ff8c32] text-black text-[8px] px-2 py-0.5 rounded-full font-black">
                            x{item.count}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 normal-case font-bold leading-snug">
                          {item.desc}
                        </p>
                      </div>

                      <button
                        onClick={() => handleConsumeItem(item)}
                        disabled={consumingItem === item.id}
                        className="w-full md:w-auto px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all bg-[#ff8c32] text-black hover:bg-white hover:text-black disabled:opacity-50 disabled:scale-100 active:scale-95 shrink-0 flex items-center justify-center gap-2 uppercase"
                      >
                        {consumingItem === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "DEPLOY"
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
