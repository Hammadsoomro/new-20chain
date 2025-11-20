import { createContext, useContext, useEffect, useState } from "react";

export type ThemeName =
  | "light"
  | "dark"
  | "ocean"
  | "forest"
  | "sunset"
  | "midnight";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: readonly ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as ThemeName | null;
      return saved || "light";
    }
    return "light";
  });

  const themes: readonly ThemeName[] = [
    "light",
    "dark",
    "ocean",
    "forest",
    "sunset",
    "midnight",
  ];

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    const root = document.documentElement;

    // Remove all theme classes
    themes.forEach((t) => {
      root.classList.remove(`theme-${t}`);
    });

    // Add new theme class
    root.classList.add(`theme-${newTheme}`);

    // Update dark mode class for dark themes
    if (newTheme === "dark" || newTheme === "midnight") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  useEffect(() => {
    setTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
