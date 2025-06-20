import React, { useState } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AddContactModal = ({ users, onClose, onSelectUser }) => {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-gray-800 w-full max-w-md m-4 rounded-2xl shadow-2xl border border-gray-700 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-green-400">Iniciar Nova Conversa</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-400 transition"
            >
              <FiX size={24} />
            </button>
          </header>

          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar usuários..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-900 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.name}
                  onClick={() => onSelectUser(user)}
                  className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover mr-4"
                  />
                  <span className="font-semibold">{user.displayName}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                Nenhum usuário encontrado.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddContactModal; 