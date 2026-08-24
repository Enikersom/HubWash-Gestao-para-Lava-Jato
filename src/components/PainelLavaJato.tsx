import React, { useState, useEffect } from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  Layers,
  CheckSquare,
  Wrench,
  Package,
  DollarSign,
  Award,
  Settings,
  Image as ImageIcon,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  Play,
  PackagePlus,
  Eye,
  Camera,
  Upload,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Paintbrush,
  LogOut,
  Car,
  AlertTriangle,
  Check,
  Fuel,
  Smartphone,
  Gift,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowLeft
} from 'lucide-react';
import { db, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from '../firebase';
import {
  ItemFila,
  Funcionario,
  MovimentacaoCaixa,
  ItemChecklist,
  ProdutoEstoque,
  ClienteFidelidade,
  BannerPromocional,
  AgendamentoPWA
} from '../types';

interface PainelLavaJatoProps {
  unidadeNome?: string;
  onLogout: () => void;
}

export default function PainelLavaJato({
  unidadeNome = 'Pit Stop Lava Jato',
  onLogout
}: PainelLavaJatoProps) {
  // CONFIGURAÇÃO DO MENU LATERAL RECOLHÍVEL
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<
    'fila' | 'agendamentos' | 'checklist' | 'clientes' | 'funcionarios' | 'produtos' | 'caixa' | 'banner' | 'configuracao'
  >('fila');

  // CONTROLADORES DE CORES PARA PERSONALIZAÇÃO DO APP
  const [corPrimaria, setCorPrimaria] = useState<'blue' | 'indigo' | 'emerald' | 'cyan' | 'violet' | 'amber'>('blue');
  const [nomeLavaJato, setNomeLavaJato] = useState(unidadeNome);

  // ESTADO DE FEEDBACK (TOAST & MODAL DE CONFIRMAÇÃO DE EXCLUSÃO)
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' | 'info' } | null>(null);
  const [itemParaExcluir, setItemParaExcluir] = useState<{
    tipo: 'fila' | 'agendamento' | 'checklist' | 'cliente' | 'funcionario' | 'produto' | 'movimentacao' | 'banner';
    id: string;
    nome: string;
  } | null>(null);

  const mostrarToast = (mensagem: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso') => {
    setToast({ mensagem, tipo });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ==========================================
  // 1. FILA DE LAVAGEM
  // ==========================================
  const [veiculosFila, setVeiculosFila] = useState<ItemFila[]>(() => {
    const salvos = localStorage.getItem('hubwash_fila');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [novoClienteFila, setNovoClienteFila] = useState('');
  const [novoVeiculoFila, setNovoVeiculoFila] = useState('');
  const [novoServicoFila, setNovoServicoFila] = useState('Lavagem Completa');
  const [novoValorFila, setNovoValorFila] = useState('80.00');
  const [novoFuncFila, setNovoFuncFila] = useState('');
  const [buscaFila, setBuscaFila] = useState('');

  useEffect(() => {
    localStorage.setItem('hubwash_fila', JSON.stringify(veiculosFila));
  }, [veiculosFila]);

  // ==========================================
  // 2. FUNCIONÁRIOS & COMISSÕES
  // ==========================================
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(() => {
    const salvos = localStorage.getItem('hubwash_funcionarios');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [novoFuncNome, setNovoFuncNome] = useState('');
  const [novoFuncCargo, setNovoFuncCargo] = useState('Lavador');
  const [novoFuncComissao, setNovoFuncComissao] = useState(30);
  const [novoFuncTel, setNovoFuncTel] = useState('');

  useEffect(() => {
    localStorage.setItem('hubwash_funcionarios', JSON.stringify(funcionarios));
  }, [funcionarios]);

  // ==========================================
  // 3. FLUXO DE CAIXA
  // ==========================================
  const [movimentacoesCaixa, setMovimentacoesCaixa] = useState<MovimentacaoCaixa[]>(() => {
    const salvos = localStorage.getItem('hubwash_caixa');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [novaDescCaixa, setNovaDescCaixa] = useState('');
  const [novoValorCaixa, setNovoValorCaixa] = useState('');
  const [novoTipoCaixa, setNovoTipoCaixa] = useState<'entrada' | 'saida'>('entrada');

  useEffect(() => {
    localStorage.setItem('hubwash_caixa', JSON.stringify(movimentacoesCaixa));
  }, [movimentacoesCaixa]);

  // ==========================================
  // 4. CHECKLIST COM FOTOS E AVARIAS
  // ==========================================
  const [checklists, setChecklists] = useState<ItemChecklist[]>(() => {
    const salvos = localStorage.getItem('hubwash_checklist');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [novoCheckVeiculo, setNovoCheckVeiculo] = useState('');
  const [novoCheckAvaria, setNovoCheckAvaria] = useState('');
  const [novoCheckCombustivel, setNovoCheckCombustivel] = useState('3/4');
  const [novoCheckPertences, setNovoCheckPertences] = useState('');

  useEffect(() => {
    localStorage.setItem('hubwash_checklist', JSON.stringify(checklists));
  }, [checklists]);

  // ==========================================
  // 5. PRODUTOS / ESTOQUE INTERNO
  // ==========================================
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>(() => {
    const salvos = localStorage.getItem('hubwash_produtos');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [novoProdNome, setNovoProdNome] = useState('');
  const [novoProdQtd, setNovoProdQtd] = useState('10');
  const [novoProdMin, setNovoProdMin] = useState('3');
  const [novoProdCat, setNovoProdCat] = useState('Geral');

  useEffect(() => {
    localStorage.setItem('hubwash_produtos', JSON.stringify(produtos));
  }, [produtos]);

  // ==========================================
  // 6. CLIENTES & FIDELIDADE
  // ==========================================
  const [clientes, setClientes] = useState<ClienteFidelidade[]>(() => {
    const salvos = localStorage.getItem('hubwash_clientes_fidelidade');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [novoCliNome, setNovoCliNome] = useState('');
  const [novoCliTel, setNovoCliTel] = useState('');
  const [novoCliVeiculo, setNovoCliVeiculo] = useState('');
  const [buscaCliente, setBuscaCliente] = useState('');

  useEffect(() => {
    localStorage.setItem('hubwash_clientes_fidelidade', JSON.stringify(clientes));
  }, [clientes]);

  // ==========================================
  // 7. AGENDAMENTOS PWA
  // ==========================================
  const [agendamentos, setAgendamentos] = useState<AgendamentoPWA[]>(() => {
    const salvos = localStorage.getItem('hubwash_agendamentos_painel');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [novoAgendCliente, setNovoAgendCliente] = useState('');
  const [novoAgendTel, setNovoAgendTel] = useState('');
  const [novoAgendVeiculo, setNovoAgendVeiculo] = useState('');
  const [novoAgendServico, setNovoAgendServico] = useState('Lavagem Completa');
  const [novoAgendHorario, setNovoAgendHorario] = useState('15:00');

  useEffect(() => {
    localStorage.setItem('hubwash_agendamentos_painel', JSON.stringify(agendamentos));
  }, [agendamentos]);

  // Helper para identificar se o documento do Firestore pertence a este lava-jato
  const slugUnidade = (unidadeNome || 'pitstop')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const pertenceAEstaUnidade = (docUnidadeId: string) => {
    if (!docUnidadeId) return true;
    const docLimpo = docUnidadeId.toLowerCase().trim();
    const nomeLimpo = (unidadeNome || '').toLowerCase().trim();
    const slugAtual = slugUnidade;
    return (
      docLimpo === slugAtual ||
      docLimpo === nomeLimpo ||
      nomeLimpo.includes(docLimpo) ||
      docLimpo.includes(slugAtual) ||
      (docLimpo.includes('pitstop') && slugAtual.includes('pitstop')) ||
      (docLimpo.includes('ducha') && slugAtual.includes('ducha')) ||
      (docLimpo.includes('express') && slugAtual.includes('express'))
    );
  };

  // ➡️ SINCRONIZAÇÃO EM TEMPO REAL COM FIREBASE FIRESTORE (CLIENTES E AGENDAMENTOS)
  useEffect(() => {
    if (!db) return;

    let unsubClientes: (() => void) | null = null;
    let unsubAgendamentos: (() => void) | null = null;

    try {
      // 1. Ouvir coleção 'clientes' em tempo real
      unsubClientes = onSnapshot(
        collection(db, 'clientes'),
        (snapshot) => {
          const clientesFirestore: ClienteFidelidade[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const clienteUnidade = data.unidadeVinculadaId || '';

            if (!clienteUnidade || pertenceAEstaUnidade(clienteUnidade)) {
              const veiculoFormatado = data.modelo
                ? `${data.modelo}${data.placa ? ` (${data.placa})` : ''}`
                : data.veiculoPrincipal || 'Veículo Cadastrado';

              clientesFirestore.push({
                id: docSnap.id,
                nome: data.nome || 'Cliente',
                telefone: data.contato || data.telefone || '(11) 99999-0000',
                veiculoPrincipal: veiculoFormatado,
                pontos: Number(data.pontosFidelidade) || 1,
                totalGasto: data.totalGasto || 0
              });
            }
          });

          if (clientesFirestore.length > 0) {
            setClientes((prev) => {
              const mapa = new Map<string, ClienteFidelidade>();
              prev.forEach((c) => mapa.set(c.id, c));
              clientesFirestore.forEach((c) => mapa.set(c.id, c));
              return Array.from(mapa.values());
            });
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot clientes (Painel):', error);
        }
      );

      // 2. Ouvir coleção 'agendamentos' em tempo real
      unsubAgendamentos = onSnapshot(
        collection(db, 'agendamentos'),
        (snapshot) => {
          const agendamentosFirestore: AgendamentoPWA[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (pertenceAEstaUnidade(data.unidadeId || '')) {
              agendamentosFirestore.push({
                id: docSnap.id,
                cliente: data.cliente || 'Cliente App',
                telefone: data.telefone || '(11) 99999-0000',
                veiculo: data.veiculo || 'Veículo Agendado',
                servico: data.servico || 'Lavagem Completa',
                data: data.data || 'Hoje',
                horario: data.horario || '12:00',
                status: (data.status as any) || 'Pendente'
              });
            }
          });

          if (agendamentosFirestore.length > 0) {
            setAgendamentos((prev) => {
              const mapa = new Map<string, AgendamentoPWA>();
              prev.forEach((ag) => mapa.set(ag.id, ag));
              agendamentosFirestore.forEach((ag) => mapa.set(ag.id, ag));
              return Array.from(mapa.values());
            });
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot agendamentos (Painel):', error);
        }
      );
    } catch (err) {
      console.warn('Erro ao configurar listeners do Firestore:', err);
    }

    return () => {
      if (unsubClientes) unsubClientes();
      if (unsubAgendamentos) unsubAgendamentos();
    };
  }, [unidadeNome]);

  // ==========================================
  // 8. BANNERS PROMOCIONAIS
  // ==========================================
  const [banners, setBanners] = useState<BannerPromocional[]>(() => {
    const salvos = localStorage.getItem('hubwash_banners');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [novoBannerTitulo, setNovoBannerTitulo] = useState('');
  const [novoBannerImg, setNovoBannerImg] = useState('');

  useEffect(() => {
    localStorage.setItem('hubwash_banners', JSON.stringify(banners));
  }, [banners]);

  // ==========================================
  // LOGICA: EXCLUSÃO CONFIRMADA (MODAL INTERNO)
  // ==========================================
  const confirmarExclusao = async () => {
    if (!itemParaExcluir) return;

    const { tipo, id, nome } = itemParaExcluir;

    if (tipo === 'fila') {
      setVeiculosFila(prev => prev.filter(item => item.id !== id));
    } else if (tipo === 'agendamento') {
      setAgendamentos(prev => prev.filter(item => item.id !== id));
      try {
        if (db && !id.startsWith('17') && isNaN(Number(id))) {
          await deleteDoc(doc(db, 'agendamentos', id));
        }
      } catch (err) {
        console.warn('Erro ao remover agendamento do Firestore:', err);
      }
    } else if (tipo === 'checklist') {
      setChecklists(prev => prev.filter(item => item.id !== id));
    } else if (tipo === 'cliente') {
      setClientes(prev => prev.filter(item => item.id !== id));
      try {
        if (db && !id.startsWith('17') && isNaN(Number(id))) {
          await deleteDoc(doc(db, 'clientes', id));
        }
      } catch (err) {
        console.warn('Erro ao remover cliente do Firestore:', err);
      }
    } else if (tipo === 'funcionario') {
      setFuncionarios(prev => prev.filter(item => item.id !== id));
    } else if (tipo === 'produto') {
      setProdutos(prev => prev.filter(item => item.id !== id));
    } else if (tipo === 'movimentacao') {
      setMovimentacoesCaixa(prev => prev.filter(item => item.id !== id));
    } else if (tipo === 'banner') {
      setBanners(prev => prev.filter(item => item.id !== id));
    }

    mostrarToast(`"${nome}" foi excluído com sucesso!`, 'info');
    setItemParaExcluir(null);
  };

  // ==========================================
  // FUNÇÕES DE AÇÃO
  // ==========================================

  // Avançar status da Fila
  const avancarStatusFila = (id: string) => {
    setVeiculosFila(veiculosFila.map(veiculo => {
      if (veiculo.id === id) {
        let proximoStatus: ItemFila['status'] = veiculo.status;

        if (veiculo.status === 'Espera') {
          proximoStatus = 'Lavando';
          mostrarToast(`Veículo "${veiculo.veiculo}" agora está em Lavagem!`, 'info');
        } else if (veiculo.status === 'Lavando') {
          proximoStatus = 'Pronto';
          // GERAR COMISSÃO AUTOMÁTICA
          const func = funcionarios.find(f => f.nome === veiculo.funcionario);
          const perc = func ? func.comissaoPorcentagem : 30;
          const valorComissao = (veiculo.valor * perc) / 100;

          setFuncionarios(funcionarios.map(f =>
            f.nome === veiculo.funcionario
              ? { ...f, totalComissaoAcumulada: f.totalComissaoAcumulada + valorComissao }
              : f
          ));

          // LANÇAR NO CAIXA AUTOMATICAMENTE
          setMovimentacoesCaixa([
            { id: String(Date.now()), descricao: `Recebimento: ${veiculo.servico} (${veiculo.veiculo})`, tipo: 'entrada', valor: veiculo.valor, data: 'Hoje' },
            ...movimentacoesCaixa
          ]);

          mostrarToast(`Veículo "${veiculo.veiculo}" pronto! R$ ${valorComissao.toFixed(2)} de comissão gerada e R$ ${veiculo.valor.toFixed(2)} lançado no Caixa.`, 'sucesso');
        } else if (veiculo.status === 'Pronto') {
          proximoStatus = 'Entregue';
          mostrarToast(`Veículo "${veiculo.veiculo}" finalizado e entregue ao cliente!`, 'sucesso');
        }

        return { ...veiculo, status: proximoStatus };
      }
      return veiculo;
    }));
  };

  // Adicionar Veículo na Fila
  const handleCadastrarFila = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoClienteFila.trim() || !novoVeiculoFila.trim()) {
      mostrarToast('Preencha o nome do cliente e veículo.', 'erro');
      return;
    }

    const novoItem: ItemFila = {
      id: String(Date.now()),
      cliente: novoClienteFila.trim(),
      veiculo: novoVeiculoFila.trim(),
      servico: novoServicoFila,
      status: 'Espera',
      funcionario: novoFuncFila,
      valor: parseFloat(novoValorFila) || 50,
      horaEntrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setVeiculosFila([novoItem, ...veiculosFila]);
    setNovoClienteFila('');
    setNovoVeiculoFila('');
    mostrarToast(`Veículo ${novoItem.veiculo} adicionado na fila de lavagem!`, 'sucesso');
  };

  // Pontos de Fidelidade
  const adicionarPontoCliente = (id: string) => {
    setClientes(clientes.map(c => {
      if (c.id === id) {
        const novosPontos = c.pontos + 1;
        if (novosPontos >= 10) {
          mostrarToast(`🎉 PARABÉNS! ${c.nome} atingiu 10 pontos e ganhou UMA LAVAGEM GRÁTIS!`, 'sucesso');
          return { ...c, pontos: 0 };
        }
        mostrarToast(`+1 Ponto adicionado para ${c.nome}. Total: ${novosPontos}/10`, 'sucesso');
        return { ...c, pontos: novosPontos };
      }
      return c;
    }));
  };

  // Cadastrar Cliente Fidelidade
  const handleCadastrarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCliNome.trim()) {
      mostrarToast('Digite o nome do cliente.', 'erro');
      return;
    }

    const tempId = String(Date.now());
    const novoCli: ClienteFidelidade = {
      id: tempId,
      nome: novoCliNome.trim(),
      telefone: novoCliTel.trim() || 'Não informado',
      veiculoPrincipal: novoCliVeiculo.trim() || 'Não informado',
      pontos: 1
    };

    setClientes([novoCli, ...clientes]);
    setNovoCliNome('');
    setNovoCliTel('');
    setNovoCliVeiculo('');

    try {
      if (db) {
        await addDoc(collection(db, 'clientes'), {
          nome: novoCli.nome,
          contato: novoCli.telefone,
          modelo: novoCli.veiculoPrincipal,
          placa: '',
          unidadeVinculadaId: slugUnidade,
          pontosFidelidade: 1,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Cliente salvo localmente (Firestore offline/não configurado):', err);
    }

    mostrarToast(`Cliente ${novoCli.nome} cadastrado com sucesso!`, 'sucesso');
  };

  // Cadastro de Funcionário
  const handleCadastrarFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoFuncNome.trim()) {
      mostrarToast('Digite o nome do funcionário.', 'erro');
      return;
    }

    const novo: Funcionario = {
      id: String(Date.now()),
      nome: novoFuncNome.trim(),
      cargo: novoFuncCargo,
      comissaoPorcentagem: Number(novoFuncComissao) || 30,
      totalComissaoAcumulada: 0,
      telefone: novoFuncTel.trim() || '(11) 90000-0000'
    };

    setFuncionarios([...funcionarios, novo]);
    setNovoFuncNome('');
    setNovoFuncTel('');
    mostrarToast(`Funcionário ${novo.nome} adicionado com comissão de ${novo.comissaoPorcentagem}%!`, 'sucesso');
  };

  // Zerar comissão do funcionário (pagamento realizado)
  const zerarComissao = (id: string, nome: string) => {
    setFuncionarios(funcionarios.map(f => f.id === id ? { ...f, totalComissaoAcumulada: 0 } : f));
    mostrarToast(`Comissão de ${nome} foi marcada como paga e zerada!`, 'sucesso');
  };

  // Criar Checklist com Avarias
  const handleSalvarChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCheckVeiculo.trim()) {
      mostrarToast('Informe o veículo para a vistoria.', 'erro');
      return;
    }

    const novo: ItemChecklist = {
      id: String(Date.now()),
      veiculo: novoCheckVeiculo.trim(),
      avarias: novoCheckAvaria.trim() || 'Nenhuma avaria observada',
      fotos: 3,
      data: new Date().toLocaleDateString('pt-BR'),
      nivelCombustivel: novoCheckCombustivel,
      pertences: novoCheckPertences.trim() || 'Nenhum'
    };

    setChecklists([novo, ...checklists]);
    setNovoCheckVeiculo('');
    setNovoCheckAvaria('');
    setNovoCheckPertences('');
    mostrarToast('Vistoria e Checklist registrados com sucesso!', 'sucesso');
  };

  // Lançamento de Caixa
  const handleAdicionarCaixa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaDescCaixa.trim() || !novoValorCaixa) {
      mostrarToast('Preencha a descrição e valor.', 'erro');
      return;
    }

    const nova: MovimentacaoCaixa = {
      id: String(Date.now()),
      descricao: novaDescCaixa.trim(),
      tipo: novoTipoCaixa,
      valor: parseFloat(novoValorCaixa) || 0,
      data: 'Hoje'
    };

    setMovimentacoesCaixa([nova, ...movimentacoesCaixa]);
    setNovaDescCaixa('');
    setNovoValorCaixa('');
    mostrarToast(`Lançamento de ${nova.tipo.toUpperCase()} no valor de R$ ${nova.valor.toFixed(2)} registrado!`, 'sucesso');
  };

  // Adicionar Estoque
  const handleAdicionarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoProdNome.trim()) {
      mostrarToast('Digite o nome do produto.', 'erro');
      return;
    }

    const novo: ProdutoEstoque = {
      id: String(Date.now()),
      nome: novoProdNome.trim(),
      estoque: parseInt(novoProdQtd) || 0,
      min: parseInt(novoProdMin) || 2,
      categoria: novoProdCat
    };

    setProdutos([...produtos, novo]);
    setNovoProdNome('');
    mostrarToast(`Produto "${novo.nome}" cadastrado no estoque!`, 'sucesso');
  };

  const ajustarEstoque = (id: string, delta: number) => {
    setProdutos(produtos.map(p => {
      if (p.id === id) {
        const novoEstoque = Math.max(0, p.estoque + delta);
        return { ...p, estoque: novoEstoque };
      }
      return p;
    }));
  };

  // Criar Agendamento
  const handleCriarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAgendCliente.trim() || !novoAgendVeiculo.trim()) {
      mostrarToast('Preencha cliente e veículo do agendamento.', 'erro');
      return;
    }

    const tempId = String(Date.now());
    const novo: AgendamentoPWA = {
      id: tempId,
      cliente: novoAgendCliente.trim(),
      telefone: novoAgendTel.trim() || '(11) 99999-0000',
      veiculo: novoAgendVeiculo.trim(),
      servico: novoAgendServico,
      data: 'Hoje',
      horario: novoAgendHorario,
      status: 'Confirmado'
    };

    setAgendamentos([novo, ...agendamentos]);
    setNovoAgendCliente('');
    setNovoAgendVeiculo('');
    setNovoAgendTel('');

    try {
      if (db) {
        await addDoc(collection(db, 'agendamentos'), {
          unidadeId: slugUnidade,
          cliente: novo.cliente,
          telefone: novo.telefone,
          veiculo: novo.veiculo,
          servico: novo.servico,
          data: novo.data,
          horario: novo.horario,
          status: novo.status,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Agendamento salvo localmente (Firestore offline/não configurado):', err);
    }

    mostrarToast(`Agendamento de ${novo.cliente} confirmado para as ${novo.horario}!`, 'sucesso');
  };

  // Adicionar Banner
  const handleAdicionarBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoBannerTitulo.trim()) {
      mostrarToast('Digite o título do banner promocional.', 'erro');
      return;
    }

    const novo: BannerPromocional = {
      id: String(Date.now()),
      titulo: novoBannerTitulo.trim(),
      status: 'Ativo',
      imagem: novoBannerImg.trim() || 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=60'
    };

    setBanners([novo, ...banners]);
    setNovoBannerTitulo('');
    setNovoBannerImg('');
    mostrarToast('Novo banner promocional publicado!', 'sucesso');
  };

  // Totais do Caixa
  const totalEntradas = movimentacoesCaixa.filter(m => m.tipo === 'entrada').reduce((acc, curr) => acc + curr.valor, 0);
  const totalSaidas = movimentacoesCaixa.filter(m => m.tipo === 'saida').reduce((acc, curr) => acc + curr.valor, 0);
  const saldoCaixa = totalEntradas - totalSaidas;

  // Classes de cor dinâmica do tema selecionado
  const temaClasses = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500', shadow: 'shadow-blue-900/30' },
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-400', border: 'border-indigo-500', shadow: 'shadow-indigo-900/30' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500', shadow: 'shadow-emerald-900/30' },
    cyan: { bg: 'bg-cyan-600', text: 'text-cyan-400', border: 'border-cyan-500', shadow: 'shadow-cyan-900/30' },
    violet: { bg: 'bg-violet-600', text: 'text-violet-400', border: 'border-violet-500', shadow: 'shadow-violet-900/30' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500', shadow: 'shadow-amber-900/30' }
  }[corPrimaria];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex antialiased selection:bg-blue-500/30">
      
      {/* TOAST DE NOTIFICAÇÃO */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${
            toast.tipo === 'sucesso' 
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200' 
              : toast.tipo === 'erro'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-200'
              : 'bg-blue-950/95 border-blue-500/40 text-blue-200'
          }`}>
            {toast.tipo === 'sucesso' && <CheckCircle2 size={16} className="text-emerald-400" />}
            {toast.tipo === 'erro' && <AlertTriangle size={16} className="text-rose-400" />}
            {toast.tipo === 'info' && <CheckCircle2 size={16} className="text-blue-400" />}
            <span>{toast.mensagem}</span>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO INTERNO (100% ATIVO E SEGURO) */}
      {itemParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Confirmar Exclusão</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Você tem certeza que deseja excluir permanentemente <strong className="text-white">"{itemParaExcluir.nome}"</strong>?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setItemParaExcluir(null)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                Excluir Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENUBAR LATERAL RECOLHÍVEL (SIDEBAR) */}
      <aside className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 relative z-30 shrink-0 ${sidebarAberta ? 'w-64' : 'w-20'}`}>
        <div>
          {/* Logo e Botão de Recolher */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            {sidebarAberta ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className={`p-2 rounded-xl ${temaClasses.bg} text-white shadow-lg`}>
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="font-bold text-sm tracking-tight text-white block truncate">{nomeLavaJato}</span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide">Gestão & PWA</span>
                </div>
              </div>
            ) : (
              <div className={`p-2 rounded-xl ${temaClasses.bg} text-white mx-auto shadow-lg`}>
                <Wrench className="w-5 h-5" />
              </div>
            )}
            <button 
              type="button"
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="absolute -right-3 top-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full p-1 text-slate-200 transition-colors z-50 shadow-md cursor-pointer"
              title={sidebarAberta ? 'Recolher Menu' : 'Expandir Menu'}
            >
              {sidebarAberta ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* ITENS DO MENU NAVEGAÇÃO */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'fila', label: 'Fila de Lavagem', icon: Layers },
              { id: 'agendamentos', label: 'Agendamentos PWA', icon: Calendar },
              { id: 'checklist', label: 'Checklist de Entrada', icon: CheckSquare },
              { id: 'clientes', label: 'Clientes & Fidelidade', icon: Users },
              { id: 'funcionarios', label: 'Funcionários / Comissão', icon: Wrench },
              { id: 'produtos', label: 'Estoque / Produtos', icon: Package },
              { id: 'caixa', label: 'Caixa Diário', icon: DollarSign },
              { id: 'banner', label: 'Banners Promocionais', icon: ImageIcon },
              { id: 'configuracao', label: 'Configurações App', icon: Settings },
            ].map((item) => {
              const Icone = item.icon;
              const ativo = abaAtiva === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAbaAtiva(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    ativo 
                      ? `${temaClasses.bg} text-white shadow-md ${temaClasses.shadow}` 
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                  title={item.label}
                >
                  <Icone className="w-4 h-4 shrink-0" />
                  {sidebarAberta && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-3.5 border-t border-slate-800 space-y-2">
          <p className="text-[10px] text-slate-500 font-mono text-center">
            {sidebarAberta ? 'Pit Stop v2.0 Realtime' : 'v2.0'}
          </p>
        </div>
      </aside>

      {/* ÁREA DO CONTEÚDO DA TELA DA DIREITA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOPBAR SUPERIOR COM BOTÃO VOLTAR AO LOGIN */}
        <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${temaClasses.bg}`} />
              {abaAtiva === 'fila' && 'Fila de Lavagens em Tempo Real'}
              {abaAtiva === 'agendamentos' && 'Agendamentos Online (PWA Clientes)'}
              {abaAtiva === 'checklist' && 'Checklist de Entrada & Vistoria'}
              {abaAtiva === 'clientes' && 'Clientes & Programa de Fidelidade'}
              {abaAtiva === 'funcionarios' && 'Funcionários & Comissões Automáticas'}
              {abaAtiva === 'produtos' && 'Controle de Estoque & Insumos'}
              {abaAtiva === 'caixa' && 'Caixa Diário & Movimentações'}
              {abaAtiva === 'banner' && 'Banners & Campanhas do App'}
              {abaAtiva === 'configuracao' && 'Configurações do Lava Jato'}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* BOTÃO DE RETORNO AO LOGIN SEMPRE ATIVO NO TOPO */}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition cursor-pointer shadow-sm shadow-rose-950/50"
              title="Voltar à tela de login / terminal OTP"
            >
              <ArrowLeft size={14} />
              <span>Voltar ao Login</span>
            </button>
          </div>
        </header>

        {/* CONTEÚDO DAS ABAS */}
        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* ========================================== */}
          {/* ABA 1: FILA DE LAVAGEM */}
          {/* ========================================== */}
          {abaAtiva === 'fila' && (
            <div className="space-y-6">
              {/* Formulário Rápido de Nova Entrada */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-400" /> Nova Entrada na Fila
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Total na Fila: <strong>{veiculosFila.filter(v => v.status !== 'Entregue').length}</strong>
                  </span>
                </div>

                <form onSubmit={handleCadastrarFila} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Cliente *</label>
                    <input
                      type="text"
                      value={novoClienteFila}
                      onChange={(e) => setNovoClienteFila(e.target.value)}
                      placeholder="Ex: João Ferreira"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Veículo / Placa *</label>
                    <input
                      type="text"
                      value={novoVeiculoFila}
                      onChange={(e) => setNovoVeiculoFila(e.target.value)}
                      placeholder="Ex: Corolla - ABC1234"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Serviço</label>
                    <select
                      value={novoServicoFila}
                      onChange={(e) => setNovoServicoFila(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Lavagem Simples">Lavagem Simples (Ducha)</option>
                      <option value="Lavagem Completa">Lavagem Completa</option>
                      <option value="Ducha e Cera">Ducha e Cera</option>
                      <option value="Higienização Interna">Higienização Interna</option>
                      <option value="Polimento e Cristalização">Polimento e Cristalização</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Lavador / Responsável</label>
                    <select
                      value={novoFuncFila}
                      onChange={(e) => setNovoFuncFila(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {funcionarios.map(f => (
                        <option key={f.id} value={f.nome}>{f.nome} ({f.comissaoPorcentagem}%)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={novoValorFila}
                      onChange={(e) => setNovoValorFila(e.target.value)}
                      placeholder="80.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className={`w-full py-2 px-3 ${temaClasses.bg} hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer`}
                    >
                      <Plus size={15} />
                      <span>Inserir</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Quadro da Fila (Colunas de Status ou Lista Interativa) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" /> Fila Ativa de Veículos
                  </h3>
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={buscaFila}
                      onChange={(e) => setBuscaFila(e.target.value)}
                      placeholder="Buscar placa, cliente..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {veiculosFila
                    .filter(v => 
                      v.cliente.toLowerCase().includes(buscaFila.toLowerCase()) ||
                      v.veiculo.toLowerCase().includes(buscaFila.toLowerCase())
                    )
                    .map((item) => {
                      const statusStyles = {
                        Espera: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', nextText: 'Iniciar Lavagem', nextIcon: Play },
                        Lavando: { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', nextText: 'Marcar Pronto', nextIcon: CheckCircle2 },
                        Pronto: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', nextText: 'Entregar Veículo', nextIcon: Check },
                        Entregue: { bg: 'bg-slate-800/60 border-slate-700/60 text-slate-400', nextText: 'Finalizado', nextIcon: CheckCircle2 }
                      }[item.status];

                      const IconeBotao = statusStyles.nextIcon;

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg hover:border-slate-700 transition"
                        >
                          <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                            <div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusStyles.bg}`}>
                                {item.status}
                              </span>
                              <h4 className="text-sm font-bold text-white mt-1.5">{item.veiculo}</h4>
                              <p className="text-xs text-slate-400">{item.cliente}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setItemParaExcluir({ tipo: 'fila', id: item.id, nome: `${item.veiculo} (${item.cliente})` })}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                              title="Remover da Fila"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Serviço</span>
                              <p className="font-semibold">{item.servico}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">Valor</span>
                              <p className="font-bold text-emerald-400">R$ {item.valor.toFixed(2)}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-slate-500 block">Responsável</span>
                              <p className="text-slate-300 font-medium">{item.funcionario}</p>
                            </div>
                          </div>

                          {item.status !== 'Entregue' ? (
                            <button
                              type="button"
                              onClick={() => avancarStatusFila(item.id)}
                              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <IconeBotao size={14} className="text-cyan-400" />
                              <span>{statusStyles.nextText}</span>
                            </button>
                          ) : (
                            <div className="text-center py-1 text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                              <CheckCircle2 size={13} className="text-emerald-500" />
                              <span>Veículo Entregue</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* ABA 2: AGENDAMENTOS PWA */}
          {/* ========================================== */}
          {abaAtiva === 'agendamentos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulário Novo Agendamento */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Calendar className="w-4 h-4 text-blue-400" /> Novo Agendamento
                </h3>

                <form onSubmit={handleCriarAgendamento} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Cliente *</label>
                    <input
                      type="text"
                      value={novoAgendCliente}
                      onChange={(e) => setNovoAgendCliente(e.target.value)}
                      placeholder="Nome do cliente"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">WhatsApp / Telefone</label>
                    <input
                      type="text"
                      value={novoAgendTel}
                      onChange={(e) => setNovoAgendTel(e.target.value)}
                      placeholder="(11) 98888-7777"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Veículo *</label>
                    <input
                      type="text"
                      value={novoAgendVeiculo}
                      onChange={(e) => setNovoAgendVeiculo(e.target.value)}
                      placeholder="Ex: Jeep Renegade"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Serviço</label>
                      <select
                        value={novoAgendServico}
                        onChange={(e) => setNovoAgendServico(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Lavagem Simples">Lavagem Simples</option>
                        <option value="Lavagem Completa">Lavagem Completa</option>
                        <option value="Polimento">Polimento</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Horário</label>
                      <input
                        type="time"
                        value={novoAgendHorario}
                        onChange={(e) => setNovoAgendHorario(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                      </input>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 ${temaClasses.bg} text-white font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    <Plus size={15} />
                    <span>Confirmar Agendamento</span>
                  </button>
                </form>
              </div>

              {/* Lista de Agendamentos */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" /> Agendamentos Recebidos pelo App
                </h3>

                <div className="space-y-3">
                  {agendamentos.map((ag) => (
                    <div
                      key={ag.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{ag.cliente}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
                            {ag.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {ag.veiculo} • <strong className="text-cyan-400">{ag.servico}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Horário: <span className="text-slate-300 font-semibold">{ag.data} às {ag.horario}</span> • Tel: {ag.telefone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setNovoClienteFila(ag.cliente);
                            setNovoVeiculoFila(ag.veiculo);
                            setNovoServicoFila(ag.servico);
                            setAbaAtiva('fila');
                            mostrarToast(`Dados de ${ag.cliente} carregados na Fila de Lavagem!`, 'info');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <Play size={13} />
                          <span>Puxar p/ Fila</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setItemParaExcluir({ tipo: 'agendamento', id: ag.id, nome: `Agendamento de ${ag.cliente}` })}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                          title="Excluir Agendamento"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* ABA 3: CHECKLIST DE ENTRADA & VISTORIA */}
          {/* ========================================== */}
          {abaAtiva === 'checklist' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulário Novo Checklist */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <CheckSquare className="w-4 h-4 text-cyan-400" /> Nova Vistoria de Entrada
                </h3>

                <form onSubmit={handleSalvarChecklist} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Veículo / Placa *</label>
                    <input
                      type="text"
                      value={novoCheckVeiculo}
                      onChange={(e) => setNovoCheckVeiculo(e.target.value)}
                      placeholder="Ex: Honda Civic (BRA2E19)"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Avarias Observadas</label>
                    <textarea
                      value={novoCheckAvaria}
                      onChange={(e) => setNovoCheckAvaria(e.target.value)}
                      placeholder="Ex: Risco porta motorista, pequeno amassado na tampa traseira..."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Nível Tanque</label>
                      <select
                        value={novoCheckCombustivel}
                        onChange={(e) => setNovoCheckCombustivel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Reserva">Reserva</option>
                        <option value="1/4">1/4 Tanque</option>
                        <option value="1/2">1/2 Tanque</option>
                        <option value="3/4">3/4 Tanque</option>
                        <option value="Cheio">Tanque Cheio</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Pertences</label>
                      <input
                        type="text"
                        value={novoCheckPertences}
                        onChange={(e) => setNovoCheckPertences(e.target.value)}
                        placeholder="Ex: Moletom no banco"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-dashed border-slate-700 rounded-xl text-center space-y-1.5">
                    <Camera className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-[11px] text-slate-400">Fotos da Vistoria anexadas (3 fotos)</p>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 ${temaClasses.bg} text-white font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    <CheckCircle2 size={15} />
                    <span>Salvar Checklist & Vistoria</span>
                  </button>
                </form>
              </div>

              {/* Histórico de Checklists */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Histórico de Vistorias Registradas
                </h3>

                <div className="space-y-3">
                  {checklists.map((chk) => (
                    <div
                      key={chk.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <div>
                          <h4 className="text-sm font-bold text-white">{chk.veiculo}</h4>
                          <p className="text-[11px] text-slate-400">Vistoria realizada em: {chk.data}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setItemParaExcluir({ tipo: 'checklist', id: chk.id, nome: `Vistoria de ${chk.veiculo}` })}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                          title="Excluir Vistoria"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Avarias</span>
                          <p className="text-amber-300 font-medium">{chk.avarias}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Combustível</span>
                          <p className="text-slate-300">{chk.nivelCombustivel || '1/2 tanque'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Pertences</span>
                          <p className="text-slate-300">{chk.pertences || 'Nenhum'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* ABA 4: CLIENTES & FIDELIDADE */}
          {/* ========================================== */}
          {abaAtiva === 'clientes' && (
            <div className="space-y-6">
              {/* Topo com Cadastro de Cliente */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Gift className="w-4 h-4 text-pink-400" /> Cadastrar Cliente no Cartão Fidelidade
                </h3>

                <form onSubmit={handleCadastrarCliente} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={novoCliNome}
                      onChange={(e) => setNovoCliNome(e.target.value)}
                      placeholder="Ex: Carlos Andrade"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">WhatsApp / Telefone</label>
                    <input
                      type="text"
                      value={novoCliTel}
                      onChange={(e) => setNovoCliTel(e.target.value)}
                      placeholder="(11) 98888-9999"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Veículo Principal</label>
                    <input
                      type="text"
                      value={novoCliVeiculo}
                      onChange={(e) => setNovoCliVeiculo(e.target.value)}
                      placeholder="Ex: Honda HR-V"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className={`w-full py-2 px-3 ${temaClasses.bg} text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer`}
                    >
                      <Plus size={15} />
                      <span>Cadastrar Fidelidade</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista dos Clientes & Pontuação de Fidelidade */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" /> Cartão Fidelidade (10 Pontos = 1 Lavagem Grátis)
                  </h3>

                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={buscaCliente}
                      onChange={(e) => setBuscaCliente(e.target.value)}
                      placeholder="Buscar por nome..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientes
                    .filter(c => c.nome.toLowerCase().includes(buscaCliente.toLowerCase()))
                    .map((c) => {
                      const progresso = (c.pontos / 10) * 100;

                      return (
                        <div
                          key={c.id}
                          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg"
                        >
                          <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                            <div>
                              <h4 className="text-sm font-bold text-white">{c.nome}</h4>
                              <p className="text-xs text-slate-400">{c.telefone} • {c.veiculoPrincipal}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setItemParaExcluir({ tipo: 'cliente', id: c.id, nome: c.nome })}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                              title="Excluir Cliente"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Barra de Progresso Fidelidade */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-medium">Pontos Acumulados</span>
                              <span className="font-bold text-amber-400">{c.pontos} / 10 pontos</span>
                            </div>

                            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${progresso}%` }}
                              />
                            </div>
                          </div>

                          {/* Botão de Adicionar Ponto */}
                          <button
                            type="button"
                            onClick={() => adicionarPontoCliente(c.id)}
                            className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-white border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles size={14} className="text-amber-400" />
                            <span>+1 Ponto Fidelidade</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* ABA 5: FUNCIONÁRIOS & COMISSÕES */}
          {/* ========================================== */}
          {abaAtiva === 'funcionarios' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cadastro de Funcionário */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Wrench className="w-4 h-4 text-blue-400" /> Cadastrar Funcionário
                </h3>

                <form onSubmit={handleCadastrarFuncionario} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Nome do Profissional *</label>
                    <input
                      type="text"
                      value={novoFuncNome}
                      onChange={(e) => setNovoFuncNome(e.target.value)}
                      placeholder="Ex: Mateus Ribeiro"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Cargo</label>
                    <select
                      value={novoFuncCargo}
                      onChange={(e) => setNovoFuncCargo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Lavador Master">Lavador Master</option>
                      <option value="Especialista Estética">Especialista Estética</option>
                      <option value="Polidor">Polidor</option>
                      <option value="Ajudante Geral">Ajudante Geral</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Comissão (%)</label>
                      <input
                        type="number"
                        value={novoFuncComissao}
                        onChange={(e) => setNovoFuncComissao(Number(e.target.value))}
                        placeholder="30"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Telefone</label>
                      <input
                        type="text"
                        value={novoFuncTel}
                        onChange={(e) => setNovoFuncTel(e.target.value)}
                        placeholder="(11) 99999-0000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 ${temaClasses.bg} text-white font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    <Plus size={15} />
                    <span>Salvar Funcionário</span>
                  </button>
                </form>
              </div>

              {/* Lista dos Funcionários e Comissões */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Extrato de Comissões por Lavador
                </h3>

                <div className="space-y-3">
                  {funcionarios.map((f) => (
                    <div
                      key={f.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{f.nome}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
                            {f.cargo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Comissão Base: <strong className="text-slate-200">{f.comissaoPorcentagem}%</strong> de cada serviço concluído.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Comissão Acumulada</span>
                          <span className="text-base font-black text-emerald-400">
                            R$ {f.totalComissaoAcumulada.toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => zerarComissao(f.id, f.nome)}
                          disabled={f.totalComissaoAcumulada === 0}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                          title="Marcar como Pago"
                        >
                          Pagar / Zerar
                        </button>

                        <button
                          type="button"
                          onClick={() => setItemParaExcluir({ tipo: 'funcionario', id: f.id, nome: f.nome })}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                          title="Excluir Funcionário"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* ABA 6: ESTOQUE / PRODUTOS */}
          {/* ========================================== */}
          {abaAtiva === 'produtos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cadastro de Produto */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <PackagePlus className="w-4 h-4 text-indigo-400" /> Cadastrar Produto no Estoque
                </h3>

                <form onSubmit={handleAdicionarProduto} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Nome do Insumo / Produto *</label>
                    <input
                      type="text"
                      value={novoProdNome}
                      onChange={(e) => setNovoProdNome(e.target.value)}
                      placeholder="Ex: Cera Líquida 5L"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Qtd Atual</label>
                      <input
                        type="number"
                        value={novoProdQtd}
                        onChange={(e) => setNovoProdQtd(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Qtd Mínima</label>
                      <input
                        type="number"
                        value={novoProdMin}
                        onChange={(e) => setNovoProdMin(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Categoria</label>
                    <input
                      type="text"
                      value={novoProdCat}
                      onChange={(e) => setNovoProdCat(e.target.value)}
                      placeholder="Ex: Químicos, Panos, Ceras"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 ${temaClasses.bg} text-white font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    <Plus size={15} />
                    <span>Adicionar ao Estoque</span>
                  </button>
                </form>
              </div>

              {/* Lista dos Produtos */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" /> Insumos & Materiais
                </h3>

                <div className="space-y-3">
                  {produtos.map((p) => {
                    const estoqueBaixo = p.estoque <= p.min;

                    return (
                      <div
                        key={p.id}
                        className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg ${
                          estoqueBaixo ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{p.nome}</h4>
                            {estoqueBaixo && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center gap-1">
                                <AlertTriangle size={11} /> Estoque Baixo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            Categoria: {p.categoria || 'Geral'} • Mínimo recomendado: {p.min} unidades
                          </p>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                            <button
                              type="button"
                              onClick={() => ajustarEstoque(p.id, -1)}
                              className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-sm font-bold text-white px-2">{p.estoque}</span>
                            <button
                              type="button"
                              onClick={() => ajustarEstoque(p.id, 1)}
                              className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setItemParaExcluir({ tipo: 'produto', id: p.id, nome: p.nome })}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                            title="Excluir Insumo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* ABA 7: CAIXA DIÁRIO */}
          {/* ========================================== */}
          {abaAtiva === 'caixa' && (
            <div className="space-y-6">
              {/* Cards de Resumo Financeiro */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Total Entradas</span>
                    <ArrowUpRight className="text-emerald-400 w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-emerald-400 mt-2">
                    R$ {totalEntradas.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Total Saídas</span>
                    <ArrowDownRight className="text-rose-400 w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-rose-400 mt-2">
                    R$ {totalSaidas.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Saldo em Caixa</span>
                    <DollarSign className="text-cyan-400 w-4 h-4" />
                  </div>
                  <p className={`text-2xl font-black mt-2 ${saldoCaixa >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    R$ {saldoCaixa.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Lançamento Rápido no Caixa */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Plus className="w-4 h-4 text-blue-400" /> Novo Lançamento no Caixa
                  </h3>

                  <form onSubmit={handleAdicionarCaixa} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Descrição *</label>
                      <input
                        type="text"
                        value={novaDescCaixa}
                        onChange={(e) => setNovaDescCaixa(e.target.value)}
                        placeholder="Ex: Pagamento Água / Refil Shampoo"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 font-medium mb-1">Tipo</label>
                        <select
                          value={novoTipoCaixa}
                          onChange={(e) => setNovoTipoCaixa(e.target.value as 'entrada' | 'saida')}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="entrada">Entrada (+)</option>
                          <option value="saida">Saída (-)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-medium mb-1">Valor (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={novoValorCaixa}
                          onChange={(e) => setNovoValorCaixa(e.target.value)}
                          placeholder="50.00"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-2.5 px-4 ${temaClasses.bg} text-white font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5`}
                    >
                      <DollarSign size={15} />
                      <span>Registrar Movimentação</span>
                    </button>
                  </form>
                </div>

                {/* Extrato do Caixa */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Extrato de Movimentações
                  </h3>

                  <div className="space-y-2.5">
                    {movimentacoesCaixa.map((m) => (
                      <div
                        key={m.id}
                        className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${m.tipo === 'entrada' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {m.tipo === 'entrada' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{m.descricao}</p>
                            <span className="text-[10px] text-slate-500">{m.data}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-black ${m.tipo === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {m.tipo === 'entrada' ? '+' : '-'} R$ {m.valor.toFixed(2)}
                          </span>

                          <button
                            type="button"
                            onClick={() => setItemParaExcluir({ tipo: 'movimentacao', id: m.id, nome: m.descricao })}
                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                            title="Excluir Lançamento"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* ABA 8: BANNERS PROMOCIONAIS */}
          {/* ========================================== */}
          {abaAtiva === 'banner' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cadastro de Banner */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ImageIcon className="w-4 h-4 text-cyan-400" /> Publicar Novo Banner
                </h3>

                <form onSubmit={handleAdicionarBanner} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Título da Promoção *</label>
                    <input
                      type="text"
                      value={novoBannerTitulo}
                      onChange={(e) => setNovoBannerTitulo(e.target.value)}
                      placeholder="Ex: Quarta com Cera Grátis"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">URL da Imagem (ou Unsplash)</label>
                    <input
                      type="text"
                      value={novoBannerImg}
                      onChange={(e) => setNovoBannerImg(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 ${temaClasses.bg} text-white font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    <Upload size={15} />
                    <span>Publicar no App Cliente</span>
                  </button>
                </form>
              </div>

              {/* Lista dos Banners */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" /> Banners Ativos no PWA
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {banners.map((b) => (
                    <div
                      key={b.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-3"
                    >
                      <img
                        src={b.imagem}
                        alt={b.titulo}
                        className="w-full h-36 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-4 pt-0 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white">{b.titulo}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                            {b.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setBanners(banners.map(item => item.id === b.id ? { ...item, status: item.status === 'Ativo' ? 'Inativo' : 'Ativo' } : item));
                              mostrarToast('Status do banner atualizado!', 'info');
                            }}
                            className="text-xs text-cyan-400 hover:underline cursor-pointer"
                          >
                            Alternar Status
                          </button>

                          <button
                            type="button"
                            onClick={() => setItemParaExcluir({ tipo: 'banner', id: b.id, nome: b.titulo })}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                            title="Excluir Banner"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* ABA 9: CONFIGURAÇÕES DO APP */}
          {/* ========================================== */}
          {abaAtiva === 'configuracao' && (
            <div className="max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Settings className="w-5 h-5 text-blue-400" /> Personalização & Identidade Visual
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Nome do Lava Jato</label>
                  <input
                    type="text"
                    value={nomeLavaJato}
                    onChange={(e) => setNomeLavaJato(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm font-semibold"
                  />
                </div>

                {/* Paleta de Cores do Sistema */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-medium flex items-center gap-1.5">
                    <Paintbrush size={14} className="text-cyan-400" /> Cor Primária do Sistema
                  </label>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {[
                      { id: 'blue', label: 'Azul Clássico', bg: 'bg-blue-600' },
                      { id: 'indigo', label: 'Índigo Moderno', bg: 'bg-indigo-600' },
                      { id: 'emerald', label: 'Verde Esmeralda', bg: 'bg-emerald-600' },
                      { id: 'cyan', label: 'Ciano Tech', bg: 'bg-cyan-600' },
                      { id: 'violet', label: 'Violeta Royal', bg: 'bg-violet-600' },
                      { id: 'amber', label: 'Âmbar Dourado', bg: 'bg-amber-600' }
                    ].map((cor) => (
                      <button
                        key={cor.id}
                        type="button"
                        onClick={() => {
                          setCorPrimaria(cor.id as any);
                          mostrarToast(`Tema alterado para ${cor.label}!`, 'sucesso');
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          corPrimaria === cor.id
                            ? 'border-white text-white bg-slate-800 shadow-md'
                            : 'border-slate-800 text-slate-400 hover:text-white bg-slate-950'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${cor.bg}`} />
                        <span>{cor.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <p className="text-slate-400 text-[11px]">
                    As alterações são salvas automaticamente na sessão atual.
                  </p>
                  <button
                    type="button"
                    onClick={() => mostrarToast('Configurações salvas com sucesso!', 'sucesso')}
                    className={`px-5 py-2 ${temaClasses.bg} text-white font-bold rounded-xl shadow-lg transition cursor-pointer`}
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
