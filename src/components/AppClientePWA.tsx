import React, { useState, useEffect } from 'react';
import {
  Car,
  Calendar,
  Award,
  User,
  LogIn,
  UserPlus,
  MapPin,
  Smartphone,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
  Flag,
  Sparkles,
  ShieldCheck,
  Ticket,
  ArrowLeft,
  Phone,
  Tag,
  Gift,
  CheckCircle2,
  AlertTriangle,
  Info,
  CalendarCheck,
  Trash2,
  Share2,
  Plus
} from 'lucide-react';

// Interfaces de Estrutura de Dados Garantidas
export interface UnidadeLavaJato {
  id: string; // Slug identificador (ex: pitstop, ecowash)
  nomeFantasia: string;
  contato: string;
  corTematica: 'blue' | 'emerald' | 'indigo' | 'cyan' | 'amber';
}

export interface ClientePWA {
  nome: string;
  email: string;
  contato: string;
  cep: string;
  cidade: string;
  bairro: string;
  estado: string;
  tipoVeiculo: 'carro' | 'moto';
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  cor: string;
  pontosFidelidade: number;
}

export interface AgendamentoPWAItem {
  id: string;
  unidadeId: string; // Amarração crucial para o multi-inquilino
  data: string;
  horario: string;
  veiculo: string;
  servico: string;
  status: 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado';
}

interface AppClientePWAProps {
  unidadeNome?: string;
  onVoltarLogin: () => void;
  telaInicial?: 'login' | 'cadastro' | 'home' | 'agendar' | 'fidelidade';
}

