import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiLock, FiArrowRight } from "react-icons/fi";

export default function Login() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    displayName: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Gradiente animado no body
    const style = document.createElement('style');
    style.innerHTML = `
      body { background: linear-gradient(120deg, #7c3aed, #a21caf, #f472b6, #7c3aed); background-size: 300% 300%; animation: gradientMove 8s ease-in-out infinite; }
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.password || (isRegister && !form.displayName)) {
      setError("Preencha todos os campos!");
      return;
    }
    const users = JSON.parse(localStorage.getItem("chat_users") || "[]");
    if (isRegister) {
      if (users.find((u) => u.name === form.name)) {
        setError("Usuário já existe!");
        return;
      }
      const newUser = { ...form, avatar: null, admin: form.name === 'admin' };
      users.push(newUser);
      localStorage.setItem("chat_users", JSON.stringify(users));
      login(newUser);
    } else {
      const user = users.find((u) => u.name === form.name && u.password === form.password);
      if (!user) {
        setError("Usuário ou senha inválidos!");
        return;
      }
      login(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradiente animado extra para efeito de "bolhas" */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-96 h-96 bg-purple-500 opacity-30 rounded-full blur-3xl animate-pulse left-[-10%] top-[-10%]" />
        <div className="absolute w-80 h-80 bg-pink-400 opacity-20 rounded-full blur-2xl animate-pulse right-[-10%] bottom-[-10%]" />
        <div className="absolute w-72 h-72 bg-fuchsia-600 opacity-20 rounded-full blur-2xl animate-pulse left-[60%] top-[60%]" />
      </div>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-zinc-900/90 p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-5 border border-purple-700 backdrop-blur-md"
      >
        <h2 className="text-3xl font-extrabold text-purple-400 mb-2 text-center tracking-tight drop-shadow-lg">
          {isRegister ? "Cadastro" : "Login"}
        </h2>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xl" />
            <input
              type="text"
              name="name"
              placeholder="Nome de usuário"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 pl-10 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow"
            />
          </div>
          {isRegister && (
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xl" />
              <input
                type="text"
                name="displayName"
                placeholder="Nome de exibição"
                value={form.displayName}
                onChange={handleChange}
                className="w-full p-3 pl-10 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow"
              />
            </div>
          )}
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xl" />
            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 pl-10 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow"
            />
          </div>
        </div>
        {error && <div className="text-red-400 text-sm text-center animate-pulse">{error}</div>}
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition text-lg flex items-center justify-center gap-2 shadow-lg"
        >
          {isRegister ? "Cadastrar" : "Entrar"}
          <FiArrowRight />
        </button>
        <button
          type="button"
          onClick={() => setIsRegister((v) => !v)}
          className="text-purple-300 hover:underline text-sm mt-2 text-center"
        >
          {isRegister ? "Já tem conta? Faça login" : "Não tem conta? Cadastre-se"}
        </button>
      </motion.form>
    </div>
  );
} 