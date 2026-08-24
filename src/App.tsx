import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import LoginOTP from './components/LoginOTP';
import AdminMaster from './components/AdminMaster';
import PainelLavaJato from './components/PainelLavaJato';
import AppClientePWA from './components/AppClientePWA';

// ============================================================================
// CONFIGURAÇÃO DO FIREBASE FIRESTORE
// Espaço reservado para inserção das chaves oficiais do projeto Firebase Console
// ou via variáveis de ambiente (.env)
// ============================================================================
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Inicialização resiliente do Firebase
const app = !getApps().length
  ? initializeApp(
      firebaseConfig.projectId
        ? firebaseConfig
        : {
            apiKey: "AIzaSyDemoKeyForPreviewModeOnly12345",
            authDomain: "hubwash-preview.firebaseapp.com",
            projectId: "hubwash-preview",
            storageBucket: "hubwash-preview.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:demo"
          }
    )
  : getApp();

export const db = getFirestore(app);
export { collection, addDoc, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy };

// Função segura para ler parâmetros de busca na URL

function getParamSafe(name: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.location || !window.location.search) {
      return null;
    }
    const params = new URLSearchParams(window.location.search);
    const val = params.get(name);
    return val ? val.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

// Resolver o nome da unidade com proteção contra quebras e suporte a novos inquilinos
function resolverNomeUnidade(slugParam: string | null): string {
  if (!slugParam) {
    return 'Pit Stop Lava Jato';
  }

  try {
    const salvos = localStorage.getItem('hubwash_lava_jatos');
    if (salvos) {
      const lista = JSON.parse(salvos);
      if (Array.isArray(lista) && lista.length > 0) {
        const encontrada = lista.find((u: any) => {
          const uId = String(u.id || '').trim().toLowerCase();
          const uNome = String(u.nomeFantasia || '').trim().toLowerCase();
          return uId === slugParam || uNome === slugParam;
        });
        if (encontrada && encontrada.nomeFantasia) {
          return encontrada.nomeFantasia;
        }
      }
    }
  } catch (e) {
    console.error('Erro ao resolver unidade no storage:', e);
  }

  // Se não encontrar no localStorage local do celular, gera um nome limpo e elegante a partir do slug
  const nomeFormatado = slugParam
    .split(/[-_]/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

  return nomeFormatado.toLowerCase().includes('lava')
    ? nomeFormatado
    : `${nomeFormatado} Lava Jato`;
}

export default function App() {
  const unidadeSlug = getParamSafe('unidade');
  const rotaSlug = getParamSafe('rota');

  // Inicialização inteligente com base na URL
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return Boolean(unidadeSlug);
  });
  
  const [telaAtual, setTelaAtual] = useState<'lavajato' | 'master' | 'cliente'>(() => {
    return Boolean(unidadeSlug) ? 'cliente' : 'master';
  });

  const [telaClienteInicial, setTelaClienteInicial] = useState<'login' | 'cadastro' | 'home'>(() => {
    // Se a URL for do cliente ou contiver unidade, obrigatoriamente inicia no cadastro se não houver login prévio
    if (rotaSlug === 'login') return 'login';
    return 'cadastro';
  });

  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>(() => {
    return resolverNomeUnidade(unidadeSlug);
  });

  const [erroApp, setErroApp] = useState<string | null>(null);

  // Efeito de inicialização e validação das rotas multi-inquilino
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uParam = params.get('unidade');
    const rParam = params.get('rota');

    if (uParam) {
      setAutenticado(true);
      setTelaAtual('cliente');
      setUnidadeSelecionada(resolverNomeUnidade(uParam.trim().toLowerCase()));

      const sessaoSalva = localStorage.getItem('hubwash_cliente_sessao');
      // Se não há usuário logado ou a rota for cliente/cadastro, obriga abrir o formulário de cadastro
      if (!sessaoSalva || rParam?.toLowerCase() === 'cliente' || rParam?.toLowerCase() === 'cadastro') {
        setTelaClienteInicial('cadastro');
      } else if (rParam?.toLowerCase() === 'login') {
        setTelaClienteInicial('login');
      } else {
        setTelaClienteInicial('home');
      }
    }
  }, []);

  // Tratamento de Erro Seguro em HTML Estruturado (fundo visível, sem travar o celular)
  if (erroApp) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-sm bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="bg-rose-500/10 p-3 rounded-full text-rose-400 w-12 h-12 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Ops! Algo deu errado</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{erroApp}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setErroApp(null);
              setAutenticado(false);
              setTelaAtual('master');
            }}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Voltar ao Início</span>
          </button>
        </div>
