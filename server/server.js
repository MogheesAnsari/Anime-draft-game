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
app.use(express.json({ limit: "10mb" })); // Extra limit for Elite Bulk Data

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 DB CONNECTED: MULTIVERSE ENGINE ONLINE"))
  .catch((err) => console.error("❌ DB ERROR:", err));

// 📝 SCHEMAS & MODELS
const CharacterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // String is safest for all Universes
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

// 🚀 ELITE BULK UPDATE PROTOCOL
app.put("/api/admin/bulk-update", async (req, res) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates))
      return res.status(400).json({ error: "ARRAY_REQUIRED" });

    const results = [];
    for (const char of updates) {
      // Matches by String ID
      const updated = await Character.findOneAndUpdate(
        { id: String(char.id) },
        { $set: char },
        { new: true, upsert: true },
      );
      if (updated) results.push(updated.name);
    }
    res.json({
      message: "MULTIVERSE_SYNC_COMPLETE",
      updated_count: results.length,
    });
  } catch (err) {
    console.error("BULK_SYNC_ERR:", err);
    res.status(500).json({ error: "BULK_SYNC_FAILED", details: err.message });
  }
});

// ⚔️ SINGLE CHARACTER UPDATE
app.put("/api/admin/update-character/:id", async (req, res) => {
  try {
    const updated = await Character.findOneAndUpdate(
      { id: String(req.params.id) },
      { $set: req.body },
      { new: true },
    );
    if (!updated)
      return res.status(404).json({ message: "Character not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "UPDATE_FAILED" });
  }
});

// 🃏 FETCH CHARACTERS
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

// 🖼️ IMAGE_REFRESH_PROTOCOL: Only updates images for existing characters
app.post("/api/admin/refresh-images", async (req, res) => {
  try {
    const chars = await Character.find({}); // Poore 480+ characters uthayega
    let updatedCount = 0;

    for (const char of chars) {
      try {
        // Anilist se fresh image link mangna (sirf ID use karke)
        const query = `query ($id: Int) { Character (id: $id) { image { large } } }`;
        const response = await axios.post("https://graphql.anilist.co", {
          query,
          variables: { id: parseInt(char.id) },
        });

        const newImg = response.data.data.Character.image.large;

        if (newImg) {
          // DATABASE UPDATE: Sirf 'img' field ko update karega
          await Character.updateOne({ id: char.id }, { $set: { img: newImg } });
          updatedCount++;
        }

        // API Rate Limit (Anilist) se bachne ke liye thoda gap
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.log(`⚠️ Skip: Character ${char.name} image not found.`);
      }
    }
    res.json({ message: "REFRESH_COMPLETE", total_updated: updatedCount });
  } catch (err) {
    res.status(500).json({ error: "REFRESH_FAILED" });
  }
});

// 🗑️ EMERGENCY WIPE: Delete all characters of a specific universe
app.delete("/api/admin/wipe-universe/:universe", async (req, res) => {
  try {
    const { universe } = req.params;
    const result = await Character.deleteMany({ universe });
    res.json({
      message: "UNIVERSE_PURGED",
      deleted_count: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: "PURGE_FAILED" });
  }
});

// Auth & Battle Routes
app.post("/api/user/access", async (req, res) => {
  /* Add your logic here */
});
app.get("/api/leaderboard", async (req, res) => {
  /* Add your logic here */
});
app.post("/api/fight", async (req, res) => {
  /* Add your logic here */
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
