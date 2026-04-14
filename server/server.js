import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// 1. HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Anime Draft API is running!");
});

// 2. AUTH ROUTES
app.post("/api/login", (req, res) => {
  res.json({ success: true, message: "Logged in", user: req.body });
});

app.post("/api/register", (req, res) => {
  res.json({ success: true, message: "Registered", user: req.body });
});

// 3. LEADERBOARD API (Fixes 404)
app.get("/api/leaderboard", async (req, res) => {
  try {
    const rankings = [
      { username: "SoloLevelingFan", wins: 15, totalGames: 20 },
      { username: "NarutoUzuma", wins: 12, totalGames: 25 },
      { username: "LuffyD", wins: 10, totalGames: 18 },
      { username: "Zoro_Lost", wins: 8, totalGames: 15 },
    ];
    res.status(200).json(rankings);
  } catch (error) {
    res.status(500).json({ error: "Leaderboard fetch error" });
  }
});

// 4. DASHBOARD API (Fixes 404)
app.get("/api/dashboard/:username", async (req, res) => {
  try {
    const { username } = req.params;
    res.status(200).json({
      username: username,
      wins: 0,
      totalGames: 0,
      history: [],
    });
  } catch (error) {
    res.status(500).json({ error: "Dashboard fetch error" });
  }
});

// 5. BATTLE API
app.post("/api/battle", async (req, res) => {
  try {
    const { username, mode, teams } = req.body;
    if (!teams || teams.length === 0)
      return res.status(400).json({ error: "No teams" });

    const rawMode = String(mode)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const individualScores = teams.map((team) => {
      let total = 0;
      const captain = team.captain || { atk: 0, def: 0, spd: 0 };
      const aura =
        ((Number(captain.atk) || 0) +
          (Number(captain.def) || 0) +
          (Number(captain.spd) || 0)) *
        0.1;

      Object.keys(team).forEach((slotId) => {
        const char = team[slotId];
        if (!char) return;
        let base =
          (Number(char.atk) || 0) +
          (Number(char.def) || 0) +
          (Number(char.spd) || 0);
        let bonus = 0;
        if (slotId === "vice_cap") bonus = aura * 2;
        if (slotId === "speedster") bonus = (Number(char.spd) || 0) * 0.2;
        if (slotId === "tank") bonus = (Number(char.def) || 0) * 0.3;
        if (slotId === "raw_power") bonus = (Number(char.atk) || 0) * 0.4;
        if (slotId === "support") bonus = 10;
        total += slotId === "captain" ? base : base + bonus + aura;
      });
      return Math.round(total);
    });

    let finalScores = individualScores;
    let winnerIndex = 0;

    if (rawMode.includes("team") || rawMode.includes("2v2")) {
      const team1Total = individualScores[0] + (individualScores[1] || 0);
      const team2Total =
        (individualScores[2] || 0) + (individualScores[3] || 0);
      finalScores = [team1Total, team2Total];
      winnerIndex = team1Total >= team2Total ? 0 : 1;
    } else {
      winnerIndex = individualScores.indexOf(Math.max(...individualScores));
    }

    res.status(200).json({
      success: true,
      scores: finalScores,
      wins: winnerIndex === 0 ? 1 : 0,
      fullHistory: [],
      totalGames: 1,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
