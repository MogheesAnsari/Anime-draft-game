import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Gem,
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  PackageSearch,
  TrendingUp,
} from "lucide-react";
import { ARTIFACTS } from "../Draft/Anime/utils/draftUtils";

export default function Shop() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState("ARTIFACTS");

  // Load Currency and Inventory
  useEffect(() => {
    const updateStats = () => {
      setCoins(parseInt(localStorage.getItem("user_coins") || "0"));
      setGems(parseInt(localStorage.getItem("user_gems") || "0"));
      const savedInv = localStorage.getItem("animeDraft_inventory");
      if (savedInv) setInventory(JSON.parse(savedInv));
    };
    updateStats();
    window.addEventListener("storage", updateStats);
    return () => window.removeEventListener("storage", updateStats);
  }, []);

  const buyArtifact = (item, price) => {
    if (coins < price) {
      alert("INSUFFICIENT FUNDS! DEPLOY MORE SQUADS.");
      return;
    }

    const newCoins = coins - price;
    const newInventory = [...inventory, item];

    setCoins(newCoins);
    setInventory(newInventory);
    localStorage.setItem("user_coins", newCoins);
    localStorage.setItem("animeDraft_inventory", JSON.stringify(newInventory));
  };

  const hasItem = (itemName) => inventory.some((i) => i.name === itemName);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 uppercase font-sans selection:bg-[#ff8c32] overflow-x-hidden">
      {/* 🌌 Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#ff8c32_0%,_transparent_70%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 border-b border-white/5 pb-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <button
              onClick={() => navigate("/modes")}
              className="group flex items-center gap-2 text-gray-500 hover:text-[#ff8c32] transition-colors text-[10px] font-black tracking-widest"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />{" "}
              TERMINATE_SHOPPING
            </button>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
              BLACK
              <span className="text-[#ff8c32] drop-shadow-[0_0_30px_rgba(255,140,50,0.5)]">
                MARKET
              </span>
            </h1>
          </div>

          {/* Currency HUD */}
          <div className="flex gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-yellow-500/5 border border-yellow-500/20 px-8 py-4 rounded-[24px] flex flex-col items-center shadow-[0_0_40px_rgba(234,179,8,0.05)]"
            >
              <span className="text-[8px] font-black text-yellow-500/50 mb-1 tracking-[0.3em]">
                SPIRIT_COINS
              </span>
              <div className="flex items-center gap-3 text-2xl md:text-4xl font-black text-yellow-400">
                <Coins size={28} /> {coins}
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-purple-500/5 border border-purple-500/20 px-8 py-4 rounded-[24px] flex flex-col items-center shadow-[0_0_40px_rgba(168,85,247,0.05)]"
            >
              <span className="text-[8px] font-black text-purple-500/50 mb-1 tracking-[0.3em]">
                COSMIC_GEMS
              </span>
              <div className="flex items-center gap-3 text-2xl md:text-4xl font-black text-purple-400">
                <Gem size={28} /> {gems}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          {["ARTIFACTS", "LOOT_BOX", "SKINS"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full text-[10px] font-black tracking-widest transition-all border ${activeTab === tab ? "bg-[#ff8c32] text-black border-[#ff8c32] shadow-[0_0_20px_rgba(255,140,50,0.3)]" : "bg-white/5 text-gray-500 border-white/5 hover:border-white/20"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {activeTab === "ARTIFACTS" && (
            <motion.div
              key="artifacts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {ARTIFACTS.map((item, idx) => {
                const owned = hasItem(item.name);
                const price = 500 + idx * 150; // Dynamic pricing logic

                return (
                  <div
                    key={idx}
                    className={`group relative bg-[#0a0a0c] border-2 rounded-[32px] p-8 flex flex-col items-center transition-all ${owned ? "border-green-500/30 opacity-70" : "border-white/5 hover:border-[#ff8c32]"}`}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-6 right-6">
                      {owned ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Lock size={18} className="text-gray-700" />
                      )}
                    </div>

                    <div
                      className={`p-6 rounded-full mb-6 ${owned ? "bg-green-500/10" : "bg-[#ff8c32]/5 group-hover:bg-[#ff8c32]/20"} transition-all`}
                    >
                      <Sparkles
                        size={40}
                        className={owned ? "text-green-500" : "text-[#ff8c32]"}
                      />
                    </div>

                    <h3 className="text-2xl font-black italic mb-2 tracking-tighter text-center">
                      {item.name}
                    </h3>
                    <div className="text-[9px] font-black text-gray-500 mb-6 bg-white/5 px-4 py-1 rounded-full">
                      {item.effect.replace("_", " ")}
                    </div>

                    <p className="text-[11px] text-gray-400 text-center leading-relaxed mb-8 flex-1">
                      {item.desc}
                    </p>

                    {owned ? (
                      <div className="w-full py-4 bg-green-500/10 border border-green-500/20 text-green-500 font-black text-xs rounded-2xl flex justify-center items-center gap-2">
                        EQUIPPED IN DRAFT
                      </div>
                    ) : (
                      <button
                        onClick={() => buyArtifact(item, price)}
                        className="w-full py-4 bg-yellow-500 text-black font-black text-sm rounded-2xl flex justify-center items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(234,179,8,0.1)]"
                      >
                        <Coins size={18} /> {price}
                      </button>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "LOOT_BOX" && (
            <motion.div
              key="loot"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[50px] border-2 border-dashed border-white/10"
            >
              <PackageSearch
                size={80}
                className="text-[#ff8c32] mb-6 animate-bounce"
              />
              <h2 className="text-4xl font-black italic mb-4">
                LEGENDARY CRATE
              </h2>
              <p className="text-gray-500 text-sm mb-10 max-w-md text-center">
                Contains a 15% chance for a Mythic Artifact and 100% chance for
                a random item.
              </p>
              <button className="px-12 py-5 bg-purple-600 text-white font-black italic text-xl rounded-3xl flex items-center gap-4 hover:bg-purple-500 transition-colors shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                <Gem size={24} /> 10 GEMS TO OPEN
              </button>
            </motion.div>
          )}

          {activeTab === "SKINS" && (
            <div className="flex flex-col items-center justify-center py-32 opacity-30 italic font-black text-4xl">
              COMMING_SOON_...
            </div>
          )}
        </AnimatePresence>

        {/* Footer Stats Info */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-20 text-gray-500">
          <div className="flex items-center gap-3">
            <Zap size={16} />{" "}
            <span className="text-[10px] font-black tracking-widest">
              REAL-TIME MATH SYSTEM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp size={16} />{" "}
            <span className="text-[10px] font-black tracking-widest">
              DYNAMIC PRICING
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
