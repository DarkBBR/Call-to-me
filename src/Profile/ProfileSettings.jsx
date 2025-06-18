import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function ProfileSettings({ open, onClose, onThemeChange, currentTheme, clearChat }) {
  const { user, updateProfile } = useAuth();
  const { themes } = useTheme();
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [theme, setTheme] = useState(currentTheme || "dark-green");

  if (!open) return null;

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile({ displayName, avatar });
    onThemeChange(theme);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-sm shadow-lg border border-green-800">
        <h2 className="text-xl font-bold text-green-400 mb-4">Configurações do Perfil</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-2xl">
                {displayName[0]?.toUpperCase() || user.name[0].toUpperCase()}
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleAvatar} className="text-xs" />
          </div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nome de exibição"
            className="p-2 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div>
            <label className="text-green-300 text-sm">Tema:</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="ml-2 p-1 rounded bg-zinc-800 text-white"
            >
              {themes.map((t) => (
                <option key={t.value} value={t.value}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
            >
              Salvar
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-700 hover:bg-zinc-800 text-white font-bold py-2 rounded"
            >
              Cancelar
            </button>
          </div>
          {user.admin && (
            <button
              onClick={() => { if(window.confirm('Tem certeza que deseja limpar o chat?')) clearChat(); }}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded w-full transition"
            >
              LIMPAR CHAT
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 