import { useState, useEffect } from "react";
import axios from "axios";

export const useDraftLogic = (universe, mode, isRetry) => {
  const [playerTurn, setPlayerTurn] = useState(1);
  const [completedTeams, setCompletedTeams] = useState([]);
  const [team, setTeam] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [skips, setSkips] = useState(1);
  const [characterPool, setCharacterPool] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  // 🛰️ Mission Data Fetching
  useEffect(() => {
    const fetchFromDB = async () => {
      setDbLoading(true);
      try {
        const baseUrl =
          "https://anime-draft-game-1.onrender.com/api/characters";
        // Inside useDraftLogic.js
        const allUniverses =
          "naruto,one_piece,jjk,dragon_ball,mha,hxh,chainsaw_man,solo_leveling,demon_slayer,bleach,black_clover";
        const universeQuery = universe === "all" ? allUniverses : universe;
        const finalUrl = `${baseUrl}?universe=${universeQuery}&t=${Date.now()}`;
        const res = await axios.get(finalUrl);
        if (res.data?.length > 0) {
          const shuffled = [...res.data].sort(() => 0.5 - Math.random());
          setCharacterPool(shuffled);
          setCurrentCard(null);
          setSkips(1);
        }
      } catch (err) {
        console.error("KERNEL_FETCH_ERROR:", err);
      } finally {
        setDbLoading(false);
      }
    };
    if (universe) fetchFromDB();
  }, [universe, isRetry]);

  // 🚫 PULL LOGIC (Enforces 6-Slot Limit)
  const pull = () => {
    if (Object.keys(team).length >= 6) {
      return alert("SQUAD FULL! INITIATE FIGHT PROTOCOL.");
    }
    if (characterPool.length === 0) return alert("POOL EXHAUSTED!");

    const nextCard = characterPool[0];
    setCurrentCard(nextCard);
    setCharacterPool((prev) => prev.slice(1));
  };

  // 🛡️ ASSIGN LOGIC (Prevents Overfilling)
  const assign = (slotId) => {
    if (!currentCard || team[slotId]) return;

    if (Object.keys(team).length >= 6) {
      setCurrentCard(null);
      return alert("SQUAD COMPLETE!");
    }

    setTeam({ ...team, [slotId]: currentCard });
    setCurrentCard(null);
  };

  const nextTurn = () => {
    setCompletedTeams([...completedTeams, team]);
    setTeam({});
    setSkips(1);
    setCurrentCard(null);
    setPlayerTurn((prev) => prev + 1);
  };

  return {
    playerTurn,
    team,
    currentCard,
    skips,
    dbLoading,
    completedTeams,
    pull,
    handleSkip: () => {
      if (skips > 0) {
        setSkips(0);
        pull();
      }
    },
    assign,
    nextTurn,
    characterPool,
  };
};
