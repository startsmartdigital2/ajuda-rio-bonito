// Onde: app/admin/page.js
// VERSÃO 6.0 - CÓDIGO COMPLETO - SEGURANÇA RESTAURADA + TODAS AS FUNCIONALIDADES

"use client";

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '../../lib/supabaseClient';

// --- COMPONENTE PRINCIPAL QUE CONTROLA O ACESSO ---
export default function AdminAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Verifica se a senha já foi validada na sessão atual
        if (sessionStorage.getItem('admin-auth') === 'true') {
            setIsAuthenticated(true);
            return;
        }

        // Pede a senha
        const password = prompt("Por favor, digite a senha para acessar a área administrativa:");
        
        // A SENHA DEVE SER A MESMA QUE VOCÊ DEFINIU ANTES
        // NOTA: Esta é uma segurança básica. Para produção real, um sistema de login seria mais seguro.
        if (password === "ajuda-rio-bonito-2024") { // <-- Usando a senha do .env.local (verifique se está correta)
            sessionStorage.setItem('admin-auth', 'true'); // Salva o estado de autenticação na sessão
            setIsAuthenticated(true);
        } else {
            alert("Senha incorreta. Acesso negado.");
            // Redireciona para a página inicial se a senha estiver errada
            window.location.href = '/'; 
        }
    }, []); // Executa apenas uma vez, quando o componente é montado

    // Se não estiver autenticado, mostra uma mensagem de carregamento/verificação
    if (!isAuthenticated) {
        return <div className="text-center p-10">Verificando autenticação...</div>;
    }

    // Se estiver autenticado, renderiza o painel de administração completo
    return <AdminPanel />;
}


// --- O PAINEL DE ADMINISTRAÇÃO COMPLETO ---
// (Todo o nosso código anterior agora está dentro deste componente)

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

