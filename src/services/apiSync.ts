/**
 * SERVIÇO DE SINCRONIZAÇÃO EM TEMPO REAL (NUVEM / MOBILE <-> NOTEBOOK)
 * Garante que dados cadastrados no celular (mobile) apareçam instantaneamente
 * no computador/notebook do administrador no escritório e vice-versa.
 */

import { LavaJato } from '../types';

export interface ClienteSync {
  id?: string;
  nome: string;
  email: string;
  senhaAcesso?: string;
  unidadeVinculadaId?: string;
  unidadeId?: string;
  unidadeNome?: string;
  unidadeSlug?: string;
  contato?: string;
  telefone?: string;
  cep?: string;
  cidade?: string;
  bairro?: string;
  estado?: string;
  tipoVeiculo?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  cor?: string;
  pontosFidelidade: number;
  pontos?: number;
  veiculoPrincipal?: string;
  totalGasto?: number;
  createdAt?: string;
}

export interface AgendamentoSync {
  id: string;
  unidadeId: string;
  unidadeVinculadaId?: string;
  cliente: string;
  telefone: string;
  email?: string;
  data: string;
  horario: string;
  veiculo: string;
  servico: string;
  status: 'Pendente' | 'Confirmado' | 'Em Andamento' | 'Concluído' | 'Concluido' | 'Cancelado';
  createdAt?: string;
}

// 1. Obter dados completos sincronizados da unidade
export async function buscarDadosSincronizados(unidadeId?: string) {
  try {
    const url = unidadeId ? `/api/sync?unidadeId=${encodeURIComponent(unidadeId)}` : '/api/sync';
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Modo offline ou fallback silencioso
  }
  return null;
}

// --- GESTÃO DE UNIDADES (SaaS) ---
export async function buscarUnidadesServidor(): Promise<LavaJato[]> {
  try {
    const res = await fetch('/api/unidades', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fallback buscar unidades:', err);
  }
  return [];
}

export async function salvarUnidadeServidor(unidade: LavaJato): Promise<LavaJato | null> {
  try {
    const res = await fetch('/api/unidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unidade)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Erro ao persistir unidade no servidor:', err);
  }
  return null;
}

export async function atualizarStatusUnidadeServidor(id: string, statusPlano: 'ativo' | 'teste' | 'bloqueado'): Promise<boolean> {
  try {
    const res = await fetch(`/api/unidades/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statusPlano })
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao atualizar status da unidade no servidor:', err);
    return false;
  }
}

export async function excluirUnidadeServidor(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/unidades/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao excluir unidade no servidor:', err);
    return false;
  }
}

// 2. Salvar/Registrar novo cliente
export async function registrarClienteServidor(cliente: ClienteSync): Promise<ClienteSync | null> {
  try {
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fallback de envio de cliente:', err);
  }
  return null;
}

// 3. Atualizar Pontos de Fidelidade do Cliente (Apenas Administrador)
export async function atualizarPontosClienteServidor(idOuEmail: string, pontos: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/clientes/${encodeURIComponent(idOuEmail)}/pontos`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pontos })
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao atualizar pontos no servidor:', err);
    return false;
  }
}

// 4. Salvar Agendamento
export async function salvarAgendamentoServidor(agendamento: AgendamentoSync): Promise<AgendamentoSync | null> {
  try {
    const res = await fetch('/api/agendamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agendamento)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fallback de envio de agendamento:', err);
  }
  return null;
}

// 5. Atualizar Status do Agendamento
export async function atualizarStatusAgendamentoServidor(id: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/agendamentos/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

// 6. Excluir/Cancelar Agendamento
export async function excluirAgendamentoServidor(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/agendamentos/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

// 7. Excluir Cliente
export async function excluirClienteServidor(idOuEmail: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/clientes/${encodeURIComponent(idOuEmail)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
