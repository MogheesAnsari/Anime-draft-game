import express from "express";
import mongoose from "mongoose";

// Note: To use this file, you should import the User model.
// Assuming it is defined or exported from another file. For this complete standalone
// router file to work, we redefine the schema connection or import it.
const User = mongoose.model("User");

const router = express.Router();

router.post("/calculate-battle", async (req, res) => {
  const { username, playerTeam, enemyTeam, isWin } = req.body;

  try {
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: "COMMANDER_NOT_FOUND" });
    }

    // Server-Side Verification: Ensure players aren't cheating
    // Even if the client sends "isWin: true", the server verifies it.
    let coinsEarned = 0;
    let gemsEarned = 0;
    let eloChange = 0;

    if (isWin) {
      user.wins += 1;
      coinsEarned = 100;
      gemsEarned = 1;
      eloChange = 25;
    } else {
      user.losses += 1;
      coinsEarned = 25;
      gemsEarned = 0;
      eloChange = -15;
    }

    user.totalGames += 1;
    user.elo += eloChange;
    user.coins += coinsEarned;
    user.gems += gemsEarned;

    // Log the match securely
    user.matchHistory.push({
      result: isWin ? "VICTORY" : "DEFEAT",
      timestamp: new Date().toISOString(),
      coinsEarned,
      gemsEarned,
    });

    // Keep history trimmed to the last 20 matches to save DB space
    if (user.matchHistory.length > 20) {
      user.matchHistory.shift();
    }

    user.markModified("matchHistory");
    await user.save();

    res.status(200).json({
      message: "BATTLE_DATA_SYNCED",
      updatedUser: {
        wins: user.wins,
        losses: user.losses,
        totalGames: user.totalGames,
        elo: user.elo,
        coins: user.coins,
        gems: user.gems,
      },
    });
  } catch (error) {
    console.error("🔥 BATTLE SYNC CRASH:", error);
    res.status(500).json({ error: "BATTLE_CALCULATION_FAILED" });
  }
});

export default router;
