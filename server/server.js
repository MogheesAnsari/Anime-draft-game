import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

let isDbConnected = false;

// 🔗 Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ SUCCESS: Connected to MongoDB.");
    isDbConnected = true;
  })
  .catch((err) => {
    console.error("❌ ERROR: Connection Failed:", err.message);
    isDbConnected = false;
  });

// 📂 DATABASE SCHEMA (Flexible for existing data)
const UserStatsSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String },
    wins: { type: Number, default: 0 },
    totalGames: { type: Number, default: 0 },
    lastPlayed: { type: Date, default: Date.now },
  },
  { strict: false },
);

// Yahan 'users' aapki existing collection ka naam hai
const UserStats = mongoose.model("UserStats", UserStatsSchema, "users");

// 🔑 AUTH ROUTES (Fixes 404 Error)
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await UserStats.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    const newUser = new UserStats({
      username,
      password,
      wins: 0,
      totalGames: 0,
    });
    await newUser.save();
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserStats.findOne({ username });

    if (user) {
      // Direct login check
      return res.status(200).json({ success: true, user });
    }
    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// 🏆 LEADERBOARD API
app.get("/api/leaderboard", async (req, res) => {
  try {
    if (isDbConnected) {
      const rankings = await UserStats.find({}).sort({ wins: -1 }).limit(50);
      if (rankings.length > 0) return res.status(200).json(rankings);
    }
    res.status(200).json([{ username: "No Data", wins: 0, totalGames: 0 }]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📊 DASHBOARD API
app.get("/api/dashboard/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const stats = await UserStats.findOne({ username });
    if (stats) return res.status(200).json(stats);
    res.status(200).json({ username, wins: 0, totalGames: 0 });
  } catch (error) {
    res.status(500).json({ error: "Dashboard error" });
  }
});

// ⚔️ BATTLE API
app.post("/api/battle", async (req, res) => {
  try {
    const { username, mode, teams } = req.body;
    // ... Battle logic (Scores calculation) ...
    let winnerIndex = 0;

    if (isDbConnected && username !== "Guest") {
      await UserStats.findOneAndUpdate(
        { username: username },
        {
          $inc: { wins: winnerIndex === 0 ? 1 : 0, totalGames: 1 },
          $set: { lastPlayed: new Date() },
        },
        { upsert: true },
      );
    }
    res.status(200).json({ success: true, wins: winnerIndex === 0 ? 1 : 0 });
  } catch (error) {
    res.status(500).json({ error: "Battle failed" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
