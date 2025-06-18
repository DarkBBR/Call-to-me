import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://call-to-me.onrender.com";

export function useSocket(onEvents = {}) {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });

    // Registrar eventos recebidos
    Object.entries(onEvents).forEach(([event, handler]) => {
      socketRef.current.on(event, handler);
    });

    return () => {
      // Limpar eventos ao desmontar
      Object.entries(onEvents).forEach(([event, handler]) => {
        socketRef.current.off(event, handler);
      });
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  return socketRef;
} 