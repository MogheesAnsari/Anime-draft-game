// ✅ 1. Universe Synergy Logic
export const getUniverseSynergy = (team) => {
  const chars = Object.values(team).filter(Boolean);
  if (chars.length < 6) return false;
  const firstUniverse = chars[0].universe;
  if (!firstUniverse || firstUniverse === "all") return false;
  const isSynergy = chars.every((c) => c.universe === firstUniverse);
  return isSynergy ? firstUniverse : false;
};

// ✅ 2. Accurate Slot Math (Base Stats)
export const calculateEffectiveScore = (
  char,
  slotId,
  leaderBoost = 0,
  aura = 0,
) => {
  if (!char) return 0;
  let atk =
    (Number(char.atk) || 0) +
    (slotId === "captain" || slotId === "vice_cap" ? leaderBoost : 0);
  let def =
    (Number(char.def) || 0) +
    (slotId === "captain" || slotId === "vice_cap" ? leaderBoost : 0);
  let spd =
    (Number(char.spd) || 0) +
    (slotId === "captain" || slotId === "vice_cap" ? leaderBoost : 0);
  let iq = Number(char.iq) || 100;

  let base = atk + def + spd + iq;
  let bonus = 0;

  if (slotId === "vice_cap") bonus = aura * 2;
  if (slotId === "speedster") bonus = spd * 0.2;
  if (slotId === "tank") bonus = def * 0.3;
  if (slotId === "raw_power") bonus = atk * 0.4;

  let total = slotId === "captain" ? base : base + bonus + aura;
  return Math.round(total);
};

// ✅ 3. Total Team Score
export const calculateTeamScore = (team) => {
  let total = 0;
  const strategist = team["support"];
  const leaderBoost = strategist
    ? Math.round((Number(strategist.iq) || 100) * 0.1)
    : 0;
  const cap = team.captain || { atk: 0, def: 0, spd: 0, iq: 100 };
  const capTotal =
    (Number(cap.atk) || 0) +
    (Number(cap.def) || 0) +
    (Number(cap.spd) || 0) +
    (Number(cap.iq) || 100) +
    leaderBoost * 3;
  const aura = capTotal * 0.1;

  Object.keys(team).forEach((slotId) => {
    total += calculateEffectiveScore(team[slotId], slotId, leaderBoost, aura);
  });

  if (getUniverseSynergy(team)) total = Math.round(total * 1.1);
  return Math.round(total);
};

// 🌟 NEW: Combat Tier Grading
export const getCombatTier = (totalScore) => {
  if (totalScore >= 5000) return { tier: "S-CLASS", color: "text-red-500" };
  if (totalScore >= 4000) return { tier: "A-CLASS", color: "text-[#ff8c32]" };
  if (totalScore >= 3000) return { tier: "B-CLASS", color: "text-purple-500" };
  if (totalScore >= 2000) return { tier: "C-CLASS", color: "text-blue-500" };
  return { tier: "D-CLASS", color: "text-gray-400" };
};

// ✅ 4. CPU Generation
export const generateCpuTeam = (pool) => {
  const SLOTS = [
    "captain",
    "vice_cap",
    "speedster",
    "tank",
    "support",
    "raw_power",
  ];
  let cpuTeam = {};
  let availableChars =
    pool && pool.length > 0
      ? [...pool]
      : [{ name: "BOT", atk: 70, def: 70, spd: 70, iq: 70, img: "/zoro.svg" }];
  while (availableChars.length < 6)
    availableChars = [...availableChars, ...availableChars];
  const shuffled = availableChars.sort(() => 0.5 - Math.random());
  SLOTS.forEach((id, i) => {
    cpuTeam[id] = shuffled[i];
  });
  return cpuTeam;
};

// 🌟 5. Elite Rank Progression System
export const getRankTier = (wins) => {
  if (wins >= 100) return { title: "MYTHIC COMMANDER", color: "text-red-500" };
  if (wins >= 50) return { title: "HOKAGE", color: "text-[#ff8c32]" };
  if (wins >= 25) return { title: "JONIN", color: "text-purple-500" };
  if (wins >= 10) return { title: "CHUNIN", color: "text-blue-500" };
  return { title: "GENIN", color: "text-gray-400" };
};

