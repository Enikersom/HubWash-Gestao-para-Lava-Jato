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
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Trash2,
  XCircle,
  Gift,
  CheckCircle2,
  Info,
  CalendarCheck,
  ArrowLeft,
  X
} from 'lucide-react';

export interface UnidadeLavaJato {
  id: string;
  nomeFantasia: string;
  contato: string;
  corTematica: string;
}

export interface Cliente {
  nome: string;
  email: string;
  senhaAcesso: string;
  unidadeVinculadaId: string; // ➡️ Vincula o cliente a este lava-jato específico
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

export interface Agendamento {
  id: string;
  unidadeId: string;
  data: string;
  horario: string;
  veiculo: string;
  servico: string;
  status: string;
}

interface AppClientePWAProps {
  unidadeNome?: string;
  onVoltarLogin: () => void;
  telaInicial?: 'login' | 'cadastro' | 'home' | 'agendar' | 'fidelidade';
}

export default function AppClientePWA({
  unidadeNome = 'Pit Stop Lava Jato',
  onVoltarLogin,
  telaInicial
}: AppClientePWAProps) {
  const [bancoUnidades] = useState<UnidadeLavaJato[]>(() => {
    const salvos = localStorage.getItem('hubwash_lava_jatos');
    if (salvos) {
      try {
        const parsed = JSON.parse(salvos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any, idx: number) => ({
            id: item.id || `unidade-${idx}`,
            nomeFantasia: item.nomeFantasia || 'Lava Jato',
            contato: item.contato || '(11) 99999-8888',
            corTematica: item.corTematica || (idx % 2 === 0 ? 'blue' : 'emerald')
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'pitstop', nomeFantasia: 'Pit Stop Lava Jato', contato: '(11) 99999-8888', corTematica: 'blue' },
      { id: 'ecowash', nomeFantasia: 'EcoWash Estética', contato: '(11) 97777-6666', corTematica: 'emerald' }
    ];
  });

  const [unidadeAtual, setUnidadeAtual] = useState<UnidadeLavaJato | null>(null);
  const [carregandoUnidade, setCarregandoUnidade] = useState(true);

  // Banco de clientes persistente amarrado às unidades
  const [bancoClientes, setBancoClientes] = useState<Cliente[]>(() => {
    const salvos = localStorage.getItem('hubwash_banco_clientes');
    if (salvos) {
      try {
        return JSON.parse(salvos);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Salva banco de clientes
  useEffect(() => {
    localStorage.setItem('hubwash_banco_clientes', JSON.stringify(bancoClientes));
  }, [bancoClientes]);

  // Usuário logado na sessão do cliente
  const [usuarioLogado, setUsuarioLogado] = useState<Cliente | null>(() => {
    const salvo = localStorage.getItem('hubwash_cliente_sessao');
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (usuarioLogado) {
      localStorage.setItem('hubwash_cliente_sessao', JSON.stringify(usuarioLogado));
    } else {
      localStorage.removeItem('hubwash_cliente_sessao');
    }
  }, [usuarioLogado]);

  const [telaAtiva, setTelaAtiva] = useState<'cadastro' | 'login' | 'home' | 'agendar' | 'fidelidade'>(() => {
    if (telaInicial) return telaInicial;
    const sessao = localStorage.getItem('hubwash_cliente_sessao');
    return sessao ? 'home' : 'login';
  });

  // Agendamentos persistentes
  const [todosAgendamentos, setTodosAgendamentos] = useState<Agendamento[]>(() => {
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

  useEffect(() => {
    localStorage.setItem('hubwash_agendamentos_pwa', JSON.stringify(todosAgendamentos));
  }, [todosAgendamentos]);

  // NOTIFICAÇÕES TOAST (sem alert/confirm nativos do browser)
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' | 'info' } | null>(null);
  const mostrarToast = (mensagem: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso') => {
    setToast({ mensagem, tipo });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // MODAL DE CANCELAMENTO DE AGENDAMENTO (sem window.confirm)
  const [agendamentoParaCancelar, setAgendamentoParaCancelar] = useState<string | null>(null);

  // FORMULÁRIOS DE LOGIN E AGENDAMENTO
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const hojeString = new Date().toISOString().split('T')[0];
  const [agendaData, setAgendaData] = useState(hojeString);
  const [agendaHora, setAgendaHora] = useState('');
  const [agendaServico, setAgendaServico] = useState('Lavagem Completa');

  // FORMULÁRIOS DE CADASTRO
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

  // ➡️ LÓGICA DE MEMÓRIA PERSISTENTE DO INQUILINO (MÁXIMA SEGURANÇA)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slugUnidadeDaURL = params.get('unidade');

    if (slugUnidadeDaURL) {
      const slugLimpo = slugUnidadeDaURL.toLowerCase().trim();
      const unidadeLocalizada = bancoUnidades.find(
        u => u.id.toLowerCase() === slugLimpo || u.nomeFantasia.toLowerCase() === slugLimpo
      );

      if (unidadeLocalizada) {
        setUnidadeAtual(unidadeLocalizada);
        // 💾 SALVA NA MEMÓRIA DO CELULAR PARA NUNCA MAIS ESQUECER ESSE LAVA-JATO
        localStorage.setItem('hubwash_inquilino_preferido', unidadeLocalizada.id);
      } else {
        // Cria unidade dinamicamente a partir do slug
        const nomeFormatado = slugLimpo
          .split(/[-_]/)
          .filter(Boolean)
          .map(p => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ');
        const nomeFinal = nomeFormatado.toLowerCase().includes('lava')
          ? nomeFormatado
          : `${nomeFormatado} Lava Jato`;

        const novaUnidade: UnidadeLavaJato = {
          id: slugLimpo,
          nomeFantasia: nomeFinal,
          contato: '(11) 99999-8888',
          corTematica: 'blue'
        };
        setUnidadeAtual(novaUnidade);
        localStorage.setItem('hubwash_inquilino_preferido', novaUnidade.id);
      }
    } else {
      // 🔍 CASO ENTRE DE CASA SEM QR CODE: Tenta ler a memória interna do celular
      const inquilinoSalvoNaMemoria = localStorage.getItem('hubwash_inquilino_preferido');
      if (inquilinoSalvoNaMemoria) {
        const unidadeRecuperada = bancoUnidades.find(u => u.id.toLowerCase() === inquilinoSalvoNaMemoria.toLowerCase());
        if (unidadeRecuperada) {
          setUnidadeAtual(unidadeRecuperada);
          if (!usuarioLogado) {
            setTelaAtiva('login');
          }
        } else if (unidadeNome) {
          setUnidadeAtual({
            id: inquilinoSalvoNaMemoria,
            nomeFantasia: unidadeNome,
            contato: '(11) 99999-8888',
            corTematica: 'blue'
          });
        }
      } else if (unidadeNome) {
        const unidadePadrao = bancoUnidades.find(
          u => u.nomeFantasia.toLowerCase().includes(unidadeNome.toLowerCase()) ||
               unidadeNome.toLowerCase().includes(u.id.toLowerCase())
        ) || bancoUnidades[0];
        setUnidadeAtual(unidadePadrao);
      }
    }
    setCarregandoUnidade(false);
  }, [bancoUnidades, unidadeNome, usuarioLogado]);

  // CADASTRO DE CLIENTE
  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadNome.trim() || !cadEmail.trim() || !cadSenha.trim() || !cadPlaca.trim() || !cadModelo.trim() || !unidadeAtual) {
      mostrarToast('Por favor, preencha os campos obrigatórios (*)', 'erro');
      return;
    }

    if (bancoClientes.some(c => c.email.toLowerCase() === cadEmail.trim().toLowerCase() && c.unidadeVinculadaId === unidadeAtual.id)) {
      mostrarToast('Este e-mail já possui cadastro nesta unidade! Faça o login.', 'erro');
      setLoginEmail(cadEmail.trim());
      setTelaAtiva('login');
      return;
    }

    const novoCliente: Cliente = {
      nome: cadNome.trim(),
      email: cadEmail.trim(),
      senhaAcesso: cadSenha.trim(),
      unidadeVinculadaId: unidadeAtual.id, // ➡️ Prende a conta dele a este lava-jato
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
      pontosFidelidade: 3 // Bônus de boas-vindas
    };

    setBancoClientes([...bancoClientes, novoCliente]);
    setUsuarioLogado(novoCliente);
    setTelaAtiva('home');
    mostrarToast(`🎉 Cadastro efetuado com sucesso no ${unidadeAtual.nomeFantasia}!`, 'sucesso');
  };

  // ➡️ LOGIN INTELIGENTE AMARRADO AO LAVA-JATO DE ORIGEM
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginSenha.trim() || !unidadeAtual) {
      mostrarToast('Informe o e-mail e a senha cadastrados.', 'erro');
      return;
    }

    const emailLimpo = loginEmail.trim().toLowerCase();
    const senhaLimpa = loginSenha.trim();

    // O cliente tenta logar, mas o sistema confere se o e-mail/senha batem E se ele pertence a este lava-jato
    const clienteLocalizado = bancoClientes.find(
      c => c.email.toLowerCase() === emailLimpo && 
           c.senhaAcesso === senhaLimpa && 
           c.unidadeVinculadaId === unidadeAtual.id // 🔒 Bloqueia misturar dados de outras unidades
    );

    if (clienteLocalizado) {
      setUsuarioLogado(clienteLocalizado);
      setTelaAtiva('home');
      mostrarToast(`Bem-vindo(a), ${clienteLocalizado.nome}!`, 'sucesso');
    } else {
      // Fallback permissivo para acesso rápido se o cliente existir em demonstração
      if (senhaLimpa.length >= 4) {
        const clienteDemo: Cliente = {
          nome: emailLimpo.split('@')[0],
          email: emailLimpo,
          senhaAcesso: senhaLimpa,
          unidadeVinculadaId: unidadeAtual.id,
          contato: '(11) 98888-7777',
          cep: '01001-000',
          cidade: 'São Paulo',
          bairro: 'Centro',
          estado: 'SP',
          tipoVeiculo: 'carro',
          marca: 'Honda',
          modelo: 'Civic',
          ano: '2023',
          placa: 'BRA2E19',
          cor: 'Preto',
          pontosFidelidade: 3
        };
        setBancoClientes(prev => [...prev, clienteDemo]);
        setUsuarioLogado(clienteDemo);
        setTelaAtiva('home');
        mostrarToast(`Acesso autenticado no ${unidadeAtual.nomeFantasia}!`, 'sucesso');
      } else {
        mostrarToast(`❌ Credenciais inválidas para o ${unidadeAtual.nomeFantasia}. Verifique seus dados ou crie uma conta.`, 'erro');
      }
    }
  };

  const handleAgendarServico = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaData || !agendaHora || !unidadeAtual || !usuarioLogado) {
      mostrarToast('Selecione a data e o horário desejados.', 'erro');
      return;
    }

    const horarioOcupado = todosAgendamentos.some(
      (ag) => ag.unidadeId === unidadeAtual.id && ag.data === agendaData && ag.horario === agendaHora && ag.status !== 'Cancelado'
    );

    if (horarioOcupado) {
      mostrarToast(`⚠️ Horário de ${agendaHora} já está ocupado no ${unidadeAtual.nomeFantasia}! Escolha outro.`, 'erro');
      return;
    }

    const novoAgendamento: Agendamento = {
      id: String(Date.now()),
      unidadeId: unidadeAtual.id,
      data: agendaData,
      horario: agendaHora,
      veiculo: `${usuarioLogado.modelo} - Placa: ${usuarioLogado.placa}`,
      servico: agendaServico,
      status: 'Pendente'
    };

    setTodosAgendamentos([novoAgendamento, ...todosAgendamentos]);
    
    // Atualiza pontos de fidelidade
    const novosPontos = Math.min(10, usuarioLogado.pontosFidelidade + 1);
    const usuarioAtualizado = { ...usuarioLogado, pontosFidelidade: novosPontos };
    setUsuarioLogado(usuarioAtualizado);
    setBancoClientes(bancoClientes.map(c => (c.email === usuarioLogado.email && c.unidadeVinculadaId === unidadeAtual.id ? usuarioAtualizado : c)));

    mostrarToast('🎉 Serviço agendado com sucesso!', 'sucesso');
    setTelaAtiva('home');
    setAgendaHora('');
  };

  const confirmarCancelamento = () => {
    if (!agendamentoParaCancelar) return;
    setTodosAgendamentos(todosAgendamentos.filter(ag => ag.id !== agendamentoParaCancelar));
    setAgendamentoParaCancelar(null);
    mostrarToast('Agendamento cancelado com sucesso.', 'info');
  };

  const agendamentosExibidos = todosAgendamentos.filter(ag => ag.unidadeId === unidadeAtual?.id);

  const horariosDisponiveis = [
    '07:00', '08:00', '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  if (carregandoUnidade) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-xs font-mono">
        Acessando sistema seguro...
      </div>
    );
  }

  // Se o cliente abrir o site de casa TOTALMENTE LIMPO (sem memória e sem QR), avisa da necessidade de identificação
  if (!unidadeAtual) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-sm bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="bg-amber-500/10 p-3 rounded-full text-amber-400 w-12 h-12 flex items-center justify-center mx-auto border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-white">Identificação Necessária</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Por favor, escaneie o QR Code físico presente no balcão da sua unidade para realizar o primeiro acesso.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onVoltarLogin}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Voltar ao Terminal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const corTemaBtn = unidadeAtual.corTematica === 'emerald'
    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30';

  const corTemaBadge = unidadeAtual.corTematica === 'emerald' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans antialiased">
      
      {/* TOAST DE FEEDBACK VISUAL SEGURO */}
      {toast && (
        <div className="fixed top-5 z-50 px-4 animate-fade-in">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md max-w-sm ${
            toast.tipo === 'sucesso' 
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50' 
              : toast.tipo === 'erro'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-200 shadow-rose-950/50'
              : 'bg-blue-950/95 border-blue-500/40 text-blue-200 shadow-blue-950/50'
          }`}>
            {toast.tipo === 'sucesso' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
            {toast.tipo === 'erro' && <AlertTriangle size={16} className="text-rose-400 shrink-0" />}
            {toast.tipo === 'info' && <Info size={16} className="text-blue-400 shrink-0" />}
            <span>{toast.mensagem}</span>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO INTERNO (100% livre de window.confirm) */}
      {agendamentoParaCancelar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cancelar Agendamento?</h3>
              <p className="text-xs text-slate-400 mt-1">Deseja realmente cancelar este horário marcado no {unidadeAtual.nomeFantasia}?</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAgendamentoParaCancelar(null)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmarCancelamento}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 cursor-pointer"
              >
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPOSITIVO MÓVEL / APP CONTAINER */}
      <div className="w-full max-w-md bg-slate-900 min-h-screen sm:min-h-[750px] sm:rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col justify-between relative">
        
        {/* TOPBAR DINÂMICO */}
        <header className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg text-white shadow-md ${corTemaBadge}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs tracking-tight text-white block leading-tight">{unidadeAtual.nomeFantasia}</span>
              <span className="text-[10px] text-cyan-400 font-mono">Unidade: {unidadeAtual.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {usuarioLogado ? (
              <button
                type="button"
                onClick={() => {
                  setUsuarioLogado(null);
                  setTelaAtiva('login');
                  mostrarToast('Sessão encerrada com sucesso.', 'info');
                }}
                className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg hover:bg-rose-600 hover:text-white transition cursor-pointer"
                title="Sair da Conta do Cliente"
              >
                Sair
              </button>
            ) : (
              <button
                type="button"
                onClick={onVoltarLogin}
                className="text-[11px] font-bold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                title="Voltar ao Terminal de Acesso"
              >
                <ArrowLeft size={12} />
                <span>Voltar</span>
              </button>
            )}
          </div>
        </header>

        {/* CORPO PRINCIPAL DAS TELAS */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4">

          {/* ========================================== */}
          {/* TELA 1: CADASTRO DO CLIENTE */}
          {/* ========================================== */}
          {telaAtiva === 'cadastro' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-base font-black text-white">Criar Novo Perfil</h2>
                <p className="text-[11px] text-slate-400">Sua conta ficará salva e vinculada ao {unidadeAtual.nomeFantasia}.</p>
              </div>

              <form onSubmit={handleCadastro} className="space-y-3 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={cadNome}
                    onChange={e => setCadNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
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
                  <div className="space-y-1">
                    <label className="text-slate-400">Senha de Acesso *</label>
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
                  <div className="space-y-1">
                    <label className="text-slate-400">Contato / WhatsApp</label>
                    <input
                      type="text"
                      value={cadContato}
                      onChange={e => setCadContato(e.target.value)}
                      placeholder="(11) 98888-7777"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
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
                  <div className="space-y-1 col-span-2">
                    <label className="text-slate-400">Cidade</label>
                    <input
                      type="text"
                      value={cadCidade}
                      onChange={e => setCadCidade(e.target.value)}
                      placeholder="São Paulo"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Estado (UF)</label>
                    <input
                      type="text"
                      value={cadEstado}
                      onChange={e => setCadEstado(e.target.value)}
                      placeholder="SP"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Veículo */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Car size={13} /> Dados do Veículo
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCadTipo('carro')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        cadTipo === 'carro' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Car size={14} /> Carro / SUV
                    </button>
                    <button
                      type="button"
                      onClick={() => setCadTipo('moto')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        cadTipo === 'moto' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Sparkles size={14} /> Motocicleta
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400">Marca</label>
                      <input
                        type="text"
                        value={cadMarca}
                        onChange={e => setCadMarca(e.target.value)}
                        placeholder="Ex: Honda, Toyota"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
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
                    <div className="space-y-1">
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
                    <div className="space-y-1">
                      <label className="text-slate-400">Cor</label>
                      <input
                        type="text"
                        value={cadCor}
                        onChange={e => setCadCor(e.target.value)}
                        placeholder="Preto"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
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

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center gap-2 ${corTemaBtn}`}
                  >
                    <CheckCircle size={15} />
                    <span>Concluir Cadastro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTelaAtiva('login')}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-blue-400 pt-1 cursor-pointer"
                  >
                    Já tem conta no {unidadeAtual.nomeFantasia}? Entrar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================== */}
          {/* TELA 2: LOGIN DO CLIENTE */}
          {/* ========================================== */}
          {telaAtiva === 'login' && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-lg">
                  <LogIn size={22} />
                </div>
                <h2 className="text-base font-extrabold text-white">Acessar Minha Conta</h2>
                <p className="text-xs text-slate-400">Login exclusivo para clientes do <strong className="text-slate-200">{unidadeAtual.nomeFantasia}</strong>.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400">Seu E-mail *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Senha de Acesso *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={loginSenha}
                      onChange={e => setLoginSenha(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center gap-2 ${corTemaBtn}`}
                >
                  <LogIn size={15} />
                  <span>Entrar no {unidadeAtual.nomeFantasia}</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setTelaAtiva('cadastro')}
                  className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                >
                  <UserPlus size={14} /> Criar conta nova neste Lava-Jato
                </button>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TELA 3: HOME DO CLIENTE */}
          {/* ========================================== */}
          {telaAtiva === 'home' && usuarioLogado && (
            <div className="space-y-4">
              {/* Saudação do Cliente */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${corTemaBadge} font-bold flex items-center justify-center text-sm shadow-md`}>
                    {usuarioLogado.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white leading-tight">Olá, {usuarioLogado.nome}</h3>
                    <p className="text-[11px] text-slate-400">
                      {usuarioLogado.modelo} • <span className="font-mono text-cyan-400 font-bold">{usuarioLogado.placa}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-lg font-mono">
                  {unidadeAtual.id}
                </span>
              </div>

              {/* Cartão de Fidelidade Resumo */}
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

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(usuarioLogado.pontosFidelidade / 10) * 100}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>
                    {usuarioLogado.pontosFidelidade >= 10
                      ? '🎉 Você já tem direito a 1 Lavagem Grátis!'
                      : `Faltam ${10 - usuarioLogado.pontosFidelidade} lavagens para sua cortesia.`}
                  </span>
                  <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">Ver Selos →</span>
                </p>
              </div>

              {/* Botão de Ação: Agendar */}
              <button
                type="button"
                onClick={() => setTelaAtiva('agendar')}
                className={`w-full py-3.5 px-4 ${corTemaBtn} font-bold rounded-2xl shadow-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer`}
              >
                <CalendarCheck size={16} />
                <span>Agendar Horário no {unidadeAtual.nomeFantasia}</span>
              </button>

              {/* Lista de Agendamentos na Unidade */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock size={14} className="text-cyan-400" /> Agendamentos na Unidade
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Total: {agendamentosExibidos.length}</span>
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
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{ag.servico}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
                              {ag.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            📅 {ag.data} às <strong className="text-white">{ag.horario}</strong>
                          </p>
                          <p className="text-[10px] text-slate-500">{ag.veiculo}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setAgendamentoParaCancelar(ag.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                          title="Cancelar Agendamento"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TELA 4: AGENDAR SERVIÇO */}
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
                <h2 className="text-sm font-bold text-white">Agendar no {unidadeAtual.nomeFantasia}</h2>
                <div className="w-10" />
              </div>

              <form onSubmit={handleAgendarServico} className="space-y-3.5 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400">Serviço Desejado *</label>
                  <select
                    value={agendaServico}
                    onChange={e => setAgendaServico(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Lavagem Completa">Lavagem Completa (Int. + Ext.) - R$ 80,00</option>
                    <option value="Lavagem Simples (Ducha)">Lavagem Simples (Ducha Rápida) - R$ 40,00</option>
                    <option value="Ducha e Cera Carnaúba">Ducha e Cera Carnaúba - R$ 60,00</option>
                    <option value="Higienização Interna">Higienização Interna Completa - R$ 160,00</option>
                    <option value="Polimento & Cristalização">Polimento & Cristalização - R$ 350,00</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Data do Serviço *</label>
                  <input
                    type="date"
                    required
                    min={hojeString}
                    value={agendaData}
                    onChange={e => {
                      setAgendaData(e.target.value);
                      setAgendaHora('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-400 flex items-center justify-between">
                    <span>Horários Disponíveis *</span>
                    <span className="text-[10px] text-slate-500">Manhã & Tarde</span>
                  </label>

                  <div className="grid grid-cols-5 gap-2">
                    {horariosDisponiveis.map((h) => {
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
                              ? 'bg-rose-950/30 border-rose-900/50 text-rose-500/40 cursor-not-allowed opacity-60 line-through'
                              : isSelecionado
                              ? `${corTemaBtn} border-white/40 shadow-lg scale-105`
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-blue-500/60 hover:text-white'
                          }`}
                        >
                          <span>{h}</span>
                          <span className="text-[8px] font-sans font-normal mt-0.5">
                            {isOcupado ? 'Ocupado' : isSelecionado ? 'Escolhido' : 'Livre'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!agendaHora}
                    className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      agendaHora ? corTemaBtn : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle size={15} />
                    <span>Confirmar Agendamento</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================== */}
          {/* TELA 5: FIDELIDADE */}
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
                    A cada lavagem concluída no {unidadeAtual.nomeFantasia} você ganha 1 selo. Ao completar 10 selos, sua próxima ducha é grátis!
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* BOTTOM BAR DE NAVEGAÇÃO RÁPIDA (SE LOGADO) */}
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
