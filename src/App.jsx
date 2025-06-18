import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { useAuth } from "./context/AuthContext";
import Login from "./Auth/Login";
import ChatWindow from "./Chat/ChatWindow";

function App() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return <ChatWindow />;
}

export default App
