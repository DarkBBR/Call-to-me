import React, { useState, useRef } from "react";
import { FiCamera, FiX, FiSave } from "react-icons/fi";

export default function ProfileModal({ user, onClose, onSave }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatar, setAvatar] = useState(user.avatar || null);
  const fileInputRef = useRef();
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ displayName, avatar });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative border border-green-700 animate-fadeIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-2xl"><FiX /></button>
        <h2 className="text-xl font-bold text-green-400 mb-6 text-center">Editar Perfil</h2>
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <img
              src={avatar || `https://ui-avatars.com/api/?name=${displayName}&background=random`}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 group-hover:border-green-500 transition-all duration-300"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full text-white shadow-lg transform group-hover:scale-110 transition"
              title="Alterar foto"
            >
              <FiCamera />
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
          </div>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
            placeholder="Nome de Exibição"
            maxLength={32}
          />
          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 w-full"
          >
            <FiSave /> {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
} 