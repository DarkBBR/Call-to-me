import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import AudioRecorder from "./AudioRecorder";
import StickerPicker from "./StickerPicker";
import MessageBubble from "./MessageBubble";
import ProfileHeader from "../Profile/ProfileHeader";
import ProfileSettings from "../Profile/ProfileSettings";
import { useTheme } from "../context/ThemeContext";
import EmojiPicker from "emoji-picker-react";
import { FaImage } from "react-icons/fa";

const notificationSound = new Audio("https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa1c82.mp3");
const MESSAGES_KEY = "chat_messages";

export default function ChatWindow() {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(MESSAGES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiPickerRef = useRef();
  const fileInputRef = useRef();

  // Recebe mensagens do socket
  const socketRef = useSocket({
    receive_message: (msg) => {
      setMessages((msgs) => [...msgs, msg]);
      if (msg.user.name !== user.name) notificationSound.play();
    },
    receive_audio: (msg) => {
      setMessages((msgs) => [...msgs, msg]);
      if (msg.user.name !== user.name) notificationSound.play();
    },
    receive_sticker: (msg) => {
      setMessages((msgs) => [...msgs, msg]);
      if (msg.user.name !== user.name) notificationSound.play();
    },
    message_reaction: ({ id, emoji, userName }) => {
      setMessages((msgs) =>
        msgs.map((m) =>
          m.id === id
            ? {
                ...m,
                reactions: {
                  ...m.reactions,
                  [emoji]: m.reactions && m.reactions[emoji]
                    ? m.reactions[emoji].includes(userName)
                      ? m.reactions[emoji]
                      : [...m.reactions[emoji], userName]
                    : [userName],
                },
              }
            : m
        )
      );
    },
    message_edited: ({ id, newText }) => {
      setMessages((msgs) =>
        msgs.map((m) => (m.id === id ? { ...m, text: newText } : m))
      );
    },
  });

  // Salvar mensagens no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fechar emoji picker ao clicar fora
  useEffect(() => {
    if (!showEmoji) return;
    function handleClick(e) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmoji]);

  const sendMessage = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const msg = {
      id: Date.now(),
      text: input,
      user: {
        name: user.name,
        displayName: user.displayName,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
    };
    socketRef.current.emit("send_message", msg);
    setInput("");
  };

  const sendAudio = (audioBase64) => {
    const msg = {
      id: Date.now(),
      audio: audioBase64,
      user: {
        name: user.name,
        displayName: user.displayName,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
    };
    socketRef.current.emit("send_audio", msg);
  };

  const sendSticker = (stickerBase64) => {
    const msg = {
      id: Date.now(),
      sticker: stickerBase64,
      user: {
        name: user.name,
        displayName: user.displayName,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
    };
    socketRef.current.emit("send_sticker", msg);
  };

  const reactMessage = (id, emoji) => {
    socketRef.current.emit("react_message", { id, emoji, userName: user.name });
  };

  const editMessage = (id, newText) => {
    socketRef.current.emit("edit_message", { id, newText });
  };

  const sendImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      sendSticker(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Limpar chat (admin)
  const clearChat = () => {
    setMessages([]);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    // Notificar outros usuários via socket
    socketRef.current.emit("clear_chat");
  };

  // Receber comando de limpar chat
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on("chat_cleared", () => {
      setMessages([]);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    });
    return () => {
      socketRef.current.off("chat_cleared");
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-zinc-900 flex items-center justify-center overflow-hidden">
      
      <div className="flex flex-col w-full h-full max-w-3xl mx-auto bg-zinc-900 border border-green-800 shadow-xl rounded-none sm:rounded-[2.5rem] overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="sticky top-0 z-20">
          <ProfileHeader user={user} onSettings={() => setSettingsOpen(true)} />
        </div>
        {/* Mensagens */}
        <div className="flex-1 min-h-0 overflow-y-auto p-1 sm:p-4 space-y-1 sm:space-y-2 bg-zinc-900 custom-scrollbar">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.user.name === user.name}
              onReact={(emoji) => reactMessage(msg.id, emoji)}
              onEdit={(newText) => editMessage(msg.id, newText)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="sticky bottom-0 z-20 w-full bg-zinc-950 border-t border-green-800">
          <form onSubmit={sendMessage} className="flex gap-2 items-center w-full p-2 sm:p-4">
            <button
              type="button"
              className="text-2xl px-2 text-green-400 hover:text-green-300 focus:outline-none"
              onClick={() => setShowEmoji((v) => !v)}
              tabIndex={-1}
              aria-label="Abrir emojis"
            >
              😊
            </button>
            {showEmoji && (
              <div ref={emojiPickerRef} className="fixed left-1/2 bottom-24 sm:bottom-32 -translate-x-1/2 z-50 w-[95vw] max-w-xs sm:max-w-sm md:max-w-md">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setInput((prev) => prev + emojiData.emoji);
                    setShowEmoji(false);
                  }}
                  theme={theme === "light" ? "light" : "dark"}
                  width="100%"
                  searchDisabled
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-2 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500 border-2 border-transparent focus:border-green-400 transition-all duration-200 text-sm sm:text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) sendMessage(e);
              }}
            />
            <button
              type="button"
              className="text-xl p-2 text-green-400 hover:text-green-300 focus:outline-none"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              aria-label="Enviar imagem"
            >
              <FaImage />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={sendImage}
              className="hidden"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 sm:px-4 py-2 rounded shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Enviar mensagem"
            >
              Enviar
            </button>
          </form>
        </div>
        <ProfileSettings
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onThemeChange={setTheme}
          currentTheme={theme}
          clearChat={clearChat}
        />
      </div>
    </div>
  );
}

// Adicionar fundo gradiente ao body via JS para garantir compatibilidade
if (typeof window !== "undefined") {
  document.body.style.background =
    "linear-gradient(135deg, #101c1c 0%, #1a2a2a 100%)";
} 