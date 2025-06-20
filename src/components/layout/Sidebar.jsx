import React, { useState, useEffect } from 'react';
import { FiPlusCircle, FiGlobe, FiSettings, FiMenu, FiX, FiUsers, FiMessageSquare, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';

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

function MenuBar({ onChat, onContacts, onProfile, onSettings, onLogout, active }) {
  return (
    <nav className="fixed left-0 top-0 h-full w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 z-50 gap-4 md:gap-6">
      <button onClick={onChat} className={`flex flex-col items-center text-xl ${active==='chat' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'}`} title="Chat">
        <FiMessageSquare />
        <span className="text-[10px] mt-1">Chat</span>
      </button>
      <button onClick={onContacts} className={`flex flex-col items-center text-xl ${active==='contacts' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'}`} title="Contatos">
        <FiUsers />
        <span className="text-[10px] mt-1">Contatos</span>
      </button>
      <button onClick={onProfile} className="flex flex-col items-center text-xl text-gray-400 hover:text-green-400" title="Perfil">
        <FiUser />
        <span className="text-[10px] mt-1">Perfil</span>
      </button>
      <button onClick={onSettings} className="flex flex-col items-center text-xl text-gray-400 hover:text-green-400" title="Configurações">
        <FiSettings />
        <span className="text-[10px] mt-1">Config</span>
      </button>
      <button onClick={onLogout} className="flex flex-col items-center text-xl text-gray-400 hover:text-red-400" title="Sair">
        <FiLogOut />
        <span className="text-[10px] mt-1">Sair</span>
      </button>
    </nav>
  );
}

export default function Sidebar({ allUsers, dmConversations, onSelectConversation, activeConversationId, onSelectGlobalChat }) {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  // Fecha sidebar ao clicar fora (mobile)
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 768) {
      const handle = (e) => {
        if (!e.target.closest('.sidebar-slide')) setSidebarOpen(false);
      };
      document.addEventListener('mousedown', handle);
      return () => document.removeEventListener('mousedown', handle);
    }
  }, [sidebarOpen]);

  // MenuBar sempre fixo à esquerda, Sidebar desliza à direita dele
  return (
    <>
      <MenuBar
        onChat={() => { setActiveTab('chat'); setSidebarOpen(false); }}
        onContacts={() => { setActiveTab('contacts'); setSidebarOpen(true); }}
        onProfile={() => setShowProfile(true)}
        onSettings={() => navigate('/settings')}
        onLogout={() => { logout(); navigate('/login'); }}
        active={activeTab}
      />
      {/* Sidebar desliza à direita do MenuBar (desktop) ou cobre a tela (mobile) */}
      <aside className={`sidebar-slide fixed top-0 left-16 h-full w-11/12 max-w-xs sm:w-72 bg-gray-800 flex flex-col border-r border-gray-700 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-[-110%]'} md:static md:left-16 md:w-80 lg:w-96 md:translate-x-0`} style={{maxHeight: '100dvh'}}>
        <div className="p-3 sm:p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`} alt="avatar" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover mr-2 sm:mr-3 border-2 border-green-400 shadow" />
            <h2 className="font-bold text-lg sm:text-xl truncate max-w-[120px] sm:max-w-xs">{user?.displayName}</h2>
          </div>
          <button className="md:hidden ml-1 text-gray-400 hover:text-red-400" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu"><FiX size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-1 sm:p-2 space-y-1 custom-scrollbar" style={{maxHeight: 'calc(100dvh - 64px)'}}>
          {/* Seção de Conversas Ativas */}
          {activeTab === 'chat' && <>
            <h3 className="px-2 sm:px-3 py-2 text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><FiMessageSquare/> Conversas</h3>
            <ConversationItem 
                name="Chat Global"
                avatar={'/globe.svg'}
                lastMessage="Converse com todos os usuários"
                onClick={() => { onSelectGlobalChat(); setSidebarOpen(false); }}
                active={activeConversationId === 'global'}
            />
            {(dmConversations || []).map(conv => (
              <ConversationItem 
                key={conv.id}
                name={conv.user.displayName}
                avatar={conv.user.avatar || `https://ui-avatars.com/api/?name=${conv.user.displayName}&background=random`}
                lastMessage={conv.lastMessage}
                onClick={() => { onSelectConversation(conv.user); setSidebarOpen(false); }}
                active={activeConversationId === conv.id}
              />
            ))}
          </>}
          {/* Seção de Usuários Online */}
          {activeTab === 'contacts' && <>
            <h3 className="px-2 sm:px-3 py-2 text-xs font-bold text-gray-400 uppercase mt-3 sm:mt-4 flex items-center gap-2"><FiUsers/> Usuários</h3>
            {(allUsers || []).map(u => (
              <UserItem 
                key={u.name} 
                user={u}
                onClick={() => { onSelectConversation(u); setSidebarOpen(false); }}
              />
            ))}
          </>}
        </div>
      </aside>
      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onSave={({ displayName, avatar }) => {
            // Atualiza localStorage e contexto
            const users = JSON.parse(localStorage.getItem('chat_users') || '[]');
            const idx = users.findIndex(u => u.name === user.name);
            const updatedUser = { ...user, displayName, avatar };
            if (idx !== -1) users[idx] = updatedUser;
            else users.push(updatedUser);
            localStorage.setItem('chat_users', JSON.stringify(users));
            setUser(updatedUser);
          }}
        />
      )}
    </>
  );
} 