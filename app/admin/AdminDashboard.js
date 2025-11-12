// Onde: app/admin/AdminDashboard.js
// VERSÃO FINAL E COMPLETA - O CENTRO DE COMANDO LOGÍSTICO (SEM OMISSÕES)

"use client";

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '../../lib/supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Hook customizado para debounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

const todasAsNecessidades = [
    "Alimentos", "Água potável", "Colchões", "Roupas de cama", "Roupas (adulto)", "Roupas (criança)",
    "Calçados", "Produtos de higiene", "Produtos de limpeza", "Fraldas", "Móveis", "Eletrodomésticos",
    "Madeira (telhado)", "Madeira (parede)", "Caibros", "Tijolos", "Cimento", "Areia", "Brita", "Brasilit", "Telhas"
];

export default function AdminDashboard({ onLogout }) {
    const [todasFamilias, setTodasFamilias] = useState([]);
    const [familiasFiltradas, setFamiliasFiltradas] = useState([]);
    const [entregas, setEntregas] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFamilia, setSelectedFamilia] = useState(null);

    // --- ESTADOS PARA OS FILTROS ---
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroMoradia, setFiltroMoradia] = useState('Todas');
    const [filtroEmprego, setFiltroEmprego] = useState('Todas');
    const [filtroTrabalhoAfetado, setFiltroTrabalhoAfetado] = useState('Todos');
    const [filtroPossuiCriancas, setFiltroPossuiCriancas] = useState('Todos');
    const [filtroNumMoradores, setFiltroNumMoradores] = useState('');
    const [filtroNecessidade, setFiltroNecessidade] = useState('Todas');

    const debouncedNome = useDebounce(filtroNome, 500);
    const debouncedNumMoradores = useDebounce(filtroNumMoradores, 500);
    const componentToPrintRef = useRef();

    const fetchData = async () => {
        setLoading(true);
        const { data: familiasData, error: familiasError } = await supabase.from('vitimas').select('*').order('created_at', { ascending: false });
        const { data: entregasData, error: entregasError } = await supabase.from('entregas').select('vitima_id, created_at');

        if (familiasError || entregasError) {
            console.error("Erro ao buscar dados:", familiasError || entregasError);
            setError("Não foi possível carregar os dados.");
        } else {
            setTodasFamilias(familiasData);
            setFamiliasFiltradas(familiasData);
            const entregasMap = new Map(entregasData.map(e => [e.vitima_id, e.created_at]));
            setEntregas(entregasMap);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        let familias = [...todasFamilias];
        if (debouncedNome) familias = familias.filter(f => f.nome_responsavel.toLowerCase().includes(debouncedNome.toLowerCase()));
        if (filtroMoradia !== 'Todas') familias = familias.filter(f => f.situacao_moradia === filtroMoradia);
        if (filtroEmprego !== 'Todas') familias = familias.filter(f => f.situacao_emprego === filtroEmprego);
        if (filtroTrabalhoAfetado !== 'Todos') familias = familias.filter(f => f.local_trabalho_atingido === (filtroTrabalhoAfetado === 'Sim'));
        if (filtroPossuiCriancas !== 'Todos') familias = familias.filter(f => (filtroPossuiCriancas === 'Sim' ? (f.criancas || 0) > 0 : (f.criancas || 0) === 0));
        if (debouncedNumMoradores) familias = familias.filter(f => ((f.adultos || 0) + (f.criancas || 0)) >= parseInt(debouncedNumMoradores, 10));
        if (filtroNecessidade !== 'Todas') familias = familias.filter(f => f.lista_necessidades && f.lista_necessidades.includes(filtroNecessidade));
        
        setFamiliasFiltradas(familias);
        if (selectedFamilia && !familias.find(f => f.id === selectedFamilia.id)) {
            setSelectedFamilia(null);
        }
    }, [debouncedNome, filtroMoradia, filtroEmprego, filtroTrabalhoAfetado, filtroPossuiCriancas, debouncedNumMoradores, filtroNecessidade, todasFamilias]);

    const limparTodosFiltros = () => {
        setFiltroNome('');
        setFiltroMoradia('Todas');
        setFiltroEmprego('Todas');
        setFiltroTrabalhoAfetado('Todos');
        setFiltroPossuiCriancas('Todos');
        setFiltroNumMoradores('');
        setFiltroNecessidade('Todas');
    };

    const handlePrintDetalhes = useReactToPrint({
        content: () => componentToPrintRef.current,
        documentTitle: `Detalhes_Familia_${selectedFamilia?.nome_responsavel.replace(/\s/g, '_') || 'N/A'}`,
    });

    const handleExportarListaPDF = () => {
        const doc = new jsPDF();
        doc.text(`Lista de Famílias Filtradas - ${new Date().toLocaleDateString()}`, 14, 16);
        doc.autoTable({
            head: [['Responsável', 'CPF', 'Telefone', 'Endereço']],
            body: familiasFiltradas.map(f => [f.nome_responsavel, f.cpf_responsavel, f.telefone_contato, f.endereco_completo]),
            startY: 20,
        });
        doc.save(`lista_filtrada_${Date.now()}.pdf`);
    };

    const handleMarcarAtendido = async (familiaId) => {
        if (!familiaId) return;
        if (entregas.has(familiaId)) {
            alert("Esta família já foi marcada como atendida.");
            return;
        }
        if (confirm("Tem certeza que deseja marcar esta família como atendida? Esta ação não pode ser desfeita.")) {
            const { error } = await supabase.from('entregas').insert([{ vitima_id: familiaId }]);
            if (error) {
                alert("Erro ao marcar como atendido: " + error.message);
            } else {
                alert("Família marcada como atendida com sucesso!");
                fetchData(); // Re-busca os dados para atualizar a interface
            }
        }
    };

    if (loading) return <div className="text-center p-10">Carregando painel...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Centro de Comando</h1>
                        <p className="text-gray-600">Filtre, gerencie e atenda as necessidades das famílias.</p>
                    </div>
                    <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Sair</button>
                </header>

                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold mb-3">Filtros de Logística</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <FilterInput label="Nome do Responsável" value={filtroNome} onChange={setFiltroNome} placeholder="Busca por nome..." />
                        <FilterSelect label="Situação Moradia" value={filtroMoradia} onChange={setFiltroMoradia} options={['Própria', 'Alugada']} />
                        <FilterSelect label="Situação Emprego" value={filtroEmprego} onChange={setFiltroEmprego} options={['Desempregado(a)', 'Autônomo(a)', 'Empregado(a)', 'Aposentado(a)/Pensionista']} />
                        <FilterSelect label="Trabalho Afetado" value={filtroTrabalhoAfetado} onChange={setFiltroTrabalhoAfetado} options={[{ value: 'Sim', label: 'Sim' }, { value: 'Não', label: 'Não' }]} isObject />
                        <FilterSelect label="Possui Crianças" value={filtroPossuiCriancas} onChange={setFiltroPossuiCriancas} options={[{ value: 'Sim', label: 'Sim' }, { value: 'Não', label: 'Não' }]} isObject />
                        <FilterInput label="Nº Mín. de Moradores" value={filtroNumMoradores} onChange={setFiltroNumMoradores} placeholder="Ex: 3" type="number" />
                        <FilterSelect label="Necessidade Específica" value={filtroNecessidade} onChange={setFiltroNecessidade} options={todasAsNecessidades} />
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <button onClick={limparTodosFiltros} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Limpar Filtros</button>
                        <button onClick={handlePrintDetalhes} disabled={!selectedFamilia} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300">Imprimir Detalhes</button>
                        <button onClick={handleExportarListaPDF} disabled={familiasFiltradas.length === 0} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:bg-gray-300">Exportar Lista (PDF)</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-xl font-semibold mb-4">Famílias Encontradas ({familiasFiltradas.length})</h2>
                        <div className="overflow-y-auto max-h-[60vh]">
                            <ul className="divide-y divide-gray-200">
                                {familiasFiltradas.map((familia) => (
                                    <li key={familia.id} onClick={() => setSelectedFamilia(familia)} className={`p-3 cursor-pointer flex justify-between items-center hover:bg-emerald-50 ${selectedFamilia?.id === familia.id ? 'bg-emerald-100' : ''}`}>
                                        <div>
                                            <p className="font-semibold text-emerald-800">{familia.nome_responsavel}</p>
                                            <p className="text-sm text-gray-500">{familia.cpf_responsavel}</p>
                                        </div>
                                        {entregas.has(familia.id) && (
                                            <span className="text-xs bg-green-200 text-green-800 font-bold px-2 py-1 rounded-full" title={`Atendido em ${new Date(entregas.get(familia.id)).toLocaleDateString()}`}>ATENDIDO</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        {selectedFamilia ? (
                            <div className="bg-white rounded-lg shadow-md">
                                <div ref={componentToPrintRef} className="p-6 print-container">
                                    {/* ===== INÍCIO DO CÓDIGO QUE ESTAVA FALTANDO ===== */}
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedFamilia.nome_responsavel}</h2>
                                    <div className="space-y-6">
                                        <DetalhesSection title="Identificação">
                                            <InfoItem label="CPF" value={selectedFamilia.cpf_responsavel} />
                                            <InfoItem label="RG" value={selectedFamilia.rg_responsavel} />
                                            <InfoItem label="Data de Nascimento" value={selectedFamilia.data_nascimento_responsavel ? new Date(selectedFamilia.data_nascimento_responsavel + 'T00:00:00').toLocaleDateString() : 'N/A'} />
                                            <InfoItem label="Telefone Principal" value={selectedFamilia.telefone_contato} />
                                            <InfoItem label="Telefone Secundário" value={selectedFamilia.telefone_secundario} />
                                        </DetalhesSection>
                                        <DetalhesSection title="Moradia e Emprego">
                                            <InfoItem label="Endereço" value={selectedFamilia.endereco_completo} />
                                            <InfoItem label="Tipo de Moradia" value={selectedFamilia.situacao_moradia} />
                                            <InfoItem label="Situação da Residência" value={selectedFamilia.qualificacao_moradia} highlight />
                                            <InfoItem label="Situação de Emprego" value={selectedFamilia.situacao_emprego} />
                                            <InfoItem label="Local de Trabalho Atingido" value={selectedFamilia.local_trabalho_atingido ? 'Sim' : 'Não'} highlight />
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
                                            {selectedFamilia.lista_necessidades && selectedFamilia.lista_necessidades.length > 0 && (
                                                <div className="sm:col-span-2">
                                                    <h4 className="text-sm font-medium text-gray-500">Itens Solicitados:</h4>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {selectedFamilia.lista_necessidades.map(item => <span key={item} className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">{item}</span>)}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="sm:col-span-2 mt-4">
                                                <p className="text-gray-800 bg-yellow-50 p-3 rounded"><strong>Outras Necessidades / Detalhes:</strong> {selectedFamilia.necessidades_urgentes || 'Nenhuma registrada'}</p>
                                                <p className="text-gray-800 mt-2"><strong>Observações (Uso Interno):</strong> {selectedFamilia.observacoes || 'Nenhuma registrada'}</p>
                                            </div>
                                        </DetalhesSection>
                                    </div>
                                    {/* ===== FIM DO CÓDIGO QUE ESTAVA FALTANDO ===== */}
                                </div>
                                <div className="p-6 border-t">
                                    <button onClick={() => handleMarcarAtendido(selectedFamilia.id)} disabled={entregas.has(selectedFamilia.id)} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        {entregas.has(selectedFamilia.id) ? `Atendido em ${new Date(entregas.get(selectedFamilia.id)).toLocaleDateString()}` : 'Marcar Como Atendido'}
                                    </button>
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

// --- Componentes Auxiliares Completos ---
function FilterInput({ label, value, onChange, placeholder, type = 'text' }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
        </div>
    );
}

function FilterSelect({ label, value, onChange, options, isObject = false }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                <option value={isObject ? 'Todos' : 'Todas'}>Todos/Todas</option>
                {options.map(opt => (
                    isObject ? <option key={opt.value} value={opt.value}>{opt.label}</option> : <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}

function DetalhesSection({ title, children }) {
    return (
        <div>
            <h3 className="font-semibold text-lg mb-2 border-b pb-1 text-gray-700">{title}</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">{children}</dl>
        </div>
    );
}

function InfoItem({ label, value, highlight = false }) {
    return (
        <div className={highlight ? 'bg-emerald-50 p-2 rounded-md' : ''}>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 font-medium">{value || 'Não informado'}</dd>
        </div>
    );
}
