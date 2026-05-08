import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// 🚀 LIVE BACKEND URL
const SOCKET_URL = "https://anime-draft-game-1.onrender.com";

// 🎲 Casino-Grade Shuffle
const shuffleArray = (array) => {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function useSportsDraftLogic(universe, isOnline = false, roomId = null) {
  const [characterPool, setCharacterPool] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [team, setTeam] = useState({});
  const [currentDraftSlot, setCurrentDraftSlot] = useState(null);
  const [draftOptions, setDraftOptions] = useState([]);
  const [skips, setSkips] = useState(3);

  const pityBonus = useRef(0);
  const seenHistory = useRef(new Set());

  const [socket, setSocket] = useState(null);

  // 🚀 SOCKET SYNC ENGINE
  useEffect(() => {
    if (!isOnline || !roomId) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit("join_match", { roomId });

    newSocket.on("opponent_action", (data) => {
      // If the opponent drafts someone, we instantly remove them from our local pool
      if (data.type === "SPORTS_PICK") {
        setCharacterPool((prev) => prev.filter((p) => p.id !== data.player.id));
        seenHistory.current.add(data.player.name.toLowerCase());
      }
    });

    return () => newSocket.disconnect();
  }, [isOnline, roomId]);

  useEffect(() => {
    const fetchPool = async () => {
      try {
        const res = await axios.get(
          `https://anime-draft-game-1.onrender.com/api/players?sport=${universe}`,
        );
        setCharacterPool(res.data);
      } catch (err) {
        console.error(err);
      }
      setDbLoading(false);
    };
    fetchPool();
  }, [universe]);

  const rollForCard = (availablePlayers, usedNamesInThisDraw) => {
    const roll = Math.random() * 100;
    const currentPity = pityBonus.current;
    let targetTier = "B";

    if (roll <= 3 + currentPity) targetTier = "S+";
    else if (roll <= 15 + currentPity) targetTier = "S";
    else if (roll <= 50) targetTier = "A";

    let tierPool = availablePlayers.filter(
      (p) =>
        p.tier === targetTier &&
        !usedNamesInThisDraw.has(p.name.toLowerCase()) &&
        !seenHistory.current.has(p.name.toLowerCase()),
    );

    if (tierPool.length === 0)
      tierPool = availablePlayers.filter(
        (p) =>
          !usedNamesInThisDraw.has(p.name.toLowerCase()) &&
          !seenHistory.current.has(p.name.toLowerCase()),
      );

    if (tierPool.length === 0) {
      tierPool = availablePlayers.filter(
        (p) => !usedNamesInThisDraw.has(p.name.toLowerCase()),
      );
    }

    if (tierPool.length === 0) return { selected: null, isSPlus: false };

    const selected = tierPool[0];
    seenHistory.current.add(selected.name.toLowerCase());
    return { selected, isSPlus: targetTier === "S+" };
  };

  const openDraftOptions = (slotConfig, globalDraftedNames = new Set()) => {
    const draftedIds = Object.values(team).map((p) => p.id);

    if (slotConfig.role === "IMP") {
      const batPool = shuffleArray(
        characterPool.filter(
          (p) =>
            p.role === "BAT" &&
            !globalDraftedNames.has(p.name.toLowerCase()) &&
            !draftedIds.includes(p.id),
        ),
      );
      const bwlPool = shuffleArray(
        characterPool.filter(
          (p) =>
            p.role === "BWL" &&
            !globalDraftedNames.has(p.name.toLowerCase()) &&
            !draftedIds.includes(p.id),
        ),
      );
      const allPool = shuffleArray(
        characterPool.filter(
          (p) =>
            p.role === "ALL" &&
            !globalDraftedNames.has(p.name.toLowerCase()) &&
            !draftedIds.includes(p.id),
        ),
      );

      if (batPool.length < 1 || bwlPool.length < 1 || allPool.length < 1)
        return alert("Not enough diverse players in DB for Impact!");

      const newOptions = [];
      const usedNamesInThisDraw = new Set();
      let foundSPlus = false;

      [batPool, bwlPool, allPool].forEach((pool) => {
        const { selected, isSPlus } = rollForCard(pool, usedNamesInThisDraw);
        if (selected) {
          newOptions.push(selected);
          usedNamesInThisDraw.add(selected.name.toLowerCase());
          if (isSPlus) foundSPlus = true;
        }
      });

      pityBonus.current = foundSPlus ? 0 : pityBonus.current + 1.5;
      setDraftOptions(newOptions);
      setCurrentDraftSlot(slotConfig);
      return;
    }

    const validPlayers = shuffleArray(
      characterPool.filter(
        (p) =>
          p.role === slotConfig.role &&
          !globalDraftedNames.has(p.name.toLowerCase()) &&
          !draftedIds.includes(p.id),
      ),
    );
    if (validPlayers.length < 2)
      return alert(`Not enough players left for role ${slotConfig.role}!`);

    const newOptions = [];
    const usedNamesInThisDraw = new Set();
    let foundSPlus = false;

    for (let i = 0; i < 2; i++) {
      const { selected, isSPlus } = rollForCard(
        validPlayers,
        usedNamesInThisDraw,
      );
      if (selected) {
        newOptions.push(selected);
        usedNamesInThisDraw.add(selected.name.toLowerCase());
        if (isSPlus) foundSPlus = true;
      }
    }

    pityBonus.current = foundSPlus ? 0 : pityBonus.current + 1.5;
    setDraftOptions(newOptions);
    setCurrentDraftSlot(slotConfig);
  };

  const selectPlayer = (player) => {
    setTeam((prev) => ({ ...prev, [currentDraftSlot.id]: player }));
    setDraftOptions([]);
    setCurrentDraftSlot(null);

    // 🚀 SYNC: Tell opponent we drafted this player so they are removed from their screen too
    if (isOnline && socket) {
      socket.emit("game_action", { roomId, type: "SPORTS_PICK", player });
    }
  };

  const cancelDraft = () => {
    if (skips > 0) {
      setSkips((prev) => prev - 1);
      setDraftOptions([]);
      setCurrentDraftSlot(null);
    }
  };

  const resetDraft = () => {
    setTeam({});
    setDraftOptions([]);
    setCurrentDraftSlot(null);
    setSkips(3);
  };

  return {
    dbLoading,
    team,
    draftOptions,
    currentDraftSlot,
    openDraftOptions,
    selectPlayer,
    cancelDraft,
    resetDraft,
    characterPool,
    skips,
    socket, // 🚀 EXPORTED FOR THE MANAGER
  };
}
