import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Game from "./components/Game"; // Check karna ki file ka naam yahi hai

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user was already logged in (Persist Login)
  useEffect(() => {
    const savedUser = localStorage.getItem("anime_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("anime_user");
      }
    }
    setLoading(false);
  }, []);

  // 2. This is the magic function that Auth.jsx calls
  const handleLogin = (userData) => {
    console.log("Login Success! Received Data:", userData);
    setUser(userData);
    localStorage.setItem("anime_user", JSON.stringify(userData));
  };

  // 3. Simple Logout function
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("anime_user");
  };

  // 4. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020a04] flex items-center justify-center">
        <div className="text-green-500 font-black tracking-widest animate-pulse">
          INITIALIZING ARENA...
        </div>
      </div>
    );
  }

  // 5. MAIN RETURN BLOCK (Exactly what you needed)
  return (
    <div className="App min-h-screen bg-black text-white">
      {!user ? (
        /* Yahan hum 'onLogin' prop bhej rahe hain jo Auth.jsx ko chahiye */
        <Auth onLogin={handleLogin} />
      ) : (
        /* User milte hi Game screen dikhao */
        <Game user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
