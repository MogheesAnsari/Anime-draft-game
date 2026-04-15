import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import axios from "axios";
import "dotenv/config";

const app = express();

// ✅ FIX 1: Allow all origins during deployment testing
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
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/anime_draft")
  .then(() => console.log("🔥 DB CONNECTED: ANILIST MODE ENGAGED"))
  .catch((err) => console.error("❌ DB ERROR:", err));

// 📝 CHARACTER MODEL
const CharacterSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  img: String,
  universe: String,
  atk: { type: Number, default: 50 },
  def: { type: Number, default: 50 },
  spd: { type: Number, default: 50 },
  tier: { type: String, default: "A" },
  bio: String,
});
const Character = mongoose.model("Character", CharacterSchema);

// ⚙️ ANILIST FETCH ROUTE (Postman)
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
      console.log(`📡 Fetching Page ${p} for ${searchName}...`);
      const response = await axios.post("https://graphql.anilist.co", {
        query: query,
        variables: { search: searchName, type: type, page: p },
      });
      const edges = response.data.data.Media.characters.edges;
      if (edges) {
        const filtered = edges
          .filter((edge) => edge.role !== "BACKGROUND")
          .map((edge) => edge.node);
        allChars = [...allChars, ...filtered];
      }
      if (pageLimit > 1)
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    const savedChars = [];
    for (let char of allChars) {
      if (!char.image?.large) continue;
      const newChar = {
        id: Number(char.id),
        name: char.name.full,
        img: char.image.large,
        universe: universe,
        atk: 60,
        def: 60,
        spd: 60,
        tier: "B",
        bio: `Elite warrior from the ${universe} series.`,
      };
      await Character.findOneAndUpdate({ id: newChar.id }, newChar, {
        upsert: true,
      });
      savedChars.push(newChar);
    }
    res.status(200).json({
      message: `🔥 SYNC COMPLETE: ${savedChars.length} CHARACTERS`,
      total: savedChars.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Manga fetch failed." });
  }
});

// 🗑️ DELETE ROUTE
app.delete("/api/admin/delete-character/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Character.findOneAndDelete({ id: Number(id) });
    if (deleted) res.status(200).json({ message: "CHARACTER PURGED" });
    else res.status(404).json({ error: "NOT FOUND" });
  } catch (err) {
    res.status(500).json({ error: "SERVER ERROR" });
  }
});

// 🃏 GENERAL ROUTES
app.get("/api/characters", async (req, res) => {
  const { universe } = req.query;
  try {
    const chars = await Character.find({ universe: universe });
    res.json(chars);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

app.put("/api/admin/update-character/:id", async (req, res) => {
  const { id } = req.params;
  const updated = await Character.findOneAndUpdate(
    { id: Number(id) },
    req.body,
    { new: true },
  );
  res.json(updated);
});

// ✅ FIX 2: Use process.env.PORT for Deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ADMIN ENGINE RUNNING ON PORT ${PORT}`));
