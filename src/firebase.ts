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
// CONFIGURAÇÃO DO FIREBASE FIRESTORE (BANCO PADRÃO - DEFAULT)
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
let app = getApps().length > 0
  ? getApp()
  : initializeApp(
      firebaseConfig.projectId
        ? firebaseConfig
        : {
            apiKey: "AIzaSyDemoDummyKeyForPreviewModeOnly12345",
            authDomain: "hubwash-preview.firebaseapp.com",
            projectId: "hubwash-preview",
            storageBucket: "hubwash-preview.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:demo"
          }
    );

// ➡️ Banco de Dados Cloud Firestore no modo limpo e padrão (default)
const db = getFirestore(app);

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
