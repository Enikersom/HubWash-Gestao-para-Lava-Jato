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
  orderBy,
  getDocs,
  Firestore
} from 'firebase/firestore';

// ============================================================================
// CONFIGURAÇÃO DO FIREBASE FIRESTORE
// Cole aqui as chaves do seu projeto Firebase Console ou configure via .env
// ============================================================================
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Inicialização segura do Firebase
let app;
let db: Firestore | null = null;

try {
  if (!getApps().length) {
    // Se não tiver projectId configurado, inicializa com dummy para não quebrar a compilação
    if (firebaseConfig.projectId) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } else {
      // Cria app padrão com identificador genérico
      app = initializeApp({
        apiKey: "AIzaSyDemoDummyKeyForPreviewModeOnly12345",
        authDomain: "hubwash-preview.firebaseapp.com",
        projectId: "hubwash-preview",
        storageBucket: "hubwash-preview.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:demo"
      });
      db = getFirestore(app);
    }
  } else {
    app = getApp();
    db = getFirestore(app);
  }
} catch (err) {
  console.warn('Firebase init fallback:', err);
}

export {
  app,
  db,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs
};
