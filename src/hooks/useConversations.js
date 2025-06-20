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

    const CONVERSATIONS_KEY = user ? `${CONVERSATIONS_KEY_PREFIX}${user.name}` : null;

    // Lógica do Socket
    const socketRef = useSocket({
        receive_message: (msg) => {
            if (!msg.roomId) return;
            // Apenas adiciona a mensagem se ela não for do usuário atual
            if (msg.user.name !== user.name) {
                setConversations(prev => ({
                    ...prev,
                    [msg.roomId]: [...(prev[msg.roomId] || []), msg]
                }));
            }
        },
        message_delivered: ({ id, roomId }) => {
            // Atualiza o status da mensagem para 'delivered'
            setConversations(prev => {
                const roomMessages = prev[roomId] || [];
                return {
                    ...prev,
                    [roomId]: roomMessages.map(m => m.id === id ? { ...m, status: 'delivered' } : m)
                };
            });
        },
        user_profile_updated: (updatedUser) => {
            setAllUsers(prev => prev.map(u => u.name === updatedUser.name ? updatedUser : u));
            const allLocalUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || "[]");
            const newAllLocalUsers = allLocalUsers.map(u => u.name === updatedUser.name ? updatedUser : u);
            localStorage.setItem(ALL_USERS_KEY, JSON.stringify(newAllLocalUsers));
        },
        user_connected: (newUser) => {
             setAllUsers(prev => [...prev.filter(u => u.name !== newUser.name), newUser]);
        },
        user_disconnected: ({ name }) => {
            // No futuro, podemos mudar o status para 'offline' em vez de remover
            setAllUsers(prev => prev.filter(u => u.name !== name));
        }
    });

    // Carregar usuários e conversas do localStorage
    useEffect(() => {
        if (!user || !CONVERSATIONS_KEY) return;

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

    }, [user, CONVERSATIONS_KEY, socketRef]);

    // Salvar conversas no localStorage
    useEffect(() => {
        if (!user || !CONVERSATIONS_KEY) return;
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }, [conversations, CONVERSATIONS_KEY, user]);


    const selectConversation = (otherUser) => {
        if (!user) return;
        const roomId = createRoomId(user.name, otherUser.name);
        if (!conversations[roomId]) {
            setConversations(prev => ({ ...prev, [roomId]: [] }));
            socketRef.current?.emit('join_room', roomId);
        }
        setActiveConversation({ id: roomId, name: otherUser.displayName, avatar: otherUser.displayName.charAt(0).toUpperCase() });
    };
    
    const sendMessage = (text, image = null) => {
        if (!user || !socketRef.current || (!text.trim() && !image)) return;
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
            if (!user) return null;
            const otherUserName = roomId.split('--').find(name => name !== user.name);
            const otherUser = allUsers.find(u => u.name === otherUserName) || { name: otherUserName, displayName: otherUserName };
            const lastMessage = conversations[roomId].slice(-1)[0];
            return {
                id: roomId,
                user: otherUser,
                lastMessage: lastMessage?.text || lastMessage?.image ? (lastMessage.image ? '📷 Imagem' : lastMessage.text) : 'Nenhuma mensagem ainda'
            };
        }).filter(Boolean);

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
        if (!user || !socketRef.current || !text.trim()) return;
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