import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

const app = express();

// ✅ PRODUCTION CORS: Allows frontend from Vercel, Render, or Localhost to connect
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" })); // Handles large image uploads or bulk data

// ✅ MONGODB CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📡 KERNEL_ONLINE: MongoDB Connected Successfully"))
  .catch((err) => console.error("🔥 KERNEL_CRASH: DB Connection Failed", err));

// 🟢 HEALTH CHECK (For Render to know server is alive)
app.get("/api/health", (req, res) =>
  res.status(200).send({ status: "ACTIVE", version: "1.1.0" }),
);

/* ==========================================
   📝 DATABASE SCHEMAS (FUTURE-PROOFED)
   ========================================== */

const CharacterSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    img: String,
    universe: String,
    atk: { type: Number, default: 60 },
    def: { type: Number, default: 60 },
    spd: { type: Number, default: 60 },
    iq: { type: Number, default: 100 },
    tier: { type: String, default: "B" },
  },
  { timestamps: true },
); // Tracks when a character was added
const Character = mongoose.model("Character", CharacterSchema);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    role: { type: String, default: "player" }, // Can be "admin" in the future

    // Combat Stats
    totalGames: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    bossKills: { type: Number, default: 0 }, // Ready for Phase 6 (PvE Boss Raids)
    highestScore: { type: Number, default: 0 },

    // Economy & Inventory
    coins: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    inventory: { type: Array, default: [] }, // Will store purchased Artifacts/Skins

    // Security
    sessionId: { type: String, default: "" }, // Prevents multi-device login glitches
  },
  { timestamps: true },
); // Tracks exact account creation date
const User = mongoose.model("User", UserSchema);

/* ==========================================
   🚀 API ROUTES
   ========================================== */

// 🟢 1. FETCH CHARACTERS (Supports universe filtering)
app.get("/api/characters", async (req, res) => {
  try {
    const { universe } = req.query;
    let dbQuery = {};
    if (universe) {
      dbQuery.universe = universe.includes(",")
        ? { $in: universe.split(",") }
        : universe;
    }
    const chars = await Character.find(dbQuery).select(
      "id name img universe atk def spd iq tier",
    );
    res.json(chars);
  } catch (err) {
    res.status(500).json({ error: "DATABASE_FETCH_FAILED" });
  }
});

// 🟢 2. USER ACCESS (LOGIN/REGISTER)
app.post("/api/user/access", async (req, res) => {
  try {
    const { username, avatar } = req.body;
    if (!username) return res.status(400).json({ error: "USERNAME_REQUIRED" });

    // Generate strict new session ID to boot old logins
    const newSessionId = Math.random().toString(36).substring(2, 15);

    let user = await User.findOne({ username: username.toLowerCase() });
    if (user) {
      if (avatar && user.avatar !== avatar) user.avatar = avatar; // Update avatar if changed
      user.sessionId = newSessionId;
      await user.save();
    } else {
      user = new User({
        username: username.toLowerCase(),
        avatar,
        sessionId: newSessionId,
      });
      await user.save();
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

// 🟢 3. LIVE SYNC & SESSION VALIDATION
app.post("/api/user/sync", async (req, res) => {
  try {
    const { username, sessionId } = req.body;
    if (!username || !sessionId)
      return res.status(401).json({ error: "MISSING_CREDENTIALS" });

    const user = await User.findOne({ username: username.toLowerCase() });

    // Core Security: Force logout if session changed
    if (!user || user.sessionId !== sessionId) {
      return res
        .status(401)
        .json({ error: "SESSION_EXPIRED_OR_DUPLICATE_LOGIN" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "SYNC_FAILED" });
  }
});

// 🟢 4. RECORD MATCH RESULT (Updates stats and economy)
app.post("/api/user/record-match", async (req, res) => {
  try {
    const {
      username,
      sessionId,
      isWin,
      coinsWon,
      gemsWon,
      matchScore,
      isBossRaid,
    } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || user.sessionId !== sessionId)
      return res.status(401).json({ error: "UNAUTHORIZED" });

    // Update standard stats
    user.totalGames += 1;
    if (isWin) {
      user.wins += 1;
      if (isBossRaid) user.bossKills += 1; // Future-proof for Phase 6
    }

    // Update highest score if the new score is better
    if (matchScore && matchScore > user.highestScore) {
      user.highestScore = matchScore;
    }

    // Add Loot
    user.coins += coinsWon || 0;
    user.gems += gemsWon || 0;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "FAILED_TO_RECORD_MATCH" });
  }
});

// 🟢 5. NEW: SHOP PURCHASING API (Future-Proofing for Shop.jsx)
app.post("/api/user/buy-item", async (req, res) => {
  try {
    const { username, sessionId, item, price, currencyType } = req.body; // currencyType = 'coins' or 'gems'

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || user.sessionId !== sessionId)
      return res.status(401).json({ error: "UNAUTHORIZED" });

    // Check if user already owns the item
    const alreadyOwns = user.inventory.some((i) => i.name === item.name);
    if (alreadyOwns) return res.status(400).json({ error: "ALREADY_OWNED" });

    // Economy Check & Deduction
    if (currencyType === "gems") {
      if (user.gems < price)
        return res.status(400).json({ error: "INSUFFICIENT_GEMS" });
      user.gems -= price;
    } else {
      if (user.coins < price)
        return res.status(400).json({ error: "INSUFFICIENT_COINS" });
      user.coins -= price;
    }

    // Add item to inventory
    user.inventory.push(item);
    await user.save();

    res.status(200).json({ message: "PURCHASE_SUCCESSFUL", user });
  } catch (err) {
    res.status(500).json({ error: "PURCHASE_FAILED" });
  }
});

// 🟢 6. GLOBAL LEADERBOARD (Top 50 Commanders)
app.get("/api/leaderboard", async (req, res) => {
  try {
    // Exclude admins from leaderboard (optional), sort by wins
    const leaders = await User.find({ role: { $ne: "admin" } })
      .sort({ wins: -1, highestScore: -1 }) // If wins tie, highest score breaks tie!
      .limit(50)
      .select("username avatar wins totalGames bossKills highestScore");

    res.status(200).json(leaders);
  } catch (err) {
    res.status(500).json({ error: "FAILED_TO_FETCH_LEADERBOARD" });
  }
});

/* ==========================================
   🔥 SERVER INITIALIZATION
   ========================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CORE ENGINE RUNNING ON PORT ${PORT}`));
