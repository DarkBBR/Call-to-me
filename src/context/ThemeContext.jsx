import React, { createContext, useContext, useState, useEffect } from "react";

export const themes = [
  { name: "Preto e verde", value: "dark" },
  { name: "Branco e roxo", value: "light" },
  { name: "Roxo e preto", value: "purple-dark" },
  { name: "Amarelo e vermelho", value: "yellow-red" },
  { name: "Rosa e preto", value: "pink-dark" },
  { name: "Rosa total com sombras", value: "pink" },
  { name: "Preto com sombras e efeitos", value: "dark-shadow" },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("chat_theme") || "dark");

  useEffect(() => {
    localStorage.setItem("chat_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 