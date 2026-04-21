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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📡 KERNEL_ONLINE: Multiverse Connected"))
  .catch((err) => console.error("🔥 KERNEL_CRASH", err));

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

const SUPERHERO_TOKEN = process.env.SUPERHERO_TOKEN;

const calculateTier = (atk, def, spd, iq) => {
  const normalizedIq = iq > 100 ? 100 : iq;
  const avg = (atk + def + spd + normalizedIq) / 4;
  if (avg >= 90) return "S+";
  if (avg >= 80) return "S";
  if (avg >= 70) return "A";
  return "B";
};
// 🔥 SERVER.JS MEIN YE WALA FUNCTION DHUND KE UPDATE KAREIN
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

  // 🔥 CORE FIX: Image Proxy using wsrv.nl (Bypasses 403 Forbidden)
  // Hum image URL ke aage proxy laga rahe hain taaki zoro.svg na dikhe
  const rawUrl = data.image.url;
  const proxyImgUrl = `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}&default=https://i.imgur.com/your-default-comic-image.jpg`;

  return {
    id: `sh-${data.id}`,
    name: data.name.toUpperCase(),
    img: proxyImgUrl, // Database mein proxy ke sath save hoga
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
   🚀 USER & COMBAT API
   ========================================== */
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

/* ==========================================
   🛡️ ADMIN PANEL ROUTES
   ========================================== */
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

app.delete("/api/admin/delete-character/:id", async (req, res) => {
  try {
    await Character.findOneAndDelete({ id: req.params.id });
    res.status(200).json({ message: "DELETED" });
  } catch (err) {
    res.status(500).json({ error: "DELETE_FAILED" });
  }
});

app.delete("/api/admin/wipe-universe/:universe", async (req, res) => {
  try {
    await Character.deleteMany({ universe: req.params.universe });
    res.status(200).json({ message: "PURGED" });
  } catch (err) {
    res.status(500).json({ error: "PURGE_FAILED" });
  }
});

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

app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaders = await User.find({}).sort({ wins: -1 }).limit(50);
    res.status(200).json(leaders);
  } catch (err) {
    res.status(500).json({ error: "LEADERBOARD_FAILED" });
  }
});

// 🔥 FIX 2: Wrap Single Image Search in Proxy
app.get("/api/admin/search-comic-image", async (req, res) => {
  if (!SUPERHERO_TOKEN) return res.status(400).json({ error: "NO_TOKEN" });
  try {
    const { name } = req.query;
    const searchRes = await axios.get(
      `https://superheroapi.com/api/${SUPERHERO_TOKEN}/search/${encodeURIComponent(name)}`,
    );
    if (
      searchRes.data.response === "success" &&
      searchRes.data.results.length > 0
    ) {
      const rawUrl = searchRes.data.results[0].image.url;
      const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}`;
      res.json({ imageUrl: proxyUrl });
    } else {
      res.status(404).json({ error: "NOT_FOUND" });
    }
  } catch (err) {
    res.status(500).json({ error: "SEARCH_FAILED" });
  }
});

app.post("/api/admin/auto-refresh-images", async (req, res) => {
  const { universe, category } = req.body;
  if (!SUPERHERO_TOKEN && category === "comic")
    return res.status(400).json({ error: "TOKEN_MISSING" });

  try {
    const chars = await Character.find({ universe });
    console.log(
      `📡 Starting Refresh for ${universe}... Found ${chars.length} units.`,
    );

    let updated = 0;
    let failed = 0;

    for (const char of chars) {
      try {
        let newImg = null;

        if (category === "comic") {
          // 🔥 POWER SEARCH: Naam se "The", "Squad", etc hata kar search karein
          const cleanName = char.name
            .replace(/\(.*\)/g, "") // Brackets hatao
            .replace(/Team|Squad|The /gi, "") // Extra words hatao
            .trim();

          const searchRes = await axios.get(
            `https://superheroapi.com/api/${SUPERHERO_TOKEN}/search/${encodeURIComponent(cleanName)}`,
          );

          if (
            searchRes.data.response === "success" &&
            searchRes.data.results.length > 0
          ) {
            // Sabse pehla aur best match uthao
            const rawImg = searchRes.data.results[0].image.url;
            // 🔥 PROXY LAGAO taaki Zoro.svg na dikhe
            newImg = `https://wsrv.nl/?url=${encodeURIComponent(rawImg)}`;
          }
        } else if (category === "anime") {
          const searchRes = await axios.get(
            `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(char.name)}&limit=1`,
          );
          if (searchRes.data.data && searchRes.data.data.length > 0) {
            newImg = searchRes.data.data[0].images.jpg.image_url;
          }
          await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for Rate Limit
        }

        if (newImg) {
          char.img = newImg;
          await char.save();
          updated++;
          console.log(`✅ Success: ${char.name}`);
        } else {
          failed++;
          console.log(`❌ Failed match: ${char.name}`);
        }
      } catch (err) {
        failed++;
        console.log(`⚠️ Error on ${char.name}: ${err.message}`);
      }
    }
    res.status(200).json({ updated, failed });
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
