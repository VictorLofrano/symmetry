import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const app = initializeApp({
  apiKey: "AIzaSyAc3kO5RCwLr72emImYgDc3DxDLLknCoEo",
  authDomain: "symmetry-9cc2a.firebaseapp.com",
  projectId: "symmetry-9cc2a",
  storageBucket: "symmetry-9cc2a.firebasestorage.app",
  messagingSenderId: "214926532562",
  appId: "1:214926532562:web:616bfb9e3697419898320b",
})

export const db = getFirestore(app)
export const auth = getAuth(app)