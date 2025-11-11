// Onde: app/admin/AdminDashboard.js
// CÓDIGO COMPLETO COM O LAYOUT CORRIGIDO (ESTILO ACORDEÃO)

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

// --- Componente de Detalhes da Vítima ---
// Este componente agora é mais simples, pois só renderiza se tiver uma vítima.
function VictimDetails({ victim }) {
  // Se não houver vítima selecionada, não renderiza nada.
  if (!victim) {
    return null;
  }

  // Se houver, mostra o card de detalhes.
  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-md space-y-4">
      <h3 className="text-2xl font-bold text-gray-800">{victim.nome_responsavel}</h3>
      <div className="space-y-2 text-gray-700">
        <p><strong>CPF:</strong> {victim.cpf}</p>
        <p><strong>RG:</strong> {victim.rg || 'Não informado'}</p>
        <p><strong>Data de Nascimento:</strong> {victim.data_nascimento || 'Não informado'}</p>
        <p><strong>Endereço:</strong> {victim.endereco}</p>
        <p><strong>Situação da Moradia:</strong> <span className="font-semibold bg-yellow-100 px-2 py-1 rounded">{victim.situacao_moradia}</span></p>
        <p><strong>Situação do Emprego:</strong> <span className="font-semibold bg-blue-100 px-2 py-1 rounded">{victim.situacao_emprego}</span></p>
        <p><strong>Necessidades Imediatas:</strong> {victim.necessidades?.join(', ') || 'Nenhuma registrada'}</p>
        <p><strong>Outras Necessidades:</strong> {victim.outras_necessidades || 'Nenhuma registrada'}</p>
      </div>
    </div>
  );
}

// --- Componente Principal do Dashboard ---
export default function AdminDashboard({ onLogout }) {
  const [todasVitimas, setTodasVitimas] = useState([]);
  const [vitimasFiltradas, setVitimasFiltradas] = useState([]);
  const [selectedVictim, setSelectedVictim] = useState(null); // Começa como nulo
  const [loading, setLoading] = useState(true);

  const [filtroMoradia, setFiltroMoradia] = useState('');
  const [filtroEmprego, setFiltroEmprego] = useState('');
  const [filtroNecessidade, setFiltroNecessidade] = useState('');

  useEffect(() => {
    const fetchVitimas = async () => {
      setLoading(true);
      const { data } = await supabase.from('vitimas').select('*').order('created_at', { ascending: false });
      if (data) {
        setTodasVitimas(data);
        setVitimasFiltradas(data);
      }
      setLoading(false);
    };
    fetchVitimas();
  }, []);

  useEffect(() => {
    let items = [...todasVitimas];
    if (filtroMoradia) items = items.filter(v => v.situacao_moradia === filtroMoradia);
    if (filtroEmprego) items = items.filter(v => v.situacao_emprego === filtroEmprego);
    if (filtroNecessidade) items = items.filter(v => v.necessidades && v.necessidades.includes(filtroNecessidade));
    setVitimasFiltradas(items);
    setSelectedVictim(null); // Limpa a seleção ao aplicar um novo filtro
  }, [filtroMoradia, filtroEmprego, filtroNecessidade, todasVitimas]);

  const limparFiltros = () => {
    setFiltroMoradia('');
    setFiltroEmprego('');
    setFiltroNecessidade('');
  };

  const handlePrint = () => {
    window.print();
  };

  // Função para selecionar a vítima ou esconder os detalhes se clicar na mesma
  const handleSelectVictim = (vitima) => {
    if (selectedVictim && selectedVictim.id === vitima.id) {
      setSelectedVictim(null); // Se clicar na mesma, esconde
    } else {
      setSelectedVictim(vitima); // Se clicar em outra, mostra
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-800">Painel de Administração</h1>
        <button onClick={onLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600">
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-white rounded-lg shadow-md print:hidden">
        {/* Filtros */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Moradia</label>
          <select value={filtroMoradia} onChange={e => setFiltroMoradia(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
            <option value="">Todas</option>
            <option value="perda_total">Perda total</option>
            <option value="danos_graves">Danos graves</option>
            <option value="danos_parciais">Danos parciais</option>
            <option value="ilhada">Ilhada/Sem acesso</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Emprego</label>
          <select value={filtroEmprego} onChange={e => setFiltroEmprego(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
            <option value="">Todas</option>
            <option value="estavel">Estável</option>
            <option value="local_atingido">Local de trabalho atingido</option>
            <option value="precisa_nova_renda">Precisa de nova renda</option>
            <option value="autonomo_impedido">Autônomo impedido</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Necessidade</label>
          <select value={filtroNecessidade} onChange={e => setFiltroNecessidade(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
            <option value="">Todas</option>
            <option value="Abrigo temporário">Abrigo temporário</option>
            <option value="Água potável">Água potável</option>
            <option value="Cesta básica">Cesta básica</option>
            <option value="Lona">Lona</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button onClick={limparFiltros} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">
            Limpar
          </button>
          <button onClick={handlePrint} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
            Imprimir
          </button>
        </div>
      </div>

      {/* ===== ÁREA DA MUDANÇA PRINCIPAL ===== */}
      {/* Layout de uma coluna só */}
      <div className="space-y-6">
        
        {/* Lista de Vítimas */}
        <div id="lista-para-impressao">
          <h2 className="text-xl font-semibold mb-4">
            Famílias Encontradas ({vitimasFiltradas.length})
          </h2>
          {loading ? <p>Carregando...</p> : (
            <div className="bg-white rounded-lg shadow-md max-h-[60vh] overflow-y-auto no-print-style print:max-h-full print:overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Situação Moradia</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vitimasFiltradas.map((vitima) => (
                    <tr key={vitima.id} onClick={() => handleSelectVictim(vitima)} className={`cursor-pointer print:break-inside-avoid ${selectedVictim?.id === vitima.id ? 'bg-green-100' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">{vitima.nome_responsavel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{vitima.cpf}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{vitima.endereco}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{vitima.situacao_moradia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Área de Detalhes (só aparece se uma vítima for selecionada) */}
        <div className="print:hidden">
          <VictimDetails victim={selectedVictim} />
        </div>

      </div>
    </div>
  );
}
