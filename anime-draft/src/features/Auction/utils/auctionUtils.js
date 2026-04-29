// 🧠 CPU Bidding Intelligence System

export const calculateCPUBid = (
  character,
  difficulty,
  currentBid,
  cpuPurse,
  cpuRoster,
) => {
  if (!character || !character.tier || cpuPurse <= currentBid) return null;

  // CPU is hard-capped at 6 cards
  const emptySlotsCount = 6 - cpuRoster.length;
  if (emptySlotsCount <= 0) return null;

  // 1. Determine Base Valuation for 2000 Coin Economy
  let baseValuation = 0;
  switch (character.tier) {
    case "S+":
      baseValuation = 900;
      break;
    case "S":
      baseValuation = 600;
      break;
    case "A":
      baseValuation = 300;
      break;
    case "B":
      baseValuation = 150;
      break;
    default:
      baseValuation = 50;
      break;
  }

  let maxWillingToPay = baseValuation;
  let increment = 10;

  // 2. Intelligence Scaling by Difficulty
  if (difficulty === "EASY") {
    maxWillingToPay = baseValuation * (0.3 + Math.random() * 0.4);
    increment = 10;
  } else if (difficulty === "MEDIUM") {
    maxWillingToPay = baseValuation * (0.8 + Math.random() * 0.3);
    increment = currentBid < baseValuation * 0.5 ? 50 : 10;
  } else if (difficulty === "HARD") {
    maxWillingToPay = baseValuation * (1.2 + Math.random() * 0.6);

    // Hard CPU Synergy Tax
    const rosterUniverses = cpuRoster.map((c) => c?.universe).filter(Boolean);
    if (rosterUniverses.includes(character.universe)) {
      maxWillingToPay += 400;
    }

    if (character.tier === "S+" && maxWillingToPay - currentBid > 300) {
      increment = 50;
    } else {
      increment = 10;
    }
  }

  // 3. Financial Safety Net (Save 50 coins for every remaining empty slot)
  const safetyReserve = (emptySlotsCount - 1) * 50;
  maxWillingToPay = Math.min(maxWillingToPay, cpuPurse - safetyReserve);

  // 4. Fold Decision
  if (currentBid >= maxWillingToPay) return null;

  // 5. Final Bid Check
  if (currentBid + increment > cpuPurse) {
    increment = cpuPurse - currentBid;
  }

  return currentBid + increment;
};
