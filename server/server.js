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
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    const updated = await Character.findOneAndUpdate(
      { id: String(req.params.id) },
      { $set: updateData },
      { new: true },
    );
    res.json({ message: "SUCCESS", character: updated });
  } catch (err) {
    res.status(500).json({ error: "DATABASE_SYNC_ERROR" });
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

app.put("/api/admin/update-player/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    const updated = await Player.findOneAndUpdate(
      { id: String(req.params.id) },
      { $set: updateData },
      { new: true },
    );
    res.json({ message: "SUCCESS", player: updated });
  } catch (err) {
    res.status(500).json({ error: "DATABASE_SYNC_ERROR" });
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
// 👤 USER MANAGEMENT & ECONOMY
// ==========================================
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: "/zoro.svg" },
  totalGames: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  coins: { type: Number, default: 500 },
  gems: { type: Number, default: 5 },
  inventory: { type: Array, default: [] },
});
const User = mongoose.model("User", UserSchema);

// 🛡️ Login or Create Profile (NO GUESTS)
app.post("/api/user/access", async (req, res) => {
  try {
    const { username, avatar } = req.body;
    if (!username) return res.status(400).json({ error: "USERNAME_REQUIRED" });

    // Force lowercase to prevent duplicate accounts like "Moghees" and "moghees"
    const safeUsername = username.toLowerCase().trim();

    let user = await User.findOne({ username: safeUsername });

    if (!user) {
      // Create fresh profile
      user = new User({
        username: safeUsername,
        avatar: avatar || "/zoro.svg",
        coins: 500,
        gems: 5,
        wins: 0,
        totalGames: 0,
      });
      await user.save();
    } else if (avatar && user.avatar !== avatar) {
      // Update avatar if provided
      user.avatar = avatar;
      await user.save();
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

// 🛡️ Record Match & Safely Reward Coins
app.post("/api/user/record-match", async (req, res) => {
  try {
    const { username, isWin } = req.body;
    if (!username) return res.status(400).json({ error: "MISSING_USER" });

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const coinsWon = isWin ? 100 : 25;
    const gemsWon = isWin ? 1 : 0;

    user.totalGames += 1;
    if (isWin) user.wins += 1;
    user.coins += coinsWon;
    user.gems += gemsWon;

    await user.save();

    // Send back the new totals so UI updates instantly
    res.status(200).json({
      user,
      coinsWon,
      gemsWon,
      newTotalCoins: user.coins,
      newTotalGems: user.gems,
    });
  } catch (err) {
    res.status(500).json({ error: "REWARD_CALCULATION_FAILED" });
  }
});

// 🛡️ Secure Shop Purchase
app.post("/api/shop/buy", async (req, res) => {
  try {
    const { username, cost, itemId, name } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.coins < cost)
      return res.status(400).json({ error: "INSUFFICIENT_FUNDS" });

    user.coins -= cost;
    user.inventory.push({ id: itemId, name, acquiredAt: new Date() });
    await user.save();

    res.status(200).json({
      newBalance: user.coins,
      newInventory: user.inventory,
    });
  } catch (err) {
    res.status(500).json({ error: "TRANSACTION_FAILED" });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaders = await User.find()
      .sort({ wins: -1 })
      .limit(50)
      .select("username avatar wins totalGames");
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: "LEADERBOARD_FAILED" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
