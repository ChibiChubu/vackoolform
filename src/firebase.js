import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAA43itUFHdzZCzZC8n0mZa2s75WeXjXv-VB",
  authDomain: "vackoolform.firebaseapp.com",
  projectId: "vackoolform",
  storageBucket: "vackoolform.appspot.com",
  messagingSenderId: "1048644503230",
  appId: "1:1048644503230:web:fcdbef7fc103b73a8550ef"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Default export jika perlu
export default { app, db, auth };