import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import MessageBubble from "../components/chat/MessageBubble";
import Sidebar from "../components/layout/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import ChatInput from "../components/chat/ChatInput";
import AddContactModal from "../components/layout/AddContactModal";
import { useConversations } from "../hooks/useConversations";
import { useSocket } from "../hooks/useSocket";

export default function Chat() {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [typingUser, setTypingUser] = useState(null);
  const [readIds, setReadIds] = useState([]);
  const [search, setSearch] = useState("");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [replyToMsg, setReplyToMsg] = useState(null);
  const [isAddContactModalOpen, setAddContactModalOpen] = useState(false);

  const {
    allUsers,
    activeConversation,
    activeConversationMessages,
    dmConversations,
    selectConversation,
    sendMessage,
    setActiveConversation,
    editMessage,
    replyMessage,
    deleteMessage
  } = useConversations();

  const socketRef = useSocket({
    typing: ({ userName }) => {
      if (userName !== user.name) setTypingUser(userName);
    },
    stop_typing: () => setTypingUser(null),
    message_read: ({ id, roomId }) => {
      setReadIds(ids => [...ids, id]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversationMessages]);

  // Emitir eventos de typing
  const handleTyping = () => {
    socketRef.current?.emit('typing', { roomId: activeConversation.id, userName: user.displayName });
  };
  const handleStopTyping = () => {
    socketRef.current?.emit('stop_typing', { roomId: activeConversation.id });
  };

  // Emitir 'message_read' para todas as mensagens recebidas que não são do usuário
  useEffect(() => {
    activeConversationMessages.forEach(msg => {
      if (msg.user.name !== user.name && msg.status !== 'read') {
        socketRef.current?.emit('message_read', { id: msg.id, roomId: activeConversation.id, userName: msg.user.name });
      }
    });
  }, [activeConversation.id, activeConversationMessages, user.name, socketRef]);

  // Filtro de mensagens
  const filteredMessages = search.trim()
    ? activeConversationMessages.filter(msg =>
        msg.text?.toLowerCase().includes(search.toLowerCase()) ||
        msg.user.displayName?.toLowerCase().includes(search.toLowerCase())
      )
    : activeConversationMessages;

  // Placeholder functions
  const handleSendFile = (files, desc = "") => {
    if (!files || !files.length) return;
    const file = files[0];
    const image = file.data || file.preview;
    sendMessage(desc, image);
  };
  const handleSendAudio = () => alert("Envio de áudio disponível apenas em dispositivos mobile!");

  // Funções de ação
  const handleEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
  };
  const handleEditSubmit = () => {
    if (editingMsgId && editingText.trim()) {
      editMessage(editingMsgId, editingText);
      setEditingMsgId(null);
      setEditingText("");
    }
  };
  const handleReply = (msg) => {
    setReplyToMsg(msg);
  };
  const handleReplySend = (text) => {
    if (replyToMsg && text.trim()) {
      replyMessage(replyToMsg, text);
      setReplyToMsg(null);
    }
  };
  const handleDelete = (msg) => {
    if (window.confirm("Tem certeza que deseja deletar esta mensagem?")) {
      deleteMessage(msg.id);
    }
  };

  const handleSelectUserFromModal = (selectedUser) => {
    selectConversation(selectedUser);
    setAddContactModalOpen(false);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white">
      <Sidebar
        dmConversations={dmConversations}
        onSelectConversation={selectConversation}
        activeConversationId={activeConversation.id}
        onSelectGlobalChat={() => setActiveConversation({ id: 'global', name: 'Chat Global', avatar: '🌐' })}
        onAddContact={() => setAddContactModalOpen(true)}
      />
      <div className="flex flex-col flex-1">
        <ChatHeader 
           conversationName={activeConversation.name}
           avatar={activeConversation.avatar}
           onSearch={setSearch}
        />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(filteredMessages || []).map((msg) => (
            editingMsgId === msg.id ? (
              <div key={msg.id} className="flex w-full mb-3">
                <input
                  className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 text-white mr-2"
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleEditSubmit(); }}
                  autoFocus
                />
                <button onClick={handleEditSubmit} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Salvar</button>
                <button onClick={() => setEditingMsgId(null)} className="ml-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded">Cancelar</button>
              </div>
            ) : (
              <MessageBubble
                key={msg.id}
                msg={{ ...msg, status: readIds.includes(msg.id) ? 'read' : msg.status }}
                isOwn={msg.user.name === user.name}
                onEdit={() => handleEdit(msg)}
                onReply={() => handleReply(msg)}
                onDelete={() => handleDelete(msg)}
              />
            )
          ))}
          {typingUser && (
            <div className="text-green-400 text-xs font-semibold px-2 py-1 animate-pulse">{typingUser} está digitando...</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput 
          onSendMessage={replyToMsg ? (text) => handleReplySend(text) : sendMessage}
          onSendFile={handleSendFile}
          onSendAudio={handleSendAudio}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
        {replyToMsg && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 border border-green-400 rounded-xl px-4 py-2 flex items-center gap-2 z-50">
            <span className="text-green-300 font-bold">Respondendo:</span>
            <span className="truncate max-w-xs">{replyToMsg.text}</span>
            <button onClick={() => setReplyToMsg(null)} className="ml-2 text-red-400 hover:text-red-600">Cancelar</button>
          </div>
        )}
      </div>

      {isAddContactModalOpen && (
        <AddContactModal
          users={allUsers}
          onClose={() => setAddContactModalOpen(false)}
          onSelectUser={handleSelectUserFromModal}
        />
      )}
    </div>
  );
}

// Adicionar fundo gradiente ao body via JS para garantir compatibilidade
if (typeof window !== "undefined") {
  document.body.style.background =
    "linear-gradient(135deg, #101c1c 0%, #1a2a2a 100%)";
} 