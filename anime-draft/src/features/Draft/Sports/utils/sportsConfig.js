export const getSportConfig = (sportId) => {
  const configs = {
    football: {
      name: "Football Arena",
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
      name: "Cricket Stadium",
      slots: [
        { id: "mgr", label: "COACH", role: "MGR", top: "6%", left: "12%" },
        { id: "op1", label: "OPENER", role: "BAT", top: "18%", left: "35%" },
        { id: "op2", label: "OPENER", role: "BAT", top: "18%", left: "65%" },
        { id: "mo1", label: "BATSMAN", role: "BAT", top: "33%", left: "20%" },
        { id: "mo2", label: "BATSMAN", role: "BAT", top: "33%", left: "80%" },
        { id: "mo3", label: "BATSMAN", role: "BAT", top: "43%", left: "50%" },
        { id: "al1", label: "ALL RND", role: "ALL", top: "58%", left: "30%" },
        { id: "al2", label: "ALL RND", role: "ALL", top: "58%", left: "70%" },
        { id: "wk", label: "WICKET", role: "WK", top: "73%", left: "50%" },
        { id: "bw1", label: "BOWLER", role: "BWL", top: "88%", left: "20%" },
        { id: "bw2", label: "BOWLER", role: "BWL", top: "88%", left: "50%" },
        { id: "bw3", label: "BOWLER", role: "BWL", top: "88%", left: "80%" },
      ],
    },
  };
  return configs[sportId] || configs.football;
};

// 🎯 UPGRADED: Exactly 4 Stats for EVERY role!
export const getRoleStats = (sportId, role) => {
  if (role === "MGR") return ["IQ", "EXP", "TACTICS", "CHARISMA"];

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
