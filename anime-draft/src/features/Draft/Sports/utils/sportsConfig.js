export const getSportConfig = (sportId) => {
  const configs = {
    football: {
      teamSize: 11,
      // 🚀 FIXED: Roles now perfectly match your database (ATT, MID, DEF, GK, MGR)
      slots: [
        {
          id: "fw_l",
          role: "ATT",
          label: "LEFT WING",
          top: "15%",
          left: "25%",
        },
        { id: "fw_c", role: "ATT", label: "STRIKER", top: "12%", left: "50%" },
        {
          id: "fw_r",
          role: "ATT",
          label: "RIGHT WING",
          top: "15%",
          left: "75%",
        },
        { id: "mf_l", role: "MID", label: "LEFT MID", top: "38%", left: "25%" },
        {
          id: "mf_c",
          role: "MID",
          label: "CENTER MID",
          top: "42%",
          left: "50%",
        },
        {
          id: "mf_r",
          role: "MID",
          label: "RIGHT MID",
          top: "38%",
          left: "75%",
        },
        {
          id: "df_l",
          role: "DEF",
          label: "LEFT BACK",
          top: "65%",
          left: "15%",
        },
        {
          id: "df_cl",
          role: "DEF",
          label: "CENTER BACK",
          top: "70%",
          left: "35%",
        },
        {
          id: "df_cr",
          role: "DEF",
          label: "CENTER BACK",
          top: "70%",
          left: "65%",
        },
        {
          id: "df_r",
          role: "DEF",
          label: "RIGHT BACK",
          top: "65%",
          left: "85%",
        },
        { id: "gk", role: "GK", label: "GOALKEEPER", top: "88%", left: "50%" },
        { id: "mgr", role: "MGR", label: "MANAGER", top: "50%", left: "8%" },
      ],
      draftPoolQuery: "football",
    },
    cricket: {
      teamSize: 11,
      // 🚀 FIXED: Roles now match your database (BAT, BWL, ALL, WK, IMP)
      slots: [
        { id: "bat_1", role: "BAT", label: "OPENING BATSMAN" },
        { id: "bat_2", role: "BAT", label: "OPENING BATSMAN" },
        { id: "bat_3", role: "BAT", label: "TOP ORDER" },
        { id: "bat_4", role: "BAT", label: "MIDDLE ORDER" },
        { id: "bat_5", role: "BAT", label: "MIDDLE ORDER" },
        { id: "all_1", role: "ALL", label: "ALL ROUNDER" },
        { id: "wk", role: "WK", label: "WICKET KEEPER" },
        { id: "bowl_1", role: "BWL", label: "SPIN BOWLER" },
        { id: "bowl_2", role: "BWL", label: "FAST BOWLER" },
        { id: "bowl_3", role: "BWL", label: "FAST BOWLER" },
        { id: "bowl_4", role: "BWL", label: "DEATH BOWLER" },
        { id: "imp", role: "IMP", label: "IMPACT PLAYER" },
      ],
      draftPoolQuery: "cricket",
    },
  };
  return configs[sportId] || configs.football;
};

// 🚀 FIXED: Updated the stat generator to recognize the new role acronyms
export const getRoleStats = (sportId, role) => {
  if (sportId === "football") {
    switch (role) {
      case "ATT":
        return ["SHOOTING", "SPEED", "DRIBBLING"];
      case "MID":
        return ["PASSING", "VISION", "DRIBBLING"];
      case "DEF":
        return ["DEFENDING", "PHYSICAL", "PACE"];
      case "GK":
        return ["REFLEXES", "POSITIONING", "HANDLING"];
      case "MGR":
        return ["TACTICS", "LEADERSHIP", "MOTIVATION"];
      default:
        return ["POWER", "SPEED", "IQ"];
    }
  }
  if (sportId === "cricket") {
    switch (role) {
      case "BAT":
        return ["BATTING", "POWER", "TECHNIQUE"];
      case "BWL":
        return ["BOWLING", "PACE", "VARIATION"];
      case "ALL":
        return ["BATTING", "BOWLING", "FIELDING"];
      case "WK":
        return ["REFLEXES", "BATTING", "FIELDING"];
      case "IMP":
        return ["POWER", "SPEED", "IMPACT"];
      default:
        return ["POWER", "SPEED", "IQ"];
    }
  }
  return ["POWER", "SPEED", "IQ"];
};
