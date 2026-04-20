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

// ✅ MongoDB Connection with strict logs
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📡 KERNEL_ONLINE: MongoDB Connected Successfully"))
  .catch((err) => console.error("🔥 KERNEL_CRASH: DB Connection Failed", err));

// Add a simple Health Check route to wake up the server
app.get("/api/health", (req, res) => res.status(200).send("ACTIVE"));
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

// ⚔️ STRICT OVERRIDE: Prevent Doubling Issue
app.put("/api/admin/update-character/:id", async (req, res) => {
  try {
    const charId = req.params.id;
    const updateData = { ...req.body };

    // 🛡️ CRITICAL: MongoDB ki internal IDs aur versioning ko nikaal dein
    delete updateData._id;
    delete updateData.__v;

    // 🚨 STRICT UPDATE: Upsert hata diya hai taaki naya clone na bane
    // $in operator ensure karega ki chahe ID string ho ya number, wo dono ko match karega
    const updated = await Character.findOneAndUpdate(
      { id: { $in: [Number(charId), String(charId)] } },
      {
        $set: {
          name: updateData.name,
          img: updateData.img, // 🔥 Image override
          atk: Number(updateData.atk),
          def: Number(updateData.def),
          spd: Number(updateData.spd),
          iq: Number(updateData.iq),
          tier: updateData.tier,
          universe: updateData.universe,
        },
      },
      { new: true }, // ❌ upsert: true HATA DIYA HAI
    );

    if (!updated) {
      return res.status(404).json({
        error: "CHARACTER_NOT_FOUND",
        message: "Cannot find original character to update.",
      });
    }

    console.log(`✅ Character Updated Safely: ${updated.name}`);
    res.json({ message: "SUCCESS", character: updated });
  } catch (err) {
    console.error("🔥 SERVER_ERROR:", err.message);
    res
      .status(500)
      .json({ error: "DATABASE_SYNC_ERROR", details: err.message });
  }
});

// 🧹 CLONE CLEANUP ROUTE: Removes duplicates keeping one safely
app.delete("/api/admin/cleanup-duplicates", async (req, res) => {
  try {
    // 1. Aise characters ko dhundo jinka Name aur Universe same hai
    const duplicates = await Character.aggregate([
      {
        $group: {
          _id: { name: "$name", universe: "$universe" },
          uniqueIds: { $addToSet: "$_id" }, // Saare IDs ek array me daal lo
          count: { $sum: 1 }, // Total count nikaalo
        },
      },
      {
        $match: { count: { $gt: 1 } }, // Sirf unhe lo jo 1 se zyada hain (Duplicates)
      },
    ]);

    let deletedCount = 0;

    // 2. Har duplicate group mein loop chalao
    for (const doc of duplicates) {
      // Pehle ID ko chhod do (Original), baaki sab nikaal lo (Clones)
      const idsToDelete = doc.uniqueIds.slice(1);

      // Clones ko delete maaro
      const result = await Character.deleteMany({ _id: { $in: idsToDelete } });
      deletedCount += result.deletedCount;
    }

    console.log(`✅ Cleanup Complete: Removed ${deletedCount} shadow clones.`);
    res.json({ message: "CLEANUP_SUCCESS", deletedCount });
  } catch (err) {
    console.error("🔥 CLEANUP_ERROR:", err.message);
    res
      .status(500)
      .json({ error: "DATABASE_CLEANUP_ERROR", details: err.message });
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

// ✅ STABLE USER PROFILE CREATION
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 🛡️ Pre-validation check
    if (!username || !email) {
      return res.status(400).json({ error: "USERNAME_OR_EMAIL_MISSING" });
    }

    const newUser = new User({
      username,
      email,
      password, // Password hashing zaroori hai
      wins: 0,
      totalGames: 0,
    });

    await newUser.save();
    console.log(`👤 PROFILE_CREATED: ${username}`);
    res.status(201).json(newUser); // Success response
  } catch (err) {
    console.error("🔥 PROFILE_ERROR:", err.message);
    // Duplicate email ya username error handle karein
    res
      .status(400)
      .json({ error: "REGISTRATION_FAILED", details: err.message });
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
