import React from "react";
import { FaCog } from "react-icons/fa";

export default function ProfileHeader({ user, onSettings }) {
  return (
    <div className="p-2 sm:p-4 border-b border-green-800 flex items-center justify-between bg-zinc-950 shadow-md rounded-t-lg">
      <div className="flex items-center gap-2 sm:gap-3">
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow" />
        ) : (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow">
            {user.displayName?.[0]?.toUpperCase() || user.name[0].toUpperCase()}
          </div>
        )}
        <span className="text-green-400 font-semibold text-base sm:text-lg truncate max-w-[120px] sm:max-w-xs">
          {user.displayName || user.name}
        </span>
      </div>
      <button className="text-green-400 hover:text-green-300 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400" onClick={onSettings} title="Configurações">
        <FaCog size={22} />
      </button>
    </div>
  );
} 