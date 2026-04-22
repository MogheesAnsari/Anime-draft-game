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
    res.status(500).json({ error: "BULK_SYNC_FAILED", details: err.message });
  }
});

// ⚔️ STRICT OVERRIDE: Prevent Doubling Issue
app.put("/api/admin/update-character/:id", async (req, res) => {
  try {
    const charId = req.params.id;
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    const updated = await Character.findOneAndUpdate(
      { id: { $in: [Number(charId), String(charId)] } },
      {
        $set: {
          name: updateData.name,
          img: updateData.img,
          atk: Number(updateData.atk),
          def: Number(updateData.def),
          spd: Number(updateData.spd),
          iq: Number(updateData.iq),
          tier: updateData.tier,
          universe: updateData.universe,
        },
      },
      { new: true },
    );

    if (!updated) return res.status(404).json({ error: "CHARACTER_NOT_FOUND" });
    res.json({ message: "SUCCESS", character: updated });
  } catch (err) {
    res
      .status(500)
      .json({ error: "DATABASE_SYNC_ERROR", details: err.message });
  }
});

// 🧹 CLONE CLEANUP ROUTE
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
    res
      .status(500)
      .json({ error: "DATABASE_CLEANUP_ERROR", details: err.message });
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

// ✅ THE MISSING PIECE: User Access/Creation (Fixes the Pending Issue)
app.post("/api/user/access", async (req, res) => {
  try {
    const { username, avatar } = req.body;
    if (!username) return res.status(400).json({ error: "USERNAME_REQUIRED" });

    // Find if user exists
    let user = await User.findOne({ username });

    if (user) {
      // If user exists and avatar is new, update it
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await user.save();
      }
      console.log(`👤 COMMANDER_LOGIN: ${username}`);
    } else {
      // If user does not exist, create new
      user = new User({ username, avatar, wins: 0, totalGames: 0 });
      await user.save();
      console.log(`👤 NEW_COMMANDER_REGISTERED: ${username}`);
    }

    res.status(200).json(user); // Send response back to stop 'Pending'
  } catch (err) {
    console.error("🔥 USER_ACCESS_ERROR:", err.message);
    res
      .status(500)
      .json({ error: "INTERNAL_SERVER_ERROR", details: err.message });
  }
});

// Ignored routes for now
app.get("/api/leaderboard", async (req, res) => {
  res.json([]);
});
app.post("/api/fight", async (req, res) => {
  res.json({ message: "FIGHT_INIT" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
