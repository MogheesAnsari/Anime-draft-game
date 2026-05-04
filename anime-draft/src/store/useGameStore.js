import { create } from "zustand";

const useGameStore = create((set) => ({
  // Initialize user straight from localStorage so it persists on refresh
  user: JSON.parse(localStorage.getItem("commander")) || null,

  // Initialize domain safely
  activeDomain: localStorage.getItem("animeDraft_lastDomain") || "anime",

  // Master function to update user and keep localStorage perfectly synced
  setUser: (userData) => {
    if (userData) {
      localStorage.setItem("commander", JSON.stringify(userData));
    } else {
      localStorage.removeItem("commander"); // Handle logouts
    }
    set({ user: userData });
  },

  setActiveDomain: (domain) => {
    localStorage.setItem("animeDraft_lastDomain", domain);
    set({ activeDomain: domain });
  },
}));

export default useGameStore;
