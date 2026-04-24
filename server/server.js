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

app.get("/api/health", (req, res) => res.status(200).send("ACTIVE"));

// ==========================================
// ⚔️ ANIME MULTIVERSE SCHEMAS & ROUTES
// ==========================================
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

// 🛡️ STRIPPED _id TO PREVENT MONGO CRASHES
app.put("/api/admin/bulk-update", async (req, res) => {
  try {
    const updates = req.body;
    const results = [];
    for (const char of updates) {
      const cData = { ...char };
      delete cData._id;
      delete cData.__v;
      const updated = await Character.findOneAndUpdate(
        { id: String(char.id) },
        { $set: cData },
        { new: true, upsert: true },
      );
      if (updated) results.push(updated.name);
    }
    res.json({
      message: "ANIME_ROSTER_SYNC_COMPLETE",
      updated_count: results.length,
    });
  } catch (err) {
    res.status(500).json({ error: "BULK_SYNC_FAILED", details: err.message });
  }
});

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
    res.json({ message: "SUCCESS", character: updated });
  } catch (err) {
    res
      .status(500)
      .json({ error: "DATABASE_SYNC_ERROR", details: err.message });
  }
});

app.delete("/api/admin/delete-character/:id", async (req, res) => {
  try {
    await Character.deleteOne({ id: String(req.params.id) });
    res.json({ message: "CHARACTER_DELETED_SUCCESSFULLY" });
  } catch (err) {
    res.status(500).json({ error: "DELETE_FAILED" });
  }
});

// ==========================================
// 🏆 SPORTS MULTIVERSE SCHEMAS & ROUTES
// ==========================================
const PlayerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  img: String,
  sport: String,
  league: String,
  tier: { type: String, default: "B" },
  role: { type: String, default: "DEFAULT" },
  stats: { type: Map, of: Number, default: {} },
});
const Player = mongoose.model("Player", PlayerSchema);

app.get("/api/players", async (req, res) => {
  try {
    const { sport } = req.query;
    let dbQuery = {};
    if (sport && sport !== "all") dbQuery.sport = sport;
    const players = await Player.find(dbQuery).select(
      "id name img sport league tier role stats",
    );
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: "PLAYER_DATABASE_FETCH_FAILED" });
  }
});

// 🛡️ STRIPPED _id TO PREVENT MONGO CRASHES
app.put("/api/admin/bulk-update-players", async (req, res) => {
  try {
    const updates = req.body;
    const results = [];
    for (const player of updates) {
      const pData = { ...player };
      delete pData._id;
      delete pData.__v;
      const updated = await Player.findOneAndUpdate(
        { id: String(player.id) },
        { $set: pData },
        { new: true, upsert: true },
      );
      if (updated) results.push(updated.name);
    }
    res.json({
      message: "SPORTS_ROSTER_SYNC_COMPLETE",
      updated_count: results.length,
    });
  } catch (err) {
    res.status(500).json({ error: "BULK_SYNC_FAILED", details: err.message });
  }
});

// 🎯 NEW: INDIVIDUAL DEDICATED PLAYER SYNC ROUTE
app.put("/api/admin/update-player/:id", async (req, res) => {
  try {
    const playerId = req.params.id;
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    const updated = await Player.findOneAndUpdate(
      { id: String(playerId) },
      { $set: updateData },
      { new: true },
    );
    res.json({ message: "SUCCESS", player: updated });
  } catch (err) {
    res
      .status(500)
      .json({ error: "DATABASE_SYNC_ERROR", details: err.message });
  }
});

app.delete("/api/admin/delete-player/:id", async (req, res) => {
  try {
    await Player.deleteOne({ id: String(req.params.id) });
    res.json({ message: "PLAYER_DELETED_SUCCESSFULLY" });
  } catch (err) {
    res.status(500).json({ error: "DELETE_FAILED" });
  }
});

// ==========================================
// 👤 USER MANAGEMENT
// ==========================================
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: "" },
  totalGames: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  scoreHistory: { type: Array, default: [] },
});
const User = mongoose.model("User", UserSchema);

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
    res
      .status(500)
      .json({ error: "INTERNAL_SERVER_ERROR", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
