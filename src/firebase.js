import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAA43itUFHdzZCzZC8n0mZa2s75WeXjXv-VB",
  authDomain: "vackoolform.firebaseapp.com",
  projectId: "vackoolform",
  storageBucket: "vackoolform.appspot.com", // Perbaiki ini
  messagingSenderId: "1048644503230",
  appId: "1:1048644503230:web:fcdbef7fc103b73a8550ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Enable offline persistence
const db = getFirestore(app);
// enableIndexedDbPersistence(db)
//   .catch((err) => {
//     if (err.code == 'failed-precondition') {
//       console.log('Persistence failed');
//     } else if (err.code == 'unimplemented') {
//       console.log('Persistence not available');
//     }
//   });

const auth = getAuth(app);

export { app, db, auth };