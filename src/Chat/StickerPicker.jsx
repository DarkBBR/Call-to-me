import React from "react";

const stickers = [
  // Exemplos de stickers base64 (pode substituir por URLs ou importar imagens)
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f60a.png",
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f602.png",
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f609.png",
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f618.png",
];

export default function StickerPicker({ onSend }) {
  const handleSticker = async (url) => {
    // Baixar imagem e converter para base64
    const res = await fetch(url);
    const blob = await res.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      onSend(reader.result);
    };
    reader.readAsDataURL(blob);
  };

  return (
    <div className="flex gap-2">
      {stickers.map((url, i) => (
        <button
          key={i}
          type="button"
          className="p-1 bg-zinc-800 rounded hover:bg-green-700"
          onClick={() => handleSticker(url)}
        >
          <img src={url} alt="sticker" className="w-8 h-8" />
        </button>
      ))}
    </div>
  );
} 