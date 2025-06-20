import React, { useState } from 'react';
import { FiPlusCircle, FiSearch, FiGlobe, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ConversationItem = ({ name, avatar, onClick, active }) => (
  <div 
    onClick={onClick}
    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-green-600/30' : 'hover:bg-gray-700/50'}`}
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-600 text-xl mr-4 flex-shrink-0">
      {avatar}
    </div>
    <div className="flex-1 overflow-hidden">
      <h3 className="font-bold truncate">{name}</h3>
      {/* <p className="text-sm text-gray-400 truncate">{lastMessage}</p> */}
    </div>
    {/* {unread > 0 && (
      <div className="flex items-center justify-center h-6 w-6 bg-green-500 text-white text-xs rounded-full ml-2">
        {unread}
      </div>
    )} */}
  </div>
);

export default function Sidebar({ allUsers, onSelectConversation, activeConversationId, onSelectGlobalChat }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Sidebar para mobile: menu hambúrguer
  return (
    <>
      {/* Botão hambúrguer visível só no mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 p-2 rounded-full border border-green-400 text-green-400 shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <FiMenu size={28} />
      </button>
      {/* Overlay e sidebar mobile */}
      <div className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} md:hidden`} onClick={() => setOpen(false)} />
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-800 flex flex-col border-r border-gray-700 z-50 transform transition-transform duration-300 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:w-80 lg:w-96`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-green-400 shadow" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-green-500 mr-3 flex items-center justify-center font-bold">
                {user?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="font-bold text-xl">{user?.displayName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-green-400 text-xl" title="Configurações">
              <FiSettings />
            </button>
            <button onClick={logout} className="text-gray-400 hover:text-white">Sair</button>
            {/* Botão fechar só no mobile */}
            <button className="md:hidden ml-2 text-gray-400 hover:text-red-400" onClick={() => setOpen(false)} aria-label="Fechar menu"><FiX size={24} /></button>
          </div>
        </div>
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar usuários"
              className="w-full bg-gray-900 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <h3 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase">Conversas</h3>
          <ConversationItem 
              name="Chat Global"
              avatar={<FiGlobe/>}
              onClick={() => { onSelectGlobalChat(); setOpen(false); }}
              active={activeConversationId === 'global'}
          />
          <h3 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase mt-4">Usuários</h3>
          {allUsers.map(u => (
            <ConversationItem 
              key={u.name} 
              name={u.displayName}
              avatar={u.displayName.charAt(0).toUpperCase()}
              onClick={() => { onSelectConversation(u); setOpen(false); }}
              active={activeConversationId.includes(u.name)}
            />
          ))}
        </div>
        <div className="p-4 border-t border-gray-700">
           <button className="flex items-center justify-center w-full gap-2 text-green-400 hover:text-green-300">
              <FiPlusCircle />
              <span>Adicionar Contato</span>
           </button>
        </div>
      </aside>
    </>
  );
} 