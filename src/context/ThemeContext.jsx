import React, { createContext, useContext, useState, useEffect } from "react";

export const themes = [
  { name: "Preto e verde", value: "dark" },
  { name: "Branco e roxo", value: "light" },
  { name: "Roxo e preto", value: "purple-dark" },
  { name: "Amarelo e vermelho", value: "yellow-red" },
  { name: "Rosa e preto", value: "pink-dark" },
  { name: "Rosa total com sombras", value: "pink" },
  { name: "Preto com sombras e efeitos", value: "dark-shadow" },
  // Exemplos de temas visuais mais ricos:
  { name: "Gradiente Roxo", value: "gradient-purple" },
  { name: "Gradiente Azul", value: "gradient-blue" },
  { name: "Fundo Animado", value: "animated-bg" },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("chat_theme") || "dark");

  useEffect(() => {
    localStorage.setItem("chat_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    // Temas visuais especiais
    document.body.classList.remove("theme-gradient-purple", "theme-gradient-blue", "theme-animated-bg");
    if (theme === "gradient-purple") {
      document.body.classList.add("theme-gradient-purple");
    } else if (theme === "gradient-blue") {
      document.body.classList.add("theme-gradient-blue");
    } else if (theme === "animated-bg") {
      document.body.classList.add("theme-animated-bg");
    }
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