export default function AppClientePWA({
  unidadeNome = 'Pit Stop Lava Jato',
  onVoltarLogin,
  telaInicial = 'home'
}: AppClientePWAProps) {
  // ==========================================
  // BANCO DE DADOS GLOBAL DE UNIDADES (MULTI-INQUILINO)
  // ==========================================
  const [bancoUnidades, setBancoUnidades] = useState<UnidadeLavaJato[]>(() => {
    const salvos = localStorage.getItem('hubwash_lava_jatos');
    if (salvos) {
      try {
        const parsed = JSON.parse(salvos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any, idx: number) => {
            const cores: Array<'blue' | 'emerald' | 'indigo' | 'cyan' | 'amber'> = ['blue', 'emerald', 'indigo', 'cyan', 'amber'];
            return {
              id: item.id || `unidade-${idx}`,
              nomeFantasia: item.nomeFantasia || 'Lava Jato',
              contato: item.contato || '',
              corTematica: cores[idx % cores.length]
            };
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'pitstop', nomeFantasia: 'Pit Stop Lava Jato', contato: '(11) 99999-8888', corTematica: 'blue' }
    ];
  });

  // CONFIGURAÇÃO DE FLUXO E IDENTIFICAÇÃO DA UNIDADE
  const [unidadeAtual, setUnidadeAtual] = useState<UnidadeLavaJato | null>(null);
  const [carregandoUnidade, setCarregandoUnidade] = useState(true);

  // ➡️ LÓGICA CRUCIAL MULTI-INQUILINO: IDENTIFICAR A UNIDADE PELA URL OU PROPS
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawSlug = params.get('unidade');
      const slugUnidade = rawSlug ? rawSlug.trim().toLowerCase() : null;

      if (slugUnidade) {
        // 1. Procura se a unidade existe na nossa lista de inquilinos
        const unidadeLocalizada = bancoUnidades.find(
          (u) => (u.id || '').trim().toLowerCase() === slugUnidade ||
                 (u.nomeFantasia || '').trim().toLowerCase() === slugUnidade
        );
        if (unidadeLocalizada) {
          setUnidadeAtual(unidadeLocalizada);
        } else {
          // 2. Se não estiver no banco do dispositivo móvel, cria a unidade dinamicamente
          const nomeFormatado = slugUnidade
            .split(/[-_]/)
            .filter(Boolean)
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' ');

          const nomeFinal = unidadeNome || (nomeFormatado.toLowerCase().includes('lava')
            ? nomeFormatado
            : `${nomeFormatado} Lava Jato`);

          const novaUnidade: UnidadeLavaJato = {
            id: slugUnidade,
            nomeFantasia: nomeFinal,
            contato: '(11) 99999-8888',
            corTematica: 'blue'
          };
          setUnidadeAtual(novaUnidade);
        }
      } else if (unidadeNome) {
        // Fallback para quando acessado via navegação interna do sistema
        const correspondente = bancoUnidades.find(
          (u) =>
            u.nomeFantasia.toLowerCase().includes(unidadeNome.toLowerCase()) ||
            unidadeNome.toLowerCase().includes((u.id || '').toLowerCase())
        ) || {
          id: 'unidade-atual',
          nomeFantasia: unidadeNome,
          contato: '(11) 99999-8888',
          corTematica: 'blue'
        };
        setUnidadeAtual(correspondente);
      } else {
        setUnidadeAtual(bancoUnidades[0] || {
          id: 'pitstop',
          nomeFantasia: 'Pit Stop Lava Jato',
          contato: '(11) 99999-8888',
          corTematica: 'blue'
        });
      }
    } catch (e) {
      console.error('Erro ao resolver unidade no cliente:', e);
      setUnidadeAtual(bancoUnidades[0] || {
        id: 'pitstop',
        nomeFantasia: 'Pit Stop Lava Jato',
        contato: '(11) 99999-8888',
        corTematica: 'blue'
      });
    } finally {
      setCarregandoUnidade(false);
    }
  }, [unidadeNome, bancoUnidades]);

  // ==========================================
  // CONFIGURAÇÃO DE ESTADOS GERAIS
  // ==========================================
  const [usuarioLogado, setUsuarioLogado] = useState<ClientePWA | null>(() => {
    const salvo = localStorage.getItem('hubwash_cliente_ativo');
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [telaAtiva, setTelaAtiva] = useState<'login' | 'cadastro' | 'home' | 'agendar' | 'fidelidade'>(() => {
    if (telaInicial) return telaInicial;
    const salvo = localStorage.getItem('hubwash_cliente_ativo');
    return salvo ? 'home' : 'login';
  });

  // TOAST E FEEDBACK VISUAL INTERNO (100% LIVRE DE ALERTS BLOQUEANTES)
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' | 'info' } | null>(null);

  const mostrarToast = (mensagem: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso') => {
    setToast({ mensagem, tipo });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // ESTADOS DO BANCO DE DADOS EM TEMPO REAL (LOCALSTORAGE + MULTI-INQUILINO)
  const [todosAgendamentos, setTodosAgendamentos] = useState<AgendamentoPWAItem[]>(() => {
    const salvos = localStorage.getItem('hubwash_agendamentos_pwa');
    if (salvos) {
      try {
        return JSON.parse(salvos);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Salva no LocalStorage
  useEffect(() => {
    localStorage.setItem('hubwash_agendamentos_pwa', JSON.stringify(todosAgendamentos));
  }, [todosAgendamentos]);

  // Salva Usuário no LocalStorage
  useEffect(() => {
    if (usuarioLogado) {
      localStorage.setItem('hubwash_cliente_ativo', JSON.stringify(usuarioLogado));
    } else {
      localStorage.removeItem('hubwash_cliente_ativo');
    }
  }, [usuarioLogado]);

  // CARROSSEL DE BANNERS (PROMOÇÕES DO LAVA-JATO)
  const bannersPromocionais = [
    {
      id: 1,
      titulo: 'Terça Maluca: Cera Grátis!',
      desc: 'Traga seu carro nesta terça e ganhe aplicação de cera carnaúba.',
      cor: 'from-blue-600 to-indigo-700',
      tag: 'Imperdível'
    },
    {
      id: 2,
      titulo: 'Fidelidade Premiada',
      desc: 'Complete 10 lavagens e ganhe uma ducha americana totalmente grátis.',
      cor: 'from-amber-600 to-red-700',
      tag: '10 Lavagens = Grátis'
    },
    {
      id: 3,
      titulo: 'Higienização de Ar Condicionado',
      desc: 'Proteja sua família com oxisanitização com 30% OFF neste mês.',
      cor: 'from-emerald-600 to-teal-700',
      tag: 'Saúde & Conforto'
    }
  ];
  const [bannerAtual, setBannerAtual] = useState(0);

  // LISTA DE HORÁRIOS DISPONÍVEIS SOLICITADOS (MANHÃ E TARDE)
  const horariosDisponiveis = [
    '07:00', '08:00', '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // FORMULÁRIO DE LOGIN
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // FORMULÁRIO DE CADASTRO DO CLIENTE + VEÍCULO
  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadContato, setCadContato] = useState('');
  const [cadCep, setCadCep] = useState('');
  const [cadCidade, setCadCidade] = useState('');
  const [cadBairro, setCadBairro] = useState('');
  const [cadEstado, setCadEstado] = useState('SP');
  const [cadTipo, setCadTipo] = useState<'carro' | 'moto'>('carro');
  const [cadMarca, setCadMarca] = useState('');
  const [cadModelo, setCadModelo] = useState('');
  const [cadAno, setCadAno] = useState('');
  const [cadPlaca, setCadPlaca] = useState('');
  const [cadCor, setCadCor] = useState('');

  // FORMULÁRIO DE NOVO AGENDAMENTO
  const hojeString = new Date().toISOString().split('T')[0];
  const [agendaData, setAgendaData] = useState(hojeString);
  const [agendaHora, setAgendaHora] = useState('');
  const [agendaServico, setAgendaServico] = useState('Lavagem Completa');

  // Lógica do Carrossel de Banners
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerAtual((prev) => (prev + 1) % bannersPromocionais.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannersPromocionais.length]);

  // FUNÇÃO DE CADASTRO DE CLIENTE
  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadNome.trim() || !cadEmail.trim() || !cadSenha.trim() || !cadPlaca.trim() || !cadModelo.trim()) {
      mostrarToast('Por favor, preencha todos os campos obrigatórios (*).', 'erro');
      return;
    }

    const novoCliente: ClientePWA = {
      nome: cadNome.trim(),
      email: cadEmail.trim(),
      contato: cadContato.trim() || '(11) 99999-0000',
      cep: cadCep.trim() || '01001-000',
      cidade: cadCidade.trim() || 'São Paulo',
      bairro: cadBairro.trim() || 'Centro',
      estado: cadEstado.trim() || 'SP',
      tipoVeiculo: cadTipo,
      marca: cadMarca.trim() || 'Marca',
      modelo: cadModelo.trim(),
      ano: cadAno.trim() || '2023',
      placa: cadPlaca.trim().toUpperCase(),
      cor: cadCor.trim() || 'Prata',
      pontosFidelidade: 3 // Inicia com 3 pontos bônus de boas-vindas
    };

    // Salva o cadastro do cliente
    localStorage.setItem(`hubwash_cliente_${cadEmail.trim().toLowerCase()}`, JSON.stringify(novoCliente));
    setLoginEmail(cadEmail.trim());
    setLoginSenha('');
    setTelaAtiva('login');
    mostrarToast('🎉 Cadastro concluído com sucesso! Faça login para acessar sua conta.', 'sucesso');
  };

  // FUNÇÃO DE LOGIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginSenha) {
      const salvo = localStorage.getItem(`hubwash_cliente_${loginEmail.trim().toLowerCase()}`);
      let cliente: ClientePWA;
      if (salvo) {
        try {
          cliente = JSON.parse(salvo);
        } catch {
          cliente = {
            nome: loginEmail.split('@')[0],
            email: loginEmail,
            contato: '(11) 98888-1111',
            cep: '01001-000',
            cidade: 'São Paulo',
            bairro: 'Centro',
            estado: 'SP',
            tipoVeiculo: 'carro',
            marca: 'Chevrolet',
            modelo: 'Onix Turbo',
            ano: '2023',
            placa: 'BRA2E19',
            cor: 'Preto Metálico',
            pontosFidelidade: 3
          };
        }
      } else {
        cliente = {
          nome: loginEmail.split('@')[0] || 'Cliente',
          email: loginEmail,
          contato: '(11) 98888-1111',
          cep: '01001-000',
          cidade: 'São Paulo',
          bairro: 'Centro',
          estado: 'SP',
          tipoVeiculo: 'carro',
          marca: 'Chevrolet',
          modelo: 'Onix Turbo',
          ano: '2023',
          placa: 'BRA2E19',
          cor: 'Preto Metálico',
          pontosFidelidade: 3
        };
      }
      setUsuarioLogado(cliente);
      setTelaAtiva('home');
      mostrarToast(`Bem-vindo de volta, ${cliente.nome}!`, 'sucesso');
    } else {
      mostrarToast('Informe o e-mail e a senha de acesso.', 'erro');
    }
  };

  // LÓGICA DE AGENDAMENTO COM TRAVA POR HORÁRIO E POR INQUILINO (MULTI-TENANT)
  const handleAgendarServico = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaData || !agendaHora || !unidadeAtual || !usuarioLogado) {
      mostrarToast('Selecione a data e o horário desejados.', 'erro');
      return;
    }

    // TRAVA MULTI-INQUILINO: Só bloqueia se o horário estiver ocupado NA MESMA UNIDADE
    const horarioOcupadoNaUnidade = todosAgendamentos.some(
      (ag) =>
        ag.unidadeId === unidadeAtual.id &&
        ag.data === agendaData &&
        ag.horario === agendaHora &&
        ag.status !== 'Cancelado'
    );

    if (horarioOcupadoNaUnidade) {
      mostrarToast(
        `⚠️ Atenção: O horário de ${agendaHora} já está preenchido no ${unidadeAtual.nomeFantasia}. Escolha outro horário.`,
        'erro'
      );
      return;
    }

    // Criar o agendamento amarrado exclusivamente a esta unidade
    const novoAgendamento: AgendamentoPWAItem = {
      id: String(Date.now()),
      unidadeId: unidadeAtual.id, // Amarração crucial para o multi-inquilino
      data: agendaData,
      horario: agendaHora,
      veiculo: `${usuarioLogado.modelo} (${usuarioLogado.placa})`,
      servico: agendaServico,
      status: 'Pendente'
    };

    setTodosAgendamentos([novoAgendamento, ...todosAgendamentos]);
    
    // Adiciona +1 Ponto de Fidelidade pelo agendamento
    const novosPontos = Math.min(10, usuarioLogado.pontosFidelidade + 1);
    setUsuarioLogado({ ...usuarioLogado, pontosFidelidade: novosPontos });

    mostrarToast('🎉 Agendamento enviado com sucesso para a empresa responsável!', 'sucesso');
    setTelaAtiva('home');
    setAgendaHora('');
  };

  // Resgatar Lavagem Grátis
  const handleResgatarLavagem = () => {
    if (!usuarioLogado) return;
    if (usuarioLogado.pontosFidelidade < 10) {
      mostrarToast(`Você possui ${usuarioLogado.pontosFidelidade}/10 pontos. Faltam ${10 - usuarioLogado.pontosFidelidade} lavagens!`, 'info');
      return;
    }

    setUsuarioLogado({ ...usuarioLogado, pontosFidelidade: 0 });
    mostrarToast('🎁 CUPOM RESGATADO COM SUCESSO! Apresente no balcão e ganhe sua Lavagem Grátis!', 'sucesso');
  };

  // Preenchimento de teste rápido no formulário de cadastro
  const preencherDadosTeste = () => {
    setCadNome('Carlos Eduardo Silva');
    setCadEmail('carlos@gmail.com');
    setCadSenha('123456');
    setCadContato('(11) 97777-8888');
    setCadCep('04538-133');
    setCadCidade('São Paulo');
    setCadBairro('Itaim Bibi');
    setCadEstado('SP');
    setCadTipo('carro');
    setCadMarca('Honda');
    setCadModelo('Civic Touring');
    setCadAno('2024');
    setCadPlaca('BRA9E99');
    setCadCor('Prata Platinum');
    mostrarToast('Dados de teste preenchidos!', 'info');
  };

  // Filtrar os agendamentos na tela para mostrar APENAS os da unidade atual
  const agendamentosExibidos = todosAgendamentos.filter((ag) => ag.unidadeId === unidadeAtual?.id);

  // Tela de Carregamento de segurança
  if (carregandoUnidade) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-medium text-xs">
        Carregando estrutura do aplicativo...
      </div>
    );
  }

  // ⚠️ BARREIRA DE PROTEÇÃO: Se a URL estiver errada ou sem unidade, bloqueia o acesso
  if (!unidadeAtual) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-sm bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="bg-amber-500/10 p-3 rounded-full text-amber-400 w-12 h-12 flex items-center justify-center mx-auto border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white">Acesso Não Autorizado</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Este aplicativo necessita de um identificador de lava-jato ativo para carregar os recursos.
          </p>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-[11px] text-left text-slate-400 space-y-2 font-mono">
            <div className="font-bold text-slate-300">Escolha uma unidade ativa:</div>
            {bancoUnidades.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUnidadeAtual(u)}
                className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs transition cursor-pointer flex items-center justify-between"
              >
                <span>{u.nomeFantasia}</span>
                <span className="text-[10px] text-slate-500">?unidade={u.id}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onVoltarLogin}
            className="w-full py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition cursor-pointer"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // COR DINÂMICA BASEADA NO INQUILINO ATIVO
  const getCorBotao = () => {
    switch (unidadeAtual.corTematica) {
      case 'emerald':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30';
      case 'indigo':
        return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30';
      case 'cyan':
        return 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/30';
      case 'amber':
        return 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30';
      default:
        return 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30';
    }
  };

  const corBadge = () => {
    switch (unidadeAtual.corTematica) {
      case 'emerald':
        return 'bg-emerald-600 text-white';
      case 'indigo':
        return 'bg-indigo-600 text-white';
      case 'cyan':
        return 'bg-cyan-600 text-white';
      case 'amber':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const corBotao = getCorBotao();
  const corIcone = corBadge();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans antialiased selection:bg-blue-500/30">
      
      {/* TOAST DE NOTIFICAÇÃO 100% FUNCIONAL E ESTILIZADO */}
      {toast && (
        <div className="fixed top-5 z-50 animate-bounce px-4">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md max-w-sm ${
            toast.tipo === 'sucesso' 
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50' 
              : toast.tipo === 'erro'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-200 shadow-rose-950/50'
              : 'bg-blue-950/95 border-blue-500/40 text-blue-200 shadow-blue-950/50'
          }`}>
            {toast.tipo === 'sucesso' && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
            {toast.tipo === 'erro' && <AlertTriangle size={18} className="text-rose-400 shrink-0" />}
            {toast.tipo === 'info' && <Info size={18} className="text-blue-400 shrink-0" />}
            <span>{toast.mensagem}</span>
          </div>
        </div>
      )}

      {/* CORPO DO APLICATIVO EM FORMATO MÓVEL (PWA CELULAR / APP DO CLIENTE) */}
      <div className="w-full max-w-md bg-slate-900 min-h-screen sm:min-h-[820px] sm:max-h-[90vh] sm:rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col justify-between relative">
        
        {/* TOPO DO APLICATIVO COM BOTÃO VOLTAR AO LOGIN SEMPRE ATIVO */}
        <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800/80 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl text-white shadow-md ${corIcone}`}>
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs tracking-tight text-white block leading-tight">{unidadeAtual.nomeFantasia}</span>
              <span className="text-[10px] text-cyan-400 font-medium">App do Cliente • <span className="font-mono text-slate-400">{unidadeAtual.id}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onVoltarLogin}
              className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-xl hover:bg-rose-600 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              title="Voltar à tela de Login / Terminal"
            >
              <ArrowLeft size={13} />
              <span>Login</span>
            </button>
          </div>
        </header>

        {/* CONTAINER DINÂMICO DE TELAS */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4">

          {/* ========================================== */}
          {/* TELA 1: LOGIN DO CLIENTE */}
          {/* ========================================== */}
          {telaAtiva === 'login' && (
            <div className="space-y-5 py-3">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-lg">
                  <LogIn size={22} />
                </div>
                <h2 className="text-lg font-extrabold text-white tracking-tight">Acesse sua Conta</h2>
                <p className="text-xs text-slate-400">Gerencie seus agendamentos e consulte seus pontos de fidelidade.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5 text-xs font-medium">
                <div className="space-y-1">
                  <label className="text-slate-400">Seu E-mail *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="marcos@email.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Sua Senha de Acesso *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={loginSenha}
                      onChange={e => setLoginSenha(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full ${corBotao} font-bold py-3 rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2`}
                >
                  <LogIn size={15} />
                  <span>Entrar no Aplicativo</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setTelaAtiva('cadastro')}
                  className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Não tem conta? Cadastre-se aqui
                </button>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TELA 2: CADASTRO DO CLIENTE + VEÍCULO */}
          {/* ========================================== */}
          {telaAtiva === 'cadastro' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2.5">
                <h2 className="text-base font-bold text-white">Criar Nova Conta</h2>
                <p className="text-[11px] text-slate-400">Cadastre seus dados e receba 3 pontos bônus!</p>
              </div>

              <form onSubmit={handleCadastro} className="space-y-3.5 text-xs">
                {/* Seção 1: Dados Pessoais */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} /> 1. Dados Pessoais
                  </span>

                  <div className="space-y-1">
                    <label className="text-slate-400">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={cadNome}
                      onChange={e => setCadNome(e.target.value)}
                      placeholder="Ex: João Carlos"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400">E-mail *</label>
                      <input
                        type="email"
                        required
                        value={cadEmail}
                        onChange={e => setCadEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400">Senha *</label>
                      <input
                        type="password"
                        required
                        value={cadSenha}
                        onChange={e => setCadSenha(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400">WhatsApp / Telefone</label>
                      <input
                        type="text"
                        value={cadContato}
                        onChange={e => setCadContato(e.target.value)}
                        placeholder="(11) 98888-7777"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400">CEP</label>
                      <input
                        type="text"
                        value={cadCep}
                        onChange={e => setCadCep(e.target.value)}
                        placeholder="01001-000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-slate-400">Cidade</label>
                      <input
                        type="text"
                        value={cadCidade}
                        onChange={e => setCadCidade(e.target.value)}
                        placeholder="São Paulo"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400">UF</label>
                      <input
                        type="text"
                        value={cadEstado}
                        onChange={e => setCadEstado(e.target.value)}
                        placeholder="SP"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 2: Dados do Veículo */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Car size={13} /> 2. Seu Veículo Principal
                  </span>

                  <div>
                    <label className="text-slate-400 mb-1 block">Tipo de Veículo</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCadTipo('carro')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          cadTipo === 'carro'
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Car size={14} /> Carro / SUV
                      </button>
                      <button
                        type="button"
                        onClick={() => setCadTipo('moto')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          cadTipo === 'moto'
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles size={14} /> Motocicleta
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400">Marca</label>
                      <input
                        type="text"
                        value={cadMarca}
                        onChange={e => setCadMarca(e.target.value)}
                        placeholder="Ex: Honda, Toyota"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400">Modelo *</label>
                      <input
                        type="text"
                        required
                        value={cadModelo}
                        onChange={e => setCadModelo(e.target.value)}
                        placeholder="Ex: Civic, Corolla"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-400">Placa *</label>
                      <input
                        type="text"
                        required
                        value={cadPlaca}
                        onChange={e => setCadPlaca(e.target.value.toUpperCase())}
                        placeholder="BRA2E19"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400">Cor</label>
                      <input
                        type="text"
                        value={cadCor}
                        onChange={e => setCadCor(e.target.value)}
                        placeholder="Preto"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400">Ano</label>
                      <input
                        type="text"
                        value={cadAno}
                        onChange={e => setCadAno(e.target.value)}
                        placeholder="2023"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full ${corBotao} font-bold py-3 rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2`}
                  >
                    <CheckCircle size={15} />
                    <span>Concluir Cadastro</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================== */}
          {/* TELA 3: HOME DO CLIENTE */}
          {/* ========================================== */}
          {telaAtiva === 'home' && usuarioLogado && (
            <div className="space-y-4">
              {/* Saudação e Perfil Rápido */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${corIcone} font-bold flex items-center justify-center text-sm shadow-md`}>
                    {usuarioLogado.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white leading-tight">Olá, {usuarioLogado.nome}</h3>
                    <p className="text-[11px] text-slate-400">
                      {usuarioLogado.modelo} • <span className="font-mono text-cyan-400">{usuarioLogado.placa}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUsuarioLogado(null);
                    setTelaAtiva('login');
                    mostrarToast('Você saiu da sua conta.', 'info');
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Trocar de Conta"
                >
                  Sair
                </button>
              </div>

              {/* CARROSSEL DE BANNERS PROMOCIONAIS */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-800">
                <div className={`p-4 bg-gradient-to-r ${bannersPromocionais[bannerAtual].cor} text-white min-h-[110px] flex flex-col justify-between transition-all duration-500`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 uppercase tracking-wider backdrop-blur-sm">
                      {bannersPromocionais[bannerAtual].tag}
                    </span>
                    <Sparkles size={14} className="text-amber-300 animate-pulse" />
                  </div>

                  <div>
                    <h4 className="font-bold text-sm leading-snug">{bannersPromocionais[bannerAtual].titulo}</h4>
                    <p className="text-[11px] text-white/80 mt-0.5 leading-tight">{bannersPromocionais[bannerAtual].desc}</p>
                  </div>

                  {/* Indicadores do Carrossel */}
                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    {bannersPromocionais.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBannerAtual(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          bannerAtual === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* CARTÃO DE FIDELIDADE RESUMO (CLIQUE VAI PRA ABA FIDELIDADE) */}
              <div
                onClick={() => setTelaAtiva('fidelidade')}
                className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 shadow-lg cursor-pointer transition space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Award size={16} />
                    </div>
                    <span className="text-xs font-bold text-white">Cartão Fidelidade ({unidadeAtual.nomeFantasia})</span>
                  </div>
                  <span className="text-xs font-extrabold text-amber-400">
                    {usuarioLogado.pontosFidelidade}/10 Selos
                  </span>
                </div>

                {/* Barra de Progresso */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(usuarioLogado.pontosFidelidade / 10) * 100}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>
                    {usuarioLogado.pontosFidelidade >= 10
                      ? '🎉 Você já pode resgatar 1 Lavagem Grátis!'
                      : `Faltam ${10 - usuarioLogado.pontosFidelidade} lavagens para sua cortesia.`}
                  </span>
                  <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">Ver →</span>
                </p>
              </div>

              {/* BOTÃO PRINCIPAL: AGENDAR NOVO HORÁRIO */}
              <button
                type="button"
                onClick={() => setTelaAtiva('agendar')}
                className={`w-full py-3.5 px-4 ${corBotao} font-bold rounded-2xl shadow-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer`}
              >
                <CalendarCheck size={16} />
                <span>Agendar no {unidadeAtual.nomeFantasia}</span>
              </button>

              {/* MEUS AGENDAMENTOS RECENTES NA UNIDADE */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock size={14} className="text-cyan-400" /> Agendamentos na Unidade
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Unidade: {agendamentosExibidos.length}</span>
                </div>

                {agendamentosExibidos.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                    Nenhum agendamento ativo nesta unidade ({unidadeAtual.nomeFantasia}).
                  </div>
                ) : (
                  <div className="space-y-2">
                    {agendamentosExibidos.map((ag) => (
                      <div
                        key={ag.id}
                        className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{ag.servico}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              ag.status === 'Confirmado'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : ag.status === 'Concluído'
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            }`}>
                              {ag.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            📅 {ag.data} às <strong className="text-white">{ag.horario}</strong>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block truncate max-w-[110px]">{ag.veiculo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TELA 4: AGENDAMENTO COM TRAVA DE HORÁRIO */}
          {/* ========================================== */}
          {telaAtiva === 'agendar' && usuarioLogado && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <button
                  type="button"
                  onClick={() => setTelaAtiva('home')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
                <h2 className="text-sm font-bold text-white">Agendar Serviço</h2>
                <div className="w-10" />
              </div>

              <form onSubmit={handleAgendarServico} className="space-y-4 text-xs font-medium">
                {/* Veículo Selecionado */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Veículo</span>
                    <span className="font-bold text-white text-xs">{usuarioLogado.modelo}</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold text-xs bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {usuarioLogado.placa}
                  </span>
                </div>

                {/* Seleção do Serviço */}
                <div className="space-y-1">
                  <label className="text-slate-400">Tipo de Serviço *</label>
                  <select
                    value={agendaServico}
                    onChange={e => setAgendaServico(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Lavagem Simples (Ducha)">Lavagem Simples (Ducha Rápida) - R$ 40,00</option>
                    <option value="Lavagem Completa">Lavagem Completa (Int. + Ext.) - R$ 80,00</option>
                    <option value="Ducha e Cera Carnaúba">Ducha e Cera Carnaúba - R$ 60,00</option>
                    <option value="Higienização Interna">Higienização Interna Completa - R$ 160,00</option>
                    <option value="Polimento & Cristalização">Polimento & Cristalização - R$ 350,00</option>
                  </select>
                </div>

                {/* Seleção da Data */}
                <div className="space-y-1">
                  <label className="text-slate-400">Escolha a Data *</label>
                  <input
                    type="date"
                    required
                    min={hojeString}
                    value={agendaData}
                    onChange={e => {
                      setAgendaData(e.target.value);
                      setAgendaHora(''); // Reseta horário ao mudar de data
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>

                {/* GRADE DE HORÁRIOS DISPONÍVEIS COM TRAVA EM TEMPO REAL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Clock size={13} className="text-cyan-400" /> Horários Disponíveis *
                    </label>
                    <span className="text-[10px] text-slate-500">Manhã & Tarde</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {horariosDisponiveis.map((h) => {
                      // Verifica se o horário já está ocupado na data selecionada PARA A UNIDADE ATUAL
                      const isOcupado = todosAgendamentos.some(
                        ag => ag.unidadeId === unidadeAtual.id && ag.data === agendaData && ag.horario === h && ag.status !== 'Cancelado'
                      );
                      const isSelecionado = agendaHora === h;

                      return (
                        <button
                          key={h}
                          type="button"
                          disabled={isOcupado}
                          onClick={() => setAgendaHora(h)}
                          className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex flex-col items-center justify-center border ${
                            isOcupado
                              ? 'bg-rose-950/30 border-rose-900/50 text-rose-500/50 cursor-not-allowed opacity-60 line-through'
                              : isSelecionado
                              ? `${corBotao} border-white/40 shadow-lg scale-105`
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-blue-500/60 hover:text-white'
                          }`}
                          title={isOcupado ? `Horário já reservado na unidade ${unidadeAtual.nomeFantasia}` : `Selecionar ${h}`}
                        >
                          <span>{h}</span>
                          <span className="text-[8px] font-sans font-normal mt-0.5">
                            {isOcupado ? 'Ocupado' : isSelecionado ? 'Escolhido' : 'Livre'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {agendaHora && (
                    <p className="text-[11px] text-emerald-400 font-semibold text-center pt-1">
                      ✓ Horário selecionado: <strong className="text-white">{agendaHora}</strong> no dia {agendaData} ({unidadeAtual.nomeFantasia})
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!agendaHora}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      agendaHora
                        ? `${corBotao}`
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle size={15} />
                    <span>Confirmar Agendamento no {unidadeAtual.nomeFantasia}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================== */}
          {/* TELA 5: PROGRAMA DE FIDELIDADE & SELOS */}
          {/* ========================================== */}
          {telaAtiva === 'fidelidade' && usuarioLogado && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <button
                  type="button"
                  onClick={() => setTelaAtiva('home')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
                <h2 className="text-sm font-bold text-white">Cartão Fidelidade Digital</h2>
                <div className="w-10" />
              </div>

              {/* Cartão Visual com os 10 Selos */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Programa VIP</span>
                    <h3 className="font-bold text-sm text-white">{unidadeAtual.nomeFantasia}</h3>
                  </div>
                  <Gift className="w-6 h-6 text-amber-400 animate-bounce" />
                </div>

                {/* Grade dos 10 Selos */}
                <div className="grid grid-cols-5 gap-2.5 py-2">
                  {Array.from({ length: 10 }).map((_, index) => {
                    const seloPreenchido = index < usuarioLogado.pontosFidelidade;
                    const isUltimo = index === 9;

                    return (
                      <div
                        key={index}
                        className={`aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          seloPreenchido
                            ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/30 font-bold'
                            : isUltimo
                            ? 'bg-amber-500/10 border-dashed border-amber-500/50 text-amber-400'
                            : 'bg-slate-950/80 border-slate-800 text-slate-600'
                        }`}
                      >
                        {seloPreenchido ? (
                          <CheckCircle2 size={20} className="text-slate-950 stroke-[2.5]" />
                        ) : isUltimo ? (
                          <Gift size={18} />
                        ) : (
                          <span className="text-xs font-mono font-semibold">{index + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">
                    {usuarioLogado.pontosFidelidade} de 10 Lavagens Realizadas
                  </p>
                  <p className="text-[11px] text-slate-400">
                    A cada lavagem concluída você ganha 1 selo. Ao completar 10 selos, sua próxima ducha é 100% gratuita!
                  </p>
                </div>

                {/* Botão de Resgatar Cortesia */}
                <button
                  type="button"
                  onClick={handleResgatarLavagem}
                  className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
                    usuarioLogado.pontosFidelidade >= 10
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-500 hover:bg-slate-750'
                  }`}
                >
                  <Gift size={16} />
                  <span>
                    {usuarioLogado.pontosFidelidade >= 10
                      ? 'Resgatar Minha Lavagem Grátis'
                      : `Faltam ${10 - usuarioLogado.pontosFidelidade} Selos`}
                  </span>
                </button>
              </div>

              {/* Informações adicionais */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400 space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" /> Regulamento do Programa
                </h4>
                <ul className="text-[11px] space-y-1 list-disc list-inside text-slate-400">
                  <li>Os pontos são creditados automaticamente após o pagamento no caixa.</li>
                  <li>A lavagem cortesia inclui Ducha Completa com cera líquida.</li>
                  <li>Pontos intransferíveis vinculados à placa {usuarioLogado.placa}.</li>
                </ul>
              </div>
            </div>
          )}

        </main>

        {/* BARRA INFERIOR DE NAVEGAÇÃO RÁPIDA (PWA BOTTOM BAR - SOMENTE NO PAINEL DO CLIENTE LOGADO) */}
        {usuarioLogado && telaAtiva !== 'login' && telaAtiva !== 'cadastro' && (
          <nav className="bg-slate-950 border-t border-slate-800 px-6 py-2.5 flex items-center justify-around z-30">
            <button
              type="button"
              onClick={() => setTelaAtiva('home')}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition cursor-pointer ${
                telaAtiva === 'home' ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Car size={18} />
              <span>Início</span>
            </button>

            <button
              type="button"
              onClick={() => setTelaAtiva('agendar')}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition cursor-pointer ${
                telaAtiva === 'agendar' ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Calendar size={18} />
              <span>Agendar</span>
            </button>

            <button
              type="button"
              onClick={() => setTelaAtiva('fidelidade')}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition cursor-pointer ${
                telaAtiva === 'fidelidade' ? 'text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Award size={18} />
              <span>Fidelidade</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
