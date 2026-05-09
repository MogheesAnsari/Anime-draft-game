import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const SOCKET_URL = "https://anime-draft-game-1.onrender.com";

// 🚀 CUSTOM SEEDED RNG: Ensures both players shuffle the deck the EXACT same way!
const getSeededRandom = (seed) => {
  let state = seed;
  return function () {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
};

export const useDraftLogic = (
  domain,
  universe,
  mode,
  isRetry,
  isOnline = false,
  roomId = null,
  matchSeed = null, // 🚀 NEW: Receive the seed from the manager
) => {
  const [playerTurn, setPlayerTurn] = useState(1);
  const [completedTeams, setCompletedTeams] = useState([]);
  const [team, setTeam] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [skips, setSkips] = useState(1);
  const [characterPool, setCharacterPool] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  const [socket, setSocket] = useState(null);

  // 🚀 SOCKET SYNC ENGINE (LIVE SPECTATOR MODE)
  useEffect(() => {
    if (!isOnline || !roomId) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit("join_match", { roomId });

    newSocket.on("opponent_action", (data) => {
      // 🚀 LIVE UI SYNC: Update our local state based on opponent's moves
      if (data.type === "PULL") {
        setCharacterPool((prev) => {
          if (prev.length === 0) return prev;
          setCurrentCard(prev[0]); // Show the card to the spectator!
          return prev.slice(1);
        });
      } else if (data.type === "ASSIGN") {
        // Opponent assigned a card to their team dock
        setTeam((prev) => ({ ...prev, [data.slotId]: data.character }));
        setCurrentCard(null);
        setCharacterPool((prev) =>
          prev.filter((char) => char.id !== data.character.id),
        );
      } else if (data.type === "SKIP") {
        setCharacterPool((prev) => prev.slice(1));
      } else if (data.type === "NEXT_TURN") {
        setCompletedTeams((prev) => [...prev, data.team]);
        setTeam({});
        setCurrentCard(null);
        setPlayerTurn((prev) => prev + 1);
      }
    });

    return () => newSocket.disconnect();
  }, [isOnline, roomId]);

  // 🛰️ Mission Data Fetching & Sync Shuffling
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
          // 🚀 DETERMINISTIC SHUFFLE: Use the server seed so both pools are identical
          const rng = matchSeed
            ? getSeededRandom(Math.floor(matchSeed * 1000000))
            : Math.random;

          const shuffled = [...res.data].sort(() => 0.5 - rng());

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
  }, [domain, universe, isRetry, matchSeed]);

  const pull = () => {
    if (Object.keys(team).length >= 6) return alert("SQUAD FULL!");
    if (characterPool.length === 0) return alert("POOL EXHAUSTED!");

    const nextCard = characterPool[0];
    setCurrentCard(nextCard);
    setCharacterPool((prev) => prev.slice(1));

    if (isOnline && socket) {
      socket.emit("game_action", { roomId, type: "PULL" });
    }
  };

  const assign = (slotId) => {
    if (!currentCard || team[slotId]) return;

    const assignedChar = currentCard;
    setTeam({ ...team, [slotId]: assignedChar });
    setCurrentCard(null);

    // 🚀 SYNC ASSIGNMENT: Send the full character object so spectator sees the image in the dock
    if (isOnline && socket) {
      socket.emit("game_action", {
        roomId,
        type: "ASSIGN",
        slotId,
        character: assignedChar,
      });
    }
  };

  const nextTurn = () => {
    const finalTeam = { ...team };
    setCompletedTeams((prev) => [...prev, finalTeam]);
    setTeam({});
    setSkips(1);
    setCurrentCard(null);
    setPlayerTurn((prev) => prev + 1);

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
        if (isOnline && socket) {
          socket.emit("game_action", { roomId, type: "SKIP" });
        }
      }
    },
    assign,
    nextTurn,
    characterPool,
    socket,
  };
};
