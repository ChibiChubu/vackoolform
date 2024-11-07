import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAA43itUFHdzZCzZC8n0mZa2s75WeXjXv-VB",
  authDomain: "vackoolform.firebaseapp.com",
  projectId: "vackoolform",
  storageBucket: "vackoolform.appspot.com", // Make sure this is correct
  messagingSenderId: "1048644503230",
  appId: "1:1048644503230:web:fcdbef7fc103b73a8550ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings
const db = getFirestore(app);

// Optional: Enable offline persistence
// enableIndexedDbPersistence(db)
//   .catch((err) => {
//     console.error("Error enabling offline persistence:", err);
//   });

const auth = getAuth(app);

export { app, db, auth };