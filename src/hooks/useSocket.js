import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://call-to-me.onrender.com';

export function useSocket(events = {}) {
  const socketRef = useRef();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });
    }
    const socket = socketRef.current;
    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });
    return () => {
      // Limpar eventos ao desmontar
      Object.entries(events).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [JSON.stringify(events)]);

  // Função para registrar o usuário
  const registerUser = (user) => {
    socketRef.current?.emit('register_user', user);
  };

  return Object.assign(socketRef, { registerUser });
} 