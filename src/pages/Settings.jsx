import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCamera, FiUser, FiSliders, FiBell, FiLogOut, FiTrash2, FiSave } from "react-icons/fi";
import { motion } from "framer-motion";
import { useSocket } from "../hooks/useSocket";

const randomAvatars = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=6",
  "https://i.pravatar.cc/150?img=7",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=9",
  "https://i.pravatar.cc/150?img=10"
];

export default function Settings() {
  const { user, logout, setUser } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [success, setSuccess] = useState("");
  const [notificationSound, setNotificationSound] = useState(() => localStorage.getItem('convosphere_notification_sound') === 'true');
  const [pushNotification, setPushNotification] = useState(() => localStorage.getItem('convosphere_push_notification') === 'true');
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const socketRef = useSocket();

  const handleSave = () => {
    const users = JSON.parse(localStorage.getItem("chat_users") || "[]");
    const idx = users.findIndex(u => u.name === user.name);
    const updatedUser = { ...user, displayName, avatar };
    
    if (idx !== -1) {
      users[idx] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem("chat_users", JSON.stringify(users));
    setUser(updatedUser);
    
    socketRef.current?.emit('profile_updated', updatedUser);

    setSuccess("Perfil atualizado com sucesso!");
    setTimeout(() => {
      setSuccess("");
      navigate(-1);
    }, 1200);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleClearHistory = () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('convosphere_conversations_'))
      .forEach(key => localStorage.removeItem(key));
    setSuccess("Histórico de mensagens limpo!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleSoundChange = (e) => {
    setNotificationSound(e.target.checked);
    localStorage.setItem('convosphere_notification_sound', e.target.checked);
  };

  const handlePushChange = (e) => {
    setPushNotification(e.target.checked);
    localStorage.setItem('convosphere_push_notification', e.target.checked);
  };

  const handleRandomProfile = () => {
    setAvatar(randomAvatars[Math.floor(Math.random() * randomAvatars.length)]);
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button onClick={() => navigate(-1)} className="text-green-400 hover:text-green-300">
            <FiArrowLeft size={24} className="sm:hidden" />
            <FiArrowLeft size={28} className="hidden sm:inline" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold">Configurações</h1>
        </header>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* --- Seção de Perfil --- */}
          <section className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-green-400"><FiUser /> Perfil</h2>
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <img
                  src={avatar || `https://ui-avatars.com/api/?name=${displayName}&background=random`}
                  alt="Avatar"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-700 group-hover:border-green-500 transition-all duration-300"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full text-white shadow-lg transform group-hover:scale-110 transition"
                  title="Alterar foto"
                >
                  <FiCamera />
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
                <button
                  onClick={handleRandomProfile}
                  className="mt-2 sm:mt-3 w-full bg-gray-700 hover:bg-green-700 text-white text-xs px-2 sm:px-3 py-1 rounded transition md:absolute md:top-0 md:left-full md:ml-4 md:mt-0"
                  type="button"
                >
                  Gerar avatar aleatório
                </button>
              </div>
              {/* Nome */}
              <div className="w-full mt-3 sm:mt-4 md:mt-0">
                <label htmlFor="displayName" className="block text-sm font-medium mb-1">Nome de Exibição</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </section>

          {/* --- Seção de Preferências --- */}
          <section className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 mt-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-green-400"><FiSliders /> Aparência e Notificações</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tema */}
              <div>
                <label htmlFor="theme" className="block text-sm font-medium mb-1">Tema</label>
                <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white">
                  {themes.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.name}
                      {t.value.includes('gradient') ? ' 🌈' : ''}
                      {t.value === 'animated-bg' ? ' ✨' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {/* Notificações */}
              <div className="flex flex-col gap-4">
                 <label className="block text-sm font-medium -mb-3">Notificações</label>
                 <label className="flex items-center gap-3 cursor-pointer">
                   <input type="checkbox" checked={notificationSound} onChange={handleSoundChange} className="sr-only peer" />
                   <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                   <span>Sons de notificação</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer">
                   <input type="checkbox" checked={pushNotification} onChange={handlePushChange} className="sr-only peer" />
                   <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                   <span>Notificações push</span>
                 </label>
              </div>
            </div>
          </section>
          
          {/* --- Ações --- */}
          <section className="mt-8 flex flex-col md:flex-row gap-4">
              <button onClick={handleClearHistory} className="flex-1 flex items-center justify-center gap-2 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/40 font-bold py-3 px-4 rounded-lg transition">
                <FiTrash2 /> Limpar Histórico
              </button>
              <button onClick={() => { logout(); navigate('/login'); }} className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 text-red-300 hover:bg-red-600/40 font-bold py-3 px-4 rounded-lg transition">
                <FiLogOut /> Sair da Conta
              </button>
          </section>

          {/* Botão Salvar Fixo */}
          <div className="mt-8 text-center sticky bottom-0 bg-gray-900/80 py-4 z-30 w-full rounded-b-2xl shadow-lg">
            <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 mx-auto w-full max-w-xs"
            >
                <FiSave /> Salvar Alterações
            </button>
            {success && <div className="text-green-400 text-center text-sm mt-4 animate-pulse">{success}</div>}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 