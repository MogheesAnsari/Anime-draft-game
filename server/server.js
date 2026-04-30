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
    const chars = await Character.find(dbQuery)
      .select("id name img universe atk def spd iq tier")
      .lean();
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
  // 🚀 FIXED: Switched from strict 'Map' to 'Mixed' so any valid JSON object uploaded is saved perfectly
  stats: { type: mongoose.Schema.Types.Mixed, default: {} },
});
const Player = mongoose.model("Player", PlayerSchema);

app.get("/api/players", async (req, res) => {
  try {
    const { sport } = req.query;
    let dbQuery = {};
    if (sport && sport !== "all") dbQuery.sport = sport;

    const players = await Player.find(dbQuery)
      .select("id name img sport league tier role stats")
      .lean();
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
// 👤 USER MANAGEMENT & DYNAMIC ECONOMY
// ==========================================
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: "" },
  totalGames: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  coins: { type: Number, default: 500 },
  gems: { type: Number, default: 5 },
  inventory: { type: Array, default: [] },
  scoreHistory: { type: Array, default: [] },
});
const User = mongoose.model("User", UserSchema);

app.post("/api/user/access", async (req, res) => {
  try {
    const { username, avatar } = req.body;
    if (!username) return res.status(400).json({ error: "USERNAME_REQUIRED" });

    let user = await User.findOne({ username: username.toLowerCase() });

    if (user) {
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      user = new User({
        username: username.toLowerCase(),
        avatar,
        wins: 0,
        totalGames: 0,
        coins: 500,
        gems: 5,
        inventory: [],
      });
      await user.save();
    }
    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ error: "INTERNAL_SERVER_ERROR", details: err.message });
  }
});

app.post("/api/user/record-match", async (req, res) => {
  try {
    const { username, isWin, coinsWon, gemsWon } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.totalGames += 1;
    if (isWin) user.wins += 1;
    user.coins += coinsWon || 0;
    user.gems += gemsWon || 0;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "MATCH_RECORD_FAILED" });
  }
});

// 🛍️ MULTI-CURRENCY SHOP
app.post("/api/shop/buy", async (req, res) => {
  try {
    const { username, itemId, cost, currency, name, type } = req.body;
    if (!username) return res.status(400).json({ error: "MISSING_USERNAME" });

    let buyer = await User.findOne({ username: username.toLowerCase() });
    if (!buyer) return res.status(404).json({ error: "USER_NOT_FOUND" });

    if (currency === "gems") {
      if (buyer.gems < cost)
        return res.status(400).json({ error: "INSUFFICIENT GEMS." });
      buyer.gems -= cost;
    } else {
      if (buyer.coins < cost)
        return res.status(400).json({ error: "INSUFFICIENT COINS." });
      buyer.coins -= cost;
    }

    if (!buyer.inventory) buyer.inventory = [];

    if (type === "EXCHANGE") {
      if (itemId === "exchange_gem") buyer.gems += 1;
    } else {
      buyer.inventory.push({ id: itemId, name, type, acquiredAt: new Date() });
    }

    buyer.markModified("inventory");
    await buyer.save();

    res.status(200).json({
      newBalance: { coins: buyer.coins, gems: buyer.gems },
      newInventory: buyer.inventory,
    });
  } catch (err) {
    res.status(500).json({ error: "TRANSACTION_FAILED", details: err.message });
  }
});

app.post("/api/user/consume-item", async (req, res) => {
  try {
    const { username, itemId } = req.body;
    if (!username || !itemId)
      return res.status(400).json({ error: "Missing data" });

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.inventory) user.inventory = [];
    const itemIndex = user.inventory.findIndex((i) => i.id === itemId);

    if (itemIndex === -1) {
      return res.status(400).json({ error: "ITEM_NOT_FOUND_IN_INVENTORY" });
    }

    user.inventory.splice(itemIndex, 1);
    user.markModified("inventory");
    await user.save();

    res.json({ newInventory: user.inventory });
  } catch (err) {
    console.error("🔥 CONSUME ERROR:", err);
    res.status(500).json({ error: "CONSUME_FAILED", details: err.message });
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
