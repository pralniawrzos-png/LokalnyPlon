import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Importy naszych nowych modułów
import { auth, db, appId } from './config/firebase';
import { Navigation } from './components/Navigation';
import { BoardView } from './views/BoardView';
import { AddAdView } from './views/AddAdView';
import { AdminView } from './views/AdminView';

export default function App() {
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [view, setView] = useState('board'); 
  const [message, setMessage] = useState(null);

  // Autoryzacja
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        signInAnonymously(auth).catch(err => console.error("Błąd auth:", err));
      }
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Pobieranie danych
  useEffect(() => {
    if (!user) return;
    const adsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'ads');
    const unsubscribe = onSnapshot(query(adsCollection), 
      (snapshot) => {
        setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error("Błąd Firestore:", error)
    );
    return () => unsubscribe();
  }, [user]);

  const pendingCount = ads.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Globalne powiadomienia (Toasty) */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 text-white flex items-center gap-2 ${message.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Pasek Nawigacji */}
      <Navigation view={view} setView={setView} pendingCount={pendingCount} />

      {/* Wyświetlanie odpowiedniego widoku */}
      <main className="max-w-4xl mx-auto p-4 mt-4">
        {view === 'board' && <BoardView ads={ads} />}
        {view === 'add' && <AddAdView user={user} setView={setView} setMessage={setMessage} />}
        {view === 'admin' && <AdminView ads={ads} setMessage={setMessage} />}
      </main>
    </div>
  );
}