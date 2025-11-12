// Onde: app/page.js
// VERSÃO ATUALIZADA - ADICIONANDO MATERIAIS DE CONSTRUÇÃO

"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [membros, setMembros] = useState([{ nome: '', data_nascimento: '' }]);

  const adicionarMembro = () => setMembros([...membros, { nome: '', data_nascimento: '' }]);
  const removerMembro = (index) => setMembros(membros.filter((_, i) => i !== index));
  const handleMembroChange = (index, event) => {
    const novosMembros = membros.map((membro, i) => 
      i === index ? { ...membro, [event.target.name]: event.target.value } : membro
    );
    setMembros(novosMembros);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage('');

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const necessidadesSelecionadas = Array.from(formData.keys())
        .filter(key => key.startsWith('necessidade_'))
        .map(key => key.replace(/necessidade_/g, '').replace(/_/g, ' ')); // Lógica para tratar nomes compostos

    const submissionData = {
      nome_responsavel: data.nome_responsavel,
      cpf_responsavel: data.cpf_responsavel,
      rg_responsavel: data.rg_responsavel || null,
      data_nascimento_responsavel: data.data_nascimento_responsavel,
      telefone_contato: data.telefone_contato,
      telefone_secundario: data.telefone_secundario || null,
      endereco_completo: data.endereco_completo,
      adultos: parseInt(data.adultos, 10) || 0,
      criancas: parseInt(data.criancas, 10) || 0,
      pcd: formData.get('pcd') === 'on',
      gestante: formData.get('gestante') === 'on',
      membros_familia: membros.filter(m => m.nome),
      situacao_moradia: data.situacao_moradia,
      qualificacao_moradia: data.qualificacao_moradia,
      situacao_emprego: data.situacao_emprego,
      local_trabalho_atingido: formData.get('local_trabalho_atingido') === 'on',
      possui_veiculo: data.possui_veiculo,
      veiculo_atingido: formData.get('veiculo_atingido') === 'on',
      lista_necessidades: necessidadesSelecionadas,
      necessidades_urgentes: data.necessidades_urgentes,
      observacoes: data.observacoes || null,
    };

    try {
      const { error } = await supabase.from('vitimas').insert([submissionData]);
      if (error) throw error;
      setSubmissionMessage('Cadastro realizado com sucesso! Obrigado pela sua colaboração.');
      event.target.reset();
      setMembros([{ nome: '', data_nascimento: '' }]);
    } catch (error) {
      console.error('Erro do Supabase:', error);
      if (error.code === '23505') {
        setSubmissionMessage('Erro: Este CPF já foi cadastrado. Para atualizar, procure um ponto de apoio.');
      } else {
        setSubmissionMessage(`Erro no cadastro: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Formulário de Cadastro de Ajuda</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção 1: Identificação */}
          <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50 rounded-r-lg">
            <h3 className="font-bold text-lg text-emerald-800 mb-2">1. Identificação do Responsável</h3>
            <div className="space-y-4">
              <div><label htmlFor="nome_responsavel" className="block text-sm font-medium text-gray-700">Nome Completo *</label><input type="text" name="nome_responsavel" id="nome_responsavel" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="cpf_responsavel" className="block text-sm font-medium text-gray-700">CPF *</label><input type="text" name="cpf_responsavel" id="cpf_responsavel" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
                <div><label htmlFor="rg_responsavel" className="block text-sm font-medium text-gray-700">RG (Opcional)</label><input type="text" name="rg_responsavel" id="rg_responsavel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
              </div>
              <div><label htmlFor="data_nascimento_responsavel" className="block text-sm font-medium text-gray-700">Data de Nascimento *</label><input type="date" name="data_nascimento_responsavel" id="data_nascimento_responsavel" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="telefone_contato" className="block text-sm font-medium text-gray-700">Telefone Principal (WhatsApp) *</label><input type="tel" name="telefone_contato" id="telefone_contato" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
                <div><label htmlFor="telefone_secundario" className="block text-sm font-medium text-gray-700">Telefone Secundário (Opcional)</label><input type="tel" name="telefone_secundario" id="telefone_secundario" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
              </div>
            </div>
          </div>

          {/* Seção 2: Composição Familiar */}
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
            <h3 className="font-bold text-lg text-blue-800 mb-2">2. Composição Familiar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="adultos" className="block text-sm font-medium text-gray-700">Nº de Adultos</label><input type="number" name="adultos" id="adultos" required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
              <div><label htmlFor="criancas" className="block text-sm font-medium text-gray-700">Nº de Crianças/Adolescentes</label><input type="number" name="criancas" id="criancas" required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center"><input id="pcd" name="pcd" type="checkbox" className="h-4 w-4 rounded border-gray-300"/><label htmlFor="pcd" className="ml-2 block text-sm text-gray-900">Há pessoa com deficiência (PCD)?</label></div>
              <div className="flex items-center"><input id="gestante" name="gestante" type="checkbox" className="h-4 w-4 rounded border-gray-300"/><label htmlFor="gestante" className="ml-2 block text-sm text-gray-900">Há gestante?</label></div>
            </div>
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Membros da Família (Opcional)</h4>
              {membros.map((membro, index) => (<div key={index} className="flex items-end gap-2 p-2 border rounded-md bg-gray-50 mb-2"><div className="flex-grow"><label className="text-xs text-gray-600">Nome</label><input type="text" name="nome" value={membro.nome} onChange={(e) => handleMembroChange(index, e)} className="w-full text-sm p-1 border-gray-200 rounded-md"/></div><div className="flex-grow"><label className="text-xs text-gray-600">Data de Nascimento</label><input type="date" name="data_nascimento" value={membro.data_nascimento} onChange={(e) => handleMembroChange(index, e)} className="w-full text-sm p-1 border-gray-200 rounded-md"/></div>{membros.length > 1 && <button type="button" onClick={() => removerMembro(index)} className="px-2 py-1 text-red-600 hover:text-red-800 text-sm">Remover</button>}</div>))}
              <button type="button" onClick={adicionarMembro} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">+ Adicionar membro</button>
            </div>
          </div>

          {/* Seção 3: Moradia e Emprego */}
          <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
            <h3 className="font-bold text-lg text-amber-800 mb-2">3. Moradia e Emprego</h3>
            <div className="space-y-4">
              <div><label htmlFor="endereco_completo" className="block text-sm font-medium text-gray-700">Endereço da Moradia Atingida *</label><input type="text" name="endereco_completo" id="endereco_completo" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Moradia</label>
                <div className="mt-2 flex gap-x-6"><div className="flex items-center"><input id="moradia_propria" name="situacao_moradia" type="radio" value="Própria" required className="h-4 w-4"/><label htmlFor="moradia_propria" className="ml-2 block text-sm font-medium text-gray-700">Própria</label></div><div className="flex items-center"><input id="moradia_alugada" name="situacao_moradia" type="radio" value="Alugada" className="h-4 w-4"/><label htmlFor="moradia_alugada" className="ml-2 block text-sm font-medium text-gray-700">Alugada</label></div></div>
              </div>
              <div>
                <label htmlFor="qualificacao_moradia" className="block text-sm font-medium text-gray-700">Qual a situação da residência após o desastre? *</label>
                <select id="qualificacao_moradia" name="qualificacao_moradia" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="">Selecione...</option><option value="Habitável com danos">Habitável com danos</option><option value="Inabitável (Temporário)">Inabitável (Temporário)</option><option value="Inabitável (Permanente)">Inabitável (Permanente / Perda total)</option></select>
              </div>
              <hr/>
              <div>
                <label htmlFor="situacao_emprego" className="block text-sm font-medium text-gray-700">Situação de Emprego do Responsável *</label>
                <select id="situacao_emprego" name="situacao_emprego" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="">Selecione...</option><option value="Empregado(a)">Empregado(a)</option><option value="Autônomo(a)">Autônomo(a)</option><option value="Desempregado(a)">Desempregado(a)</option><option value="Aposentado(a)/Pensionista">Aposentado(a)/Pensionista</option></select>
              </div>
              <div className="flex items-center">
                <input id="local_trabalho_atingido" name="local_trabalho_atingido" type="checkbox" className="h-4 w-4 rounded border-gray-300"/><label htmlFor="local_trabalho_atingido" className="ml-2 block text-sm text-gray-900">O local de trabalho/fonte de renda também foi atingido?</label>
              </div>
              <hr/>
              <div>
                <label className="block text-sm font-medium text-gray-700">Possui veículo?</label>
                <div className="mt-2 flex gap-x-6"><div className="flex items-center"><input id="veiculo_sim" name="possui_veiculo" type="radio" value="Sim" required className="h-4 w-4"/><label htmlFor="veiculo_sim" className="ml-2 block text-sm font-medium text-gray-700">Sim</label></div><div className="flex items-center"><input id="veiculo_nao" name="possui_veiculo" type="radio" value="Não" className="h-4 w-4"/><label htmlFor="veiculo_nao" className="ml-2 block text-sm font-medium text-gray-700">Não</label></div></div>
              </div>
              <div className="flex items-center">
                <input id="veiculo_atingido" name="veiculo_atingido" type="checkbox" className="h-4 w-4 rounded border-gray-300"/><label htmlFor="veiculo_atingido" className="ml-2 block text-sm text-gray-900">O veículo foi atingido/danificado?</label>
              </div>
            </div>
          </div>

          {/* --- SEÇÃO 4: NECESSIDADES (COM MATERIAIS DE CONSTRUÇÃO) --- */}
          <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
            <h3 className="font-bold text-lg text-red-800 mb-2">4. Necessidades da Família</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Itens Básicos:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                    <CheckboxItem name="Alimentos" /><CheckboxItem name="Água potável" /><CheckboxItem name="Colchões" /><CheckboxItem name="Roupas de cama" /><CheckboxItem name="Roupas (adulto)" /><CheckboxItem name="Roupas (criança)" /><CheckboxItem name="Calçados" /><CheckboxItem name="Produtos de higiene" /><CheckboxItem name="Produtos de limpeza" /><CheckboxItem name="Fraldas" /><CheckboxItem name="Móveis" /><CheckboxItem name="Eletrodomésticos" />
                </div>
            </div>
            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Materiais de Reconstrução:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                    <CheckboxItem name="Madeira (telhado)" /><CheckboxItem name="Madeira (parede)" /><CheckboxItem name="Caibros" /><CheckboxItem name="Tijolos" /><CheckboxItem name="Cimento" /><CheckboxItem name="Areia" /><CheckboxItem name="Brita" /><CheckboxItem name="Brasilit" /><CheckboxItem name="Telhas" />
                </div>
            </div>
            <div className="mt-6">
              <label htmlFor="necessidades_urgentes" className="block text-sm font-medium text-gray-700">Outras necessidades ou detalhes importantes (Ex: remédios, etc.):</label>
              <textarea name="necessidades_urgentes" id="necessidades_urgentes" rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
            </div>
            <div className="mt-4">
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações Adicionais (uso interno)</label>
              <textarea name="observacoes" id="observacoes" rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
            </div>
          </div>

          <div className="pt-5"><button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400">{isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}</button></div>
          {submissionMessage && (<div className={`mt-4 text-center p-3 rounded-md ${submissionMessage.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{submissionMessage}</div>)}
        </form>
      </div>
    </div>
  );
}

function CheckboxItem({ name }) {
    const id = `necessidade_${name.replace(/[\s/()]/g, '_')}`; // Trata espaços, barras e parênteses
    return (<div className="flex items-center"><input id={id} name={id} type="checkbox" className="h-4 w-4 rounded border-gray-300"/><label htmlFor={id} className="ml-2 block text-sm text-gray-900">{name}</label></div>);
}
