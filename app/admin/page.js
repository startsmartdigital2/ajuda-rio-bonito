// Onde: app/admin/page.js
// CÓDIGO DE LOGIN - CORRETO E VALIDADO POR VOCÊ

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminDashboard from './AdminDashboard'; // Importa o painel

export default function AdminLoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  // Tenta autenticar pela sessão ao carregar a página
  useEffect(() => {
    if (sessionStorage.getItem('admin-authenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('administradores')
        .select('senha')
        .eq('usuario', user)
        .single();

      if (fetchError || !data) {
        setError('Usuário ou senha inválidos.');
        return;
      }

      if (data.senha === password) {
        sessionStorage.setItem('admin-authenticated', 'true'); // Salva na sessão
        setIsAuthenticated(true);
      } else {
        setError('Usuário ou senha inválidos.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-authenticated'); // Limpa a sessão
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Acesso Restrito</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Usuário"
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700">
            Entrar
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