// 🌟 6. THE GOD-MODE SKILL ENGINE (Universe + Character Name Auto-Detect)
export const getSlotSkill = (char, slot, hasSynergy = false) => {
  if (!char) return "COMBAT STRIKE";

  const uniKey = String(char.universe || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const nameKey = String(char.name || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  const prefix = hasSynergy ? "AWAKENED " : "";

  // 🔥 MAGIC: Auto-detect anime from character names if DB universe is wrong/empty!
  const isDemonSlayer =
    uniKey.includes("demon") ||
    uniKey.includes("kimetsu") ||
    nameKey.includes("sanemi") ||
    nameKey.includes("tanjirou") ||
    nameKey.includes("yoriichi") ||
    nameKey.includes("gyokko");
  const isNaruto =
    uniKey.includes("naruto") ||
    uniKey.includes("boruto") ||
    nameKey.includes("kaguya") ||
    nameKey.includes("madara") ||
    nameKey.includes("sasuke");
  const isBleach =
    uniKey.includes("bleach") ||
    uniKey.includes("soul") ||
    nameKey.includes("askin") ||
    nameKey.includes("ichigo") ||
    nameKey.includes("aizen");
  const isOnePiece =
    uniKey.includes("onepiece") ||
    nameKey.includes("luffy") ||
    nameKey.includes("zoro") ||
    nameKey.includes("sanji");
  const isJJK =
    uniKey.includes("jujutsu") ||
    uniKey.includes("jjk") ||
    nameKey.includes("yorozu") ||
    nameKey.includes("gojo") ||
    nameKey.includes("sukuna");
  const isMHA =
    uniKey.includes("heroacademia") ||
    uniKey.includes("mha") ||
    nameKey.includes("tenya") ||
    nameKey.includes("mirai") ||
    nameKey.includes("deku");
  const isDBZ =
    uniKey.includes("dragonball") ||
    uniKey.includes("dbz") ||
    nameKey.includes("zamasu") ||
    nameKey.includes("goku") ||
    nameKey.includes("vegeta");
  const isHxH =
    uniKey.includes("hunter") ||
    uniKey.includes("hxh") ||
    nameKey.includes("tserriednich") ||
    nameKey.includes("gon") ||
    nameKey.includes("killua");
  // 🛡️ PROPER CAPTAIN SLOT LOGIC
  if (slot === "captain") {
    if (isNaruto) return prefix + "WILL OF FIRE";
    if (isOnePiece) return prefix + "SUPREME CONQUEROR";
    if (isBleach) return prefix + "SPIRITUAL PRESSURE";
    if (isJJK) return prefix + "BLACK FLASH SYNC";
    if (isDBZ) return prefix + "SAIYAN PRIDE";
    if (isDemonSlayer) return prefix + "HASHIRA RESOLVE";
    if (isMHA) return prefix + "PLUS ULTRA WILL";
    if (uniKey.includes("solo")) return prefix + "SHADOW COMMAND";
    if (uniKey.includes("blackclover")) return prefix + "WIZARD KING ART";
    if (uniKey.includes("chainsaw")) return prefix + "DEVIL CONTRACT";

    return (
      prefix +
      (char.iq >= char.atk ? "TACTICAL MASTERMIND" : "COMMANDER'S WRATH")
    );
  }

  // ⚔️ PROPER RAW POWER SLOT LOGIC
  if (slot === "raw_power") {
    if (isNaruto) return prefix + "SECRET NINJUTSU";
    if (isOnePiece) return prefix + "FRUIT AWAKENING";
    if (isBleach) return prefix + "BANKAI RELEASE";
    if (isJJK) return prefix + "DOMAIN EXPANSION";
    if (isDBZ) return prefix + "FINAL FLASH IMPACT";
    if (isDemonSlayer) return prefix + "TOTAL CONCENTRATION";
    if (isMHA) return prefix + "QUIRK AWAKENING";
    if (uniKey.includes("solo")) return prefix + "MONARCH'S DOMAIN";
    if (uniKey.includes("blackclover")) return prefix + "ULTIMATE MAGIC";
    if (uniKey.includes("chainsaw")) return prefix + "BLOOD DEVIL RAGE";

    return prefix + "MULTIVERSE OVERLOAD";
  }

  const slotSkills = {
    vice_cap: "AURA BURST",
    speedster: "FLASH STEP",
    tank: "ABSOLUTE DEFENSE",
    support: "STRATEGIC OVERLAY",
  };
  return prefix + (slotSkills[slot] || "STRIKE");
};
