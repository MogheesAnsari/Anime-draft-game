import { useState, useEffect, useRef } from "react";
import axios from "axios";

export function useSportsDraftLogic(universe) {
  const [characterPool, setCharacterPool] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [team, setTeam] = useState({});
  const [currentDraftSlot, setCurrentDraftSlot] = useState(null);
  const [draftOptions, setDraftOptions] = useState([]);

  // 🛑 ANTI-SPAM RULE: Give them a strict limit on how many times they can cancel!
  // You can change this '3' to '1' if you want it to be incredibly strict.
  const [skips, setSkips] = useState(3);

  const pityBonus = useRef(0);

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

  const rollForCard = (availablePlayers, usedIds) => {
    const roll = Math.random() * 100;
    const currentPity = pityBonus.current;
    let targetTier = "B";

    if (roll <= 3 + currentPity) targetTier = "S+";
    else if (roll <= 15 + currentPity) targetTier = "S";
    else if (roll <= 50) targetTier = "A";

    let tierPool = availablePlayers.filter(
      (p) => p.tier === targetTier && !usedIds.has(p.id),
    );
    if (tierPool.length === 0)
      tierPool = availablePlayers.filter(
        (p) => p.tier === "A" && !usedIds.has(p.id),
      );
    if (tierPool.length === 0)
      tierPool = availablePlayers.filter((p) => !usedIds.has(p.id));

    if (tierPool.length === 0) return { selected: null, isSPlus: false };

    const selected = tierPool[Math.floor(Math.random() * tierPool.length)];
    return { selected, isSPlus: targetTier === "S+" };
  };

  const openDraftOptions = (slotConfig) => {
    const draftedIds = Object.values(team).map((p) => p.id);
    const validPlayers = characterPool.filter(
      (p) => p.role === slotConfig.role && !draftedIds.includes(p.id),
    );

    if (validPlayers.length < 3)
      return alert("Not enough players for a 3-card draw!");

    const newOptions = [];
    const usedIdsInThisDraw = new Set();
    let foundSPlus = false;

    for (let i = 0; i < 3; i++) {
      const { selected, isSPlus } = rollForCard(
        validPlayers,
        usedIdsInThisDraw,
      );
      if (selected) {
        newOptions.push(selected);
        usedIdsInThisDraw.add(selected.id);
        if (isSPlus) foundSPlus = true;
      }
    }

    if (!foundSPlus) pityBonus.current += 1.5;
    else pityBonus.current = 0;

    setDraftOptions(newOptions);
    setCurrentDraftSlot(slotConfig);
  };

  const selectPlayer = (player) => {
    setTeam((prev) => ({ ...prev, [currentDraftSlot.id]: player }));
    setDraftOptions([]);
    setCurrentDraftSlot(null);
  };

  // 🛑 deduct a skip when they cancel
  const cancelDraft = () => {
    if (skips > 0) {
      setSkips((prev) => prev - 1);
      setDraftOptions([]);
      setCurrentDraftSlot(null);
    }
  };

  // ✅ Export skips so the UI can use it
  return {
    dbLoading,
    team,
    draftOptions,
    currentDraftSlot,
    openDraftOptions,
    selectPlayer,
    cancelDraft,
    characterPool,
    skips,
  };
}
