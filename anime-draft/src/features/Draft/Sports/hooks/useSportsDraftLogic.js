import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// 🚀 LIVE BACKEND URL
const SOCKET_URL = "https://anime-draft-game-1.onrender.com";

// 🚀 CUSTOM SEEDED RNG: Ensures both players shuffle the deck identically!
const getSeededRandom = (seed) => {
  let state = seed;
  return function () {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
};

const shuffleArray = (array, rng) => {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function useSportsDraftLogic(
  universe,
  isOnline = false,
  roomId = null,
  matchSeed = null,
) {
  const [characterPool, setCharacterPool] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [team, setTeam] = useState({});
  const [currentDraftSlot, setCurrentDraftSlot] = useState(null);
  const [draftOptions, setDraftOptions] = useState([]);
  const [skips, setSkips] = useState(3);

  const pityBonus = useRef(0);
  const seenHistory = useRef(new Set());
  const rngRef = useRef(Math.random);

  const [socket, setSocket] = useState(null);

  // 🚀 Initialize deterministic RNG if we are in an online match
  useEffect(() => {
    if (matchSeed) {
      rngRef.current = getSeededRandom(Math.floor(matchSeed * 1000000));
    }
  }, [matchSeed]);

  // 🚀 SOCKET SYNC ENGINE (LIVE SPECTATOR MODE)
  useEffect(() => {
    if (!isOnline || !roomId) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit("join_match", { roomId });

    newSocket.on("opponent_action", (data) => {
      // Spectator watches you open the pack
      if (data.type === "OPEN_PACK") {
        setDraftOptions(data.options);
        setCurrentDraftSlot(data.slotConfig);
      }
      // Spectator watches you cancel
      else if (data.type === "CANCEL_DRAFT") {
        setDraftOptions([]);
        setCurrentDraftSlot(null);
      }
      // Spectator watches you pick a player
      else if (data.type === "SPORTS_PICK") {
        setTeam((prev) => ({ ...prev, [data.slotId]: data.player }));
        setDraftOptions([]);
        setCurrentDraftSlot(null);
        setCharacterPool((prev) => prev.filter((p) => p.id !== data.player.id));
        seenHistory.current.add(data.player.name.toLowerCase());
      }
    });

    return () => newSocket.disconnect();
  }, [isOnline, roomId]);

  // Fetch Database
  useEffect(() => {
    const fetchPool = async () => {
      try {
        const res = await axios.get(
          `https://anime-draft-game-1.onrender.com/api/players?sport=${universe}`,
        );
        // Apply seeded shuffle so both pools match perfectly
        setCharacterPool(shuffleArray(res.data, rngRef.current));
      } catch (err) {
        console.error(err);
      }
      setDbLoading(false);
    };
    fetchPool();
  }, [universe]);

  const rollForCard = (availablePlayers, usedNamesInThisDraw) => {
    const roll = rngRef.current() * 100;
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
        rngRef.current,
      );
      const bwlPool = shuffleArray(
        characterPool.filter(
          (p) =>
            p.role === "BWL" &&
            !globalDraftedNames.has(p.name.toLowerCase()) &&
            !draftedIds.includes(p.id),
        ),
        rngRef.current,
      );
      const allPool = shuffleArray(
        characterPool.filter(
          (p) =>
            p.role === "ALL" &&
            !globalDraftedNames.has(p.name.toLowerCase()) &&
            !draftedIds.includes(p.id),
        ),
        rngRef.current,
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

      // 🚀 SYNC: Show opponent the pack you opened
      if (isOnline && socket) {
        socket.emit("game_action", {
          roomId,
          type: "OPEN_PACK",
          options: newOptions,
          slotConfig,
        });
      }
      return;
    }

    const validPlayers = shuffleArray(
      characterPool.filter(
        (p) =>
          p.role === slotConfig.role &&
          !globalDraftedNames.has(p.name.toLowerCase()) &&
          !draftedIds.includes(p.id),
      ),
      rngRef.current,
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

    // 🚀 SYNC: Show opponent the pack you opened
    if (isOnline && socket) {
      socket.emit("game_action", {
        roomId,
        type: "OPEN_PACK",
        options: newOptions,
        slotConfig,
      });
    }
  };

  const selectPlayer = (player) => {
    const slotId = currentDraftSlot.id;
    setTeam((prev) => ({ ...prev, [slotId]: player }));
    setDraftOptions([]);
    setCurrentDraftSlot(null);

    // 🚀 SYNC: Tell opponent who you picked
    if (isOnline && socket) {
      socket.emit("game_action", {
        roomId,
        type: "SPORTS_PICK",
        player,
        slotId,
      });
    }
  };

  const cancelDraft = () => {
    if (skips > 0) {
      setSkips((prev) => prev - 1);
      setDraftOptions([]);
      setCurrentDraftSlot(null);

      // 🚀 SYNC: Close opponent's view of the pack
      if (isOnline && socket) {
        socket.emit("game_action", { roomId, type: "CANCEL_DRAFT" });
      }
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
    socket,
  };
}
