import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. DATABASE CONNECTION
// ==========================================
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://admin:admin123@cluster.mongodb.net/animedraft";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("🔥 ENGINE ONLINE: Buffs Activated"))
  .catch((err) => console.error("❌ DB ERROR:", err));

// ==========================================
// 2. USER SCHEMA & MODEL
// ==========================================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wins: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  fullHistory: [
    {
      won: Boolean,
      score: Number,
      mode: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", userSchema);

// ==========================================
// 3. AUTH ROUTES (Login/Register)
// ==========================================
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "TAKEN" });
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: "SUCCESS" });
  } catch (err) {
    res.status(500).json({ message: "ERROR" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(400).json({ message: "INVALID" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "ERROR" });
  }
});

// ==========================================
// 4. THE BATTLE ENGINE (The Fix)
// ==========================================
app.post("/api/battle", async (req, res) => {
  try {
    const { username, mode, teams } = req.body;
    let finalScores = [];
    let labels = [];

    console.log("--- NEW BATTLE CALCULATION ---");

    teams.forEach((team, teamIndex) => {
      let teamTotal = 0;

      // A. CAPTAIN AURA (10% OF TOTAL STATS)
      const cap = team.captain || { atk: 0, def: 0, spd: 0 };
      const capTotalPower =
        (Number(cap.atk) || 0) +
        (Number(cap.def) || 0) +
        (Number(cap.spd) || 0);
      const auraUnit = capTotalPower * 0.1;

      console.log(
        `Team ${teamIndex + 1} Leader: ${cap.name} | Aura Bonus: +${auraUnit.toFixed(2)}`,
      );

      // B. CALCULATE EACH SLOT
      Object.keys(team).forEach((slotId) => {
        const char = team[slotId];
        if (!char) return;

        // Base power of current character
        let base =
          (Number(char.atk) || 0) +
          (Number(char.def) || 0) +
          (Number(char.spd) || 0);
        let slotBonus = 0;

        // SLOT ADVANTAGES
        switch (slotId) {
          case "vice_cap":
            slotBonus = auraUnit * 2; // 20% Captain Aura
            break;
          case "speedster":
            slotBonus = Number(char.spd) * 0.2; // +20% Speed
            break;
          case "tank":
            slotBonus = Number(char.def) * 0.3; // +30% Defense
            break;
          case "raw_power":
            slotBonus = Number(char.atk) * 0.4; // +40% Attack
            break;
          case "support":
            slotBonus = 10; // Fixed Tactical Aid
            break;
          default:
            slotBonus = 0;
        }

        // --- THE FINAL MATH ---
        // Captain gets 100% (Base Only)
        // Others get Base + Slot Bonus + Captain's 10% Aura
        const finalCharScore =
          slotId === "captain" ? base : base + slotBonus + auraUnit;

        teamTotal += finalCharScore;
        console.log(
          `- ${slotId}: ${char.name} | Base: ${base} | Bonus: ${slotBonus.toFixed(1)} | Aura: ${slotId === "captain" ? 0 : auraUnit.toFixed(1)} | Total: ${finalCharScore.toFixed(1)}`,
        );
      });

      finalScores.push(Math.round(teamTotal));
    });

    console.log("FINAL TEAM SCORES:", finalScores);

    // MODE LOGIC
    if (mode === "pve" || mode === "PVE") {
      labels = ["MOGHEES", "CPU BOT"];
    } else if (mode === "2v2") {
      const t1 = finalScores[0] + finalScores[1];
      const t2 = finalScores[2] + finalScores[3];
      finalScores = [t1, t2];
      labels = ["TEAM 1", "TEAM 2"];
    } else {
      labels = finalScores.map((_, i) => `PLAYER ${i + 1}`);
    }

    const winnerIndex = finalScores.indexOf(Math.max(...finalScores));

    // DB Update
    if (username && username !== "Guest") {
      const user = await User.findOne({ username });
      if (user) {
        user.totalGames += 1;
        if (winnerIndex === 0) user.wins += 1;
        user.fullHistory.push({
          won: winnerIndex === 0,
          score: finalScores[0],
          mode,
          date: new Date(),
        });
        await user.save();
      }
    }

    res
      .status(200)
      .json({ winner: labels[winnerIndex], scores: finalScores, labels });
  } catch (error) {
    console.error("CRITICAL ENGINE ERROR:", error);
    res.status(500).json({ message: "CALCULATION FAILED" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`));
