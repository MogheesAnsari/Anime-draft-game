export const getUniverseSynergy = (team) => {
  const chars = Object.values(team).filter(Boolean);
  if (chars.length < 6) return false;
  const firstUniverse = chars[0].universe;
  if (!firstUniverse || firstUniverse === "all") return false;
  return chars.every((c) => c.universe === firstUniverse)
    ? firstUniverse
    : false;
};

export const DOMAINS = [
  {
    name: "VALLEY OF THE END",
    universe: "naruto",
    buffText: "+15% CHAKRA BOOST",
  },
  { name: "MARINEFORD", universe: "onepiece", buffText: "+15% HAKI RESONANCE" },
  { name: "SOUL SOCIETY", universe: "bleach", buffText: "+15% REIATSU SPIKE" },
  {
    name: "SHIBUYA INCIDENT",
    universe: "jujutsu",
    buffText: "+15% CURSED ENERGY",
  },
  {
    name: "TOURNAMENT OF POWER",
    universe: "dragonball",
    buffText: "+15% GODLY KI",
  },
  {
    name: "INFINITY CASTLE",
    universe: "demon",
    buffText: "+15% BREATHING MASTERY",
  },
  {
    name: "U.A. HIGH ARENA",
    universe: "heroacademia",
    buffText: "+15% QUIRK AWAKENING",
  },
  { name: "DARK CONTINENT", universe: "hunter", buffText: "+15% NEN OVERFLOW" },
  {
    name: "FINAL DESTINATION",
    universe: "all",
    buffText: "PURE SKILL (NO BUFFS)",
  },
];
export const getRandomDomain = () =>
  DOMAINS[Math.floor(Math.random() * DOMAINS.length)];

export const ARTIFACTS = [
  {
    name: "POTARA EARRINGS",
    effect: "balanced",
    boost: 1.1,
    desc: "Fuses power for +10% ATK & DEF",
  },
  {
    name: "DEATH NOTE",
    effect: "iq",
    boost: 1.3,
    desc: "Absolute Strategy: +30% IQ boost",
  },
  {
    name: "ZANPAKUTO",
    effect: "atk",
    boost: 1.2,
    desc: "Soul Cutter: +20% Physical ATK",
  },
  {
    name: "STRAW HAT",
    effect: "all",
    boost: 1.1,
    desc: "Captain's Will: +10% to ALL stats",
  },
  {
    name: "NINJA SCROLL",
    effect: "spd",
    boost: 1.2,
    desc: "Hidden Arts: +20% Speed increase",
  },
  {
    name: "CURSED FINGER",
    effect: "berserk",
    boost: 1.25,
    desc: "Cursed Might: +25% ATK (Risky)",
  },
  {
    name: "HUNTER LICENSE",
    effect: "tactical",
    boost: 1.15,
    desc: "Pro Hunter: +15% IQ & SPD",
  },
  {
    name: "AEGIS SHIELD",
    effect: "tank",
    boost: 1.3,
    desc: "Absolute Defense: +30% DEF",
  },
];
export const getRandomArtifact = () =>
  ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)];

export const getRoleAction = (char, slot) => {
  if (!char) return null;
  const rng = Math.random();
  if (slot === "speedster" && rng < 0.2)
    return {
      text: "SPEED MIRAGE",
      boost: 1.2,
      color: "text-blue-400 border-blue-400",
    };
  if (slot === "tank" && rng < 0.25)
    return {
      text: "ABSOLUTE BLOCK",
      boost: 1.25,
      color: "text-gray-400 border-gray-400",
    };
  if (slot === "support" && rng < 0.3)
    return {
      text: "200 IQ PLAY",
      boost: 1.3,
      color: "text-purple-400 border-purple-400",
    };
  if (slot === "raw_power" && rng < 0.15)
    return {
      text: "FATAL STRIKE",
      boost: 1.5,
      color: "text-red-500 border-red-500",
    };
  if (slot === "vice_cap" && rng < 0.2)
    return {
      text: "AURA BURST",
      boost: 1.15,
      color: "text-yellow-400 border-yellow-400",
    };
  return null;
};

export const getCharacterPassive = (char) => {
  if (!char) return null;
  const name = char.name?.toLowerCase() || "";
  if (name.includes("goku") || name.includes("vegeta"))
    return { name: "SAIYAN BLOOD", boost: 1.15 };
  if (
    name.includes("itachi") ||
    name.includes("madara") ||
    name.includes("sasuke")
  )
    return { name: "UCHIHA PRIDE", boost: 1.2 };
  if (name.includes("gojo")) return { name: "LIMITLESS", boost: 1.25 };
  return null;
};

