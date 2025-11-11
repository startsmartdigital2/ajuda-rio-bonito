// Onde: app/admin/page.js
// CÓDIGO COMPLETO E CORRIGIDO DA PÁGINA DE LOGIN

'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminDashboard from './AdminDashboard';

export default function AdminLoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

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
        setError('Usuário não encontrado.');
        return;
      }

      if (data.senha === password) {
        setIsAuthenticated(true);
      } else {
        setError('Senha incorreta.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
    }
  };

  // **A CORREÇÃO ESTÁ AQUI**
  // A função de logout é definida no escopo principal do componente.
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Se o login foi bem-sucedido, mostra o Painel ADM.
  if (isAuthenticated) {
    // Agora passamos a função que já foi definida.
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Se não, mostra a tela de login.
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
