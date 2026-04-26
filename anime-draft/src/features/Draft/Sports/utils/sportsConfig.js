export const getSportConfig = (sportId) => {
  const configs = {
    football: {
      name: "Football Arena",
      // ⚽ FOOTBALL: 100% UNTOUCHED
      slots: [
        { id: "mgr", label: "MANAGER", role: "MGR", top: "6%", left: "12%" },
        { id: "lwf", label: "LWF", role: "ATT", top: "18%", left: "20%" },
        { id: "cf", label: "CF", role: "ATT", top: "12%", left: "50%" },
        { id: "rwf", label: "RWF", role: "ATT", top: "18%", left: "80%" },
        { id: "lcm", label: "CMF", role: "MID", top: "38%", left: "25%" },
        { id: "ccm", label: "CMF", role: "MID", top: "48%", left: "50%" },
        { id: "rcm", label: "CMF", role: "MID", top: "38%", left: "75%" },
        { id: "lb", label: "LB", role: "DEF", top: "68%", left: "15%" },
        { id: "lcb", label: "CB", role: "DEF", top: "73%", left: "35%" },
        { id: "rcb", label: "CB", role: "DEF", top: "73%", left: "65%" },
        { id: "rb", label: "RB", role: "DEF", top: "68%", left: "85%" },
        { id: "gk", label: "GK", role: "GK", top: "88%", left: "50%" },
      ],
    },
    cricket: {
      name: "Mega Auction",
      // 🏏 CRICKET: No positions needed because it's a List UI now!
      slots: [
        { id: "imp", label: "IMPACT PLAYER", role: "IMP" }, // 💥 The new Impact slot!
        { id: "wk", label: "WICKETKEEPER", role: "WK" },
        { id: "bat1", label: "OPENING BATTER", role: "BAT" },
        { id: "bat2", label: "OPENING BATTER", role: "BAT" },
        { id: "bat3", label: "MIDDLE ORDER", role: "BAT" },
        { id: "bat4", label: "MIDDLE ORDER", role: "BAT" },
        { id: "bat5", label: "POWER HITTER", role: "BAT" },
        { id: "all1", label: "ALL-ROUNDER", role: "ALL" },
        { id: "all2", label: "ALL-ROUNDER", role: "ALL" },
        { id: "bwl1", label: "PACE BOWLER", role: "BWL" },
        { id: "bwl2", label: "PACE BOWLER", role: "BWL" },
        { id: "bwl3", label: "SPIN BOWLER", role: "BWL" },
      ],
    },
  };
  return configs[sportId] || configs.football;
};

export const getRoleStats = (sportId, role) => {
  if (role === "MGR") return ["IQ", "EXP", "TACTICS", "CHARISMA"];
  if (role === "IMP") return ["BATTING", "BOWLING", "FIELDING", "POWER"];

  const stats = {
    football: {
      ATT: ["SHOOTING", "PACE", "DRIBBLING", "PHYSICAL"],
      MID: ["PASSING", "VISION", "DRIBBLING", "STAMINA"],
      DEF: ["TACKLING", "PHYSICAL", "HEADING", "PACE"],
      GK: ["DIVING", "REFLEXES", "HANDLING", "POSITIONING"],
      DEFAULT: ["PACE", "SHOOTING", "PASSING", "DEFENDING"],
    },
    cricket: {
      BAT: ["BATTING", "POWER", "TIMING", "RUNNING"],
      BWL: ["BOWLING", "PACE", "ACCURACY", "VARIATION"],
      ALL: ["BATTING", "BOWLING", "FIELDING", "STAMINA"],
      WK: ["GLOVES", "REFLEXES", "AGILITY", "BATTING"],
      DEFAULT: ["BATTING", "BOWLING", "FIELDING", "POWER"],
    },
  };
  return stats[sportId]?.[role] || stats[sportId]?.DEFAULT || [];
};