export const calculateFinalBattleScore = (
  char,
  slot,
  domain,
  artifact,
  rngBoost = 1,
  rngText = null,
  isAwakened = false,
) => {
  if (!char) return { final: 0, breakdown: [] };

  let base =
    (Number(char.atk) || 0) +
    (Number(char.def) || 0) +
    (Number(char.spd) || 0) +
    (Number(char.iq) || 100);
  let multiplier = 1;
  if (slot === "speedster") multiplier = 1.2;
  if (slot === "tank") multiplier = 1.3;
  if (slot === "raw_power") multiplier = 1.4;

  let total = base * multiplier;
  let breakdown = [
    { label: "Base Stats (with Slot Bonus)", value: Math.round(total) },
  ];

  const passive = getCharacterPassive(char);
  if (passive) {
    total *= passive.boost;
    breakdown.push({
      label: `Passive: ${passive.name}`,
      value: `x${passive.boost}`,
    });
  }

  if (artifact) {
    total *= artifact.boost;
    breakdown.push({
      label: `Artifact: ${artifact.name}`,
      value: `x${artifact.boost}`,
    });
  }

  let domainMatched = false;
  if (domain && domain.universe !== "all") {
    const charUni = char.universe?.toLowerCase().replace(/[^a-z]/g, "") || "";
    if (charUni.includes(domain.universe)) {
      total *= 1.15;
      domainMatched = true;
      breakdown.push({ label: `Field Buff`, value: `x1.15` });
    }
  }

  if (rngBoost !== 1) {
    total *= rngBoost;
    breakdown.push({ label: `RNG: ${rngText}`, value: `x${rngBoost}` });
  }

  if (isAwakened) {
    total *= 1.2;
    breakdown.push({ label: `Awakened Power`, value: `x1.2` });
  }

  return {
    final: Math.round(total),
    breakdown,
    domainMatched,
    passive,
    artifact,
  };
};

export const calculateEffectiveScore = (char, slotId) => {
  if (!char) return 0;
  let base =
    (Number(char.atk) || 0) +
    (Number(char.def) || 0) +
    (Number(char.spd) || 0) +
    (Number(char.iq) || 100);
  let multiplier = 1;
  if (slotId === "speedster") multiplier = 1.2;
  if (slotId === "tank") multiplier = 1.3;
  if (slotId === "raw_power") multiplier = 1.4;
  return Math.round(base * multiplier);
};

export const calculateTeamScore = (team) => {
  return Object.keys(team).reduce(
    (acc, slot) => acc + calculateEffectiveScore(team[slot], slot),
    0,
  );
};

export const getSlotSkill = (char, slot, synergy) => {
  if (!char) return "STRIKE";
  const prefix = synergy ? "AWAKENED " : "";
  if (slot === "captain") {
    const uni = char.universe?.toLowerCase() || "";
    if (uni.includes("naruto")) return prefix + "WILL OF FIRE";
    if (uni.includes("onepiece") || uni.includes("one piece"))
      return prefix + "SUPREME CONQUEROR";
    if (uni.includes("bleach")) return prefix + "SPIRITUAL PRESSURE";
    if (uni.includes("jujutsu")) return prefix + "BLACK FLASH SYNC";
    return prefix + "COMMANDER'S WRATH";
  }
  if (slot === "raw_power") {
    const uni = char.universe?.toLowerCase() || "";
    if (uni.includes("naruto")) return prefix + "SECRET NINJUTSU";
    if (uni.includes("onepiece") || uni.includes("one piece"))
      return prefix + "FRUIT AWAKENING";
    if (uni.includes("bleach")) return prefix + "BANKAI RELEASE";
    if (uni.includes("jujutsu")) return prefix + "DOMAIN EXPANSION";
    return prefix + "CATASTROPHIC END";
  }
  const slotSkills = {
    vice_cap: "AURA BURST",
    speedster: "FLASH STEP",
    tank: "ABSOLUTE DEFENSE",
    support: "STRATEGIC OVERLAY",
  };
  return prefix + (slotSkills[slot] || "COMBAT STRIKE");
};

export const getRankTier = (wins) => ({
  title: wins >= 50 ? "HOKAGE" : "GENIN",
  color: wins >= 50 ? "text-orange-500" : "text-gray-400",
});

export const getCombatTier = (totalScore) => {
  if (totalScore >= 5000) return { tier: "S-CLASS", color: "text-red-500" };
  if (totalScore >= 4000) return { tier: "A-CLASS", color: "text-[#ff8c32]" };
  if (totalScore >= 3000) return { tier: "B-CLASS", color: "text-purple-500" };
  return { tier: "C-CLASS", color: "text-blue-500" };
};

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
// 👹 PHASE 6: RAID BOSS DATA & MATH
export const RAID_BOSSES = [
  {
    id: "boss_aizen",
    name: "AIZEN (HOGYOKU)",
    universe: "bleach",
    img: "/boss_aizen.jpg", // Add a cool image in public folder
    title: "THE TRANSCENDENT",
    atk: 220,
    def: 240,
    spd: 210,
    iq: 250, // Peak Intelligence
    maxHp: 12000,
    skill: "KYOKA SUIGETSU: COMPLETE HYPNOSIS",
    passive: { name: "EVOLUTION", effect: "all", boost: 1.2 },
  },
  {
    id: "boss_madara",
    name: "MADARA (TEN-TAILS)",
    universe: "naruto",
    img: "/boss_madara.jpg", // Add image
    title: "GHOST OF THE UCHIHA",
    atk: 250,
    def: 250,
    spd: 220,
    iq: 200,
    maxHp: 15000, // Massive Tank
    skill: "INFINITE TSUKUYOMI",
    passive: { name: "SIX PATHS CHAKRA", effect: "atk", boost: 1.25 },
  },
  {
    id: "boss_sukuna",
    name: "SUKUNA (TRUE FORM)",
    universe: "jujutsu kaisen",
    img: "/boss_sukuna.jpg", // Add image
    title: "KING OF CURSES",
    atk: 280,
    def: 180,
    spd: 240,
    iq: 180, // Pure Aggression
    maxHp: 10000,
    skill: "MALEVOLENT SHRINE",
    passive: { name: "CURSED REGENERATION", effect: "def", boost: 1.15 },
  },
];

export const getRandomRaidBoss = () => {
  return RAID_BOSSES[Math.floor(Math.random() * RAID_BOSSES.length)];
};
