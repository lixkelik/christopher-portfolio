import { Moon, Sun } from "lucide-react";
import { useState } from "react";
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

  const [isDarkMode, setIsDarkMode] = useState(isStoredDarkMode);

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
        "fixed max-sm:hidden top-2 right-5 z-50 p-2 rounded-full transition-colors duration-300",
        "focus:outline-hidden"
      )}
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="h-6 w-6 text-yellow-300" />
      ) : (
        <Moon className="h-6 w-6 text-blue-900" />
      )}
    </button>
  );
};
