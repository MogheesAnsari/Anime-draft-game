import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client"; // 🚀 1. Import Socket Client

const SOCKET_URL = "https://anime-draft-game-1.onrender.com";

// 🚀 2. Added isOnline and roomId with default local values
export const useDraftLogic = (
  domain,
  universe,
  mode,
  isRetry,
  isOnline = false,
  roomId = null,
) => {
  const [playerTurn, setPlayerTurn] = useState(1);
  const [completedTeams, setCompletedTeams] = useState([]);
  const [team, setTeam] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [skips, setSkips] = useState(1);
  const [characterPool, setCharacterPool] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  // 🚀 3. Socket State
  const [socket, setSocket] = useState(null);

  // 🚀 4. MULTIPLAYER SYNC EFFECT
  useEffect(() => {
    if (!isOnline || !roomId) return; // Ignore completely if playing locally

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Tell server we are entering the active game room
    newSocket.emit("join_match", { roomId });

    // Listen for the opponent's moves
    newSocket.on("opponent_action", (data) => {
      if (data.type === "PULL" || data.type === "SKIP") {
        // If opponent pulls or skips, we must remove that card from our pool too!
        setCharacterPool((prev) => prev.slice(1));
      } else if (data.type === "NEXT_TURN") {
        // Opponent locked in their squad, it's our turn now
        setCompletedTeams((prev) => [...prev, data.team]);
        setPlayerTurn((prev) => prev + 1);
      }
    });

    return () => newSocket.disconnect();
  }, [isOnline, roomId]);

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
  }, [domain, universe, isRetry]);

  const pull = () => {
    if (Object.keys(team).length >= 6) return alert("SQUAD FULL!");
    if (characterPool.length === 0) return alert("POOL EXHAUSTED!");

    const nextCard = characterPool[0];
    setCurrentCard(nextCard);
    setCharacterPool((prev) => prev.slice(1));

    // 🚀 MULTIPLAYER: Tell the opponent we pulled a card
    if (isOnline && socket) {
      socket.emit("game_action", { roomId, type: "PULL" });
    }
  };

  const assign = (slotId) => {
    if (!currentCard || team[slotId]) return;
    setTeam({ ...team, [slotId]: currentCard });
    setCurrentCard(null);
  };

  const nextTurn = () => {
    const finalTeam = { ...team };
    setCompletedTeams((prev) => [...prev, finalTeam]);
    setTeam({});
    setSkips(1);
    setCurrentCard(null);
    setPlayerTurn((prev) => prev + 1);

    // 🚀 MULTIPLAYER: Send our completed team to the opponent
    if (isOnline && socket) {
      socket.emit("game_action", {
        roomId,
        type: "NEXT_TURN",
        team: finalTeam,
      });
    }
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
        // 🚀 MULTIPLAYER: Sync skip
        if (isOnline && socket) {
          socket.emit("game_action", { roomId, type: "SKIP" });
        }
      }
    },
    assign,
    nextTurn,
    characterPool,
  };
};
