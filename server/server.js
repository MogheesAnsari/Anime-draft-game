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

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📡 KERNEL_ONLINE: MongoDB Connected Successfully"))
  .catch((err) => console.error("🔥 KERNEL_CRASH: DB Connection Failed", err));

app.get("/api/health", (req, res) => res.status(200).send("ACTIVE"));

// 📝 SCHEMAS
const CharacterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  img: String,
  universe: String,
  atk: { type: Number, default: 60 },
  def: { type: Number, default: 60 },
  spd: { type: Number, default: 60 },
  iq: { type: Number, default: 100 },
  tier: { type: String, default: "B" },
});
const Character = mongoose.model("Character", CharacterSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: "" },
  totalGames: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  scoreHistory: { type: Array, default: [] },
  coins: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  inventory: { type: Array, default: [] },
  sessionId: { type: String, default: "" }, // Protection against multiple logins
});
const User = mongoose.model("User", UserSchema);

// 🚀 CHARACTER FETCH
app.get("/api/characters", async (req, res) => {
  try {
    const { universe } = req.query;
    let dbQuery = {};
    if (universe)
      dbQuery.universe = universe.includes(",")
        ? { $in: universe.split(",") }
        : universe;
    const chars = await Character.find(dbQuery).select(
      "id name img universe atk def spd iq tier",
    );
    res.json(chars);
  } catch (err) {
    res.status(500).json({ error: "DATABASE_FETCH_FAILED" });
  }
});

// ✅ USER ACCESS (LOGIN)
app.post("/api/user/access", async (req, res) => {
  try {
    const { username, avatar } = req.body;
    if (!username) return res.status(400).json({ error: "USERNAME_REQUIRED" });

    const newSessionId = Math.random().toString(36).substring(2, 15);

    let user = await User.findOne({ username });
    if (user) {
      if (avatar && user.avatar !== avatar) user.avatar = avatar;
      user.sessionId = newSessionId;
      await user.save();
    } else {
      user = new User({
        username,
        avatar,
        wins: 0,
        totalGames: 0,
        coins: 0,
        gems: 0,
        sessionId: newSessionId,
      });
      await user.save();
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

// 🔄 LIVE SYNC & SESSION CHECK ROUTE
app.post("/api/user/sync", async (req, res) => {
  try {
    const { username, sessionId } = req.body;

    // 🔥 THE FIX: Prevent crash if frontend sends empty data
    if (!username || !sessionId) {
      return res.status(401).json({ error: "MISSING_CREDENTIALS" });
    }

    const user = await User.findOne({ username });

    // If session doesn't match or user deleted, force logout!
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

// 🌟 RECORD MATCH RESULT
app.post("/api/user/record-match", async (req, res) => {
  try {
    const { username, sessionId, isWin, coinsWon, gemsWon } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.sessionId !== sessionId)
      return res.status(401).json({ error: "UNAUTHORIZED" });

    user.totalGames += 1;
    if (isWin) user.wins += 1;
    user.coins += coinsWon || 0;
    user.gems += gemsWon || 0;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "FAILED_TO_RECORD_MATCH" });
  }
});

// 🌟 GLOBAL LEADERBOARD
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaders = await User.find({})
      .sort({ wins: -1 })
      .limit(50)
      .select("username avatar wins totalGames");
    res.status(200).json(leaders);
  } catch (err) {
    res.status(500).json({ error: "FAILED_TO_FETCH_LEADERBOARD" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
