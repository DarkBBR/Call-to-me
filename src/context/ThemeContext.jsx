import React, { createContext, useContext, useState, useEffect } from "react";

export const themes = [
  { name: "Preto/Verde", value: "dark-green" },
  { name: "Claro", value: "light" },
  { name: "Azul", value: "blue" },
  { name: "Roxo", value: "purple" },
  { name: "Vermelho", value: "red" },
  { name: "Amarelo", value: "yellow" },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("chat_theme") || "dark-green");

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