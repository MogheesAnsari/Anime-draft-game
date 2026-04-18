import React, { useState } from "react";
import axios from "axios";

const AVATARS = [
  { id: 1, name: "GOJO", img: "/gojo.svg" },
  { id: 2, name: "ZORO", img: "/zoro.svg" },
  { id: 3, name: "LUFFY", img: "/luffy.svg" },
  { id: 4, name: "SUKUNA", img: "/sukuna.svg" },
  { id: 5, name: "JINWOO", img: "/jinwoo.svg" },
  { id: 6, name: "ITACHI", img: "/itachi.svg" },
];

export default function ProfileEntry({ setUser }) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEntry = async () => {
    const specialCharRegex = /[._@#$]/;
    if (name.length < 3) return setError("NAME TOO SHORT! (MIN 3)");
    if (!specialCharRegex.test(name))
      return setError("ADD ONE SPECIAL CHAR (._@#$)");
    if (name.includes(" ")) return setError("NO SPACES ALLOWED!");

    setLoading(true);
    try {
      const res = await axios.post(
        "https://anime-draft-game-1.onrender.com/api/user/access",
        {
          username: name.toLowerCase().trim(),
          avatar: selectedAvatar.img,
        },
      );
      localStorage.setItem("commander", JSON.stringify(res.data));
      setUser(res.data);
    } catch (err) {
      setError("OFFLINE! ENGINE BOOTING...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-[#050505] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-[420px] bg-[#111113] p-8 rounded-[40px] border border-[#ff8c32]/20 text-center shadow-2xl relative">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#ff8c32]/5 rounded-full blur-[60px]"></div>
        <div className="relative w-32 h-32 mx-auto mb-8">
          <img
            src={selectedAvatar.img}
            className="w-full h-full rounded-full border-4 border-[#ff8c32] object-cover object-top p-1"
            alt=""
          />
        </div>
        <h1 className="text-3xl font-black italic text-white mb-8 tracking-tighter">
          CREATE <span className="text-[#ff8c32]">ID</span>
        </h1>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {AVATARS.map((av) => (
            <button
              key={av.id}
              onClick={() => setSelectedAvatar(av)}
              className={`aspect-square rounded-2xl border-2 transition-all p-1 ${selectedAvatar.id === av.id ? "border-[#ff8c32] scale-110" : "border-white/5 opacity-50"}`}
            >
              <img
                src={av.img}
                className="w-full h-full rounded-xl object-cover object-top"
                alt=""
              />
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="ID (e.g. MOGHEES_01)"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          className="w-full bg-black border border-white/10 p-5 rounded-3xl text-center text-white font-black mb-4 focus:border-[#ff8c32] outline-none transition-all uppercase"
        />
        {error && (
          <p className="text-[10px] text-red-500 font-bold mb-4 animate-pulse">
            {error}
          </p>
        )}
        <button
          onClick={handleEntry}
          disabled={loading}
          className="w-full bg-[#ff8c32] text-black font-black py-5 rounded-3xl italic tracking-widest hover:shadow-[0_0_30px_rgba(255,140,50,0.3)] transition-all uppercase"
        >
          {loading ? "Initializing..." : "DEPLOY COMMANDER"}
        </button>
      </div>
    </div>
  );
}
