import React, { useState } from 'react';
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

function MenuBar({ onProfile, onSettings, onLogout }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-14 bg-gray-900 border-t border-gray-800 flex justify-around items-center z-40 md:static md:w-20 md:h-full md:flex-col md:justify-start md:gap-6 md:border-t-0 md:border-r">
      <button className="flex flex-col items-center text-gray-400 hover:text-green-400 text-xl" title="Chat">
        <FiMessageSquare />
        <span className="text-xs md:hidden">Chat</span>
      </button>
      <button className="flex flex-col items-center text-gray-400 hover:text-green-400 text-xl" title="Contatos">
        <FiUsers />
        <span className="text-xs md:hidden">Contatos</span>
      </button>
      <button onClick={onProfile} className="flex flex-col items-center text-gray-400 hover:text-green-400 text-xl" title="Perfil">
        <FiUser />
        <span className="text-xs md:hidden">Perfil</span>
      </button>
      <button onClick={onSettings} className="flex flex-col items-center text-gray-400 hover:text-green-400 text-xl" title="Configurações">
        <FiSettings />
        <span className="text-xs md:hidden">Config</span>
      </button>
      <button onClick={onLogout} className="flex flex-col items-center text-gray-400 hover:text-red-400 text-xl" title="Sair">
        <FiLogOut />
        <span className="text-xs md:hidden">Sair</span>
      </button>
    </nav>
  );
}

export default function Sidebar({ allUsers, dmConversations, onSelectConversation, activeConversationId, onSelectGlobalChat }) {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(window.innerWidth >= 768); // Aberta por padrão no desktop
  const [showProfile, setShowProfile] = useState(false);

  // Fechar sidebar ao clicar fora no mobile
  React.useEffect(() => {
    if (open && window.innerWidth < 768) {
      const handle = (e) => {
        if (!e.target.closest('.sidebar-fixed')) setOpen(false);
      };
      document.addEventListener('mousedown', handle);
      return () => document.removeEventListener('mousedown', handle);
    }
  }, [open]);

  // Atualizar estado ao redimensionar
  React.useEffect(() => {
    const handleResize = () => setOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Botão menu sempre visível, mas fora da sidebar */}
      <button
        className="fixed top-4 left-4 z-50 bg-gray-900 p-2 rounded-full border border-green-400 text-green-400 shadow-lg md:top-6 md:left-6"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        style={{ pointerEvents: open && window.innerWidth < 768 ? 'none' : 'auto' }}
      >
        {open ? <FiX size={28} /> : <FiMenu size={28} />}
      </button>
      {/* Overlay escuro no mobile quando sidebar aberta */}
      {open && window.innerWidth < 768 && (
        <div className="fixed inset-0 z-40 bg-black/60 transition-opacity" />
      )}
      {/* Sidebar fixa no desktop, sobreposta no mobile */}
      <aside className={`sidebar-fixed fixed top-0 left-0 h-full w-11/12 max-w-xs sm:w-72 bg-gray-800 flex flex-col border-r border-gray-700 z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-[-110%]'} md:static md:translate-x-0 md:w-80 lg:w-96`} style={{maxHeight: '100dvh'}}>
        <div className="md:sticky md:top-0 md:z-10">
          <MenuBar
            onProfile={() => setShowProfile(true)}
            onSettings={() => navigate('/settings')}
            onLogout={() => { logout(); navigate('/login'); }}
          />
        </div>
        <div className="p-3 sm:p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`} alt="avatar" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover mr-2 sm:mr-3 border-2 border-green-400 shadow" />
            <h2 className="font-bold text-lg sm:text-xl truncate max-w-[120px] sm:max-w-xs">{user?.displayName}</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-1 sm:p-2 space-y-1 custom-scrollbar" style={{maxHeight: 'calc(100dvh - 120px)'}}>
          {/* Seção de Conversas Ativas */}
          <h3 className="px-2 sm:px-3 py-2 text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><FiMessageSquare/> Conversas</h3>
          <ConversationItem 
              name="Chat Global"
              avatar={'/globe.svg'}
              lastMessage="Converse com todos os usuários"
              onClick={() => { onSelectGlobalChat(); setOpen(false); }}
              active={activeConversationId === 'global'}
          />
          {(dmConversations || []).map(conv => (
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
          <h3 className="px-2 sm:px-3 py-2 text-xs font-bold text-gray-400 uppercase mt-3 sm:mt-4 flex items-center gap-2"><FiUsers/> Usuários</h3>
          {(allUsers || []).map(u => (
            <UserItem 
              key={u.name} 
              user={u}
              onClick={() => { onSelectConversation(u); setOpen(false); }}
            />
          ))}
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