import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    displayName: "",
    password: "",
  });
  const [error, setError] = useState("");

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-green-900">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-green-400 mb-2 text-center">
          {isRegister ? "Cadastro" : "Login"}
        </h2>
        <input
          type="text"
          name="name"
          placeholder="Nome de usuário"
          value={form.name}
          onChange={handleChange}
          className="p-2 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {isRegister && (
          <input
            type="text"
            name="displayName"
            placeholder="Nome de exibição"
            value={form.displayName}
            onChange={handleChange}
            className="p-2 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        )}
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          className="p-2 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
        >
          {isRegister ? "Cadastrar" : "Entrar"}
        </button>
        <button
          type="button"
          onClick={() => setIsRegister((v) => !v)}
          className="text-green-400 hover:underline text-sm mt-2"
        >
          {isRegister ? "Já tem conta? Faça login" : "Não tem conta? Cadastre-se"}
        </button>
      </form>
    </div>
  );
} 