import React, { useState } from 'react';
import LoginOTP from './components/LoginOTP';
import AdminMaster from './components/AdminMaster';
import PainelLavaJato from './components/PainelLavaJato';
import AppClientePWA from './components/AppClientePWA';

export default function App() {
  // Inicialização inteligente com base na URL (ex: ?unidade=pitstop)
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('unidade');
  });
  
  const [telaAtual, setTelaAtual] = useState<'lavajato' | 'master' | 'cliente'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('unidade') ? 'cliente' : 'master';
  });

  const [telaClienteInicial, setTelaClienteInicial] = useState<'login' | 'cadastro' | 'home'>('home');
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('unidade');
    
    try {
      const salvos = localStorage.getItem('hubwash_lava_jatos');
      if (salvos) {
        const lista = JSON.parse(salvos);
        if (Array.isArray(lista) && lista.length > 0) {
          if (slug) {
            const encontrada = lista.find((u: any) => u.id?.toLowerCase() === slug.toLowerCase() || u.nomeFantasia?.toLowerCase() === slug.toLowerCase());
            if (encontrada) return encontrada.nomeFantasia;
          }
          return lista[0].nomeFantasia;
        }
      }
    } catch {}
    return 'Pit Stop Lava Jato';
  });

  if (!autenticado) {
    return (
      <LoginOTP
        onSuccess={(role, unidadeNome, telaCliente) => {
          setAutenticado(true);
          if (role === 'master') {
            setTelaAtual('master');
          } else if (role === 'cliente') {
            if (unidadeNome) setUnidadeSelecionada(unidadeNome);
            if (telaCliente) setTelaClienteInicial(telaCliente);
            setTelaAtual('cliente');
          } else {
            if (unidadeNome) {
              setUnidadeSelecionada(unidadeNome);
            }
            setTelaAtual('lavajato');
          }
        }}
      />
    );
  }

  // TELA: APLICATIVO DO CLIENTE (PWA)
  if (telaAtual === 'cliente') {
    return (
      <AppClientePWA
        unidadeNome={unidadeSelecionada}
        telaInicial={telaClienteInicial}
        onVoltarLogin={() => {
          setAutenticado(false);
        }}
      />
    );
  }

  // TELA: ADMIN MASTER (HUBWASH)
  if (telaAtual === 'master') {
    return (
      <AdminMaster
        onLogout={() => {
          setAutenticado(false);
        }}
        onIrParaLavaJato={(nome?: string) => {
          if (nome) setUnidadeSelecionada(nome);
          setTelaAtual('lavajato');
        }}
        onIrParaCliente={(nome?: string) => {
          if (nome) setUnidadeSelecionada(nome);
          setTelaClienteInicial('home');
          setTelaAtual('cliente');
        }}
      />
    );
  }

  // TELA: PAINEL OPERACIONAL LAVA JATO
  return (
    <PainelLavaJato
      unidadeNome={unidadeSelecionada}
      onLogout={() => {
        setAutenticado(false);
      }}
    />
  );
}
