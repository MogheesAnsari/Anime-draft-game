import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/calculate-battle", async (req, res) => {
  const { userId, playerTeam, enemyTeam } = req.body;

  // 1. Move the math logic from engine.js to here
  const calculatePower = (team) => {
    let total = 0;
    // ... insert the power calculation logic from the previous engine.js ...
    return total;
  };

  const p1Power = calculatePower(playerTeam);
  const p2Power = calculatePower(enemyTeam);
  const win = p1Power > p2Power;

  // 2. Update MongoDB
  try {
    const user = await User.findById(userId);
    if (user) {
      win ? user.wins++ : user.losses++;
      user.elo += win ? 25 : -15; // Elo gain/loss
      user.matchHistory.push({ result: win ? "WIN" : "LOSS", score: p1Power });
      await user.save();
    }

    res.json({
      p1Power,
      p2Power,
      winner: win ? "Player 1" : "Opponent",
      newElo: user?.elo,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// GET Global Leaderboard
router.get("/leaderboard", async (req, res) => {
  const topPlayers = await User.find().sort({ elo: -1 }).limit(10);
  res.json(topPlayers);
});

export default router;