function AdminPanel() {
    const [todasFamilias, setTodasFamilias] = useState([]);
    const [familiasFiltradas, setFamiliasFiltradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFamilia, setSelectedFamilia] = useState(null);

    const [filtroNome, setFiltroNome] = useState('');
    const [filtroEndereco, setFiltroEndereco] = useState('');
    const [filtroMoradia, setFiltroMoradia] = useState('Todas');
    const [filtroEmprego, setFiltroEmprego] = useState('Todas');
    const [filtroQualificacaoMoradia, setFiltroQualificacaoMoradia] = useState('Todas');
    const [filtroNecessidade, setFiltroNecessidade] = useState('Todas');

    const debouncedNome = useDebounce(filtroNome, 500);
    const debouncedEndereco = useDebounce(filtroEndereco, 500);
    const componentToPrintRef = useRef();

    const fetchFamilias = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('vitimas').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Erro ao buscar famílias:", error);
            setError("Não foi possível carregar os dados.");
        } else {
            setTodasFamilias(data);
            setFamiliasFiltradas(data);
        }
        setLoading(false);
    };

    useEffect(() => { fetchFamilias(); }, []);

    useEffect(() => {
        let familias = [...todasFamilias];
        if (debouncedNome) familias = familias.filter(f => f.nome_responsavel.toLowerCase().includes(debouncedNome.toLowerCase()));
        if (debouncedEndereco) familias = familias.filter(f => f.endereco_completo && f.endereco_completo.toLowerCase().includes(debouncedEndereco.toLowerCase()));
        if (filtroMoradia !== 'Todas') familias = familias.filter(f => f.situacao_moradia === filtroMoradia);
        if (filtroEmprego !== 'Todas') familias = familias.filter(f => f.situacao_emprego === filtroEmprego);
        if (filtroQualificacaoMoradia !== 'Todas') familias = familias.filter(f => f.qualificacao_moradia === filtroQualificacaoMoradia);
        if (filtroNecessidade !== 'Todas') {
            familias = familias.filter(f => f.lista_necessidades && f.lista_necessidades.includes(filtroNecessidade));
        }
        setFamiliasFiltradas(familias);
        if (selectedFamilia && !familias.find(f => f.id === selectedFamilia.id)) {
            setSelectedFamilia(null);
        }
    }, [debouncedNome, debouncedEndereco, filtroMoradia, filtroEmprego, filtroQualificacaoMoradia, filtroNecessidade, todasFamilias]);

    const limparTodosFiltros = () => {
        setFiltroNome('');
        setFiltroEndereco('');
        setFiltroMoradia('Todas');
        setFiltroEmprego('Todas');
        setFiltroQualificacaoMoradia('Todas');
        setFiltroNecessidade('Todas');
    };

    const handlePrint = useReactToPrint({
        content: () => componentToPrintRef.current,
        documentTitle: `Detalhes_Familia_${selectedFamilia?.nome_responsavel.replace(/\s/g, '_') || 'N/A'}`,
    });

    if (loading) return <div className="text-center p-10">Carregando...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
                    <p className="text-gray-600">Visualize, filtre e gerencie os cadastros das famílias.</p>
                </header>

                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold mb-3">Filtros de Busca</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <FilterInput label="Nome do Responsável" value={filtroNome} onChange={setFiltroNome} placeholder="Digite um nome..." />
                        <FilterInput label="Endereço" value={filtroEndereco} onChange={setFiltroEndereco} placeholder="Digite um endereço..." />
                        <FilterSelect label="Filtrar por Necessidade" value={filtroNecessidade} onChange={setFiltroNecessidade} options={todasAsNecessidades} />
                        <FilterSelect label="Situação da Moradia" value={filtroMoradia} onChange={setFiltroMoradia} options={['Própria', 'Alugada']} />
                        <FilterSelect label="Qualificação da Moradia" value={filtroQualificacaoMoradia} onChange={setFiltroQualificacaoMoradia} options={['Habitável com danos', 'Inabitável (Temporário)', 'Inabitável (Permanente / Perda total)']} />
                        <FilterSelect label="Situação de Emprego" value={filtroEmprego} onChange={setFiltroEmprego} options={['Empregado(a)', 'Autônomo(a)', 'Desempregado(a)', 'Aposentado(a)/Pensionista']} />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={limparTodosFiltros} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Limpar Filtros</button>
                        <button onClick={handlePrint} disabled={!selectedFamilia} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:bg-gray-300">Imprimir Selecionado</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-xl font-semibold mb-4">Famílias Encontradas ({familiasFiltradas.length})</h2>
                        <div className="overflow-y-auto max-h-[60vh]">
                            <ul className="divide-y divide-gray-200">
                                {familiasFiltradas.map((familia) => (
                                    <li key={familia.id} onClick={() => setSelectedFamilia(familia)} className={`p-3 cursor-pointer hover:bg-emerald-50 ${selectedFamilia?.id === familia.id ? 'bg-emerald-100' : ''}`}>
                                        <p className="font-semibold text-emerald-800">{familia.nome_responsavel}</p>
                                        <p className="text-sm text-gray-500">{familia.cpf_responsavel}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        {selectedFamilia ? (
                            <div ref={componentToPrintRef} className="bg-white rounded-lg shadow-md p-6 print-container">
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

// --- Componentes Auxiliares para um código mais limpo ---
function FilterInput({ label, value, onChange, placeholder }) {
    return (
        <div>
            <label htmlFor={`filtro-${label}`} className="block text-sm font-medium text-gray-700">{label}</label>
            <input type="text" id={`filtro-${label}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
    );
}

function FilterSelect({ label, value, onChange, options }) {
    return (
        <div>
            <label htmlFor={`filtro-${label}`} className="block text-sm font-medium text-gray-700">{label}</label>
            <select id={`filtro-${label}`} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option>Todas</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
}

function DetalhesSection({ title, children }) {
    return (
        <div>
            <h3 className="font-semibold text-lg mb-2 border-b pb-1">{title}</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
        </div>
    );
}

function InfoItem({ label, value, highlight = false }) {
    return (
        <div className={highlight ? 'bg-blue-50 p-2 rounded-md' : ''}>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 font-medium">{value || 'Não informado'}</dd>
        </div>
    );
}
