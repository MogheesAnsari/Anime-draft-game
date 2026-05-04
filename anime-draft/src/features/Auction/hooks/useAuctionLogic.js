import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { calculateCPUBid } from "../utils/auctionUtils";

export const useAuctionLogic = (universe = "all", difficulty = "MEDIUM") => {
  const [characterPool, setCharacterPool] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  const [purses, setPurses] = useState([2000, 2000, 2000, 2000]);
  const [rosters, setRosters] = useState([[], [], [], []]);

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);

  // 🚀 FIXED: Default timer set to 5 seconds
  const [timer, setTimer] = useState(5);

  const [isAuctionActive, setIsAuctionActive] = useState(false);
  const [auctionComplete, setAuctionComplete] = useState(false);

  const currentLot =
    currentIndex >= 0 && currentIndex < characterPool.length
      ? characterPool[currentIndex]
      : null;
  const lotsRemaining = Math.max(
    0,
    characterPool.length - (currentIndex === -1 ? 0 : currentIndex),
  );

  const auctionInterval = useRef(null);
  const cpuDecisionTimeout = useRef(null);
  const phaseTimeout = useRef(null);

  useEffect(() => {
    const fetchPool = async () => {
      try {
        let queryValue = universe;
        if (universe === "all" || !universe) {
          queryValue =
            "naruto,one_piece,jjk,dragon_ball,mha,hxh,chainsaw_man,solo_leveling,demon_slayer,bleach,black_clover,opm,tokyo_ghoul";
        }
        const res = await axios.get(
          `https://anime-draft-game-1.onrender.com/api/characters?universe=${queryValue}`,
        );
        const validChars = res.data.filter((c) => c && c.tier);
        const shuffled = validChars.sort(() => 0.5 - Math.random());
        setCharacterPool(shuffled.slice(0, 32));
        setDbLoading(false);
      } catch (err) {
        console.error("AUCTION_POOL_FETCH_ERROR", err);
        setDbLoading(false);
      }
    };
    fetchPool();
  }, [universe]);

  const startNextLot = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    setCurrentBid(10);
    setHighestBidder(null);

    // 🚀 FIXED: Timer resets to 5 when a new lot drops
    setTimer(5);

    setIsAuctionActive(true);
  }, []);

  useEffect(() => {
    if (characterPool.length > 0 && currentIndex >= characterPool.length) {
      setAuctionComplete(true);
      setIsAuctionActive(false);
    }
  }, [currentIndex, characterPool.length]);

  const placeBid = useCallback(
    (playerIndex, amount) => {
      if (!isAuctionActive) return;
      if (amount <= currentBid) return;
      if (amount > purses[playerIndex]) return;

      if (playerIndex === 0 && rosters[0].length >= 8) return;
      if (playerIndex !== 0 && rosters[playerIndex].length >= 6) return;

      setCurrentBid(amount);
      setHighestBidder(playerIndex);

      // 🚀 FIXED: Timer resets to 5 every time someone bids
      setTimer(5);
    },
    [isAuctionActive, currentBid, purses, rosters],
  );

  const finishAuctionEarly = useCallback(() => {
    setAuctionComplete(true);
    setIsAuctionActive(false);
    clearTimeout(phaseTimeout.current);
    clearInterval(auctionInterval.current);
    clearTimeout(cpuDecisionTimeout.current);
  }, []);

  useEffect(() => {
    const isHumanFull = rosters[0].length >= 8;
    const isCpu1Full = rosters[1].length >= 6;
    const isCpu2Full = rosters[2].length >= 6;
    const isCpu3Full = rosters[3].length >= 6;

    if (
      isHumanFull &&
      isCpu1Full &&
      isCpu2Full &&
      isCpu3Full &&
      !auctionComplete
    ) {
      finishAuctionEarly();
    }
  }, [rosters, auctionComplete, finishAuctionEarly]);

  const skipCurrentLot = useCallback(() => {
    setIsAuctionActive(false);
    clearTimeout(phaseTimeout.current);
    clearInterval(auctionInterval.current);
    clearTimeout(cpuDecisionTimeout.current);

    let simPurses = [...purses];
    let simRosters = [...rosters];
    let simBid = 10;
    let simWinner = null;
    let activeBidders = [1, 2, 3];
    let safeLoop = 0;

    while (activeBidders.length > 0 && safeLoop < 100) {
      safeLoop++;
      let bidPlaced = false;
      activeBidders.sort(() => 0.5 - Math.random());

      for (let i = 0; i < activeBidders.length; i++) {
        const cpuId = activeBidders[i];
        if (simWinner === cpuId) continue;

        const bid = calculateCPUBid(
          currentLot,
          difficulty,
          simBid,
          simPurses[cpuId],
          simRosters[cpuId],
        );

        if (bid !== null) {
          simBid = bid;
          simWinner = cpuId;
          bidPlaced = true;
          break;
        } else {
          activeBidders = activeBidders.filter((id) => id !== cpuId);
        }
      }
      if (!bidPlaced) break;
    }

    if (simWinner !== null) {
      simRosters[simWinner] = [...simRosters[simWinner], currentLot];
      simPurses[simWinner] -= simBid;
      setRosters(simRosters);
      setPurses(simPurses);
    }

    phaseTimeout.current = setTimeout(() => {
      startNextLot();
    }, 500);
  }, [purses, rosters, currentLot, difficulty, startNextLot]);

  const concludeLot = useCallback(() => {
    setIsAuctionActive(false);

    if (highestBidder !== null && currentLot) {
      setRosters((prev) => {
        const newRosters = [...prev];
        newRosters[highestBidder] = [...newRosters[highestBidder], currentLot];
        return newRosters;
      });

      setPurses((prev) => {
        const newPurses = [...prev];
        newPurses[highestBidder] -= currentBid;
        return newPurses;
      });
    }

    clearTimeout(phaseTimeout.current);
    phaseTimeout.current = setTimeout(() => {
      startNextLot();
    }, 1500);
  }, [highestBidder, currentLot, currentBid, startNextLot]);

  useEffect(() => {
    if (isAuctionActive && timer > 0) {
      auctionInterval.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isAuctionActive) {
      concludeLot();
    }
    return () => clearInterval(auctionInterval.current);
  }, [timer, isAuctionActive, concludeLot]);

  useEffect(() => {
    if (!isAuctionActive || currentLot === null) return;

    clearTimeout(cpuDecisionTimeout.current);

    cpuDecisionTimeout.current = setTimeout(
      () => {
        const cpus = [1, 2, 3].sort(() => 0.5 - Math.random());

        for (let cpuId of cpus) {
          if (highestBidder === cpuId) continue;

          const cpuPurse = purses[cpuId];
          const cpuRoster = rosters[cpuId];

          const nextBid = calculateCPUBid(
            currentLot,
            difficulty,
            currentBid,
            cpuPurse,
            cpuRoster,
          );

          if (nextBid !== null) {
            placeBid(cpuId, nextBid);
            break;
          }
        }
      },
      400 + Math.random() * 600,
    );

    return () => clearTimeout(cpuDecisionTimeout.current);
  }, [
    currentBid,
    highestBidder,
    isAuctionActive,
    currentLot,
    difficulty,
    purses,
    rosters,
    placeBid,
  ]);

  return {
    dbLoading,
    characterPool,
    currentIndex,
    currentLot,
    purses,
    currentBid,
    highestBidder,
    timer,
    isAuctionActive,
    auctionComplete,
    rosters,
    placeBid,
    startNextLot,
    lotsRemaining,
    skipCurrentLot,
    finishAuctionEarly,
  };
};
