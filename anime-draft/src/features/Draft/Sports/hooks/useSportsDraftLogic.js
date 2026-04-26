import { useState, useEffect, useRef } from "react";
import axios from "axios";

// 🎲 Casino-Grade Shuffle Array
const shuffleArray = (array) => {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function useSportsDraftLogic(universe) {
  const [characterPool, setCharacterPool] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [team, setTeam] = useState({});
  const [currentDraftSlot, setCurrentDraftSlot] = useState(null);
  const [draftOptions, setDraftOptions] = useState([]);
  const [skips, setSkips] = useState(3);

  const pityBonus = useRef(0);
  const seenHistory = useRef(new Set()); // 🧠 Remembers seen players

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

    // Prioritize players NOT seen yet
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

    // Deck Empty Rescue: If everyone was seen, ignore seenHistory so the game doesn't break
    if (tierPool.length === 0) {
      tierPool = availablePlayers.filter(
        (p) => !usedNamesInThisDraw.has(p.name.toLowerCase()),
      );
    }

    if (tierPool.length === 0) return { selected: null, isSPlus: false };

    const selected = tierPool[0]; // Take first from shuffled deck
    seenHistory.current.add(selected.name.toLowerCase()); // Add name to discard pile
    return { selected, isSPlus: targetTier === "S+" };
  };

  // 🛡️ globalDraftedNames blocks duplicates from OTHER human teams
  const openDraftOptions = (slotConfig, globalDraftedNames = new Set()) => {
    if (slotConfig.role === "IMP") {
      const batPool = shuffleArray(
        characterPool.filter(
          (p) =>
            p.role === "BAT" && !globalDraftedNames.has(p.name.toLowerCase()),
        ),
      );
      const bwlPool = shuffleArray(
        characterPool.filter(
          (p) =>
            p.role === "BWL" && !globalDraftedNames.has(p.name.toLowerCase()),
        ),
      );
      const allPool = shuffleArray(
        characterPool.filter(
          (p) =>
            p.role === "ALL" && !globalDraftedNames.has(p.name.toLowerCase()),
        ),
      );

      if (batPool.length < 1 || bwlPool.length < 1 || allPool.length < 1)
        return alert("Not enough diverse players left in DB for Impact Draw!");

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

    // STANDARD DRAFT
    const validPlayers = shuffleArray(
      characterPool.filter(
        (p) =>
          p.role === slotConfig.role &&
          !globalDraftedNames.has(p.name.toLowerCase()),
      ),
    );
    if (validPlayers.length < 3)
      return alert(`Not enough players left for role ${slotConfig.role}!`);

    const newOptions = [];
    const usedNamesInThisDraw = new Set();
    let foundSPlus = false;

    for (let i = 0; i < 3; i++) {
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
  };

  const cancelDraft = () => {
    if (skips > 0) {
      setSkips((prev) => prev - 1);
      setDraftOptions([]);
      setCurrentDraftSlot(null);
    }
  };

  // 🔄 REQUIRED FOR MULTIPLAYER: Clears the pitch for the next player!
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
  };
}
