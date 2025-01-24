import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJjAF1Rl-t4TpI-lrizZ2v6r860bKBZ1s",
  authDomain: "suivipap.firebaseapp.com",
  projectId: "suivipap",
  storageBucket: "suivipap.appspot.com",
  messagingSenderId: "380638639558",
  appId: "1:380638639558:web:4988ce965fc86f634eaec7",
  measurementId: "G-LCM07EXCNZ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);