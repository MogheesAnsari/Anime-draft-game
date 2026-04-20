import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, MapPin, Skull, Zap } from "lucide-react";
import {
  calculateFinalBattleScore,
  getRoleAction,
  getRandomDomain,
  getSlotSkill,
  getRandomRaidBoss,
} from "../Draft/utils/draftUtils";

const BossArena = ({ playerTeam, artifact, onComplete }) => {
  const [phase, setPhase] = useState("INTRO");
  const [currentSlot, setCurrentSlot] = useState(0);
  const [battleDomain] = useState(getRandomDomain());

  // 🔥 BOSS LOGIC
  const [boss] = useState(getRandomRaidBoss());
  const [bossHp, setBossHp] = useState(boss.maxHp);
  const [damageDealt, setDamageDealt] = useState(0);

  const [clashText, setClashText] = useState("");
  const [roundDamage, setRoundDamage] = useState(0);
  const [rngAction, setRngAction] = useState(null);

  const SLOTS = [
    "captain",
    "vice_cap",
    "speedster",
    "tank",
    "support",
    "raw_power",
  ];

  useEffect(() => {
    let timer;
    if (phase === "INTRO")
      timer = setTimeout(() => setPhase("DOMAIN_REVEAL"), 2500);
    if (phase === "DOMAIN_REVEAL")
      timer = setTimeout(() => setPhase("BOSS_REVEAL"), 3000);
    if (phase === "BOSS_REVEAL")
      timer = setTimeout(() => setPhase("SKILL_FLASH"), 4000);

    if (phase === "SKILL_FLASH") {
      const char = playerTeam[SLOTS[currentSlot]];
      setClashText(getSlotSkill(char, SLOTS[currentSlot], false));
      timer = setTimeout(() => setPhase("ATTACK"), 2000);
    }

    if (phase === "ATTACK") {
      const char = playerTeam[SLOTS[currentSlot]];
      const action = getRoleAction(char, SLOTS[currentSlot]);
      setRngAction(action);

      // Bosses take heavy damage! We use the score as raw damage.
      const calc = calculateFinalBattleScore(
        char,
        SLOTS[currentSlot],
        battleDomain,
        artifact,
        action?.boost || 1,
        action?.text,
        false,
      );
      const damage = calc.final;
      setRoundDamage(damage);

      timer = setTimeout(() => {
        setBossHp((prev) => Math.max(0, prev - damage));
        setDamageDealt((prev) => prev + damage);
        setPhase("IMPACT");
      }, 1000);
    }

    if (phase === "IMPACT") {
      timer = setTimeout(() => {
        if (currentSlot < SLOTS.length - 1 && bossHp > 0) {
          setCurrentSlot((s) => s + 1);
          setPhase("SKILL_FLASH");
        } else {
          setPhase("FINISHER");
        }
      }, 2500);
    }

    if (phase === "FINISHER") {
      timer = setTimeout(() => {
        onComplete({
          victory: bossHp - roundDamage <= 0,
          boss: boss,
          damageDealt: damageDealt + roundDamage,
        });
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [phase, currentSlot]);

  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex flex-col items-center justify-center font-black uppercase italic overflow-hidden z-[5000]">
      {phase === "INTRO" && (
        <motion.h1
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl text-red-500 flex flex-col items-center"
        >
          <Skull size={80} className="mb-4 animate-pulse" /> BOSS RAID START
        </motion.h1>
      )}

      {phase === "DOMAIN_REVEAL" && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center px-4"
        >
          <MapPin
            size={60}
            className="mx-auto text-purple-500 mb-6 animate-bounce"
          />
          <h2 className="text-6xl drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
            {battleDomain.name}
          </h2>
          <p className="mt-4 text-purple-300 text-xl border border-purple-500/50 bg-purple-900/30 px-6 py-2 rounded-full inline-block">
            {battleDomain.buffText}
          </p>
        </motion.div>
      )}

      {/* 👹 THE MEGA BOSS REVEAL */}
      <AnimatePresence>
        {phase === "BOSS_REVEAL" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="bg-red-950/20 backdrop-blur-2xl p-12 border-2 border-red-500/50 rounded-[50px] flex flex-col items-center max-w-4xl text-center shadow-[0_0_100px_rgba(239,68,68,0.3)]"
          >
            <h3 className="text-2xl text-red-400 tracking-widest mb-2">
              TARGET ACQUIRED
            </h3>
            <h1 className="text-6xl text-white drop-shadow-[0_0_30px_#ef4444] mb-6">
              {boss.name}
            </h1>
            <div className="text-xl text-red-300 bg-red-900/40 px-6 py-2 rounded-full border border-red-500/30 mb-8">
              {boss.title}
            </div>

            <div className="flex justify-center gap-6 mb-8 text-sm">
              <div className="bg-black/50 px-4 py-2 rounded-xl border border-white/10">
                ATK {boss.atk}
              </div>
              <div className="bg-black/50 px-4 py-2 rounded-xl border border-white/10">
                DEF {boss.def}
              </div>
              <div className="bg-black/50 px-4 py-2 rounded-xl border border-white/10">
                SPD {boss.spd}
              </div>
              <div className="bg-black/50 px-4 py-2 rounded-xl border border-white/10 text-orange-400">
                IQ {boss.iq}
              </div>
            </div>

            <div className="w-full">
              <div className="text-xs text-gray-400 mb-2 flex justify-between">
                <span>BOSS HP</span> <span>{boss.maxHp}</span>
              </div>
              <div className="w-full h-4 bg-black rounded-full border border-white/10 overflow-hidden">
                <div className="h-full bg-red-600 w-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "SKILL_FLASH" && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/80 z-50"
        >
          <div className="text-center">
            <div className="text-orange-500 tracking-[0.5em] mb-4 text-xl">
              <Flame className="inline mb-1" /> {SLOTS[currentSlot]} STRIKE
            </div>
            <h2 className="text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] skew-x-[-10deg]">
              {clashText}
            </h2>
          </div>
        </motion.div>
      )}

      {(phase === "ATTACK" || phase === "IMPACT") && (
        <div className="w-full flex justify-between items-center px-20 relative h-screen">
          {/* PLAYER CARD (LEFT) */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: phase === "IMPACT" ? 100 : 0, opacity: 1 }}
            className="bg-[#0a0a0a] border-2 border-[#ff8c32] rounded-[40px] p-8 w-[400px] flex flex-col items-center shadow-[0_0_50px_rgba(255,140,50,0.2)] z-30"
          >
            <div className="text-xs text-gray-500 mb-4">
              {SLOTS[currentSlot]}
            </div>
            {rngAction && (
              <div className="bg-black text-yellow-400 border border-yellow-500/50 px-4 py-1 rounded-full text-xs mb-4 animate-bounce">
                <Zap size={12} className="inline mb-1" /> {rngAction.text}
              </div>
            )}
            <img
              src={playerTeam[SLOTS[currentSlot]]?.img || "/zoro.svg"}
              className="w-48 h-48 object-cover rounded-3xl border-4 border-white/5 mb-6"
              alt=""
            />
            <div className="text-2xl text-white mb-2 text-center">
              {playerTeam[SLOTS[currentSlot]]?.name}
            </div>
          </motion.div>

          {/* DAMAGE NUMBER FLASH */}
          {phase === "IMPACT" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute left-1/2 -translate-x-1/2 z-50 text-8xl text-red-500 drop-shadow-[0_0_40px_#ef4444]"
            >
              -{roundDamage}
            </motion.div>
          )}

          {/* BOSS CARD (RIGHT) */}
          <div className="bg-red-950/10 border-2 border-red-900 rounded-[40px] p-8 w-[500px] flex flex-col items-center">
            <div className="text-xs text-red-500 mb-4">RAID BOSS</div>
            <img
              src={boss.img || "/zoro.svg"}
              className={`w-64 h-64 object-cover rounded-3xl border-4 border-red-600 mb-6 transition-all ${phase === "IMPACT" ? "brightness-200 saturate-200 scale-95" : ""}`}
              alt=""
            />
            <div className="text-3xl text-white mb-6 text-center">
              {boss.name}
            </div>

            {/* GIANT BOSS HP BAR */}
            <div className="w-full">
              <div className="flex justify-between text-xs mb-2 font-mono text-red-300">
                <span>HP</span>{" "}
                <span>
                  {bossHp} / {boss.maxHp}
                </span>
              </div>
              <div className="w-full h-6 bg-black rounded-full border-2 border-red-900 overflow-hidden relative">
                <motion.div
                  animate={{ width: `${(bossHp / boss.maxHp) * 100}%` }}
                  className="h-full bg-gradient-to-r from-red-800 to-red-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BossArena;
