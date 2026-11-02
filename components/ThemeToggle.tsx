"use client";

import { useEffect, useState } from "react";

const themeStorageKey = "iskomart-theme";

function MoonIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none"><path d="M20.5 15.4A8.5 8.5 0 0 1 8.6 3.5 8.5 8.5 0 1 0 20.5 15.4Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SunIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none"><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedTheme = window.localStorage.getItem(themeStorageKey);
      const shouldUseDark = storedTheme === "dark";
      document.documentElement.classList.toggle("dark", shouldUseDark);
      setDark(shouldUseDark);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem(themeStorageKey, nextDark ? "dark" : "light");
    setDark(nextDark);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      className="inline-flex items-center gap-2 rounded-full border border-[#e8d9c5] bg-[#fffdf8] px-3 py-2 text-xs font-semibold text-[#7b2432] transition hover:border-[#d3a445] hover:text-[#b07b1d]"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
      <span className="hidden sm:inline">{dark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
