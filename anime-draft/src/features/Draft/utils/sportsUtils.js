import { getSportConfig, getRoleStats } from "./sportsConfig";

// 🏟️ STADIUM DATA
const stadiums = {
  football: [
    {
      name: "Camp Nou",
      city: "Barcelona",
      img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
    },
    {
      name: "Santiago Bernabéu",
      city: "Madrid",
      img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20",
    },
    {
      name: "Old Trafford",
      city: "Manchester",
      img: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308",
    },
  ],
  cricket: [
    {
      name: "Lord's",
      city: "London",
      img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da",
    },
    {
      name: "MCG",
      city: "Melbourne",
      img: "https://images.unsplash.com/photo-1540749303346-5b43fa01815e",
    },
    {
      name: "Narendra Modi Stadium",
      city: "Ahmedabad",
      img: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece",
    },
  ],
};

/**
 * 🎯 THE MISSING EXPORT: getSportsPlayText
 */
export const getSportsPlayText = (player, sportId) => {
  if (!player) return "READY FOR KICKOFF...";

  const plays = {
    football: [
      `${player.name.toUpperCase()} DRIVES THE BALL FORWARD!`,
      `${player.name.toUpperCase()} LOOKING FOR THE TOP CORNER!`,
      `${player.name.toUpperCase()} CONTROLLING THE MIDFIELD!`,
      `${player.name.toUpperCase()} EXECUTES A PERFECT TACKLE!`,
    ],
    cricket: [
      `${player.name.toUpperCase()} SMASHES IT OVER THE ROPES!`,
      `${player.name.toUpperCase()} DELIVERS A FIERY BOUNCER!`,
      `${player.name.toUpperCase()} DIVES FOR A STUNNING CATCH!`,
      `${player.name.toUpperCase()} STEALS A QUICK SINGLE!`,
    ],
  };

  const list = plays[sportId] || plays.football;
  return list[Math.floor(Math.random() * list.length)];
};

/**
 * 🏟️ EXPORT: getRandomStadium
 */
export const getRandomStadium = (sportId) => {
  const list = stadiums[sportId] || stadiums.football;
  return list[Math.floor(Math.random() * list.length)];
};

/**
 * 🧮 SPORTS SCORING MATH
 */
export const calculateSportsEffectiveScore = (player, slotId, sportId) => {
  if (!player || !player.stats) return 0;

  const statLabels = getRoleStats(sportId, player.role || "DEFAULT");
  let baseTotal = 0;

  statLabels.forEach((stat) => {
    baseTotal += Number(player.stats[stat]) || 0;
  });

  let multiplier = 1;
  if (slotId === "att" || slotId === "opn") multiplier = 1.3;
  if (slotId === "gk" || slotId === "pac") multiplier = 1.2;

  return Math.round(baseTotal * multiplier);
};

/**
 * 📝 TEXT FORMATTER
 */
export const formatSportName = (name) => {
  return name ? name.toUpperCase().replace("_", " ") : "UNKNOWN UNIT";
};

/**
 * 🏟️ GET CONFIG HELPER
 */
export const getArenaDetails = (sportId) => {
  return getSportConfig(sportId);
};
