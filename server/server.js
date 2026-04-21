import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📡 KERNEL_ONLINE: MongoDB Connected Successfully"))
  .catch((err) => console.error("🔥 KERNEL_CRASH: DB Connection Failed", err));

app.get("/api/health", (req, res) =>
  res.status(200).send({ status: "ACTIVE", version: "2.0.0-MULTIVERSE" }),
);

/* ==========================================
   📝 DATABASE SCHEMAS
   ========================================== */
const CharacterSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    img: String,
    universe: String,
    category: { type: String, default: "anime" }, // 🔥 NEW: "anime", "comic", or "sports"
    atk: { type: Number, default: 60 },
    def: { type: Number, default: 60 },
    spd: { type: Number, default: 60 },
    iq: { type: Number, default: 100 },
    tier: { type: String, default: "B" },
  },
  { timestamps: true },
);
const Character = mongoose.model("Character", CharacterSchema);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    role: { type: String, default: "player" },
    totalGames: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    bossKills: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    inventory: { type: Array, default: [] },
    sessionId: { type: String, default: "" },
  },
  { timestamps: true },
);
const User = mongoose.model("User", UserSchema);

/* ==========================================
   🚀 API ROUTES
   ========================================== */
// 🟢 1. FETCH CHARACTERS (Now supports filtering by category & universe)
app.get("/api/characters", async (req, res) => {
  try {
    const { universe, category } = req.query;
    let dbQuery = {};
    if (universe)
      dbQuery.universe = universe.includes(",")
        ? { $in: universe.split(",") }
        : universe;
    if (category) dbQuery.category = category; // Fetch only comics or only anime

    const chars = await Character.find(dbQuery).select(
      "id name img universe category atk def spd iq tier",
    );
    res.json(chars);
  } catch (err) {
    res.status(500).json({ error: "DATABASE_FETCH_FAILED" });
  }
});

// 🟢 2. USER ACCESS (LOGIN)
app.post("/api/user/access", async (req, res) => {
  try {
    const { username, avatar } = req.body;
    if (!username) return res.status(400).json({ error: "USERNAME_REQUIRED" });
    const newSessionId = Math.random().toString(36).substring(2, 15);
    let user = await User.findOne({ username: username.toLowerCase() });
    if (user) {
      if (avatar && user.avatar !== avatar) user.avatar = avatar;
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

// 🟢 3. LIVE SYNC
app.post("/api/user/sync", async (req, res) => {
  try {
    const { username, sessionId } = req.body;
    if (!username || !sessionId)
      return res.status(401).json({ error: "MISSING_CREDENTIALS" });
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || user.sessionId !== sessionId)
      return res.status(401).json({ error: "SESSION_EXPIRED" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "SYNC_FAILED" });
  }
});

// 🟢 4. RECORD MATCH
app.post("/api/user/record-match", async (req, res) => {
  try {
    const { username, sessionId, isWin, coinsWon, gemsWon, matchScore } =
      req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || user.sessionId !== sessionId)
      return res.status(401).json({ error: "UNAUTHORIZED" });

    user.totalGames += 1;
    if (isWin) user.wins += 1;
    if (matchScore && matchScore > user.highestScore)
      user.highestScore = matchScore;
    user.coins += coinsWon || 0;
    user.gems += gemsWon || 0;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "FAILED_TO_RECORD_MATCH" });
  }
});

// 🟢 5. BUY ITEM
app.post("/api/user/buy-item", async (req, res) => {
  try {
    const { username, sessionId, item, price, currencyType } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || user.sessionId !== sessionId)
      return res.status(401).json({ error: "UNAUTHORIZED" });

    if (user.inventory.some((i) => i.name === item.name))
      return res.status(400).json({ error: "ALREADY_OWNED" });
    if (currencyType === "gems") {
      if (user.gems < price)
        return res.status(400).json({ error: "INSUFFICIENT_GEMS" });
      user.gems -= price;
    } else {
      if (user.coins < price)
        return res.status(400).json({ error: "INSUFFICIENT_COINS" });
      user.coins -= price;
    }

    user.inventory.push(item);
    await user.save();
    res.status(200).json({ message: "PURCHASE_SUCCESSFUL", user });
  } catch (err) {
    res.status(500).json({ error: "PURCHASE_FAILED" });
  }
});

// 🟢 6. LEADERBOARD
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaders = await User.find({ role: { $ne: "admin" } })
      .sort({ wins: -1, highestScore: -1 })
      .limit(50)
      .select("username avatar wins totalGames highestScore");
    res.status(200).json(leaders);
  } catch (err) {
    res.status(500).json({ error: "FAILED_TO_FETCH_LEADERBOARD" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 MULTIVERSE ENGINE RUNNING ON PORT ${PORT}`),
);
