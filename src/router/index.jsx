import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Chat from '../pages/Chat';
import Settings from '../pages/Settings';
import App from '../App';

// Componente para rotas que exigem autenticação
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    // Se não houver usuário, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente para rotas que não devem ser acessadas se o usuário já estiver logado
const PublicRoute = ({ children }) => {
    const { user } = useAuth();
    if (user) {
      // Se houver usuário, redireciona para a página de chat
      return <Navigate to="/" replace />;
    }
    return children;
  };

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
]); 