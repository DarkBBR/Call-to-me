import React, { useState, useRef } from 'react';
import { FiSmile, FiPaperclip, FiMic, FiX } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import { isMobile } from 'react-device-detect';

export default function ChatInput({ onSendMessage, onSendAudio, onSendFile, onTyping, onStopTyping }) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDesc, setImageDesc] = useState("");
  const fileInputRef = useRef();
  const emojiPickerRef = useRef();
  const typingTimeout = useRef();

  const handleChange = (e) => {
    setInput(e.target.value);
    if (onTyping) onTyping();
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      if (onStopTyping) onStopTyping();
    }, 1200);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
      setShowEmoji(false);
      if (onStopTyping) onStopTyping();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
    e.target.value = null;
  };

  const handleSendImage = (e) => {
    e.preventDefault();
    if (imagePreview) {
      onSendFile([{ name: 'image', type: 'image/png', preview: imagePreview, desc: imageDesc, data: imagePreview }], imageDesc);
      setImagePreview(null);
      setImageDesc("");
    }
  };

  // Gravação de áudio real (apenas mobile)
  const handleMicTouchStart = async () => {
    if (!isMobile) return;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);
      recorder.ondataavailable = (e) => {
        setAudioChunks((prev) => [...prev, e.data]);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        if (onSendAudio) onSendAudio(audioBlob);
        setAudioChunks([]);
      };
      recorder.start();
      setRecording(true);
    }
  };
  const handleMicTouchEnd = () => {
    if (!isMobile) return;
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 border-t border-gray-700 relative">
      {/* Preview de imagem selecionada */}
      {imagePreview && (
        <div className="mb-4 flex flex-col items-center gap-2 bg-gray-900 p-4 rounded-xl border border-green-700 shadow-lg relative">
          <button onClick={() => { setImagePreview(null); setImageDesc(""); }} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><FiX /></button>
          <img src={imagePreview} alt="preview" className="w-32 h-32 object-contain rounded-xl border-2 border-green-400 bg-white" />
          <input
            type="text"
            value={imageDesc}
            onChange={e => setImageDesc(e.target.value)}
            placeholder="Adicione uma descrição..."
            className="w-full mt-2 p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button onClick={handleSendImage} className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition w-full">Enviar</button>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-4 flex-wrap md:flex-nowrap">
        <button type="button" onClick={() => setShowEmoji(v => !v)} className="text-gray-400 hover:text-green-400 text-2xl">
          <FiSmile />
        </button>
        {!input && !imagePreview && (
          <>
            <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-400 hover:text-green-400 text-2xl">
              <FiPaperclip />
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {isMobile && (
              <button
                type="button"
                className={`text-2xl ${recording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-green-400'}`}
                title={recording ? 'Gravando...' : 'Segure para gravar áudio'}
                onTouchStart={handleMicTouchStart}
                onTouchEnd={handleMicTouchEnd}
                onTouchCancel={handleMicTouchEnd}
              >
                <FiMic />
              </button>
            )}
          </>
        )}
        <input 
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Digite uma mensagem..."
          className="flex-1 bg-gray-900 rounded-full py-2 sm:py-3 px-4 sm:px-5 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[120px]"
          disabled={!!imagePreview}
        />
        {input && !imagePreview && (
          <button type="submit" className="text-green-400 hover:text-green-300 text-2xl" title="Enviar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </form>
      {showEmoji && (
        <div ref={emojiPickerRef} className="absolute bottom-20 left-4 sm:left-auto z-50">
           <EmojiPicker
              onEmojiClick={(emojiData) => setInput((prev) => prev + emojiData.emoji)}
              theme="dark"
              width="320px"
              searchDisabled
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
        </div>
      )}
    </div>
  );
} 