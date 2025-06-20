import { Server } from "socket.io";
import { createServer } from "http";

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Mais permissivo para desenvolvimento local e Vercel
    methods: ["GET", "POST"]
  }
});

httpServer.on("request", (req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ConvoSphere API Online");
  }
});

// Map de usuários conectados: { userName: socket.id }
const userSockets = {};
// Armazena o objeto de usuário completo para atualizações de perfil
const connectedUsers = {};

io.on("connection", (socket) => {
  let currentUser = null;

  socket.on("register_user", (user) => {
    if (!user || !user.name) return;
    userSockets[user.name] = socket.id;
    connectedUsers[user.name] = user;
    currentUser = user.name;
    // Notifica todos (exceto o próprio usuário) sobre o novo usuário online
    socket.broadcast.emit('user_connected', user);
  });

  // Novo evento para lidar com atualização de perfil
  socket.on("profile_updated", (user) => {
    if (user && user.name) {
      connectedUsers[user.name] = user;
      // Notifica todos sobre a atualização do perfil
      io.emit('user_profile_updated', user);
    }
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Usuário ${socket.id} entrou na sala ${roomId}`);
  });

  socket.on("send_message", (data) => {
    if (data.roomId) {
      // Envia para todos na sala, EXCETO para o remetente
      socket.to(data.roomId).emit("receive_message", { ...data, status: "delivered" });
      
      // Notifica o remetente que a mensagem foi entregue (para atualizar o status)
      if (userSockets[data.user.name]) {
        io.to(userSockets[data.user.name]).emit("message_delivered", { id: data.id, roomId: data.roomId });
      }
    }
  });

  socket.on("message_read", ({ id, roomId, userName }) => {
    // Notifica o remetente que a mensagem foi lida
    if (userSockets[userName]) {
      io.to(userSockets[userName]).emit("message_read", { id, roomId });
    }
  });

  // Recebe e repassa mensagem de áudio para uma sala
  socket.on("send_audio", (data) => {
    if (data.roomId) {
      io.to(data.roomId).emit("receive_audio", data);
    }
  });

  // Recebe e repassa figurinha para uma sala
  socket.on("send_sticker", (data) => {
    if (data.roomId) {
      io.to(data.roomId).emit("receive_sticker", data);
    }
  });

  // Reação em mensagem em uma sala
  socket.on("react_message", (data) => {
    if (data.roomId) {
      io.to(data.roomId).emit("message_reaction", data);
    }
  });

  // Edição de mensagem em uma sala
  socket.on("edit_message", (data) => {
    if (data.roomId) {
      io.to(data.roomId).emit("message_edited", data);
    }
  });

  // Limpar chat (admin) - agora também precisa de roomId
  socket.on("clear_chat", ({ roomId }) => {
    if (roomId) {
      io.to(roomId).emit("chat_cleared");
    }
  });

  // Adicionar indicador de "digitando..."
  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("typing", { userName });
  });

  socket.on("stop_typing", ({ roomId }) => {
    socket.to(roomId).emit("stop_typing");
  });

  socket.on("disconnect", () => {
    if (currentUser) {
      delete userSockets[currentUser];
      delete connectedUsers[currentUser];
      // Notifica todos que o usuário ficou offline
      io.emit('user_disconnected', { name: currentUser });
    }
    console.log("Usuário desconectado:", socket.id);
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Servidor Socket.io rodando na porta ${PORT}`);
});
