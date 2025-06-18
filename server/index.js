import { Server } from "socket.io";
import { createServer } from "http";

const PORT = "0.0.0.0";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
httpServer.on("request", (req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("API online");
  }
});

// Sala global
const ROOM = "global";

io.on("connection", (socket) => {
  console.log("Novo usuário conectado:", socket.id);
  socket.join(ROOM);

  // Recebe e repassa mensagem de texto
  socket.on("send_message", (data) => {
    io.to(ROOM).emit("receive_message", data);
  });

  // Recebe e repassa mensagem de áudio
  socket.on("send_audio", (data) => {
    io.to(ROOM).emit("receive_audio", data);
  });

  // Recebe e repassa figurinha
  socket.on("send_sticker", (data) => {
    io.to(ROOM).emit("receive_sticker", data);
  });

  // Reação em mensagem
  socket.on("react_message", (data) => {
    io.to(ROOM).emit("message_reaction", data);
  });

  // Edição de mensagem
  socket.on("edit_message", (data) => {
    io.to(ROOM).emit("message_edited", data);
  });

  // Limpar chat (admin)
  socket.on("clear_chat", () => {
    io.to(ROOM).emit("chat_cleared");
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor Socket.io rodando na porta ${PORT}`);
});
