import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import axios from "axios";
import bcrypt from "bcryptjs"; // package.json ke mutabiq
import "dotenv/config";

const app = express();

// ✅ CORS: Open for deployment
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// 🔌 MONGODB CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 DB CONNECTED: ANIME DRAFT ENGINE ONLINE"))
  .catch((err) => console.error("❌ DB ERROR:", err));

// 📝 SCHEMAS & MODELS
const CharacterSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  img: String,
  universe: String,
  atk: { type: Number, default: 60 },
  def: { type: Number, default: 60 },
  spd: { type: Number, default: 60 },
  tier: { type: String, default: "B" },
  bio: String,
});
const Character = mongoose.model("Character", CharacterSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalGames: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  fullHistory: { type: Array, default: [] },
});
const User = mongoose.model("User", UserSchema);

// -----------------------------------------
// 🔐 AUTH ROUTES (With Bcrypt Security)
// -----------------------------------------

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username.trim().toUpperCase();

    const existing = await User.findOne({ username: cleanUsername });
    if (existing) return res.status(400).json({ error: "USERNAME TAKEN" });

    // Password Hashing
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const newUser = new User({
      username: cleanUsername,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "COMMANDER REGISTERED" });
  } catch (err) {
    res.status(500).json({ error: "REGISTRATION FAILED" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username.trim().toUpperCase();

    const user = await User.findOne({ username: cleanUsername });
    if (!user) return res.status(401).json({ error: "COMMANDER NOT FOUND" });

    // Bcrypt Match Check
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch)
      return res.status(401).json({ error: "INVALID CLEARANCE CODE" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "SYSTEM ERROR" });
  }
});

// -----------------------------------------
// ⚙️ ADMIN ROUTES (AniList & Management)
// -----------------------------------------
app.post("/api/admin/fetch-and-save", async (req, res) => {
  const { searchName, type, universe, pageLimit = 1 } = req.body;
  const query = `
    query ($search: String, $type: MediaType, $page: Int) {
      Media(search: $search, type: $type) {
        characters(perPage: 50, page: $page, sort: [RELEVANCE, FAVOURITES_DESC]) { 
          edges {
            role
            node {
              id
              name { full }
              image { large }
            }
          }
        }
      }
    }
  `;
  try {
    let allChars = [];
    for (let p = 1; p <= pageLimit; p++) {
      const response = await axios.post("https://graphql.anilist.co", {
        query: query,
        variables: { search: searchName, type: type, page: p },
      });
      const edges = response.data.data.Media.characters.edges;
      if (edges) {
        const filtered = edges
          .filter((e) => e.role !== "BACKGROUND")
          .map((e) => e.node);
        allChars = [...allChars, ...filtered];
      }
      if (pageLimit > 1) await new Promise((r) => setTimeout(r, 2000));
    }
    for (let char of allChars) {
      if (!char.image?.large) continue;
      await Character.findOneAndUpdate(
        { id: Number(char.id) },
        {
          id: Number(char.id),
          name: char.name.full,
          img: char.image.large,
          universe: universe,
          bio: `Elite warrior from the ${universe} series.`,
        },
        { upsert: true },
      );
    }
    res.status(200).json({ message: "SYNC COMPLETE", total: allChars.length });
  } catch (err) {
    res.status(500).json({ error: "FETCH FAILED" });
  }
});

app.put("/api/admin/update-character/:id", async (req, res) => {
  try {
    const updated = await Character.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "UPDATE FAILED" });
  }
});

app.delete("/api/admin/delete-character/:id", async (req, res) => {
  try {
    await Character.findOneAndDelete({ id: Number(req.params.id) });
    res.json({ message: "PURGED" });
  } catch (err) {
    res.status(500).json({ error: "DELETE FAILED" });
  }
});

// -----------------------------------------
// 🃏 GAME ROUTES
// -----------------------------------------
app.get("/api/characters", async (req, res) => {
  try {
    const chars = await Character.find({ universe: req.query.universe });
    res.json(chars);
  } catch (err) {
    res.status(500).json({ error: "DB ERROR" });
  }
});

// ✅ DYNAMIC PORT FOR RENDER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
