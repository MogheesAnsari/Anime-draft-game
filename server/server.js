import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  username: { type: String, default: "Player1" },
  wins: { type: Number, default: 0 },
  history: [
    { score: Number, won: Boolean, date: { type: Date, default: Date.now } },
  ],
});
const User = mongoose.model("User", userSchema);

const calculatePower = (squad) => {
  if (!squad || Object.keys(squad).length === 0) return 0;
  let score = 0;
  Object.values(squad).forEach(
    (char) => (score += char.atk + char.def + char.spd),
  );
  if (squad.healer) score += squad.healer.def * 0.8;
  if (squad.iq) score += squad.iq.spd * 0.8;
  if (squad.duelist) score += squad.duelist.atk * 0.8;
  if (squad.captain) score += 50;
  return Math.floor(score);
};

app.post("/api/battle", async (req, res) => {
  try {
    const { teams, mode } = req.body;
    const scores = teams.map(calculatePower);
    let resultData = {};

    if (mode === "pve") {
      const cpuScore = Math.floor(Math.random() * (1800 - 1300) + 1300);
      resultData = {
        scores: [scores[0], cpuScore],
        labels: ["PLAYER 1", "CPU"],
        winner: scores[0] > cpuScore ? "PLAYER 1" : "CPU",
        won: scores[0] > cpuScore,
      };
    } else if (mode === "pvp") {
      resultData = {
        scores: [scores[0], scores[1]],
        labels: ["PLAYER 1", "PLAYER 2"],
        winner: scores[0] > scores[1] ? "PLAYER 1" : "PLAYER 2",
        won: scores[0] > scores[1],
      };
    } else if (mode === "multi") {
      const maxScore = Math.max(...scores);
      const winnerIndex = scores.indexOf(maxScore);
      resultData = {
        scores,
        labels: ["P1", "P2", "P3", "P4"],
        winner: `PLAYER ${winnerIndex + 1}`,
        won: winnerIndex === 0,
      };
    } else if (mode === "2v2") {
      const teamA = scores[0] + scores[1];
      const teamB = scores[2] + scores[3];
      resultData = {
        scores: [teamA, teamB],
        labels: ["TEAM A", "TEAM B"],
        winner: teamA > teamB ? "TEAM A" : "TEAM B",
        won: teamA > teamB,
      };
    }

    // NEW: Returning updated document to reflect real-time wins
    const updatedUser = await User.findOneAndUpdate(
      { username: "Player1" },
      {
        $inc: { wins: resultData.won ? 1 : 0 },
        $push: { history: { score: scores[0], won: resultData.won } },
      },
      { upsert: true, new: true },
    );

    res.status(200).json({
      ...resultData,
      wins: updatedUser.wins,
      fullHistory: updatedUser.history,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(5000, () => console.log("🚀 Server Live | Stats Sync Active")),
  )
  .catch((err) => console.log("❌ DB Error:", err));
