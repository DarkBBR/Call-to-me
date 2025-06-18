import React, { useRef, useState } from "react";

export default function AudioRecorder({ onSend }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    setAudioURL(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new window.MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      const reader = new FileReader();
      reader.onloadend = () => {
        onSend(reader.result); // base64
      };
      reader.readAsDataURL(blob);
      audioChunks.current = [];
    };
    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        className={`p-2 rounded-full ${recording ? "bg-red-600" : "bg-green-600"} text-white`}
        title={recording ? "Parar gravação" : "Gravar áudio"}
      >
        {recording ? (
          <span className="animate-pulse">⏺️</span>
        ) : (
          <span>🎤</span>
        )}
      </button>
      {audioURL && (
        <audio src={audioURL} controls className="h-8" />
      )}
    </div>
  );
} 