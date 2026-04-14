import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// .env file load karo
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

let isDbConnected = false;

// 🔗 Database Connection Logic
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in your .env file!");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("✅ SUCCESS: MongoDB Connected Perfectly.");
      isDbConnected = true;
    })
    .catch((err) => {
      console.error("❌ ERROR: MongoDB Connection Failed!");
      console.error("Reason:", err.message);
      isDbConnected = false;
    });
}

// 📂 DATABASE SCHEMA
const UserStatsSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  wins: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
});
const UserStats = mongoose.model("UserStats", UserStatsSchema);

// 🎭 DUMMY DATA (Fallback)
const dummyRankings = [
  { username: "SoloLevelingFan", wins: 15, totalGames: 20 },
  { username: "NarutoUzuma", wins: 12, totalGames: 25 },
  { username: "LuffyD", wins: 10, totalGames: 18 },
];

// 🏆 LEADERBOARD API
app.get("/api/leaderboard", async (req, res) => {
  try {
    if (isDbConnected) {
      const actualRankings = await UserStats.find()
        .sort({ wins: -1 })
        .limit(10);
      if (actualRankings.length > 0)
        return res.status(200).json(actualRankings);
    }
    res.status(200).json(dummyRankings);
  } catch (error) {
    res.status(200).json(dummyRankings);
  }
});

// ⚔️ BATTLE API (Actual Calculation + DB Update)
app.post("/api/battle", async (req, res) => {
  try {
    const { username, mode, teams } = req.body;
    const player = username || "Guest";
    const rawMode = String(mode)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (!teams || teams.length === 0)
      return res.status(400).json({ error: "No teams provided" });

    // Individual Scores Calculate karo
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

    let winnerIndex = 0;
    // 🧠 TEAM MODE LOGIC: Player 1+2 vs Player 3+4
    if (rawMode.includes("team") || rawMode.includes("2v2")) {
      const team1Total = individualScores[0] + (individualScores[1] || 0);
      const team2Total =
        (individualScores[2] || 0) + (individualScores[3] || 0);
      winnerIndex = team1Total >= team2Total ? 0 : 1;
    } else {
      winnerIndex = individualScores.indexOf(Math.max(...individualScores));
    }

    // 🏆 Update Actual DB Ranking
    if (isDbConnected && player !== "Guest") {
      await UserStats.findOneAndUpdate(
        { username: player },
        { $inc: { totalGames: 1, wins: winnerIndex === 0 ? 1 : 0 } },
        { upsert: true },
      );
    }

    res.status(200).json({
      success: true,
      scores: individualScores,
      wins: winnerIndex === 0 ? 1 : 0,
    });
  } catch (error) {
    console.error("Battle Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
