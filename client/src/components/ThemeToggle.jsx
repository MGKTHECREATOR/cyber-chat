import React from "react";
import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";
export default function ThemeToggle(){
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} className="p-2 rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 backdrop-blur hover:scale-105 transition shadow-soft">
      {theme === "dark" ? <FiSun/> : <FiMoon/>}
    </button>
  );
}
