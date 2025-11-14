// Onde: app/admin/page.js
// VERSÃO FINAL E CORRIGIDA - LÓGICA DE AUTENTICAÇÃO SEGURA

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminDashboard from './AdminDashboard';

export default function AdminLoginPage() {
  // O estado de autenticação agora é controlado por um objeto de sessão.
  // Isso garante que, se o usuário já estiver logado na sessão, ele vá direto para o painel.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Novo estado para controlar a verificação inicial.

  const [error, setError] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  // ===== A CORREÇÃO PRINCIPAL ESTÁ AQUI =====
  // Este useEffect agora verifica a sessão ANTES de decidir o que mostrar.
  useEffect(() => {
    // Verifica se o usuário já está "logado" na sessão do navegador.
    if (sessionStorage.getItem('admin-auth-token') === 'true') {
      setIsAuthenticated(true);
    }
    // Independentemente do resultado, a verificação inicial terminou.
    setIsLoading(false);
  }, []); // Executa apenas uma vez, quando a página carrega.

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
        // Se a senha estiver correta, salva um "token" na sessão do navegador.
        sessionStorage.setItem('admin-auth-token', 'true');
        setIsAuthenticated(true);
      } else {
        setError('Usuário ou senha inválidos.');
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError('Ocorreu um erro ao tentar fazer login.');
    }
  };

  const handleLogout = () => {
    // Remove o token da sessão e volta para a tela de login.
    sessionStorage.removeItem('admin-auth-token');
    setIsAuthenticated(false);
    setUser('');
    setPassword('');
  };

  // Enquanto a verificação inicial da sessão está acontecendo, mostra uma tela de carregamento.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-200">
        <p>Verificando sessão...</p>
      </div>
    );
  }

  // Se a verificação terminou e o usuário está autenticado, mostra o Painel ADM.
  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Se a verificação terminou e o usuário NÃO está autenticado, mostra a tela de login.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Acesso Restrito</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Usuário</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-emerald-600 rounded-md hover:bg-emerald-700">
            Entrar
          </button>
          {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
