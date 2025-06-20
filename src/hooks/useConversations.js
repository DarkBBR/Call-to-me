import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';

// Uma função para criar um ID de sala consistente para dois usuários
const createRoomId = (userId1, userId2) => {
  if (!userId1 || !userId2) return 'global';
  return [userId1, userId2].sort().join('--');
};

const ALL_USERS_KEY = "chat_users";
const CONVERSATIONS_KEY_PREFIX = "convosphere_conversations_";

export const useConversations = () => {
    const { user } = useAuth();
    const [allUsers, setAllUsers] = useState([]);
    const [conversations, setConversations] = useState({});
    const [activeConversation, setActiveConversation] = useState({ id: 'global', name: 'Chat Global', avatar: '🌐' });

    // Chave de localStorage específica do usuário
    const CONVERSATIONS_KEY = `${CONVERSATIONS_KEY_PREFIX}${user.name}`;

    // Lógica do Socket
    const socketRef = useSocket({
        receive_message: (msg) => {
            if (!msg.roomId) return;
            setConversations(prev => {
                const roomMessages = prev[msg.roomId] || [];
                // Se a mensagem já existe (confirmação do servidor), atualiza o status.
                if (roomMessages.some(m => m.id === msg.id)) {
                    return {
                        ...prev,
                        [msg.roomId]: roomMessages.map(m => m.id === msg.id ? { ...m, status: msg.status } : m)
                    };
                }
                // Se for uma mensagem nova de outro usuário, adiciona.
                return {
                    ...prev,
                    [msg.roomId]: [...roomMessages, msg]
                };
            });
        },
    });

    // Carregar usuários e conversas do localStorage
    useEffect(() => {
        const storedUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
        const storedConversations = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || '{}');

        setAllUsers(storedUsers.filter(u => u.name !== user.name));

        if (!storedConversations.global) {
            storedConversations.global = [];
        }
        setConversations(storedConversations);
        
        Object.keys(storedConversations).forEach(roomId => {
            socketRef.current?.emit('join_room', roomId);
        });
        // Garante que o usuário sempre entre na sala global também
        if(!storedConversations.global) {
            socketRef.current?.emit('join_room', 'global');
        }

    }, [user.name, CONVERSATIONS_KEY, socketRef]);

    // Salvar conversas no localStorage
    useEffect(() => {
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }, [conversations, CONVERSATIONS_KEY]);


    const selectConversation = (otherUser) => {
        const roomId = createRoomId(user.name, otherUser.name);
        if (!conversations[roomId]) {
            setConversations(prev => ({ ...prev, [roomId]: [] }));
            socketRef.current?.emit('join_room', roomId);
        }
        setActiveConversation({ id: roomId, name: otherUser.displayName, avatar: otherUser.displayName.charAt(0).toUpperCase() });
    };
    
    const sendMessage = (text, image = null) => {
        if (!socketRef.current || (!text.trim() && !image)) return;
        let to = null;
        if (activeConversation.id !== 'global') {
            // O destinatário é o outro usuário na sala
            to = activeConversation.id.split('--').find(n => n !== user.name);
        }
        const msg = {
            roomId: activeConversation.id,
            id: Date.now(),
            text,
            image,
            user: { name: user.name, displayName: user.displayName, avatar: user.avatar },
            createdAt: new Date().toISOString(),
            to,
            status: 'sent',
        };
        setConversations(prev => ({
            ...prev,
            [activeConversation.id]: [...(prev[activeConversation.id] || []), msg]
        }));
        socketRef.current.emit("send_message", msg);
    };
    
    const activeConversationMessages = conversations[activeConversation.id] || [];

    // Deriva a lista de conversas de DM a partir do objeto de conversas
    const dmConversations = Object.keys(conversations)
        .filter(roomId => roomId !== 'global')
        .map(roomId => {
            const otherUserName = roomId.split('--').find(name => name !== user.name);
            const otherUser = allUsers.find(u => u.name === otherUserName) || { name: otherUserName, displayName: otherUserName };
            const lastMessage = conversations[roomId].slice(-1)[0];
            return {
                id: roomId,
                user: otherUser,
                lastMessage: lastMessage?.text || lastMessage?.image ? (lastMessage.image ? '📷 Imagem' : lastMessage.text) : 'Nenhuma mensagem ainda'
            };
        });

    // Editar mensagem
    const editMessage = (msgId, newText) => {
        setConversations(prev => {
            const msgs = prev[activeConversation.id] || [];
            return {
                ...prev,
                [activeConversation.id]: msgs.map(m => m.id === msgId ? { ...m, text: newText, edited: true } : m)
            };
        });
    };

    // Responder mensagem (reply)
    const replyMessage = (replyToMsg, text) => {
        if (!socketRef.current || !text.trim()) return;
        let to = null;
        if (activeConversation.id !== 'global') {
            to = activeConversation.id.split('--').find(n => n !== user.name);
        }
        const msg = {
            roomId: activeConversation.id,
            id: Date.now(),
            text,
            replyTo: {
                id: replyToMsg.id,
                user: replyToMsg.user,
                text: replyToMsg.text,
            },
            user: { name: user.name, displayName: user.displayName, avatar: user.avatar },
            createdAt: new Date().toISOString(),
            to,
            status: 'sent',
        };
        setConversations(prev => ({
            ...prev,
            [activeConversation.id]: [...(prev[activeConversation.id] || []), msg]
        }));
        socketRef.current.emit("send_message", msg);
    };

    // Deletar mensagem
    const deleteMessage = (msgId) => {
        setConversations(prev => {
            const msgs = prev[activeConversation.id] || [];
            return {
                ...prev,
                [activeConversation.id]: msgs.filter(m => m.id !== msgId)
            };
        });
    };

    return {
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
    };
}; 