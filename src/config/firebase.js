import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB0hPBT6uttx-GjBk2PtGRr9mQ_xunINSU",
  authDomain: "lokalnyplon.firebaseapp.com",
  projectId: "lokalnyplon",
  storageBucket: "lokalnyplon.firebasestorage.app",
  messagingSenderId: "489756854017",
  appId: "1:489756854017:web:3b7336f071140435b73d00",
  measurementId: "G-VHEKXV97GN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'lokalny-plon-v1';