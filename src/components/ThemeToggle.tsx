import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

export const ThemeToggle = () => {
  const isStoredDarkMode = () => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      return true;
    }
    document.documentElement.classList.remove("dark");
    return false;
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    isStoredDarkMode()
  );

  // On first mount, if no theme stored, default to light
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (!storedTheme) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
      window.dispatchEvent(
        new CustomEvent("theme-changed", { detail: { theme: "light" } })
      );
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDarkMode(!isDarkMode);
    // Dispatch a custom event so other components can react without prop drilling
    window.dispatchEvent(
      new CustomEvent("theme-changed", {
        detail: { theme: !isDarkMode ? "dark" : "light" },
      })
    );
  };
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-full transition-colors duration-300 hover:bg-card focus:outline-hidden"
      )}
      aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDarkMode}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-yellow-300" />
      ) : (
        <Moon className="h-5 w-5 text-blue-900" />
      )}
    </button>
  );
};
