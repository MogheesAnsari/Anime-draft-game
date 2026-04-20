import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import axios from "axios";
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
});
const User = mongoose.model("User", UserSchema);

// 🚀 CHARACTER ROUTES
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

// ⚔️ ADMIN ROUTES
app.put("/api/admin/update-character/:id", async (req, res) => {
  try {
    const charId = req.params.id;
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    const updated = await Character.findOneAndUpdate(
      { id: { $in: [Number(charId), String(charId)] } },
      { $set: updateData },
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "CHARACTER_NOT_FOUND" });
    res.json({ message: "SUCCESS", character: updated });
  } catch (err) {
    res.status(500).json({ error: "DATABASE_SYNC_ERROR" });
  }
});

app.delete("/api/admin/cleanup-duplicates", async (req, res) => {
  try {
    const duplicates = await Character.aggregate([
      {
        $group: {
          _id: { name: "$name", universe: "$universe" },
          uniqueIds: { $addToSet: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);
    let deletedCount = 0;
    for (const doc of duplicates) {
      const idsToDelete = doc.uniqueIds.slice(1);
      const result = await Character.deleteMany({ _id: { $in: idsToDelete } });
      deletedCount += result.deletedCount;
    }
    res.json({ message: "CLEANUP_SUCCESS", deletedCount });
  } catch (err) {
    res.status(500).json({ error: "DATABASE_CLEANUP_ERROR" });
  }
});

// ✅ USER ACCESS ROUTE
app.post("/api/user/access", async (req, res) => {
  try {
    const { username, avatar } = req.body;
    if (!username) return res.status(400).json({ error: "USERNAME_REQUIRED" });
    let user = await User.findOne({ username });
    if (user) {
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      user = new User({ username, avatar, wins: 0, totalGames: 0 });
      await user.save();
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

// 🌟 NEW: RECORD MATCH RESULT (Call this when a battle ends)
app.post("/api/user/record-match", async (req, res) => {
  try {
    const { username, isWin } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

    user.totalGames += 1;
    if (isWin) user.wins += 1;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "FAILED_TO_RECORD_MATCH" });
  }
});

// 🌟 NEW: GLOBAL LEADERBOARD ROUTE
app.get("/api/leaderboard", async (req, res) => {
  try {
    // Fetch top 50 users sorted by wins in descending order
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
