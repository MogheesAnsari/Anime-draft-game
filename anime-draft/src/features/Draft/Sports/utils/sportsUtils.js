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

// 🛡️ BULLETPROOF STAT EXTRACTOR (Zero-Bug Fix)
export const getStatValue = (player, statName) => {
  if (!player) return 0;
  const statsObj = player.stats || player; // Supports flat or nested DB objects

  // 1. Try to find the exact stat name (Case-Insensitive)
  const exactKey = Object.keys(statsObj).find(
    (k) => k.toLowerCase() === statName.toLowerCase(),
  );
  if (exactKey !== undefined && !isNaN(Number(statsObj[exactKey]))) {
    return Number(statsObj[exactKey]);
  }

  // 2. Anime-to-Sports Auto Translator (If they only have atk, def, spd, iq)
  const fallbackMap = {
    SHOOTING: "atk",
    PACE: "spd",
    DRIBBLING: "iq",
    PHYSICAL: "def",
    PASSING: "iq",
    VISION: "iq",
    STAMINA: "def",
    DEFENDING: "def",
    TACKLING: "def",
    HEADING: "atk",
    DIVING: "spd",
    REFLEXES: "spd",
    HANDLING: "def",
    POSITIONING: "iq",
    BATTING: "atk",
    POWER: "atk",
    TIMING: "iq",
    RUNNING: "spd",
    BOWLING: "def",
    ACCURACY: "iq",
    VARIATION: "iq",
    SPIN: "iq",
    GLOVES: "def",
    AGILITY: "spd",
    FIELDING: "def",
    IQ: "iq",
    EXP: "iq",
    TACTICS: "iq",
    CHARISMA: "def",
  };

  const fallbackKey = fallbackMap[statName.toUpperCase()];
  if (fallbackKey) {
    const fbExact = Object.keys(statsObj).find(
      (k) => k.toLowerCase() === fallbackKey.toLowerCase(),
    );
    if (fbExact !== undefined && !isNaN(Number(statsObj[fbExact]))) {
      return Number(statsObj[fbExact]);
    }
  }

  // 3. Last Resort Fallback: Grab ANY valid number on the card so it never returns 0
  const anyNumKey = Object.keys(statsObj).find(
    (k) =>
      !["id", "tier", "v"].includes(k.toLowerCase()) &&
      typeof statsObj[k] === "number",
  );
  if (anyNumKey) return Number(statsObj[anyNumKey]);

  return 75; // Ultimate safety net
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
  manager = null,
) => {
  if (!player) return 0;

  const statLabels = getRoleStats(sportId, player.role || "DEFAULT");
  let baseTotal = 0;

  statLabels.forEach((stat) => {
    baseTotal += getStatValue(player, stat); // Pulls from our safe extractor
  });

  let multiplier = 1;
  if (player.tier === "S+") multiplier = 1.2;
  if (player.tier === "S") multiplier = 1.1;

  const mgrBonus = slotId !== "mgr" ? calculateManagerBonus(manager) : 1.0;
  return Math.round(baseTotal * multiplier * mgrBonus);
};

export const generateCpuTeam = (pool, slots = []) => {
  if (!pool || pool.length === 0) return {};
  const cpuTeam = {};
  const draftedIds = new Set();

  slots.forEach((slot) => {
    const validPlayers = pool.filter(
      (p) => p.role === slot.role && !draftedIds.has(p.id),
    );
    if (validPlayers.length > 0) {
      const selected =
        validPlayers[Math.floor(Math.random() * validPlayers.length)];
      cpuTeam[slot.id] = selected;
      draftedIds.add(selected.id);
    } else {
      const fallbackPlayers = pool.filter((p) => !draftedIds.has(p.id));
      if (fallbackPlayers.length > 0) {
        const selected =
          fallbackPlayers[Math.floor(Math.random() * fallbackPlayers.length)];
        cpuTeam[slot.id] = selected;
        draftedIds.add(selected.id);
      }
    }
  });
  return cpuTeam;
};
