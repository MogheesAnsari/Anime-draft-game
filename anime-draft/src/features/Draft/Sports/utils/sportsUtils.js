import { getRoleStats } from "./sportsConfig";

const stadiums = {
  football: [
    { name: "Camp Nou", city: "Barcelona", buffText: "+10% POSSESSION BOOST" },
    {
      name: "Santiago Bernabéu",
      city: "Madrid",
      buffText: "+10% COUNTER ATTACK",
    },
    {
      name: "Old Trafford",
      city: "Manchester",
      buffText: "+10% DEFENSIVE WALL",
    },
    { name: "San Siro", city: "Milan", buffText: "+10% MIDFIELD DOMINANCE" },
  ],
  cricket: [
    { name: "Lord's", city: "London", buffText: "+15% SWING BOWLING" },
    { name: "MCG", city: "Melbourne", buffText: "+10% BOUNCE & PACE" },
    {
      name: "Narendra Modi Stadium",
      city: "Ahmedabad",
      buffText: "+15% SPIN MASTERCLASS",
    },
    { name: "Wankhede", city: "Mumbai", buffText: "+10% BATTING PARADISE" },
  ],
};

export const getRandomStadium = (sportId) => {
  const list = stadiums[sportId] || stadiums.football;
  return list[Math.floor(Math.random() * list.length)];
};

export const getSportsPlayText = (slotId, sportId) => {
  if (slotId === "mgr") return "TACTICAL MASTERCLASS!";
  if (slotId === "imp") return "IMPACT SUBSTITUTION!";
  const plays = {
    football: [
      `THROUGH BALL!`,
      `TOP BINS FINISH!`,
      `PERFECT TACKLE!`,
      `SUPER SAVE!`,
      `CLUTCH MOMENT!`,
    ],
    cricket: [
      `COVER DRIVE!`,
      `HELICOPTER SHOT!`,
      `YORKER DELIVERED!`,
      `GOOGLY SPUN!`,
      `CRUCIAL BREAKTHROUGH!`,
    ],
  };
  const list = plays[sportId] || plays.football;
  return list[Math.floor(Math.random() * list.length)];
};

export const getStatValue = (player, statName) => {
  if (!player) return 0;
  const statsObj = player.stats || player;

  const exactKey = Object.keys(statsObj).find(
    (k) => k.toLowerCase() === statName.toLowerCase(),
  );
  if (exactKey !== undefined && !isNaN(Number(statsObj[exactKey])))
    return Number(statsObj[exactKey]);

  const fallbackMap = {
    SHOOTING: "SHO",
    PACE: "PAC",
    DRIBBLING: "DRI",
    PHYSICAL: "PHY",
    PASSING: "PAS",
    VISION: "VIS",
    STAMINA: "STA",
    DEFENDING: "DEF",
    TACKLING: "TAC",
    HEADING: "PHY",
    DIVING: "DIV",
    REFLEXES: "REF",
    HANDLING: "HAN",
    POSITIONING: "POS",
    IQ: "IQ",
    EXP: "EXP",
    TACTICS: "TAC",
    CHARISMA: "MOT",
    BATTING: "BAT",
    POWER: "POW",
    TIMING: "STR",
    RUNNING: "RUN",
    BOWLING: "BWL",
    ACCURACY: "ACC",
    VARIATION: "SPN",
    SPIN: "SPN",
    GLOVES: "GLV",
    AGILITY: "AGI",
    FIELDING: "FLD",
  };

  const fallbackKey = fallbackMap[statName.toUpperCase()];
  if (fallbackKey) {
    const fbExact = Object.keys(statsObj).find(
      (k) => k.toLowerCase() === fallbackKey.toLowerCase(),
    );
    if (fbExact !== undefined && !isNaN(Number(statsObj[fbExact])))
      return Number(statsObj[fbExact]);
  }

  const anyNumKey = Object.keys(statsObj).find(
    (k) =>
      !["id", "tier", "v"].includes(k.toLowerCase()) &&
      typeof statsObj[k] === "number",
  );
  if (anyNumKey) return Number(statsObj[anyNumKey]);

  return 75;
};

export const calculateManagerBonus = (manager) => {
  if (!manager) return 1.0;
  const iq = getStatValue(manager, "IQ") || getStatValue(manager, "TACTICS");
  const exp = getStatValue(manager, "EXP") || getStatValue(manager, "CHARISMA");
  return 1 + (iq + exp) / 1000;
};

export const calculateSportsEffectiveScore = (
  player,
  slotId,
  sportId,
  auraProvider = null,
) => {
  if (!player) return 0;
  const statLabels = getRoleStats(sportId, player.role || "DEFAULT");
  let baseTotal = 0;
  statLabels.forEach((stat) => {
    baseTotal += getStatValue(player, stat);
  });

  let multiplier = 1;
  if (player.tier === "S+") multiplier = 1.2;
  if (player.tier === "S") multiplier = 1.1;

  const auraBonus =
    slotId !== "mgr" && slotId !== "imp"
      ? calculateManagerBonus(auraProvider)
      : 1.0;
  return Math.round(baseTotal * multiplier * auraBonus);
};

// 🛡️ CPU GENERATOR: Now perfectly blocks names globally!
export const generateCpuTeam = (
  pool,
  slots = [],
  globalDraftedNames = new Set(),
) => {
  if (!pool || pool.length === 0) return {};
  const cpuTeam = {};
  const localDraftedNames = new Set();

  slots.forEach((slot) => {
    let validPlayers = [];

    // Check globalDraftedNames & localDraftedNames by NAME
    if (slot.role === "IMP") {
      validPlayers = pool.filter(
        (p) =>
          ["BAT", "BWL", "ALL"].includes(p.role) &&
          !globalDraftedNames.has(p.name.toLowerCase()) &&
          !localDraftedNames.has(p.name.toLowerCase()),
      );
    } else {
      validPlayers = pool.filter(
        (p) =>
          p.role === slot.role &&
          !globalDraftedNames.has(p.name.toLowerCase()) &&
          !localDraftedNames.has(p.name.toLowerCase()),
      );
    }

    if (validPlayers.length > 0) {
      const selected =
        validPlayers[Math.floor(Math.random() * validPlayers.length)];
      cpuTeam[slot.id] = selected;
      localDraftedNames.add(selected.name.toLowerCase());
    } else {
      const fallbackPlayers = pool.filter(
        (p) =>
          !globalDraftedNames.has(p.name.toLowerCase()) &&
          !localDraftedNames.has(p.name.toLowerCase()),
      );
      if (fallbackPlayers.length > 0) {
        const selected =
          fallbackPlayers[Math.floor(Math.random() * fallbackPlayers.length)];
        cpuTeam[slot.id] = selected;
        localDraftedNames.add(selected.name.toLowerCase());
      }
    }
  });
  return cpuTeam;
};
