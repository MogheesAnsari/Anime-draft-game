import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, Zap, ShieldCheck, AlertTriangle } from "lucide-react";
import api from "../../services/api";

export default function Shop({ user, setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const shopItems = [
    {
      id: "pack_bronze",
      name: "ROOKIE SCOUT",
      type: "PACK",
      cost: 500,
      desc: "Guarantees 3 A-Tier Players",
    },
    {
      id: "pack_gold",
      name: "ELITE DRAFT",
      type: "PACK",
      cost: 1500,
      desc: "Guarantees 1 S-Tier Player",
    },
    {
      id: "item_skip",
      name: "DRAFT SKIP",
      type: "BOOST",
      cost: 200,
      desc: "Adds +1 Skip to your next Draft",
    },
  ];

  const handlePurchase = async (item) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 🛡️ Secure Server Transaction
      const response = await api.post("/shop/buy", {
        itemId: item.id,
        cost: item.cost,
        name: item.name,
      });

      // Update global UI state
      if (setUser && response.data) {
        setUser((prev) => ({
          ...prev,
          coins: response.data.newBalance,
          inventory: response.data.newInventory,
        }));
      }

      setSuccess(`${item.name} SECURED!`);
    } catch (err) {
      setError(err.response?.data?.message || "TRANSACTION DECLINED.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#030305] text-white p-6 font-black uppercase italic overflow-y-auto relative pb-32">
      <div className="max-w-6xl mx-auto pt-10">
        <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-5xl md:text-7xl text-yellow-500 tracking-tighter drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
              BLACK MARKET
            </h1>
            <p className="text-gray-500 tracking-widest mt-2 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> SECURE
              SERVER CONNECTION
            </p>
          </div>
          <div className="text-right bg-black/60 border border-white/10 px-6 py-3 rounded-2xl shadow-xl">
            <div className="text-xs text-gray-500 tracking-widest">
              YOUR BALANCE
            </div>
            <div className="text-3xl md:text-4xl text-yellow-400">
              {user?.coins || 0}{" "}
              <span className="text-sm text-gray-500">C</span>
            </div>
          </div>
        </div>

        {/* ALERTS HUD */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-red-900/40 border border-red-500 text-red-400 p-4 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle size={20} /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-emerald-900/40 border border-emerald-500 text-emerald-400 p-4 rounded-xl flex items-center gap-3"
            >
              <Zap size={20} className="fill-emerald-400" /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shopItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -10 }}
              className="bg-[#0a0a0c] border-2 border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-yellow-500/50 transition-colors"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all" />

              <div className="relative z-10">
                <div className="text-xs text-gray-500 tracking-widest mb-4 border border-gray-700 inline-block px-3 py-1 rounded-full">
                  {item.type}
                </div>
                <h3 className="text-2xl md:text-3xl text-white mb-2">
                  {item.name}
                </h3>
                <p className="text-xs normal-case not-italic text-gray-400 font-medium">
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => handlePurchase(item)}
                disabled={loading}
                className="mt-8 w-full bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-xl text-lg tracking-widest flex justify-between items-center px-6 transition-all disabled:opacity-50 relative z-10"
              >
                <span>SECURE</span>
                <span>{item.cost} C</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => navigate("/modes")}
          className="bg-black/80 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full text-xs tracking-widest flex items-center gap-2 hover:bg-white/10 transition-colors shadow-2xl"
        >
          <Home size={16} /> RETURN TO HUB
        </button>
      </div>
    </div>
  );
}
