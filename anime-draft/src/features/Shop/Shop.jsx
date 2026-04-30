import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Crosshair,
  RefreshCw,
  Coins,
  Gem,
  Swords,
  Trophy,
} from "lucide-react";
import api from "../../services/api";

export default function Shop({ user, setUser }) {
  const navigate = useNavigate();
  // 🚀 FIXED: Added Top-Level Domain Toggle (Anime vs Sports)
  const [activeDomain, setActiveDomain] = useState("ANIME");
  const [activeTab, setActiveTab] = useState("TACTICAL");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const xpPass = user?.inventory?.find((i) => i.id === "pass_xp");
    if (!xpPass || !xpPass.acquiredAt) return;

    const interval = setInterval(() => {
      const expires =
        new Date(xpPass.acquiredAt).getTime() + 24 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        clearInterval(interval);
      } else {
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor(diff / 1000 / 60) % 60;
        const s = Math.floor(diff / 1000) % 60;
        setTimeLeft(`${h}H ${m}M ${s}S`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.inventory]);

  // 🚀 FIXED: Deeply separated the item structures by DOMAIN
  const inventoryDb = {
    ANIME: {
      RECRUITMENT: [
        {
          id: "pack_gold",
          name: "ELITE SUMMON",
          type: "PACK",
          domain: "anime",
          cost: 1500,
          currency: "coins",
          desc: "High-Value Anime Draft. S-Tier Guarantee.",
          color: "border-yellow-500",
          glow: "group-hover:bg-yellow-500/20",
        },
        {
          id: "pack_legendary",
          name: "MYTHIC DROP",
          type: "PACK",
          domain: "anime",
          cost: 50,
          currency: "gems",
          desc: "Guarantees 1 S+ Tier Multiverse Legend.",
          color: "border-purple-500",
          glow: "group-hover:bg-purple-500/20",
        },
      ],
      TACTICAL: [
        {
          id: "boost_skip_anime",
          name: "DRAFT OVERRIDE",
          type: "BOOST",
          domain: "anime",
          cost: 2,
          currency: "gems",
          desc: "Adds +1 Skip to your next tactical draft.",
          color: "border-blue-500",
          glow: "group-hover:bg-blue-500/20",
        },
        {
          id: "boost_iq",
          name: "IQ OVERCLOCK",
          type: "BOOST",
          domain: "anime",
          cost: 15,
          currency: "gems",
          desc: "Max out an Anime unit's IQ (Capped at 250 Limit).",
          color: "border-cyan-500",
          glow: "group-hover:bg-cyan-500/20",
        },
        {
          id: "boost_atk",
          name: "STRENGTH STIM",
          type: "BOOST",
          domain: "anime",
          cost: 800,
          currency: "coins",
          desc: "Temporary +10 ATK to your frontline.",
          color: "border-red-500",
          glow: "group-hover:bg-red-500/20",
        },
      ],
    },
    SPORTS: {
      RECRUITMENT: [
        {
          id: "pack_sports_elite",
          name: "PRO SCOUT",
          type: "PACK",
          domain: "sports",
          cost: 1200,
          currency: "coins",
          desc: "Guarantees World-Class Sports Talent.",
          color: "border-emerald-500",
          glow: "group-hover:bg-emerald-500/20",
        },
      ],
      TACTICAL: [
        {
          id: "boost_skip_sports",
          name: "SCOUT RE-ROLL",
          type: "BOOST",
          domain: "sports",
          cost: 2,
          currency: "gems",
          desc: "Allows you to bypass one Sports Draft Option.",
          color: "border-blue-400",
          glow: "group-hover:bg-blue-400/20",
        },
        {
          id: "boost_sports_power",
          name: "ADRENALINE SHOT",
          type: "BOOST",
          domain: "sports",
          cost: 800,
          currency: "coins",
          desc: "Temporary +10 to Power/Shooting/Batting stats.",
          color: "border-orange-500",
          glow: "group-hover:bg-orange-500/20",
        },
        {
          id: "boost_sports_tactics",
          name: "PLAYBOOK UPLOAD",
          type: "BOOST",
          domain: "sports",
          cost: 15,
          currency: "gems",
          desc: "Max out a Sports unit's Tactical awareness.",
          color: "border-teal-500",
          glow: "group-hover:bg-teal-500/20",
        },
      ],
    },
    GLOBAL: {
      BANK: [
        {
          id: "exchange_gem",
          name: "GEM REFINERY",
          type: "EXCHANGE",
          domain: "global",
          cost: 5000,
          currency: "coins",
          desc: "Convert 5,000 Coins into 1 Premium Gem.",
          color: "border-pink-500",
          glow: "group-hover:bg-pink-500/20",
        },
        {
          id: "pass_xp",
          name: "DOUBLE XP CHIP",
          type: "PASS",
          domain: "global",
          cost: 10,
          currency: "gems",
          desc: "Double Commander XP yields for 24 Hours (All Modes).",
          color: "border-amber-500",
          glow: "group-hover:bg-amber-500/20",
        },
      ],
    },
  };

  const currentCategoryOptions =
    activeTab === "BANK"
      ? inventoryDb.GLOBAL.BANK
      : inventoryDb[activeDomain]?.[activeTab] || [];

  const handlePurchase = async (item) => {
    setLoading(true);
    setFeedback({ type: "", msg: "" });

    try {
      const response = await api.post("/shop/buy", {
        username: user.username,
        itemId: item.id,
        cost: item.cost,
        currency: item.currency,
        name: item.name,
        type: item.type,
        domain: item.domain, // 🚀 Backend now knows the exact domain of the item
      });

      if (setUser && response.data) {
        const updatedInventory = response.data.newInventory.map((invItem) => {
          if (
            invItem.id === item.id &&
            item.type === "PASS" &&
            !invItem.acquiredAt
          ) {
            return { ...invItem, acquiredAt: new Date().toISOString() };
          }
          return invItem;
        });

        setUser((prev) => ({
          ...prev,
          coins: response.data.newBalance.coins,
          gems: response.data.newBalance.gems,
          inventory: updatedInventory,
        }));
      }

      setFeedback({
        type: "success",
        msg: `[${item.name}] SUCCESSFULLY ACQUIRED.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err.response?.data?.error || "TRANSACTION DECLINED.",
      });
    } finally {
      setLoading(false);
    }
  };

  const bgStyle =
    activeDomain === "ANIME"
      ? "from-[#ff8c32]/5 to-[#030305]"
      : "from-emerald-500/5 to-[#030305]";

  return (
    <div
      className={`min-h-screen bg-[#030305] text-white p-4 md:p-8 font-black uppercase italic overflow-y-auto relative pb-32 transition-colors duration-700`}
    >
      <div
        className={`fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${bgStyle} via-[#030305]`}
      />

      <div className="max-w-7xl mx-auto pt-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600 tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              BLACK{" "}
              <span
                className={
                  activeDomain === "ANIME"
                    ? "text-[#ff8c32]"
                    : "text-emerald-500"
                }
              >
                MARKET
              </span>
            </h1>
            <p className="text-[10px] text-gray-500 tracking-[0.4em] mt-2 flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-500" /> MULTIVERSE
              ENCRYPTION ACTIVE
            </p>
          </div>

          <div className="flex gap-4 bg-black/60 border border-white/10 p-4 rounded-3xl shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col items-end px-4 border-r border-white/10">
              <div className="text-[8px] text-gray-500 tracking-widest mb-1">
                COIN RESERVE
              </div>
              <div className="text-2xl md:text-3xl text-yellow-400 flex items-center gap-2">
                {user?.coins || 0}{" "}
                <Coins size={18} className="text-yellow-500/50" />
              </div>
            </div>
            <div className="flex flex-col items-end px-4">
              <div className="text-[8px] text-gray-500 tracking-widest mb-1">
                GEM STASH
              </div>
              <div className="text-2xl md:text-3xl text-purple-400 flex items-center gap-2">
                {user?.gems || 0}{" "}
                <Gem size={18} className="text-purple-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 FIXED: Domain Toggle Buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/80 border border-white/10 rounded-full p-1.5 flex gap-2 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => {
                setActiveDomain("ANIME");
                setActiveTab("TACTICAL");
              }}
              className={`px-8 py-3 rounded-full text-xs tracking-widest transition-all flex items-center gap-2 ${activeDomain === "ANIME" ? "bg-[#ff8c32] text-black shadow-[0_0_20px_rgba(255,140,50,0.4)]" : "text-gray-500 hover:text-white"}`}
            >
              <Swords size={16} /> ANIME SECTOR
            </button>
            <button
              onClick={() => {
                setActiveDomain("SPORTS");
                setActiveTab("TACTICAL");
              }}
              className={`px-8 py-3 rounded-full text-xs tracking-widest transition-all flex items-center gap-2 ${activeDomain === "SPORTS" ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.4)]" : "text-gray-500 hover:text-white"}`}
            >
              <Trophy size={16} /> SPORTS SECTOR
            </button>
          </div>
        </div>

        <AnimatePresence>
          {feedback.msg && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 text-xs tracking-widest ${feedback.type === "success" ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)]" : "bg-red-900/30 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"}`}
            >
              {feedback.type === "success" ? (
                <Zap size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}{" "}
              {feedback.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { id: "TACTICAL", icon: <Crosshair size={16} /> },
            { id: "RECRUITMENT", icon: <Sparkles size={16} /> },
            { id: "BANK", icon: <RefreshCw size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-8 py-3 rounded-full text-[10px] tracking-[0.3em] transition-all border ${activeTab === tab.id ? "bg-white/20 text-white border-white/50 shadow-lg" : "bg-transparent text-gray-600 border-white/5 hover:bg-white/5 hover:text-white"}`}
            >
              {tab.icon} {tab.id}
            </button>
          ))}
        </div>

        <motion.div
          key={`${activeDomain}-${activeTab}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {currentCategoryOptions.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-600 border-2 border-dashed border-white/5 rounded-[32px]">
              NO STOCK AVAILABLE IN THIS SECTOR
            </div>
          ) : (
            currentCategoryOptions.map((item) => {
              const ownsPass =
                item.type === "PASS" &&
                user?.inventory?.some((i) => i.id === item.id);

              return (
                <div
                  key={item.id}
                  className={`group bg-[#0a0a0c]/80 backdrop-blur-md border-2 ${ownsPass ? "border-emerald-500/50 opacity-90" : `${item.color}/30 hover:${item.color}`} rounded-[32px] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-500`}
                >
                  {!ownsPass && (
                    <div
                      className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${item.glow.replace("group-hover:", "")}`}
                    />
                  )}

                  <div className="relative z-10">
                    <div
                      className={`text-[8px] tracking-[0.4em] mb-4 border flex items-center gap-2 w-fit ${ownsPass ? "border-emerald-500/50 text-emerald-400 bg-emerald-900/30" : `${item.color}/50 text-gray-400 bg-black/50`} px-3 py-1 rounded-full`}
                    >
                      {ownsPass ? "ACTIVE BUFF" : item.type}
                      {item.domain !== "global" && (
                        <span className="opacity-50 text-[6px]">
                          [{item.domain}]
                        </span>
                      )}
                    </div>
                    <h3
                      className={`text-2xl md:text-3xl mb-3 leading-none ${ownsPass ? "text-emerald-400" : "text-white"}`}
                    >
                      {item.name}
                    </h3>
                    <p className="text-[10px] normal-case not-italic text-gray-400 font-bold leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={loading || ownsPass}
                    className={`mt-10 w-full bg-black/50 border ${ownsPass ? "border-emerald-500/50 text-emerald-400 bg-emerald-900/20" : `${item.color}/50 group-hover:bg-white text-gray-300 group-hover:text-black`} py-4 rounded-2xl text-xs tracking-[0.2em] flex justify-between items-center px-6 transition-all duration-300 disabled:opacity-50 relative z-10 overflow-hidden`}
                  >
                    <span>
                      {ownsPass ? `ACTIVE (${timeLeft})` : "INITIATE"}
                    </span>
                    {!ownsPass && (
                      <span className="flex items-center gap-1 font-sans">
                        {item.cost}{" "}
                        {item.currency === "coins" ? (
                          <Coins size={14} />
                        ) : (
                          <Gem size={14} />
                        )}
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </motion.div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => navigate("/modes")}
          className="bg-[#111113]/90 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-full text-[10px] tracking-[0.3em] flex items-center gap-3 hover:bg-white/10 hover:border-white/40 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
        >
          <Home size={16} /> RETURN TO TERMINAL
        </button>
      </div>
    </div>
  );
}
