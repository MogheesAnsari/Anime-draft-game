import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
const app = express();

// ==========================================
// 1. THE ULTIMATE CORS BYPASS
// ==========================================
// Yeh code Vercel, localhost sabko allow kar dega bina kisi error ke
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight request ko direct pass karna
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// JSON Parser
app.use(express.json());

// ==========================================
// 2. ROOT ROUTE (Health Check)
// ==========================================
app.get("/", (req, res) => {
  res.status(200).send("Anime Draft API is Live! 🚀 (CORS Bypassed)");
});

// ==========================================
// 3. DATABASE SCHEMA & MODELS
// ==========================================
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

// Power Calculator Logic
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

// ==========================================
// 4. AUTH ROUTES (Login / Register)
// ==========================================
app.post("/api/register", async (req, res) => {
  console.log(
    `[🔍 REGISTER INITIATED] Request received for username: ${req.body?.username}`,
  );

  try {
    const { username, password } = req.body;

    // Safety Check 1: Empty Fields
    if (!username || !password) {
      console.log("[❌ REGISTER FAILED] Missing username or password.");
      return res
        .status(400)
        .json({ message: "Username and password are required!" });
    }

    // Safety Check 2: Database Connection Status
    if (mongoose.connection.readyState !== 1) {
      console.log(
        "[❌ REGISTER FAILED] MongoDB is NOT connected! Status:",
        mongoose.connection.readyState,
      );
      return res
        .status(500)
        .json({ message: "Database connection error. Try again in a minute." });
    }

    console.log("[⏳ REGISTER] Checking if user exists in DB...");
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      console.log("[❌ REGISTER FAILED] Username already taken.");
      return res.status(400).json({ message: "Username already taken!" });
    }

    console.log("[⏳ REGISTER] Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("[⏳ REGISTER] Saving new user to database...");
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    console.log(
      `[✅ REGISTER SUCCESS] Account created for: ${newUser.username}`,
    );
    return res.status(201).json({
      message: "Account created successfully!",
      username: newUser.username,
    });
  } catch (error) {
    console.log(
      "[🚨 CRITICAL REGISTER ERROR] Server crashed during register:",
      error.message,
    );
    return res.status(500).json({
      message: "Internal server error during registration.",
      error: error.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  console.log(
    `[🔍 LOGIN INITIATED] Request received for username: ${req.body?.username}`,
  );

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.log("[❌ LOGIN FAILED] Missing credentials.");
      return res
        .status(400)
        .json({ message: "Username and password required!" });
    }

    if (mongoose.connection.readyState !== 1) {
      console.log("[❌ LOGIN FAILED] MongoDB is NOT connected!");
      return res.status(500).json({ message: "Database connection error." });
    }

    console.log("[⏳ LOGIN] Searching for user...");
    const user = await User.findOne({ username });

    if (!user) {
      console.log("[❌ LOGIN FAILED] User not found in DB.");
      return res.status(400).json({ message: "User not found!" });
    }

    console.log("[⏳ LOGIN] Verifying password...");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("[❌ LOGIN FAILED] Incorrect password.");
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    console.log(`[✅ LOGIN SUCCESS] User authenticated: ${user.username}`);
    return res.status(200).json({
      message: "Login successful!",
      username: user.username,
      wins: user.wins,
      totalGames: user.totalGames,
      fullHistory: user.history,
    });
  } catch (error) {
    console.log(
      "[🚨 CRITICAL LOGIN ERROR] Server crashed during login:",
      error.message,
    );
    return res.status(500).json({
      message: "Internal server error during login.",
      error: error.message,
    });
  }
});
app.get("/api/leaderboard", async (req, res) => {
  try {
    const topPlayers = await User.find()
      .sort({ wins: -1 })
      .limit(10)
      .select("-password");
    res.status(200).json(topPlayers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. GAME LOGIC (Battle API)
// ==========================================
app.post("/api/battle", async (req, res) => {
  try {
    const { teams, mode, username } = req.body;
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
      return res.status(200).json({ ...resultData, wins: 0, fullHistory: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. SERVER CONNECTION
// ==========================================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server Live on Port ${PORT} | CORS Bypass Active!`);
    });
  })
  .catch((err) => {
    console.log("❌ DB Error:", err);
  });
