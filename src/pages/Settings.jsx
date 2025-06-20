import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCamera } from "react-icons/fi";

export default function Settings() {
  const { user, logout, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [success, setSuccess] = useState("");
  const [notificationSound, setNotificationSound] = useState(() => localStorage.getItem('convosphere_notification_sound') === 'true');
  const [pushNotification, setPushNotification] = useState(() => localStorage.getItem('convosphere_push_notification') === 'true');
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleNameChange = (e) => {
    setDisplayName(e.target.value);
  };

  const handleSave = () => {
    // Atualiza o nome e avatar no localStorage
    const users = JSON.parse(localStorage.getItem("chat_users") || "[]");
    const idx = users.findIndex(u => u.name === user.name);
    if (idx !== -1) {
      users[idx].displayName = displayName;
      users[idx].avatar = avatar;
    } else {
      users.push({ ...user, displayName, avatar });
    }
    localStorage.setItem("chat_users", JSON.stringify(users));
    setUser({ ...user, displayName, avatar });
    setSuccess("Perfil atualizado!");
    setTimeout(() => {
      setSuccess("");
      navigate("/chat");
    }, 1000);
  };

  const handleClearHistory = () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('convosphere_conversations_'))
      .forEach(key => localStorage.removeItem(key));
    setSuccess("Histórico limpo!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSoundChange = (e) => {
    setNotificationSound(e.target.checked);
    localStorage.setItem('convosphere_notification_sound', e.target.checked);
  };

  const handlePushChange = (e) => {
    setPushNotification(e.target.checked);
    localStorage.setItem('convosphere_push_notification', e.target.checked);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-6 border border-gray-700 relative">
        {/* Botão de voltar */}
        <button onClick={() => navigate(-1)} className="absolute left-4 top-4 text-green-400 hover:text-green-300 text-2xl"><FiArrowLeft /></button>
        <h2 className="text-2xl font-bold text-green-400 mb-2 text-center">Configurações</h2>
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative group">
            <img
              src={avatar || '/public/vite.svg'}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-green-400 shadow-lg"
            />
            <button
              className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full text-white shadow-lg group-hover:scale-110 transition"
              onClick={() => fileInputRef.current.click()}
              title="Alterar foto"
            >
              <FiCamera />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Nome de exibição</label>
          <input
            type="text"
            value={displayName}
            onChange={handleNameChange}
            className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button onClick={handleSave} className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition w-full">Salvar</button>
        </div>
        <div>
          <label className="block text-sm mb-1">Tema</label>
          <select value={theme} onChange={handleThemeChange} className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white">
            <option value="dark">Preto e verde</option>
            <option value="light">Branco e roxo</option>
            <option value="purple-dark">Roxo e preto</option>
            <option value="yellow-red">Amarelo e vermelho</option>
            <option value="pink-dark">Rosa e preto</option>
            <option value="pink">Rosa total com sombras</option>
            <option value="dark-shadow">Preto com sombras e efeitos</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Preferências</label>
          <div className="flex gap-2 items-center">
            <input type="checkbox" checked={notificationSound} onChange={handleSoundChange} /> <span className="text-gray-400">Sons de notificação</span>
          </div>
          <div className="flex gap-2 items-center">
            <input type="checkbox" checked={pushNotification} onChange={handlePushChange} /> <span className="text-gray-400">Notificações push</span>
          </div>
        </div>
        <button onClick={handleClearHistory} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition w-full">Limpar histórico de mensagens</button>
        <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition w-full">Sair da conta</button>
        {success && <div className="text-green-400 text-center text-sm mt-2">{success}</div>}
      </div>
    </div>
  );
} 