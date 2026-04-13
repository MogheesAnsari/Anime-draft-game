import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. MONGODB CONNECTION
// ==========================================
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://<YOUR_USER>:<YOUR_PASS>@cluster.mongodb.net/animedraft?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

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
// 3. AUTH ROUTES (LOGIN & REGISTER)
// ==========================================

// Register Route
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "USERNAME ALREADY TAKEN" });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: "REGISTERED SUCCESSFULLY" });
  } catch (error) {
    res.status(500).json({ message: "SERVER ERROR" });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(400).json({ message: "INVALID CREDENTIALS" });
    }

    res.status(200).json({
      username: user.username,
      wins: user.wins,
      totalGames: user.totalGames,
      fullHistory: user.fullHistory,
    });
  } catch (error) {
    res.status(500).json({ message: "SERVER ERROR" });
  }
});

// ==========================================
// 4. BATTLE ENGINE ROUTE (DASHBOARD UPDATE)
// ==========================================
app.post("/api/battle", async (req, res) => {
  try {
    const { username, mode, teams } = req.body;

    let scores = [];
    let labels = [];

    teams.forEach((team, index) => {
      let teamScore = 0;
      Object.values(team).forEach((char) => {
        teamScore += (char.atk || 0) + (char.def || 0) + (char.spd || 0);
      });
      scores.push(teamScore);
      labels.push(`PLAYER ${index + 1}`);
    });

    if (mode === "pve" || mode === "PVE") {
      labels = ["PLAYER", "HOSTILE CPU"];
    }

    const maxScore = Math.max(...scores);
    const winnerIndex = scores.indexOf(maxScore);
    const winner = labels[winnerIndex];

    let updatedWins = 0;
    let updatedTotal = 0;
    let updatedHistory = [];

    if (username) {
      const user = await User.findOne({ username });
      if (user) {
        user.totalGames += 1;

        const isWin = winnerIndex === 0;
        if (isWin) {
          user.wins += 1;
        }

        user.fullHistory.push({
          won: isWin,
          score: scores[0],
          mode: mode,
          date: new Date(),
        });

        await user.save();
        updatedWins = user.wins;
        updatedTotal = user.totalGames;
        updatedHistory = user.fullHistory;
      }
    }

    res.status(200).json({
      winner,
      scores,
      labels,
      wins: updatedWins,
      totalGames: updatedTotal,
      fullHistory: updatedHistory,
    });
  } catch (error) {
    console.error("Battle Error:", error);
    res.status(500).json({ message: "BATTLE CALCULATION FAILED" });
  }
});

// ==========================================
// 5. LEADERBOARD ROUTE (GLOBAL RANKING)
// ==========================================
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaders = await User.find({}, "username wins totalGames")
      .sort({ wins: -1 })
      .limit(15);

    res.status(200).json(leaders);
  } catch (error) {
    res.status(500).json({ message: "FAILED TO FETCH RANKINGS" });
  }
});

// ==========================================
// 6. SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SYSTEM ONLINE: Engine running on port ${PORT}`);
});
