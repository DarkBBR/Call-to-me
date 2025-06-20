import React, { createContext, useContext, useState } from "react";
import { useSocket } from '../hooks/useSocket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("chat_user");
    return saved ? JSON.parse(saved) : null;
  });
  const socket = useSocket();

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("chat_user", JSON.stringify(userData));
    socket.registerUser?.(userData.name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("chat_user");
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("chat_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 