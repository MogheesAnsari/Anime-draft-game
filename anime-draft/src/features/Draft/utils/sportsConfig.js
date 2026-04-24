// 🏆 SPORTS ARENA CONFIGURATION
export const getSportConfig = (sportId) => {
  const configs = {
    football: {
      name: "Football Arena",
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
      name: "Cricket Stadium",
      slots: [
        { id: "cap", label: "CAPTAIN" },
        { id: "opn", label: "OPENER" },
        { id: "mid", label: "MIDDLE ORDER" },
        { id: "all", label: "ALL ROUNDER" },
        { id: "bwl", label: "BOWLER" },
        { id: "wk", label: "WICKETKEEPER" },
      ],
    },
  };
  return configs[sportId] || configs.football;
};

// 🎯 DYNAMIC ROLE-BASED STAT LABELS
export const getRoleStats = (sport, role) => {
  const config = {
    football: {
      ATT: ["SHO", "PAC", "STA", "DRI"],
      MID: ["PAS", "VIS", "STA", "DEF"],
      DEF: ["DEF", "PHY", "TAC", "PAC"],
      GK: ["DIV", "REF", "HAN", "POS"],
      MGR: ["IQ", "TAC", "MOT", "EXP"],
      DEFAULT: ["PAC", "SHO", "PAS", "DEF"],
    },
    cricket: {
      BAT: ["BAT", "STR", "RUN", "POW"],
      BWL: ["BWL", "PAC", "SPN", "ACC"],
      ALL: ["BAT", "BWL", "FLD", "STA"],
      WK: ["GLV", "REF", "BAT", "AGI"],
      MGR: ["IQ", "TAC", "EXP", "MOT"],
      DEFAULT: ["BAT", "BWL", "FLD", "STR"],
    },
  };
  return config[sport]?.[role] || config[sport]?.DEFAULT;
};
