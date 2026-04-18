export const calculateTeamScore = (team) => {
  let total = 0;
  const strategist = team["support"];
  const leaderBoost = strategist
    ? Math.round((Number(strategist.iq) || 100) * 0.1)
    : 0;
  const cap = team.captain || { atk: 0, def: 0, spd: 0, iq: 100 };
  const capTotal =
    (Number(cap.atk) || 0) +
    (Number(cap.def) || 0) +
    (Number(cap.spd) || 0) +
    (Number(cap.iq) || 100) +
    leaderBoost * 3;
  const aura = capTotal * 0.1;

  Object.keys(team).forEach((slotId) => {
    const char = team[slotId];
    if (!char) return;
    let atk =
      (Number(char.atk) || 0) +
      (slotId === "captain" || slotId === "vice_cap" ? leaderBoost : 0);
    let def =
      (Number(char.def) || 0) +
      (slotId === "captain" || slotId === "vice_cap" ? leaderBoost : 0);
    let spd =
      (Number(char.spd) || 0) +
      (slotId === "captain" || slotId === "vice_cap" ? leaderBoost : 0);
    let iq = Number(char.iq) || 100;

    let base = atk + def + spd + iq;
    let bonus = 0;
    if (slotId === "vice_cap") bonus = aura * 2;
    if (slotId === "speedster") bonus = spd * 0.2;
    if (slotId === "tank") bonus = def * 0.3;
    if (slotId === "raw_power") bonus = atk * 0.4;
    total += slotId === "captain" ? base : base + bonus + aura;
  });
  return Math.round(total);
};

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

  while (availableChars.length < 6) {
    availableChars = [...availableChars, ...availableChars];
  }
  const shuffled = availableChars.sort(() => 0.5 - Math.random());
  SLOTS.forEach((id, i) => {
    cpuTeam[id] = shuffled[i];
  });
  return cpuTeam;
};
