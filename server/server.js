import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs"; // Naya Security Package

dotenv.config();
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Tera local frontend
      "https://tera-vercel-link.vercel.app", // NAYA: Jab Vercel par live karega toh apna link yahan dalna
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// 1. UPDATED SCHEMA (Password aur Total Games add kiya)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wins: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  history: [
    { score: Number, won: Boolean, date: { type: Date, default: Date.now } },
  ],
});
const User = mongoose.model("User", userSchema);

// Power Calculator (Same as before)
const calculatePower = (squad) => {
  if (!squad || Object.keys(squad).length === 0) return 0;
  let score = 0;
  Object.values(squad).forEach(
    (char) => (score += char.atk + char.def + char.spd),
  );
  if (squad.healer) score += squad.healer.def * 0.8;
  if (squad.iq) score += squad.iq.spd * 0.8;
  if (squad.duelist) score += squad.duelist.atk * 0.8;
  if (squad.captain) score += 50;
  return Math.floor(score);
};

// --- NAYI APIs SHURU ---

// 2. REGISTER API
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already taken!" });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save New User
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "Account created successfully!",
      username: newUser.username,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. LOGIN API
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found!" });

    // Check Password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials!" });

    res.status(200).json({
      message: "Login successful!",
      username: user.username,
      wins: user.wins,
      totalGames: user.totalGames,
      fullHistory: user.history,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. LEADERBOARD API
app.get("/api/leaderboard", async (req, res) => {
  try {
    // Top 10 players jinki wins sabse zyada hain
    const topPlayers = await User.find()
      .sort({ wins: -1 })
      .limit(10)
      .select("-password");
    res.status(200).json(topPlayers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PURANI APIs (Updated) ---

// 5. BATTLE API (Ab yahan 'username' frontend se aayega)
app.post("/api/battle", async (req, res) => {
  try {
    const { teams, mode, username } = req.body; // username add kiya
    const scores = teams.map(calculatePower);
    let resultData = {};

    if (mode === "pve") {
      const cpuScore = Math.floor(Math.random() * (1800 - 1300) + 1300);
      resultData = {
        scores: [scores[0], cpuScore],
        labels: ["PLAYER 1", "CPU"],
        winner: scores[0] > cpuScore ? "PLAYER 1" : "CPU",
        won: scores[0] > cpuScore,
      };
    } else if (mode === "pvp") {
      resultData = {
        scores: [scores[0], scores[1]],
        labels: ["PLAYER 1", "PLAYER 2"],
        winner: scores[0] > scores[1] ? "PLAYER 1" : "PLAYER 2",
        won: scores[0] > scores[1],
      };
    } else if (mode === "multi") {
      const maxScore = Math.max(...scores);
      const winnerIndex = scores.indexOf(maxScore);
      resultData = {
        scores,
        labels: ["P1", "P2", "P3", "P4"],
        winner: `PLAYER ${winnerIndex + 1}`,
        won: winnerIndex === 0,
      };
    } else if (mode === "2v2") {
      const teamA = scores[0] + scores[1];
      const teamB = scores[2] + scores[3];
      resultData = {
        scores: [teamA, teamB],
        labels: ["TEAM A", "TEAM B"],
        winner: teamA > teamB ? "TEAM A" : "TEAM B",
        won: teamA > teamB,
      };
    }

    // REAL TIME STATS UPDATE (Using actual username)
    const activeUser = username || "Guest";

    if (activeUser !== "Guest") {
      const updatedUser = await User.findOneAndUpdate(
        { username: activeUser },
        {
          $inc: { wins: resultData.won ? 1 : 0, totalGames: 1 },
          $push: { history: { score: scores[0], won: resultData.won } },
        },
        { new: true },
      );

      return res.status(200).json({
        ...resultData,
        wins: updatedUser.wins,
        fullHistory: updatedUser.history,
      });
    } else {
      // Agar banda bina login khele toh DB update nahi hoga
      return res.status(200).json({ ...resultData, wins: 0, fullHistory: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(5000, () =>
      console.log("🚀 Server Live | Auth & Leaderboard Active"),
    ),
  )
  .catch((err) => console.log("❌ DB Error:", err));
