import React, { useState } from 'react';
import { FiPlusCircle, FiGlobe, FiSettings, FiMenu, FiX, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ConversationItem = ({ name, avatar, lastMessage, onClick, active }) => (
  <div
    onClick={onClick}
    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-green-600/30' : 'hover:bg-gray-700/50'}`}
  >
    <div className="relative mr-4 flex-shrink-0">
      <img
        src={avatar}
        alt="Avatar"
        className="w-12 h-12 rounded-full object-cover"
      />
      {/* Pode adicionar um indicador de online aqui se quiser */}
    </div>
    <div className="flex-1 overflow-hidden">
      <h3 className="font-bold truncate">{name}</h3>
      <p className="text-sm text-gray-400 truncate">{lastMessage}</p>
    </div>
  </div>
);

const UserItem = ({ user, onClick }) => (
    <div onClick={onClick} className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors">
        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} alt="Avatar" className="w-10 h-10 rounded-full object-cover mr-4"/>
        <span className="font-semibold">{user.displayName}</span>
    </div>
);

export default function Sidebar({ allUsers, dmConversations, onSelectConversation, activeConversationId, onSelectGlobalChat }) {
  const { user } = useAuth();
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
      <div className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'} md:hidden`} onClick={() => setOpen(false)} />
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-800 flex flex-col border-r border-gray-700 z-50 transform transition-transform duration-300 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:w-80 lg:w-96`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`} alt="avatar" className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-green-400 shadow" />
            <h2 className="font-bold text-xl">{user?.displayName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-green-400 text-xl" title="Configurações"><FiSettings /></button>
            <button className="md:hidden ml-2 text-gray-400 hover:text-red-400" onClick={() => setOpen(false)} aria-label="Fechar menu"><FiX size={24} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Seção de Conversas Ativas */}
          <h3 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><FiMessageSquare/> Conversas</h3>
          <ConversationItem 
              name="Chat Global"
              avatar={'/globe.svg'}
              lastMessage="Converse com todos os usuários"
              onClick={() => { onSelectGlobalChat(); setOpen(false); }}
              active={activeConversationId === 'global'}
          />
          {dmConversations.map(conv => (
            <ConversationItem 
              key={conv.id}
              name={conv.user.displayName}
              avatar={conv.user.avatar || `https://ui-avatars.com/api/?name=${conv.user.displayName}&background=random`}
              lastMessage={conv.lastMessage}
              onClick={() => { onSelectConversation(conv.user); setOpen(false); }}
              active={activeConversationId === conv.id}
            />
          ))}

          {/* Seção de Usuários Online */}
          <h3 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase mt-4 flex items-center gap-2"><FiUsers/> Usuários</h3>
          {allUsers.map(u => (
            <UserItem 
              key={u.name} 
              user={u}
              onClick={() => { onSelectConversation(u); setOpen(false); }}
            />
          ))}
        </div>
      </aside>
    </>
  );
} 