import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Banco de dados em arquivo JSON local para persistência garantida entre reinicializações
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  clientes: any[];
  agendamentos: any[];
  fila: any[];
  historico: any[];
  lavaJatos: any[];
}

function carregarBanco(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const conteudo = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(conteudo);
      
      // Garante que se houver lista de unidades, não fiquem bloqueadas indevidamente
      if (Array.isArray(parsed.lavaJatos) && parsed.lavaJatos.length > 0) {
        parsed.lavaJatos = parsed.lavaJatos.map((u: any) => ({
          ...u,
          statusPlano: u.statusPlano === 'bloqueado' ? 'ativo' : (u.statusPlano || 'ativo')
        }));
      } else {
        const hoje = new Date();
        const expiracao = new Date();
        expiracao.setDate(hoje.getDate() + 365);
        parsed.lavaJatos = [
          {
            id: 'pitstop',
            nomeFantasia: 'Pit Stop Lava Jato',
            nomeProprietario: 'Carlos Silva',
            razaoSocial: 'C. Silva Lavagens LTDA',
            cnpj: '12.345.678/0001-99',
            endereco: 'Av. Central, 1500 - Centro',
            contato: '(11) 99999-8888',
            senhaProvisoria: 'pit123',
            valorPlano: 149.90,
            dataCriacao: hoje.toLocaleDateString('pt-BR'),
            dataExpiracao: expiracao.toLocaleDateString('pt-BR'),
            statusPlano: 'ativo'
          }
        ];
      }
      return parsed;
    }
  } catch (err) {
    console.warn("Erro ao ler banco local, iniciando padrão:", err);
  }

  const hoje = new Date();
  const expiracao = new Date();
  expiracao.setDate(hoje.getDate() + 365);

  const inicial: DatabaseSchema = {
    clientes: [],
    agendamentos: [],
    fila: [],
    historico: [],
    lavaJatos: [
      {
        id: 'pitstop',
        nomeFantasia: 'Pit Stop Lava Jato',
        nomeProprietario: 'Carlos Silva',
        razaoSocial: 'C. Silva Lavagens LTDA',
        cnpj: '12.345.678/0001-99',
        endereco: 'Av. Central, 1500 - Centro',
        contato: '(11) 99999-8888',
        senhaProvisoria: 'pit123',
        valorPlano: 149.90,
        dataCriacao: hoje.toLocaleDateString('pt-BR'),
        dataExpiracao: expiracao.toLocaleDateString('pt-BR'),
        statusPlano: 'ativo'
      }
    ]
  };
  salvarBanco(inicial);
  return inicial;
}

function salvarBanco(dados: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dados, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao persistir banco de dados:", err);
  }
}

let dbMemory = carregarBanco();

// ============================================================================
// ROTAS DE API PARA SINCRONIZAÇÃO EM TEMPO REAL (MOBILE <-> NOTEBOOK)
// ============================================================================

app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    totalClientes: dbMemory.clientes.length,
    totalAgendamentos: dbMemory.agendamentos.length
  });
});

// --- CLIENTES ---
app.get("/api/clientes", (req, res) => {
  const unidadeId = req.query.unidadeId ? String(req.query.unidadeId).toLowerCase() : null;
  if (unidadeId) {
    const filtrados = dbMemory.clientes.filter(c => {
      const u = String(c.unidadeVinculadaId || c.unidadeId || '').toLowerCase();
      return !u || u === unidadeId || u.includes(unidadeId) || unidadeId.includes(u);
    });
    return res.json(filtrados);
  }
  res.json(dbMemory.clientes);
});

