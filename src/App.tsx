// @ts-ignore
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Car, Calendar, Award, Building2, AlertTriangle, XCircle, User } from 'lucide-react';

// ==========================================
// CONFIGURAÇÃO SEGURA DO FIREBASE (VIA .ENV)
// ==========================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa o Firebase apontando para o banco padrão (default)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const URL_BASE_NETLIFY = 'https://netlify.app';

interface UnidadeLavaJato {
  id: string;
  nomeFantasia: string;
}

interface Cliente {
  id?: string;
  nome: string;
  email: string;
  senhaAcesso: string;
  unidadeVinculadaId: string;
  contato: string;
  modelo: string;
  placa: string;
  pontosFidelidade: number;
}

interface Agendamento {
  id: string;
  unidadeId: string;
  data: string;
  horario: string;
  veiculo: string;
  servico: string;
  status: string;
}

export default function App() {
  const [unidadeAtual, setUnidadeAtual] = useState<UnidadeLavaJato | null>(null);
  const [modoVisao, setModoVisao] = useState<'gerente_empresa' | 'app_cliente'>('app_cliente');
  const [carregando, setCarregando] = useState(true);

  // Listas reais sincronizadas com o Firebase Firestore
  const [clientesBanco, setClientesBanco] = useState<Cliente[]>([]);
  const [agendamentosBanco, setAgendamentosBanco] = useState<Agendamento[]>([]);

  // Estados do Usuário Logado no celular
  const [usuarioLogado, setUsuarioLogado] = useState<Cliente | null>(null);
  const [telaClienteAtiva, setTelaClienteAtiva] = useState<'cadastro' | 'login' | 'home' | 'agendar'>('cadastro');
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);

  // Formulários
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadNome, setCadNome] = useState('');
  const [cadContato, setCadContato] = useState('');
  const [cadModelo, setCadModelo] = useState('');
  const [cadPlaca, setCadPlaca] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [agendaData, setAgendaData] = useState('');
  const [agendaHora, setAgendaHora] = useState('');
  const [agendaServico, setAgendaServico] = useState('Lavagem Completa');

  const bancoUnidades: UnidadeLavaJato[] = [
    { id: 'ducha-express', nomeFantasia: 'Ducha Express Lava Jato' },
    { id: 'ecobrilho', nomeFantasia: 'EcoBrilho Estética Automotiva' },
    { id: 'pitstop', nomeFantasia: 'Pit Stop Lava Jato' }
  ];

  // 🔄 LEITURA INTELIGENTE DE ROTAS E SESSÃO SALVA
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slugURL = params.get('unidade');
    const rotaURL = params.get('rota');

    let unidadeIdDefinida = '';

    if (slugURL) {
      unidadeIdDefinida = slugURL.toLowerCase().trim();
      localStorage.setItem('hubwash_inquilino_preferido', unidadeIdDefinida);
    } else {
      unidadeIdDefinida = localStorage.getItem('hubwash_inquilino_preferido') || '';
    }

    const unidadeLocalizada = bancoUnidades.find(u => u.id === unidadeIdDefinida);
    if (unidadeLocalizada) {
      setUnidadeAtual(unidadeLocalizada);
      
      if (rotaURL === 'cliente' || !slugURL) {
        setModoVisao('app_cliente');
        // Verifica se o cliente já estava logado antes neste celular para não mandar para o cadastro
        const sessaoSalva = localStorage.getItem('hubwash_cliente_sessao');
        if (sessaoSalva) {
          setUsuarioLogado(JSON.parse(sessaoSalva));
          setTelaClienteAtiva('home');
        } else {
          setTelaClienteAtiva('cadastro');
        }
      } else {
        setModoVisao('gerente_empresa');
      }
    }
    setCarregando(false);
  }, []);

  // 🛰️ ESCUTA DO FIRESTORE EM TEMPO REAL PARA O NOTEBOOK E CELULAR
  useEffect(() => {
    if (!unidadeAtual) return;

    // Sincroniza Clientes
    const qClientes = query(collection(db, 'clientes'), where('unidadeVinculadaId', '==', unidadeAtual.id));
    const unsubClientes = onSnapshot(qClientes, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente));
      setClientesBanco(lista);
    });

    // Sincroniza Agendamentos
    const qAgendamentos = query(collection(db, 'agendamentos'), where('unidadeId', '==', unidadeAtual.id));
    const unsubAgendamentos = onSnapshot(qAgendamentos, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agendamento));
      setAgendamentosBanco(lista);
    });

    return () => {
      unsubClientes();
      unsubAgendamentos();
    };
  }, [unidadeAtual]);

  // ➡️ CADASTRO SEGURO COM TRAVA ANTI-DUPLICAÇÃO
  const handleCadastroCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadNome || !cadEmail || !cadSenha || !cadPlaca || !unidadeAtual || enviandoFormulario) return;

    setEnviandoFormulario(true); // Liga a trava eletrônica de clique

    try {
      const novoCliente: Cliente = {
        nome: cadNome,
        email: cadEmail.toLowerCase().trim(),
        senhaAcesso: cadSenha,
        unidadeVinculadaId: unidadeAtual.id,
        contato: cadContato,
        modelo: cadModelo,
        placa: cadPlaca.toUpperCase().trim(),
        pontosFidelidade: 0
      };

      await addDoc(collection(db, 'clientes'), novoCliente);
      
      // Salva na memória do telefone para nunca mais deslogar sozinho
      localStorage.setItem('hubwash_cliente_sessao', JSON.stringify(novoCliente));
      
      setUsuarioLogado(novoCliente);
      setTelaClienteAtiva('home'); // Avança de tela imediatamente
      
      // Limpa os campos do formulário
      setCadNome(''); setCadEmail(''); setCadSenha(''); setCadContato(''); setCadModelo(''); setCadPlaca('');
      alert('Cadastro realizado com sucesso!');
    } catch (erro) {
      alert('Erro ao salvar no banco.');
    } finally {
      setEnviandoFormulario(false); // Desliga a trava
    }
  };

  // ➡️ LOGIN REAL
  const handleLoginCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginSenha || !unidadeAtual) return;

    const encontrado = clientesBanco.find(
      c => c.email.toLowerCase() === loginEmail.toLowerCase().trim() && c.senhaAcesso === loginSenha
    );

    if (encontrado) {
      localStorage.setItem('hubwash_cliente_sessao', JSON.stringify(encontrado));
      setUsuarioLogado(encontrado);
      setTelaClienteAtiva('home');
    } else {
      alert('E-mail ou senha incorretos.');
    }
  };

  // ➡️ AGENDAMENTO REAL COM TRAVA DE DOIS CLIQUES
  const handleAgendarServico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaData || !agendaHora || !unidadeAtual || !usuarioLogado || enviandoFormulario) return;

    const jaOcupado = agendamentosBanco.some(ag => ag.data === agendaData && ag.horario === agendaHora);
    if (jaOcupado) {
      alert('Esse horário já foi preenchido!');
      return;
    }

    setEnviandoFormulario(true);

    try {
      await addDoc(collection(db, 'agendamentos'), {
        unidadeId: unidadeAtual.id,
        data: agendaData,
        horario: agendaHora,
        veiculo: `${usuarioLogado.modelo} (${usuarioLogado.placa})`,
        servico: agendaServico,
        status: 'Pendente'
      });

      alert('Agendamento solicitado com sucesso!');
      setTelaClienteAtiva('home');
      setAgendaData(''); setAgendaHora('');
    } catch (erro) {
      alert('Erro ao agendar.');
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const handleCancelarAgendamento = async (id: string) => {
    if (window.confirm('Deseja cancelar esse serviço?')) {
      await deleteDoc(doc(db, 'agendamentos', id));
      alert('Agendamento cancelado.');
    }
  };

  if (carregando) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-xs font-mono text-slate-400">Conectando...</div>;
  if (!unidadeAtual) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-xs font-bold text-white"><AlertTriangle className="mr-2 text-amber-400" /> Use o QR Code oficial da empresa.</div>;

  // VISÃO 1: CELULAR DO CLIENTE
  if (modoVisao === 'app_cliente') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md bg-slate-800 min-h-screen sm:min-h-[700px] flex flex-col justify-between overflow-hidden sm:rounded-3xl border border-slate-700/60 shadow-2xl">
          <header className="bg-slate-950 border-b border-slate-800 px-5 py-4 flex justify-between items-center">
            <span className="font-bold text-xs text-white uppercase tracking-wider">{unidadeAtual.nomeFantasia}</span>
            {usuarioLogado && <button onClick={() => { localStorage.removeItem('hubwash_cliente_sessao'); setUsuarioLogado(null); setTelaClienteAtiva('login'); }} className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-1 rounded-lg font-bold">Sair</button>}
          </header>

          <main className="flex-1 p-5 overflow-y-auto space-y-4">
            {telaClienteAtiva === 'cadastro' && (
              <form onSubmit={handleCadastroCliente} className="space-y-3 text-xs font-semibold">
