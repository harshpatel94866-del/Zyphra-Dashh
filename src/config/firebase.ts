import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDPKkOYwbGxTBO78ErdgKkcJWe1NYnQ4UQ",
  authDomain: "zyphra-website-login.firebaseapp.com",
  projectId: "zyphra-website-login",
  storageBucket: "zyphra-website-login.firebasestorage.app",
  messagingSenderId: "534085344666",
  appId: "1:534085344666:web:bb4297738560e786686e23",
  measurementId: "G-N84028C1C2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
