// Onde: app/admin/auditoria/page.js
// VERSÃO FINAL E COMPLETA - LÓGICA DE AUDITORIA NO CLIENTE

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function AuditoriaPage() {
    const [gruposSuspeitos, setGruposSuspeitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEProcessarDuplicidades = async () => {
            setLoading(true);
            setError(null);

            // Passo 1: Buscar todos os dados brutos da tabela 'vitimas'.
            const { data: vitimas, error: fetchError } = await supabase
                .from('vitimas')
                .select('id, nome_responsavel, data_nascimento_responsavel, membros_familia');

            if (fetchError) {
                console.error("Erro ao buscar vítimas:", fetchError);
                setError("Não foi possível carregar os dados para auditoria.");
                setLoading(false);
                return;
            }

            // Passo 2: Processar os dados no JavaScript para encontrar duplicidades.
            const todasAsPessoas = [];
            for (const vitima of vitimas) {
                // Adiciona o responsável
                if (vitima.nome_responsavel) {
                    todasAsPessoas.push({
                        nome: vitima.nome_responsavel,
                        dataNascimento: vitima.data_nascimento_responsavel,
                        papel: 'Responsável',
                        cadastroId: vitima.id,
                        responsavelDoCadastro: vitima.nome_responsavel
                    });
                }
                // Adiciona os membros da família
                if (vitima.membros_familia) {
                    for (const membro of vitima.membros_familia) {
                        if (membro.nome) {
                            todasAsPessoas.push({
                                nome: membro.nome,
                                dataNascimento: membro.data_nascimento || null,
                                papel: 'Membro da Família',
                                cadastroId: vitima.id,
                                responsavelDoCadastro: vitima.nome_responsavel
                            });
                        }
                    }
                }
            }

            // Agrupa as pessoas por nome normalizado e data de nascimento
            const mapaDePessoas = new Map();
            for (const pessoa of todasAsPessoas) {
                const nomeNormalizado = pessoa.nome.trim().toLowerCase();
                const chave = `${nomeNormalizado}|${pessoa.dataNascimento}`;
                
                if (!mapaDePessoas.has(chave)) {
                    mapaDePessoas.set(chave, []);
                }
                mapaDePessoas.get(chave).push(pessoa);
            }

            // Filtra apenas os grupos com mais de uma ocorrência (duplicidades)
            const grupos = [];
            for (const [chave, pessoas] of mapaDePessoas.entries()) {
                if (pessoas.length > 1) {
                    grupos.push({
                        chave: chave,
                        nome: pessoas[0].nome,
                        dataNascimento: pessoas[0].dataNascimento,
                        ocorrencias: pessoas
                    });
                }
            }

            setGruposSuspeitos(grupos);
            setLoading(false);
        };

        fetchEProcessarDuplicidades();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <h1 className="text-2xl font-bold mb-4">Auditoria de Duplicidades</h1>
                <p>Analisando todos os cadastros em busca de duplicidades... Isso pode levar um momento.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Erro na Auditoria</h1>
                <p className="text-red-500">{error}</p>
                <Link href="/admin" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Voltar ao Painel
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Auditoria de Duplicidades</h1>
                        <p className="text-gray-600">Grupos de cadastros que compartilham o mesmo nome de pessoa.</p>
                    </div>
                    <Link href="/admin" className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 font-semibold">
                        Voltar ao Centro de Comando
                    </Link>
                </header>

                {gruposSuspeitos.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <p className="text-gray-700">Nenhuma duplicidade suspeita encontrada. Todos os cadastros parecem únicos.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {gruposSuspeitos.map((grupo) => (
                            <div key={grupo.chave} className="bg-white rounded-lg shadow-md">
                                <div className="p-4 bg-yellow-100 border-b border-yellow-200 rounded-t-lg">
                                    <h2 className="text-xl font-bold text-yellow-800">Grupo Suspeito: {grupo.nome}</h2>
                                    <p className="text-sm text-yellow-700">
                                        Esta pessoa aparece em {grupo.ocorrencias.length} cadastros diferentes.
                                        {grupo.dataNascimento && ` (Data de Nasc.: ${new Date(grupo.dataNascimento + 'T00:00:00').toLocaleDateString()})`}
                                    </p>
                                </div>
                                <ul className="divide-y divide-gray-200">
                                    {grupo.ocorrencias.map((ocorrencia, index) => (
                                        <li key={index} className="p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">
                                                    Aparece como: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ocorrencia.papel === 'Responsável' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{ocorrencia.papel}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    No cadastro do responsável: <span className="font-medium text-gray-800">{ocorrencia.responsavelDoCadastro}</span>
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-400">ID do Cadastro: {ocorrencia.cadastroId}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
