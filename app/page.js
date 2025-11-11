// Onde: app/page.js
// VERSÃO FINAL DO FORMULÁRIO COM TODAS AS MELHORIAS

'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function FormularioCadastro() {
  const [message, setMessage] = useState('');
  const [membros, setMembros] = useState([{ nome: '', idade: '', pcd: false }]);

  const handleMembroChange = (index, field, value) => {
    const novosMembros = [...membros];
    novosMembros[index][field] = value;
    setMembros(novosMembros);
  };

  const addMembroField = () => {
    setMembros([...membros, { nome: '', idade: '', pcd: false }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Enviando, por favor aguarde...');

    const formData = new FormData(event.currentTarget);
    const formProps = Object.fromEntries(formData.entries());

    try {
      const { data: newVictim, error: victimError } = await supabase
        .from('vitimas')
        .insert({
          // Campos existentes
          nome_responsavel: formProps.nome_responsavel,
          cpf: formProps.cpf,
          rg: formProps.rg,
          data_nascimento: formProps.data_nascimento,
          telefone: formProps.telefone,
          telefone_secundario: formProps.telefone_secundario,
          endereco: formProps.endereco,
          numero_moradores: parseInt(formProps.numero_moradores),
          situacao_moradia: formProps.situacao_moradia,
          necessidades: formData.getAll('necessidades'),
          // Novos campos
          outras_necessidades: formProps.outras_necessidades,
          situacao_emprego: formProps.situacao_emprego,
        })
        .select()
        .single();

      if (victimError) throw victimError;

      const membrosParaInserir = membros
        .filter(m => m.nome.trim() !== '')
        .map(m => ({
          vitima_id: newVictim.id,
          nome_membro: m.nome,
          idade: m.idade ? parseInt(m.idade) : null,
          pcd: m.pcd,
        }));

      if (membrosParaInserir.length > 0) {
        const { error: membrosError } = await supabase.from('membros_familia').insert(membrosParaInserir);
        if (membrosError) throw membrosError;
      }

      setMessage('Cadastro realizado com sucesso! Obrigado pela sua colaboração.');
      event.target.reset();
      setMembros([{ nome: '', idade: '', pcd: false }]);

    } catch (error) {
      console.error('Erro no cadastro:', error);
      if (error.message.includes('duplicate key value')) {
        setMessage('Erro: Este CPF já foi cadastrado. Verifique os dados.');
      } else {
        setMessage(`Erro ao cadastrar: ${error.message}`);
      }
    }
  };

  return (
    // O container principal agora está mais limpo, pois o fundo e o padding vêm do layout
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Formulário de Cadastro de Famílias</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção de Dados do Responsável */}
          <fieldset className="space-y-4">
            <legend className="font-bold text-xl text-gray-700 border-b-2 border-emerald-200 pb-2 mb-4">1. Dados do Responsável</legend>
            {/* ... campos de nome, cpf, rg, etc. ... */}
            <input name="nome_responsavel" placeholder="Nome Completo do Responsável" className="w-full p-3 border rounded-md" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="cpf" placeholder="CPF (apenas números)" className="w-full p-3 border rounded-md" required pattern="\d{11}" title="Digite um CPF válido com 11 dígitos." />
              <input name="rg" placeholder="RG (opcional)" className="w-full p-3 border rounded-md" />
            </div>
            <div>
              <label htmlFor="data_nascimento" className="text-sm font-medium text-gray-600">Data de Nascimento</label>
              <input id="data_nascimento" name="data_nascimento" type="date" className="w-full p-3 border rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="telefone" type="tel" placeholder="Telefone Principal" className="w-full p-3 border rounded-md" required />
              <input name="telefone_secundario" type="tel" placeholder="Telefone Secundário (opcional)" className="w-full p-3 border rounded-md" />
            </div>
          </fieldset>

          {/* Seção de Composição Familiar */}
          <fieldset className="space-y-4">
            <legend className="font-bold text-xl text-gray-700 border-b-2 border-emerald-200 pb-2 mb-4">2. Composição Familiar</legend>
            {/* ... campos dos membros ... */}
            {membros.map((membro, index) => (
              <div key={index} className="p-3 border rounded-md bg-gray-50 space-y-3">
                <p className="font-semibold text-gray-700">Membro {index + 1}</p>
                <input value={membro.nome} onChange={(e) => handleMembroChange(index, 'nome', e.target.value)} placeholder="Nome do membro" className="w-full p-3 border rounded-md" />
                <div className="flex items-center gap-4">
                  <input type="number" value={membro.idade} onChange={(e) => handleMembroChange(index, 'idade', e.target.value)} placeholder="Idade" className="w-1/2 p-3 border rounded-md" />
                  <label className="flex items-center gap-2 text-gray-700"><input type="checkbox" checked={membro.pcd} onChange={(e) => handleMembroChange(index, 'pcd', e.target.checked)} className="h-5 w-5" />É PCD?</label>
                </div>
              </div>
            ))}
            <button type="button" onClick={addMembroField} className="text-sm font-semibold text-blue-600 hover:underline">+ Adicionar outro membro</button>
          </fieldset>

          {/* Seção de Moradia e Emprego */}
          <fieldset className="space-y-6">
            <legend className="font-bold text-xl text-gray-700 border-b-2 border-emerald-200 pb-2 mb-4">3. Situação da Moradia e Emprego</legend>
            <input name="endereco" placeholder="Endereço Completo (Rua, Número, Bairro)" className="w-full p-3 border rounded-md" required />
            <input type="number" name="numero_moradores" placeholder="Nº total de moradores na casa" className="w-full p-3 border rounded-md" required min="1" />
            <div>
              <label className="font-semibold text-gray-700">Situação da Moradia:</label>
              <select name="situacao_moradia" className="w-full p-3 border rounded-md mt-1">
                <option value="perda_total">Perda total (inabitável)</option>
                <option value="danos_graves">Danos graves (inabitável temporariamente)</option>
                <option value="danos_parciais">Danos parciais (habitável com reparos)</option>
                <option value="ilhada">Sem danos, mas ilhado/sem acesso</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Situação do Emprego do(s) Provedor(es):</label>
              <select name="situacao_emprego" className="w-full p-3 border rounded-md mt-1">
                <option value="">Selecione uma opção</option>
                <option value="estavel">Emprego estável / não foi afetado</option>
                <option value="local_atingido">O local de trabalho também foi atingido</option>
                <option value="precisa_nova_renda">Perdeu o emprego / precisa de nova fonte de renda</option>
                <option value="autonomo_impedido">Autônomo impedido de trabalhar</option>
              </select>
            </div>
          </fieldset>

          {/* Seção de Necessidades */}
          <fieldset className="space-y-4">
            <legend className="font-bold text-xl text-gray-700 border-b-2 border-emerald-200 pb-2 mb-4">4. Necessidades</legend>
            <div>
              <label className="font-semibold text-gray-700">Necessidades Imediatas:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {['Abrigo temporário', 'Água potável', 'Cesta básica', 'Kit de higiene', 'Roupas/Cobertores', 'Atendimento psicológico', 'Lona'].map(item => (
                  <label key={item} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"><input type="checkbox" name="necessidades" value={item} className="h-5 w-5" /><span>{item}</span></label>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="outras_necessidades" className="font-semibold text-gray-700">Outras Necessidades (Ex: material de construção, móveis, etc.):</label>
              <textarea id="outras_necessidades" name="outras_necessidades" rows="4" className="w-full p-3 border rounded-md mt-1" placeholder="Descreva aqui outros itens de necessidade..."></textarea>
            </div>
          </fieldset>

          <button type="submit" className="w-full bg-emerald-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-emerald-700 transition-colors">
            Enviar Cadastro
          </button>
        </form>
        {message && <p className="mt-6 text-center font-bold text-xl">{message}</p>}
      </div>
    </div>
  );
}
