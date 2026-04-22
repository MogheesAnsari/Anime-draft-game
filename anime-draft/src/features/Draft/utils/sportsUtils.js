import { getSportConfig } from "./sportsConfig";

// 🏟️ STADIUM DATABASE
export const SPORTS_STADIUMS = {
  football: [
    { name: "WEMBLEY STADIUM", buffText: "+15% HOME ADVANTAGE" },
    { name: "CAMP NOU", buffText: "+15% POSSESSION BOOST" },
    { name: "SANTIAGO BERNABEU", buffText: "+15% COUNTER ATTACK" },
  ],
  cricket: [
    { name: "LORD'S", buffText: "+15% SWING BOWLING" },
    { name: "MCG", buffText: "+15% PACE BOUNCE" },
    { name: "EDEN GARDENS", buffText: "+15% SPIN GRIP" },
  ],
};

export const getRandomStadium = (sportId) => {
  const stadiums = SPORTS_STADIUMS[sportId] || SPORTS_STADIUMS.football;
  return stadiums[Math.floor(Math.random() * stadiums.length)];
};

// ⚡ DYNAMIC HIGHLIGHT REEL TEXT
export const getSportsPlayText = (slotId, sportId) => {
  if (sportId === "football") {
    const plays = {
      gk: "SUPER SAVE",
      def: "PERFECT TACKLE",
      mid: "THROUGH BALL",
      att: "TOP BINS FINISH",
      mgr: "TACTICAL MASTERCLASS",
      sub: "LATE WINNER",
    };
    return plays[slotId] || "HIGHLIGHT PLAY";
  } else if (sportId === "cricket") {
    const plays = {
      cap: "FIELD PLACEMENT",
      opn: "COVER DRIVE",
      mid: "HELICOPTER SHOT",
      all: "CRUCIAL BREAKTHROUGH",
      pac: "YORKER",
      spn: "GOOGLY",
    };
    return plays[slotId] || "HIGHLIGHT PLAY";
  }
  return "HIGHLIGHT PLAY";
};

// 🧮 SPORTS SCORING MATH
export const calculateSportsEffectiveScore = (player, slotId, sportId) => {
  if (!player || !player.stats) return 0;
  const config = getSportConfig(sportId);

  // 1. Calculate Base (Sum of all configured stats for that sport)
  let base = 0;
  config.statLabels.forEach((stat) => {
    base += Number(player.stats[stat]) || 0;
  });

  // 2. Multipliers based on position/role
  let multiplier = 1;
  // Attackers and Openers get a slightly higher raw point ceiling
  if (slotId === "att" || slotId === "opn") multiplier = 1.3;
  // GK and Pacers are defensive/impact anchors
  if (slotId === "gk" || slotId === "pac") multiplier = 1.2;

  return Math.round(base * multiplier);
};

export const calculateSportsTeamScore = (team, sportId) => {
  return Object.keys(team).reduce(
    (acc, slot) =>
      acc + calculateSportsEffectiveScore(team[slot], slot, sportId),
    0,
  );
};
