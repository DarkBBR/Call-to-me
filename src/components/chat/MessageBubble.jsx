import React from 'react';
import { motion } from 'framer-motion';
import { FiSmile, FiCornerUpLeft, FiEdit, FiTrash2 } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const Reaction = ({ children }) => (
    <div className="absolute -bottom-3 right-2 bg-gray-700 text-xs rounded-full px-1.5 py-0.5 shadow-md">
        {children}
    </div>
);

function StatusIcon({ status }) {
    if (status === 'read') return <BsCheck2All className="text-green-400 inline ml-1" title="Lida" />;
    if (status === 'delivered') return <BsCheck2All className="text-gray-400 inline ml-1" title="Entregue" />;
    return <FiSmile className="text-gray-400 inline ml-1" title="Enviada" />;
}

export default function MessageBubble({ msg, isOwn, onReact, onReply, onEdit, onDelete }) {
    const { user, text, createdAt, reactions, replyTo, status, image } = msg;

    const hasReactions = reactions && Object.keys(reactions).length > 0;
    const totalReactions = hasReactions ? Object.values(reactions).flat().length : 0;

    return (
        <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
            {!isOwn && (
                <div className="flex items-end mr-2">
                    {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="h-10 w-10 rounded-full object-cover border-2 border-green-400 shadow" />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white">
                            {user.displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            )}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative max-w-[90vw] sm:max-w-2xl px-6 py-4 rounded-3xl shadow-2xl text-left ${isOwn ? 'bg-green-700 text-white rounded-br-xl' : 'bg-gray-700 text-white rounded-bl-xl'} ${!isOwn ? 'ml-0' : 'mr-0'}`}
                style={{ boxShadow: 'var(--shadow, 0 4px 32px 0 #00000022)' }}
            >
                <div className={`absolute -top-3 ${isOwn ? 'right-2' : 'left-2'} flex gap-2 opacity-0 group-hover:opacity-100 transition z-10`}>
                    <button onClick={onReply} title="Responder" className="bg-gray-900/80 p-1 rounded-full hover:bg-green-600"><FiCornerUpLeft /></button>
                    {isOwn && <button onClick={onEdit} title="Editar" className="bg-gray-900/80 p-1 rounded-full hover:bg-yellow-500"><FiEdit /></button>}
                    {isOwn && <button onClick={onDelete} title="Deletar" className="bg-gray-900/80 p-1 rounded-full hover:bg-red-600"><FiTrash2 /></button>}
                </div>
                {replyTo && (
                    <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-green-400 text-xs">
                        <p className="font-bold text-green-300">{replyTo.user.displayName}</p>
                        <p className="text-gray-300 truncate">{replyTo.text}</p>
                    </div>
                )}
                <div className="text-xs font-bold mb-1 text-green-200">{isOwn ? 'Você' : user.displayName}</div>
                {image && (
                  <img src={image} alt="sticker" className="w-32 h-32 object-contain rounded-xl mx-auto mb-2 shadow-lg border-2 border-green-400 bg-white" />
                )}
                {text && <div className="whitespace-pre-wrap break-words text-base">{text}</div>}
                <div className="text-[10px] text-gray-300 text-right mt-1 flex items-center justify-end gap-1">
                    {formatDate(createdAt)}
                    {isOwn && <StatusIcon status={status} />}
                </div>
                {hasReactions && (
                    <Reaction>
                        {Object.keys(reactions)[0]} {totalReactions}
                    </Reaction>
                )}
            </motion.div>
            {isOwn && (
                <div className="flex items-end ml-2">
                    {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="h-10 w-10 rounded-full object-cover border-2 border-green-400 shadow" />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center font-bold text-white">
                            {user.displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 