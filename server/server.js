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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 DB CONNECTED: MULTIVERSE ENGINE ONLINE"))
  .catch((err) => console.error("❌ DB ERROR:", err));

// 📝 SCHEMAS & MODELS
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

// 🚀 HYBRID FETCH: Pure stats from DB
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

// 🚀 ELITE BULK UPDATE PROTOCOL
app.put("/api/admin/bulk-update", async (req, res) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates))
      return res.status(400).json({ error: "ARRAY_REQUIRED" });

    const results = [];
    for (const char of updates) {
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

// ⚔️ TARGETED OVERRIDE: Individual Sync Fix
app.put("/api/admin/update-character/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ FORCE SYNC: Matches by String or Number ID and overrides stats
    const updated = await Character.findOneAndUpdate(
      { $or: [{ id: String(id) }, { id: Number(id) }] },
      { $set: req.body },
      { new: true, upsert: true }, // Upsert: Agar ID nahi hai toh naya bana dega
    );

    if (!updated)
      return res.status(404).json({ message: "Character Sync Failed" });

    console.log(`✅ ${updated.name} updated successfully!`);
    res.json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ error: "DATABASE_SYNC_ERROR", details: err.message });
  }
});

// 🚀 TARGETED GOD-TIER AUTO-REFRESH (Anilist - Universe Specific)
app.post("/api/admin/auto-refresh-images", async (req, res) => {
  try {
    const { universe } = req.body; // ✅ Ab backend dekhega ki kaunsa universe refresh karna hai
    if (!universe) return res.status(400).json({ error: "UNIVERSE_REQUIRED" });

    // ✅ Sirf current universe ka data uthayega (e.g., Only Naruto)
    const chars = await Character.find({ universe });
    const validIds = chars
      .map((c) => parseInt(c.id))
      .filter((id) => !isNaN(id));

    let updatedCount = 0;
    let failedCount = 0;
    const chunkSize = 40;

    for (let i = 0; i < validIds.length; i += chunkSize) {
      const chunk = validIds.slice(i, i + chunkSize);
      const query = `
        query ($in: [Int]) {
          Page(perPage: 50) {
            characters(id_in: $in) {
              id
              image { large }
            }
          }
        }
      `;

      let success = false;
      let retries = 3;

      while (!success && retries > 0) {
        try {
          const response = await axios.post("https://graphql.anilist.co", {
            query,
            variables: { in: chunk },
          });

          const fetchedChars = response.data.data.Page.characters;
          const bulkOps = fetchedChars
            .map((apiChar) => {
              if (apiChar.image && apiChar.image.large) {
                updatedCount++;
                return {
                  updateOne: {
                    filter: {
                      $or: [
                        { id: String(apiChar.id) },
                        { id: Number(apiChar.id) },
                      ],
                    },
                    update: {
                      $set: {
                        img: apiChar.image.large,
                        id: String(apiChar.id),
                      },
                    },
                  },
                };
              }
              return null;
            })
            .filter(Boolean);

          if (bulkOps.length > 0) await Character.bulkWrite(bulkOps);

          success = true;
          await new Promise((r) => setTimeout(r, 1500));
        } catch (err) {
          retries--;
          console.log(`⚠️ API blocked. Retries left: ${retries}`);
          await new Promise((r) => setTimeout(r, 3000));
          if (retries === 0) failedCount += chunk.length;
        }
      }
    }

    res.json({
      message: "AUTO_REFRESH_COMPLETE",
      updated: updatedCount,
      failed: failedCount,
      universe_refreshed: universe,
    });
  } catch (error) {
    console.error("CRITICAL_FAIL:", error);
    res.status(500).json({ error: "CRITICAL_FAILURE" });
  }
});

app.delete("/api/admin/delete-character/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Character.deleteOne({ id: String(id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Not found" });
    res.json({ message: "CHARACTER_DELETED_SUCCESSFULLY" });
  } catch (err) {
    res.status(500).json({ error: "DELETE_FAILED" });
  }
});

// Auth & Battle Routes
app.post("/api/user/access", async (req, res) => {
  /* Logic */
});
app.get("/api/leaderboard", async (req, res) => {
  /* Logic */
});
app.post("/api/fight", async (req, res) => {
  /* Logic */
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
