// 🔥 SYNERGY CHECK (Now supports Comics)
export const getUniverseSynergy = (team) => {
  const chars = Object.values(team).filter(Boolean);
  if (chars.length < 6) return false;
  const firstUniverse = chars[0].universe;
  if (!firstUniverse || firstUniverse === "all") return false;
  return chars.every((c) => c.universe === firstUniverse)
    ? firstUniverse
    : false;
};

// 🌌 DOMAINS (Anime + Comics)
export const DOMAINS = [
  // Anime Domains
  {
    name: "VALLEY OF THE END",
    universe: "naruto",
    category: "anime",
    buffText: "+15% CHAKRA BOOST",
  },
  {
    name: "MARINEFORD",
    universe: "onepiece",
    category: "anime",
    buffText: "+15% HAKI RESONANCE",
  },
  {
    name: "SOUL SOCIETY",
    universe: "bleach",
    category: "anime",
    buffText: "+15% REIATSU SPIKE",
  },
  {
    name: "SHIBUYA INCIDENT",
    universe: "jujutsu",
    category: "anime",
    buffText: "+15% CURSED ENERGY",
  },
  {
    name: "TOURNAMENT OF POWER",
    universe: "dragonball",
    category: "anime",
    buffText: "+15% GODLY KI",
  },
  // Comic Domains (NEW)
  {
    name: "GOTHAM CITY",
    universe: "dc",
    category: "comic",
    buffText: "+15% TACTICAL ADVANTAGE",
  },
  {
    name: "METROPOLIS",
    universe: "dc",
    category: "comic",
    buffText: "+15% HEROIC INSPIRATION",
  },
  {
    name: "WAKANDA",
    universe: "marvel",
    category: "comic",
    buffText: "+15% VIBRANIUM TECH BOOST",
  },
  {
    name: "AVENGERS TOWER",
    universe: "marvel",
    category: "comic",
    buffText: "+15% ASSEMBLE SYNERGY",
  },
  {
    name: "X-MANSION",
    universe: "marvel",
    category: "comic",
    buffText: "+15% MUTANT GENE BOOST",
  },

  {
    name: "FINAL DESTINATION",
    universe: "all",
    category: "all",
    buffText: "PURE SKILL (NO BUFFS)",
  },
];

export const getRandomDomain = (categoryFilter = null) => {
  let pool = DOMAINS;
  if (categoryFilter && categoryFilter !== "all") {
    pool = DOMAINS.filter(
      (d) => d.category === categoryFilter || d.category === "all",
    );
  }
  return pool[Math.floor(Math.random() * pool.length)];
};

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
    name: "INFINITY GAUNTLET",
    effect: "all",
    boost: 1.4,
    desc: "Reality Bending: +40% ALL STATS",
  }, // Comic Artifact
  {
    name: "BATARANG",
    effect: "tactical",
    boost: 1.15,
    desc: "Stealth Tech: +15% IQ & SPD",
  }, // Comic Artifact
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
      text: "POWER BURST",
      boost: 1.15,
      color: "text-yellow-400 border-yellow-400",
    };
  return null;
};

export const getCharacterPassive = (char) => {
  if (!char) return null;
  const name = char.name?.toLowerCase() || "";
  // Anime Passives
  if (name.includes("goku") || name.includes("vegeta"))
    return { name: "SAIYAN BLOOD", boost: 1.15 };
  if (
    name.includes("itachi") ||
    name.includes("madara") ||
    name.includes("sasuke")
  )
    return { name: "UCHIHA PRIDE", boost: 1.2 };
  // Comic Passives
  if (name.includes("superman") || name.includes("supergirl"))
    return { name: "KRYPTONIAN", boost: 1.2 };
  if (name.includes("batman") || name.includes("iron man"))
    return { name: "BILLIONAIRE GENIUS", boost: 1.25 };
  if (name.includes("hulk") || name.includes("wolverine"))
    return { name: "REGENERATION", boost: 1.15 };
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
  let breakdown = [{ label: "Base Stats", value: Math.round(total) }];

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
    breakdown.push({ label: `Ultimate Power`, value: `x1.2` });
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

// 🌟 DYNAMIC SKILLS (Adjusts based on Universe/Category)
export const getSlotSkill = (char, slot, synergy) => {
  if (!char) return "STRIKE";
  const prefix = synergy ? "AWAKENED " : "";
  const uni = char.universe?.toLowerCase() || "";
  const isComic = uni.includes("marvel") || uni.includes("dc");

  if (slot === "captain") {
    if (isComic) return prefix + "LEADERSHIP AURA";
    if (uni.includes("naruto")) return prefix + "WILL OF FIRE";
    if (uni.includes("onepiece")) return prefix + "SUPREME CONQUEROR";
    return prefix + "COMMANDER'S WRATH";
  }
  if (slot === "raw_power") {
    if (uni.includes("dc")) return prefix + "OMEGA LEVEL THREAT";
    if (uni.includes("marvel")) return prefix + "COSMIC OVERLOAD";
    if (uni.includes("naruto")) return prefix + "SECRET NINJUTSU";
    return prefix + "CATASTROPHIC END";
  }

  const slotSkills = isComic
    ? {
        vice_cap: "TACTICAL ASSIST",
        speedster: "LIGHTSPEED DASH",
        tank: "INVULNERABILITY",
        support: "MASTER PLAN",
      }
    : {
        vice_cap: "AURA BURST",
        speedster: "FLASH STEP",
        tank: "ABSOLUTE DEFENSE",
        support: "STRATEGIC OVERLAY",
      };

  return prefix + (slotSkills[slot] || "COMBAT STRIKE");
};

export const getRankTier = (wins) => ({
  title: wins >= 50 ? "LEGEND" : "ROOKIE",
  color: wins >= 50 ? "text-orange-500" : "text-gray-400",
});

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
