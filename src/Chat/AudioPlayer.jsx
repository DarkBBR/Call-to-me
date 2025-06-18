import React, { useRef, useState } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const onPlay = () => setPlaying(true);
  const onPause = () => setPlaying(false);
  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };
  const onLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const formatTime = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const percent = e.target.value;
    audioRef.current.currentTime = percent;
    setProgress(percent);
  };

  return (
    <div className="flex items-center gap-2 w-full bg-zinc-800/80 rounded-lg px-3 py-2 shadow-inner">
      <button
        onClick={togglePlay}
        className="text-green-400 hover:text-green-300 text-xl p-2 rounded-full bg-zinc-900 shadow"
        aria-label={playing ? "Pausar áudio" : "Reproduzir áudio"}
      >
        {playing ? <FaPause /> : <FaPlay />}
      </button>
      <input
        type="range"
        min={0}
        max={duration}
        value={progress}
        onChange={handleSeek}
        className="flex-1 accent-green-400 h-1 bg-zinc-700 rounded-lg"
        style={{ minWidth: 40 }}
      />
      <span className="text-xs text-green-200 w-10 text-right">
        {formatTime(progress)} / {formatTime(duration)}
      </span>
      <audio
        ref={audioRef}
        src={src}
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setPlaying(false)}
        hidden
      />
    </div>
  );
} 