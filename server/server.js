import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import axios from "axios";

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
  .then(() => console.log("📡 KERNEL_ONLINE: Multiverse Connected"))
  .catch((err) => console.error("🔥 KERNEL_CRASH", err));

/* ==========================================
   📝 DATABASE SCHEMAS
   ========================================== */
const CharacterSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    img: String,
    description: String,
    universe: String,
    category: { type: String, default: "anime" },
    atk: { type: Number, default: 60 },
    def: { type: Number, default: 60 },
    spd: { type: Number, default: 60 },
    iq: { type: Number, default: 100 },
    tier: { type: String, default: "B" },
  },
  { timestamps: true },
);
const Character = mongoose.model("Character", CharacterSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: "" },
  totalGames: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  sessionId: { type: String, default: "" },
});
const User = mongoose.model("User", UserSchema);

/* ==========================================
   🦸 SUPERHERO API LOGIC
   ========================================== */
const SUPERHERO_TOKEN = process.env.SUPERHERO_TOKEN;

const calculateTier = (atk, def, spd, iq) => {
  const normalizedIq = iq > 100 ? 100 : iq;
  const avg = (atk + def + spd + normalizedIq) / 4;
  if (avg >= 90) return "S+";
  if (avg >= 80) return "S";
  if (avg >= 70) return "A";
  return "B";
};

const parseAndMapStats = (data) => {
  const parseStat = (val) =>
    val === "null" || isNaN(val) ? 60 : parseInt(val);
  const atk = Math.round(
    (parseStat(data.powerstats.strength) +
      parseStat(data.powerstats.power) +
      parseStat(data.powerstats.combat)) /
      3,
  );
  const def = parseStat(data.powerstats.durability);
  const spd = parseStat(data.powerstats.speed);
  const baseIq = parseStat(data.powerstats.intelligence);
  const iq = baseIq >= 95 ? 250 : baseIq >= 85 ? 200 : baseIq >= 70 ? 150 : 100;

  let universe = "other";
  const pub = data.biography.publisher?.toLowerCase() || "";
  if (pub.includes("marvel")) universe = "marvel";
  else if (pub.includes("dc")) universe = "dc";

  return {
    id: `sh-${data.id}`,
    name: data.name.toUpperCase(),
    img: data.image.url,
    description: `${data.biography["full-name"] || data.name} - ${data.work.occupation || "Multiverse Hero"}.`,
    universe,
    category: "comic",
    atk,
    def,
    spd,
    iq,
    tier: calculateTier(atk, def, spd, iq),
  };
};

/* ==========================================
   🚀 API ROUTES
   ========================================== */

// ✅ USER LOGIN / ACCESS
app.post("/api/user/access", async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const newSessionId = Math.random().toString(36).substring(2, 15);
    let user = await User.findOne({ username: username.toLowerCase() });
    if (user) {
      user.sessionId = newSessionId;
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

// 🔄 LIVE SYNC & SESSION CHECK (Fixes 401 Error)
app.post("/api/user/sync", async (req, res) => {
  try {
    const { username, sessionId } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || user.sessionId !== sessionId)
      return res.status(401).json({ error: "UNAUTHORIZED" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "SYNC_FAILED" });
  }
});

// 🌟 RECORD MATCH
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

// 🛡️ ADMIN: BULK SUPERHERO FETCH
app.post("/api/admin/bulk-fetch-superhero", async (req, res) => {
  if (!SUPERHERO_TOKEN)
    return res.status(400).json({ error: "TOKEN_MISSING_IN_SERVER" });
  try {
    const { heroIds } = req.body;
    const results = { saved: [], failed: [] };
    for (const id of heroIds) {
      try {
        const response = await axios.get(
          `https://superheroapi.com/api/${SUPERHERO_TOKEN}/${id}`,
        );
        if (response.data.response === "error") {
          results.failed.push(id);
          continue;
        }
        const mapped = parseAndMapStats(response.data);
        await Character.findOneAndUpdate(
          { id: mapped.id },
          { $set: mapped },
          { upsert: true },
        );
        results.saved.push(mapped.name);
      } catch (e) {
        results.failed.push(id);
      }
    }
    res.status(200).json({ message: "Sync Complete", results });
  } catch (err) {
    res.status(500).json({ error: "BULK_FETCH_FAILED" });
  }
});

// 🛡️ ADMIN: BULK JSON SYNC (Fixes 404 Error)
app.put("/api/admin/bulk-update", async (req, res) => {
  try {
    const data = req.body;
    let count = 0;
    for (const char of data) {
      await Character.findOneAndUpdate(
        { id: char.id },
        { $set: char },
        { upsert: true },
      );
      count++;
    }
    res.status(200).json({ updated_count: count });
  } catch (err) {
    res.status(500).json({ error: "BULK_UPDATE_FAILED" });
  }
});

// 🛡️ ADMIN: SINGLE CHARACTER UPDATE
app.put("/api/admin/update-character/:id", async (req, res) => {
  try {
    const updatedChar = await Character.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true },
    );
    res.status(200).json(updatedChar);
  } catch (err) {
    res.status(500).json({ error: "UPDATE_FAILED" });
  }
});

// 🛡️ ADMIN: INDIVIDUAL DELETE
app.delete("/api/admin/delete-character/:id", async (req, res) => {
  try {
    await Character.findOneAndDelete({ id: req.params.id });
    res.status(200).json({ message: "DELETED" });
  } catch (err) {
    res.status(500).json({ error: "DELETE_FAILED" });
  }
});

// 🛡️ ADMIN: WIPE UNIVERSE
app.delete("/api/admin/wipe-universe/:universe", async (req, res) => {
  try {
    await Character.deleteMany({ universe: req.params.universe });
    res.status(200).json({ message: "PURGED" });
  } catch (err) {
    res.status(500).json({ error: "PURGE_FAILED" });
  }
});

// 🛡️ ADMIN: CLEANUP DUPLICATES
app.delete("/api/admin/cleanup-duplicates", async (req, res) => {
  try {
    const result = await Character.aggregate([
      {
        $group: { _id: "$id", ids: { $addToSet: "$_id" }, count: { $sum: 1 } },
      },
      { $match: { count: { $gt: 1 } } },
    ]);
    let deletedCount = 0;
    for (const group of result) {
      group.ids.shift();
      const del = await Character.deleteMany({ _id: { $in: group.ids } });
      deletedCount += del.deletedCount;
    }
    res.status(200).json({ deletedCount });
  } catch (err) {
    res.status(500).json({ error: "CLEANUP_FAILED" });
  }
});

// 🚀 CHARACTER FETCH
app.get("/api/characters", async (req, res) => {
  try {
    const { universe, category } = req.query;
    let dbQuery = {};
    if (universe) dbQuery.universe = universe;
    if (category) dbQuery.category = category;
    const chars = await Character.find(dbQuery);
    res.json(chars);
  } catch (err) {
    res.status(500).json({ error: "FETCH_FAILED" });
  }
});

// 📊 LEADERBOARD
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaders = await User.find({}).sort({ wins: -1 }).limit(50);
    res.status(200).json(leaders);
  } catch (err) {
    res.status(500).json({ error: "LEADERBOARD_FAILED" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