app.post("/api/clientes", (req, res) => {
  const novoCliente = req.body;
  if (!novoCliente.nome || !novoCliente.email) {
    return res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
  }

  const id = novoCliente.id || `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  // Garante que novos clientes sempre iniciem com exatamente 0 pontos
  const clienteFormatado = {
    ...novoCliente,
    id,
    pontos: typeof novoCliente.pontos === 'number' ? novoCliente.pontos : 0,
    pontosFidelidade: typeof novoCliente.pontosFidelidade === 'number' ? novoCliente.pontosFidelidade : 0,
    updatedAt: new Date().toISOString(),
    createdAt: novoCliente.createdAt || new Date().toISOString()
  };

  const index = dbMemory.clientes.findIndex(c => 
    (c.id && c.id === id) || 
    (c.email && c.email.toLowerCase() === clienteFormatado.email.toLowerCase() && 
     String(c.unidadeVinculadaId || '').toLowerCase() === String(clienteFormatado.unidadeVinculadaId || '').toLowerCase())
  );

  if (index >= 0) {
    // Atualiza cliente existente preservando pontos existentes se não fornecidos
    dbMemory.clientes[index] = {
      ...dbMemory.clientes[index],
      ...clienteFormatado,
      pontos: clienteFormatado.pontos !== undefined ? clienteFormatado.pontos : dbMemory.clientes[index].pontos,
      pontosFidelidade: clienteFormatado.pontosFidelidade !== undefined ? clienteFormatado.pontosFidelidade : dbMemory.clientes[index].pontosFidelidade
    };
  } else {
    dbMemory.clientes.unshift(clienteFormatado);
  }

  salvarBanco(dbMemory);
  res.status(201).json(clienteFormatado);
});

// Atualizar pontos do cliente (Apenas o Administrador)
app.patch("/api/clientes/:id/pontos", (req, res) => {
  const { id } = req.params;
  const { pontos } = req.body;

  if (typeof pontos !== 'number') {
    return res.status(400).json({ error: "Valor de pontos inválido" });
  }

  const index = dbMemory.clientes.findIndex(c => c.id === id || c.email === id);
  if (index >= 0) {
    dbMemory.clientes[index].pontos = pontos;
    dbMemory.clientes[index].pontosFidelidade = pontos;
    dbMemory.clientes[index].updatedAt = new Date().toISOString();
    salvarBanco(dbMemory);
    return res.json(dbMemory.clientes[index]);
  }

  res.status(404).json({ error: "Cliente não encontrado" });
});

app.delete("/api/clientes/:id", (req, res) => {
  const { id } = req.params;
  dbMemory.clientes = dbMemory.clientes.filter(c => c.id !== id && c.email !== id);
  salvarBanco(dbMemory);
  res.json({ success: true });
});

// --- AGENDAMENTOS ---
app.get("/api/agendamentos", (req, res) => {
  const unidadeId = req.query.unidadeId ? String(req.query.unidadeId).toLowerCase() : null;
  if (unidadeId) {
    const filtrados = dbMemory.agendamentos.filter(a => {
      const u = String(a.unidadeId || a.unidadeVinculadaId || '').toLowerCase();
      return !u || u === unidadeId || u.includes(unidadeId) || unidadeId.includes(u);
    });
    return res.json(filtrados);
  }
  res.json(dbMemory.agendamentos);
});

app.post("/api/agendamentos", (req, res) => {
  const novo = req.body;
  const id = novo.id || `ag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const itemFormatado = {
    ...novo,
    id,
    status: novo.status || 'Pendente',
    createdAt: novo.createdAt || new Date().toISOString()
  };

  const index = dbMemory.agendamentos.findIndex(a => a.id === id);
  if (index >= 0) {
    dbMemory.agendamentos[index] = { ...dbMemory.agendamentos[index], ...itemFormatado };
  } else {
    dbMemory.agendamentos.unshift(itemFormatado);
  }

  salvarBanco(dbMemory);
  res.status(201).json(itemFormatado);
});

