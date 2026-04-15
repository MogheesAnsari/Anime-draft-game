import axios from "axios";
import { fire_forceChars } from "./data/fire_force";
import { one_pieceChars } from "./data/one_piece";
import { narutoChars } from "./data/naruto";
import { aotChars } from "./data/aot";
import { demon_slayerChars } from "./data/demon_slayer";
import { bleachChars } from "./data/bleach";
import { black_cloverChars } from "./data/black_clover";
import { solo_levelingChars } from "./data/solo_leveling";
import { jjkChars } from "./data/jjk";
import { slimeChars } from "./data/slime";

export const CHARACTERS = [
  ...fire_forceChars,
  ...one_pieceChars,
  ...narutoChars,
  ...aotChars,
  ...demon_slayerChars,
  ...bleachChars,
  ...black_cloverChars,
  ...solo_levelingChars,
  ...jjkChars,
  ...slimeChars,
].map((char, index) => ({
  ...char,
  uniqueDraftId: `char_${index}_${char.id}`,
}));

export const ANIME_OPTIONS = [
  { id: "naruto", name: "NARUTO" },
  { id: "demon_slayer", name: "DEMON SLAYER" },
  { id: "jjk", name: "JUJUTSU KAISEN" },
  { id: "one_piece", name: "ONE PIECE" },
  { id: "dragon_ball", name: "DRAGON BALL" },
  { id: "solo_leveling", name: "SOLO LEVELING" },
  // NAYE ANIMES YAHAN HAIN
  { id: "bleach", name: "BLEACH" },
  { id: "black_clover", name: "BLACK CLOVER" },
  { id: "hxh", name: "HUNTER X HUNTER" },
  { id: "mha", name: "MY HERO ACADEMIA" },
  { id: "chainsaw_man", name: "CHAINSAW MAN" },
];

export const SLOTS = [
  { id: "captain", label: "1. CAPTAIN (LEADER)" },
  { id: "vice_cap", label: "2. VICE CAP (RIGHT HAND)" },
  { id: "speedster", label: "3. SPEEDSTER (AGILITY)" },
  { id: "tank", label: "4. DEFENCE/TANK (SHIELD)" },
  { id: "support", label: "5. SUPPORT (TACTICIAN)" },
  { id: "raw_power", label: "6. RAW POWER (BERSERKER)" },
];

export const getRandomUniqueByUniverse = (usedIds, universeId) => {
  let pool = CHARACTERS.filter((char) => !usedIds.includes(char.id));
  if (universeId && universeId.toLowerCase() !== "all") {
    pool = pool.filter((char) => char.universe === universeId);
  }
  if (pool.length === 0) return null;
  return [...pool].sort(() => Math.random() - 0.5)[0];
};
const API_URL = "https://anime-draft-game-1.onrender.com";

export const api = {
  login: (data) =>
    axios.post(`${API_BASE}/login`, data).then((res) => res.data),
  register: (data) =>
    axios.post(`${API_BASE}/register`, data).then((res) => res.data),
  fight: (payload) =>
    axios.post(`${API_BASE}/battle`, payload).then((res) => res.data),
  getLeaderboard: () =>
    axios.get(`${API_BASE}/leaderboard`).then((res) => res.data),
  getDashboard: (username) =>
    axios.get(`${API_BASE}/dashboard/${username}`).then((res) => res.data),
};
