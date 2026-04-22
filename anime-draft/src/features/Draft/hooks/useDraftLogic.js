import { useState, useEffect } from "react";
import axios from "axios";

export const useDraftLogic = (domain, universe, mode, isRetry) => {
  const [playerTurn, setPlayerTurn] = useState(1);
  const [completedTeams, setCompletedTeams] = useState([]);
  const [team, setTeam] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [skips, setSkips] = useState(1);
  const [characterPool, setCharacterPool] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  // 🛰️ Dynamic Mission Data Fetching
  useEffect(() => {
    const fetchFromDB = async () => {
      setDbLoading(true);
      try {
        const isSports = domain === "sports";
        const endpoint = isSports ? "players" : "characters";
        const queryParam = isSports ? "sport" : "universe";

        const baseUrl = `https://anime-draft-game-1.onrender.com/api/${endpoint}`;

        let queryValue = universe;
        // Keep your specific anime list intact if they choose "all" in Anime mode
        if (!isSports && universe === "all") {
          queryValue =
            "naruto,one_piece,jjk,dragon_ball,mha,hxh,chainsaw_man,solo_leveling,demon_slayer,bleach,black_clover";
        }

        const finalUrl = `${baseUrl}?${queryParam}=${queryValue}&t=${Date.now()}`;

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
  }, [domain, universe, isRetry]); // Added domain to dependency array

  const pull = () => {
    if (Object.keys(team).length >= 6) return alert("SQUAD FULL!");
    if (characterPool.length === 0) return alert("POOL EXHAUSTED!");
    const nextCard = characterPool[0];
    setCurrentCard(nextCard);
    setCharacterPool((prev) => prev.slice(1));
  };

  const assign = (slotId) => {
    if (!currentCard || team[slotId]) return;
    setTeam({ ...team, [slotId]: currentCard });
    setCurrentCard(null);
  };

  const nextTurn = () => {
    setCompletedTeams((prev) => [...prev, { ...team }]);
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
