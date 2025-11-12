// Onde: app/admin/page.js
// VERSÃO 3.0 - REINTRODUZINDO FILTROS E IMPRESSÃO NO NOVO LAYOUT

"use client";

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '../../lib/supabaseClient';

export default function AdminPage() {
    const [todasFamilias, setTodasFamilias] = useState([]);
    const [familiasFiltradas, setFamiliasFiltradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFamilia, setSelectedFamilia] = useState(null);

    // Estados para os filtros
    const [filtroMoradia, setFiltroMoradia] = useState('Todas');
    const [filtroEmprego, setFiltroEmprego] = useState('Todas');

    const componentToPrintRef = useRef();

    // Função para buscar os dados no Supabase
    const fetchFamilias = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('vitimas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao buscar famílias:", error);
            setError("Não foi possível carregar os dados.");
        } else {
            setTodasFamilias(data);
            setFamiliasFiltradas(data); // Inicialmente, mostra todas
        }
        setLoading(false);
    };

    // Efeito para carregar os dados iniciais
    useEffect(() => {
        fetchFamilias();
    }, []);

    // Efeito para aplicar os filtros quando eles mudam
    useEffect(() => {
        let familias = [...todasFamilias];

        if (filtroMoradia !== 'Todas') {
            familias = familias.filter(f => f.situacao_moradia === filtroMoradia);
        }

        if (filtroEmprego !== 'Todas') {
            familias = familias.filter(f => f.situacao_emprego === filtroEmprego);
        }

        setFamiliasFiltradas(familias);
        // Desseleciona a família se ela não estiver mais na lista filtrada
        if (selectedFamilia && !familias.find(f => f.id === selectedFamilia.id)) {
            setSelectedFamilia(null);
        }

    }, [filtroMoradia, filtroEmprego, todasFamilias, selectedFamilia]);


    const handleSelectFamilia = (familia) => {
        setSelectedFamilia(familia);
    };

    // Função de impressão
    const handlePrint = useReactToPrint({
        content: () => componentToPrintRef.current,
        documentTitle: `Detalhes_Familia_${selectedFamilia?.nome_responsavel.replace(/\s/g, '_') || 'N/A'}`,
    });

    if (loading) return <div className="text-center p-10">Carregando dados...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
                    <p className="text-gray-600">Visualize e gerencie os cadastros das famílias.</p>
                </header>

                {/* Seção de Filtros e Ações */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label htmlFor="filtro-moradia" className="block text-sm font-medium text-gray-700">Filtrar por Moradia</label>
                            <select id="filtro-moradia" value={filtroMoradia} onChange={(e) => setFiltroMoradia(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option>Todas</option>
                                <option>Própria</option>
                                <option>Alugada</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filtro-emprego" className="block text-sm font-medium text-gray-700">Filtrar por Emprego</label>
                            <select id="filtro-emprego" value={filtroEmprego} onChange={(e) => setFiltroEmprego(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option>Todas</option>
                                <option>Empregado(a)</option>
                                <option>Autônomo(a)</option>
                                <option>Desempregado(a)</option>
                                <option>Aposentado(a)/Pensionista</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2">
                             <button onClick={() => { setFiltroMoradia('Todas'); setFiltroEmprego('Todas'); }} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Limpar Filtros</button>
                             <button onClick={handlePrint} disabled={!selectedFamilia} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Imprimir Selecionado</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna da Lista de Famílias */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-xl font-semibold mb-4">Famílias Encontradas ({familiasFiltradas.length})</h2>
                        <div className="overflow-y-auto max-h-[60vh]">
                            <ul className="divide-y divide-gray-200">
                                {familiasFiltradas.map((familia) => (
                                    <li key={familia.id} onClick={() => handleSelectFamilia(familia)} className={`p-3 cursor-pointer hover:bg-emerald-50 ${selectedFamilia?.id === familia.id ? 'bg-emerald-100' : ''}`}>
                                        <p className="font-semibold text-emerald-800">{familia.nome_responsavel}</p>
                                        <p className="text-sm text-gray-500">{familia.cpf_responsavel}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Coluna de Detalhes da Família Selecionada */}
                    <div className="lg:col-span-2">
                        {selectedFamilia ? (
                            <div ref={componentToPrintRef} className="bg-white rounded-lg shadow-md p-6 print-container">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedFamilia.nome_responsavel}</h2>
                                <div className="space-y-6">
                                    {/* Seções de detalhes... */}
                                    <DetalhesSection title="Identificação">
                                        <InfoItem label="CPF" value={selectedFamilia.cpf_responsavel} />
                                        <InfoItem label="RG" value={selectedFamilia.rg_responsavel} />
                                        <InfoItem label="Data de Nascimento" value={new Date(selectedFamilia.data_nascimento_responsavel + 'T00:00:00').toLocaleDateString()} />
                                        <InfoItem label="Telefone Principal" value={selectedFamilia.telefone_contato} />
                                        <InfoItem label="Telefone Secundário" value={selectedFamilia.telefone_secundario} />
                                    </DetalhesSection>

                                    <DetalhesSection title="Moradia e Situação">
                                        <InfoItem label="Endereço" value={selectedFamilia.endereco_completo} />
                                        <InfoItem label="Situação da Moradia" value={selectedFamilia.situacao_moradia} />
                                        <InfoItem label="Situação de Emprego" value={selectedFamilia.situacao_emprego} />
                                        <InfoItem label="Possui Veículo" value={selectedFamilia.possui_veiculo} />
                                        <InfoItem label="Veículo Atingido" value={selectedFamilia.veiculo_atingido ? 'Sim' : 'Não'} />
                                    </DetalhesSection>

                                    <DetalhesSection title="Composição Familiar">
                                        <InfoItem label="Adultos" value={selectedFamilia.adultos} />
                                        <InfoItem label="Crianças" value={selectedFamilia.criancas} />
                                        <InfoItem label="Possui PCD" value={selectedFamilia.pcd ? 'Sim' : 'Não'} />
                                        <InfoItem label="Possui Gestante" value={selectedFamilia.gestante ? 'Sim' : 'Não'} />
                                        {selectedFamilia.membros_familia && selectedFamilia.membros_familia.length > 0 && (
                                            <div className="sm:col-span-2 mt-2">
                                                <h4 className="text-sm font-medium text-gray-500">Membros da Família:</h4>
                                                <ul className="list-disc list-inside mt-1 bg-gray-50 p-2 rounded">
                                                    {selectedFamilia.membros_familia.map((membro, index) => (
                                                        <li key={index} className="text-sm">{membro.nome} ({membro.data_nascimento ? new Date(membro.data_nascimento + 'T00:00:00').toLocaleDateString() : 'Data não informada'})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </DetalhesSection>

                                    <DetalhesSection title="Necessidades e Observações">
                                        <div className="sm:col-span-2">
                                            <p className="text-gray-800 mt-1 bg-yellow-50 p-3 rounded"><strong>Necessidades Urgentes:</strong> {selectedFamilia.necessidades_urgentes || 'Nenhuma registrada'}</p>
                                            <p className="text-gray-800 mt-2"><strong>Observações:</strong> {selectedFamilia.observacoes || 'Nenhuma registrada'}</p>
                                        </div>
                                    </DetalhesSection>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-6 text-center py-20">
                                <p className="text-gray-500">Selecione uma família na lista para ver os detalhes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componentes auxiliares para manter o código limpo
function DetalhesSection({ title, children }) {
    return (
        <div>
            <h3 className="font-semibold text-lg mb-2 border-b pb-1">{title}</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value || 'Não informado'}</dd>
        </div>
    );
}
