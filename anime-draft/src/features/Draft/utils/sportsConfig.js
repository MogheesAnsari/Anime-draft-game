export const SPORTS_CONFIG = {
  football: {
    name: "FOOTBALL",
    statLabels: ["PAC", "SHO", "PAS", "DEF"], // Pace, Shooting, Passing, Defending
    slots: [
      { id: "gk", label: "GOALKEEPER" },
      { id: "def", label: "DEFENDER" },
      { id: "mid", label: "MIDFIELDER" },
      { id: "att", label: "ATTACKER" },
      { id: "mgr", label: "MANAGER" },
      { id: "sub", label: "IMPACT SUB" },
    ],
  },
  cricket: {
    name: "CRICKET",
    statLabels: ["BAT", "BWL", "FLD", "STR"], // Batting, Bowling, Fielding, Strike Rate/IQ
    slots: [
      { id: "cap", label: "CAPTAIN" },
      { id: "opn", label: "OPENER" },
      { id: "mid", label: "MIDDLE ORDER" },
      { id: "all", label: "ALL ROUNDER" },
      { id: "pac", label: "PACE BOWLER" },
      { id: "spn", label: "SPIN BOWLER" },
    ],
  },
};

export const getSportConfig = (sportId) => {
  return SPORTS_CONFIG[sportId] || SPORTS_CONFIG.football; // Default fallback
};