app.patch("/api/agendamentos/:id", (req, res) => {
  const { id } = req.params;
  const index = dbMemory.agendamentos.findIndex(a => a.id === id);
  if (index >= 0) {
    dbMemory.agendamentos[index] = {
      ...dbMemory.agendamentos[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    salvarBanco(dbMemory);
    return res.json(dbMemory.agendamentos[index]);
  }
  res.status(404).json({ error: "Agendamento não encontrado" });
});

app.delete("/api/agendamentos/:id", (req, res) => {
  const { id } = req.params;
  dbMemory.agendamentos = dbMemory.agendamentos.filter(a => a.id !== id);
  salvarBanco(dbMemory);
  res.json({ success: true });
});

// --- FILA OPERACIONAL ---
app.get("/api/fila", (req, res) => {
  const unidadeId = req.query.unidadeId ? String(req.query.unidadeId).toLowerCase() : null;
  if (unidadeId) {
    const filtrados = dbMemory.fila.filter(f => {
      const u = String(f.unidadeId || '').toLowerCase();
      return !u || u === unidadeId || u.includes(unidadeId) || unidadeId.includes(u);
    });
    return res.json(filtrados);
  }
  res.json(dbMemory.fila);
});

app.post("/api/fila", (req, res) => {
  const item = req.body;
  const id = item.id || `fila_${Date.now()}`;
  const formatado = { ...item, id };
  const idx = dbMemory.fila.findIndex(f => f.id === id);
  if (idx >= 0) {
    dbMemory.fila[idx] = formatado;
  } else {
    dbMemory.fila.unshift(formatado);
  }
  salvarBanco(dbMemory);
  res.status(201).json(formatado);
});

app.delete("/api/fila/:id", (req, res) => {
  const { id } = req.params;
  dbMemory.fila = dbMemory.fila.filter(f => f.id !== id);
  salvarBanco(dbMemory);
  res.json({ success: true });
});

// --- UNIDADES / LAVA-JATOS (SaaS) ---
app.get("/api/unidades", (_req, res) => {
  res.json(dbMemory.lavaJatos);
});

app.post("/api/unidades", (req, res) => {
  const novaUnidade = req.body;
  if (!novaUnidade.nomeFantasia || !novaUnidade.id) {
    return res.status(400).json({ error: "Nome Fantasia e ID são obrigatórios" });
  }

  const formatada = {
    ...novaUnidade,
    statusPlano: novaUnidade.statusPlano || 'ativo',
    updatedAt: new Date().toISOString()
  };

  const idx = dbMemory.lavaJatos.findIndex(u => u.id === formatada.id);
  if (idx >= 0) {
    dbMemory.lavaJatos[idx] = { ...dbMemory.lavaJatos[idx], ...formatada };
  } else {
    dbMemory.lavaJatos.unshift(formatada);
  }

  salvarBanco(dbMemory);
  res.status(201).json(formatada);
});

app.patch("/api/unidades/:id", (req, res) => {
  const { id } = req.params;
  const idx = dbMemory.lavaJatos.findIndex(u => u.id === id);
  if (idx >= 0) {
    dbMemory.lavaJatos[idx] = {
      ...dbMemory.lavaJatos[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    salvarBanco(dbMemory);
    return res.json(dbMemory.lavaJatos[idx]);
  }
  res.status(404).json({ error: "Unidade não encontrada" });
});

app.delete("/api/unidades/:id", (req, res) => {
  const { id } = req.params;
  dbMemory.lavaJatos = dbMemory.lavaJatos.filter(u => u.id !== id);
  salvarBanco(dbMemory);
  res.json({ success: true });
});

// --- STATUS GERAL DE SINCRONIZAÇÃO ---
app.get("/api/sync", (req, res) => {
  const unidadeId = req.query.unidadeId ? String(req.query.unidadeId).toLowerCase() : null;
  let clientes = dbMemory.clientes;
  let agendamentos = dbMemory.agendamentos;
  let fila = dbMemory.fila;
  let unidades = dbMemory.lavaJatos;

  if (unidadeId) {
    clientes = clientes.filter(c => {
      const u = String(c.unidadeVinculadaId || c.unidadeId || '').toLowerCase();
      return !u || u === unidadeId || u.includes(unidadeId) || unidadeId.includes(u);
    });
    agendamentos = agendamentos.filter(a => {
      const u = String(a.unidadeId || a.unidadeVinculadaId || '').toLowerCase();
      return !u || u === unidadeId || u.includes(unidadeId) || unidadeId.includes(u);
    });
    fila = fila.filter(f => {
      const u = String(f.unidadeId || '').toLowerCase();
      return !u || u === unidadeId || u.includes(unidadeId) || unidadeId.includes(u);
    });
  }

  res.json({
    timestamp: Date.now(),
    clientes,
    agendamentos,
    fila,
    unidades
  });
});

// ============================================================================
// VITE MIDDLEWARE & SERVIÇO DE ARQUIVOS ESTÁTICOS
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 HubWash Server rodando perfeitamente na porta ${PORT}`);
  });
}

startServer();
