import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import axios from "axios";
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
  iq: { type: Number, default: 100 }, // IQ stat included
  tier: { type: String, default: "B" },
  bio: String,
});
const Character = mongoose.model("Character", CharacterSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: "" },
  totalGames: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  fullHistory: { type: Array, default: [] },
});
const User = mongoose.model("User", UserSchema);

// -----------------------------------------
// 🃏 CHARACTERS FETCH ROUTE (The Fix)
// -----------------------------------------
// server.js mein characters route
app.get("/api/characters", async (req, res) => {
  try {
    const { universe } = req.query;
    let dbQuery = {};

    if (universe) {
      // 🕵️ Agar comma hai, toh array bana kar $in operator use karo
      if (universe.includes(",")) {
        const namesArray = universe.split(",");
        dbQuery.universe = { $in: namesArray };
      } else {
        dbQuery.universe = universe;
      }
    }

    const chars = await Character.find(dbQuery).select(
      "name img universe atk def spd iq tier",
    );
    res.json(chars);
  } catch (err) {
    res.status(500).json({ error: "DB ERROR" });
  }
});

// -----------------------------------------
// 🔐 USER ACCESS ROUTE
// -----------------------------------------
app.post("/api/user/access", async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const cleanUsername = username.trim().toLowerCase();
    let user = await User.findOne({ username: cleanUsername });

    if (!user) {
      user = new User({ username: cleanUsername, avatar: avatar });
      await user.save();
    } else {
      user.avatar = avatar;
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "ACCESS DENIED" });
  }
});

// -----------------------------------------
// ⚙️ ADMIN & BATTLE ROUTES
// -----------------------------------------
app.get("/api/leaderboard", async (req, res) => {
  try {
    const topPlayers = await User.find()
      .sort({ wins: -1 })
      .limit(10)
      .select("username wins totalGames avatar");
    res.json(topPlayers);
  } catch (err) {
    res.status(500).json({ error: "LEADERBOARD FAILED" });
  }
});

app.post("/api/fight", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (user) {
      user.totalGames += 1;
      await user.save();
    }
    res.json({ message: "BATTLE SYNCED", totalGames: user?.totalGames || 0 });
  } catch (err) {
    res.status(500).json({ error: "SYNC FAILED" });
  }
});

// Anilist Fetch Route
app.post("/api/admin/fetch-and-save", async (req, res) => {
  const { searchName, type, universe, pageLimit = 1 } = req.body;
  const gqlQuery = `
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
        query: gqlQuery,
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
      await Character.findOneAndUpdate(
        { id: Number(char.id) },
        {
          id: Number(char.id),
          name: char.name.full,
          img: char.image.large,
          universe: universe,
        },
        { upsert: true },
      );
    }
    res.status(200).json({ message: "SYNC COMPLETE", total: allChars.length });
  } catch (err) {
    res.status(500).json({ error: "FETCH FAILED" });
  }
});

// ✅ DYNAMIC PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE RUNNING ON PORT ${PORT}`));
