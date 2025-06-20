import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

export default function ChatHeader({ conversationName, avatar, onSearch }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 relative">
      <div className="flex items-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-600 text-xl mr-4">
          {avatar || '🌐'}
        </div>
        <div>
          <h2 className="font-bold text-lg">{conversationName || 'Chat Global'}</h2>
          <p className="text-sm text-green-400">online</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-gray-400 text-xl">
        <button className="hover:text-white" onClick={() => setSearchOpen(v => !v)}><FiSearch /></button>
      </div>
      {searchOpen && (
        <div className="absolute right-4 top-16 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-2 z-50 w-64">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar mensagens..."
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
        </div>
      )}
    </div>
  );
} 