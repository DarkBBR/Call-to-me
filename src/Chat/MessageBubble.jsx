import React, { useState } from "react";
import { FaRegEdit, FaReply } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import { motion } from "framer-motion";
import AudioPlayer from "./AudioPlayer";

const reactionsList = ["👍", "😂", "😍", "😮", "😢", "😡"];

export default function MessageBubble({ msg, isOwn, onReact, onEdit, onReply }) {
  const [showReactions, setShowReactions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleEdit = () => {
    if (editing && editText !== msg.text) {
      onEdit(editText);
    }
    setEditing((v) => !v);
  };

  return (
    <div className={`flex w-full py-1 sm:py-2 ${isOwn ? "justify-end" : "justify-start"} items-end gap-1 sm:gap-4`}>
      {/* Avatar fora do balão */}
      {!isOwn && (
        <div className="flex-shrink-0">
          {msg.user.avatar ? (
            <img src={msg.user.avatar} alt="avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md border-2 border-zinc-800" />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md border-2 border-zinc-800">
              {msg.user.displayName?.[0]?.toUpperCase() || msg.user.name[0].toUpperCase()}
            </div>
          )}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, type: "spring", bounce: 0.25 }}
        className={
          `relative max-w-[95%] sm:max-w-[80%] md:max-w-[60%] p-2 sm:p-4 rounded-[2.5rem] shadow-xl flex flex-col group border transition-all duration-200 ` +
          (isOwn
            ? "bg-gradient-to-br from-green-400/80 to-green-700/90 text-white rounded-br-3xl border-green-400 hover:shadow-green-400/40"
            : "bg-gradient-to-br from-zinc-700/80 to-zinc-900/90 text-green-100 rounded-bl-3xl border-zinc-600 hover:shadow-green-200/20"
          ) +
          " hover:scale-[1.01] min-w-[80px]"
        }
        style={{ wordBreak: "break-word" }}
      >
        <div className="text-xs sm:text-sm font-bold flex items-center gap-1 mb-1">
          {msg.user.displayName || msg.user.name}
          {isOwn && (
            <button
              className="ml-1 text-xs text-green-200 hover:text-green-100"
              onClick={handleEdit}
              title="Editar mensagem"
            >
              <FaRegEdit />
            </button>
          )}
          <button
            className="ml-1 text-green-200 hover:text-green-100"
            onClick={() => onReply && onReply(msg)}
            title="Responder mensagem"
          >
            <FaReply />
          </button>
          {msg.edited && (
            <span className="ml-2 text-[10px] text-yellow-200 italic">(editada)</span>
          )}
        </div>
        {/* Resposta (reply) */}
        {msg.replyTo && (
          <div className="mb-2 px-3 py-1 bg-zinc-800/80 border-l-4 border-green-400 rounded-md text-xs text-green-200">
            <span className="font-bold">{msg.replyTo.user.displayName || msg.replyTo.user.name}:</span> {msg.replyTo.text}
          </div>
        )}
        {editing ? (
          <input
            className="bg-zinc-700 text-white rounded p-1 mt-1 w-full border-2 border-green-400 focus:ring-2 focus:ring-green-400 outline-none transition-all duration-200"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEdit();
            }}
            autoFocus
            aria-label="Editar mensagem"
          />
        ) : msg.audio ? (
          <AudioPlayer src={msg.audio} />
        ) : msg.sticker ? (
          <img src={msg.sticker} alt="sticker" className="w-24 h-24 sm:w-32 sm:h-32 max-w-full max-h-40 sm:max-h-60 object-contain mt-1 rounded-xl shadow-md border border-zinc-700" loading="lazy" />
        ) : (
          <div className="break-words whitespace-pre-line text-base sm:text-lg">{msg.text}</div>
        )}
        <div
          className="text-[10px] text-green-200 mt-2 text-right cursor-pointer select-none relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          {showTooltip && (
            <div className="absolute right-0 bottom-7 bg-zinc-800 text-xs text-white px-3 py-1 rounded-2xl shadow-lg z-20 border border-green-700 animate-fade-in">
              {new Date(msg.createdAt).toLocaleString("pt-BR")}
            </div>
          )}
        </div>
      </motion.div>
      {/* Avatar à direita para mensagens enviadas */}
      {isOwn && (
        <div className="flex-shrink-0">
          {msg.user.avatar ? (
            <img src={msg.user.avatar} alt="avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md border-2 border-zinc-800" />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md border-2 border-zinc-800">
              {msg.user.displayName?.[0]?.toUpperCase() || msg.user.name[0].toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 