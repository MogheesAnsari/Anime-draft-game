import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  elo: { type: Number, default: 1000 }, // Pro ranking starts at 1000
  matchHistory: [
    {
      result: String,
      score: Number,
      date: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("User", userSchema);
