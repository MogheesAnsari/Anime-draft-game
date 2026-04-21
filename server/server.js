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
  .then(() => console.log("📡 KERNEL_ONLINE: MongoDB Connected"))
  .catch((err) => console.error("🔥 KERNEL_CRASH", err));

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: "" },
  totalGames: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  sessionId: { type: String, default: "" }, // Single-device protection
});
const User = mongoose.model("User", UserSchema);

// ✅ USER ACCESS (LOGIN)
app.post("/api/user/access", async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const newSessionId = Math.random().toString(36).substring(2, 15);
    let user = await User.findOne({ username: username.toLowerCase() });
    if (user) {
      user.sessionId = newSessionId; // Kick out older sessions
      if (avatar) user.avatar = avatar;
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
    res.status(500).json({ error: "AUTH_FAILED" });
  }
});

// 🔄 GLOBAL SYNC
app.post("/api/user/sync", async (req, res) => {
  try {
    const { username, sessionId } = req.body;
    if (!username || !sessionId)
      return res.status(401).json({ error: "MISSING_DATA" });
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || user.sessionId !== sessionId)
      return res.status(401).json({ error: "UNAUTHORIZED" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "SYNC_FAILED" });
  }
});

// 🌟 RECORD MATCH (Updates DB properly)
app.post("/api/user/record-match", async (req, res) => {
  try {
    const { username, sessionId, isWin, coinsWon, gemsWon } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || user.sessionId !== sessionId)
      return res.status(401).json({ error: "UNAUTHORIZED" });

    user.totalGames += 1;
    if (isWin) user.wins += 1;
    user.coins += coinsWon || 0;
    user.gems += gemsWon || 0;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "SAVE_FAILED" });
  }
});

// 📊 LEADERBOARD
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaders = await User.find({})
      .sort({ wins: -1 })
      .limit(50)
      .select("username avatar wins totalGames");
    res.status(200).json(leaders);
  } catch (err) {
    res.status(500).json({ error: "FETCH_FAILED" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
