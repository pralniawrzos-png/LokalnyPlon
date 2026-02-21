import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Importy naszych nowych modułów
import { auth, db, appId, googleProvider } from './config/firebase';
import { Navigation } from './components/Navigation';
import { BoardView } from './views/BoardView';
import { AddAdView } from './views/AddAdView';
import { AdminView } from './views/AdminView';

// --- KONFIGURACJA UPRAWNIEŃ ---
// Podmień poniższy adres na swój własny e-mail powiązany z kontem Google.
const ADMIN_EMAILS = ['twoj.email@gmail.com']; 

export default function App() {
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [view, setView] = useState('board'); 
  const [message, setMessage] = useState(null);

  // Sprawdzanie czy zalogowany użytkownik ma uprawnienia Admina
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  // Nasłuchiwanie stanu autoryzacji (teraz bez anonimowego logowania)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Pobieranie danych z Firestore (dostępne nawet dla niezalogowanych)
  useEffect(() => {
    const adsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'ads');
    const unsubscribe = onSnapshot(query(adsCollection), 
      (snapshot) => {
        setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error("Błąd Firestore:", error)
    );
    return () => unsubscribe();
  }, []);

  // Obsługa Logowania (Pojawia się okienko Google)
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setMessage({ text: "Zalogowano pomyślnie!", type: "success" });
    } catch (error) {
      console.error("Błąd logowania:", error);
      setMessage({ text: "Logowanie przerwane lub wystąpił błąd.", type: "error" });
    }
  };

  // Obsługa Wylogowania
  const handleLogout = async () => {
    await signOut(auth);
    setView('board'); // Po wylogowaniu wyrzuć na stronę główną
    setMessage({ text: "Wylogowano.", type: "success" });
  };

  const pendingCount = ads.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 text-white flex items-center gap-2 ${message.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Pasek Nawigacji z nowymi propsami */}
      <Navigation 
        view={view} 
        setView={setView} 
        pendingCount={pendingCount} 
        user={user}
        isAdmin={isAdmin}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />

      <main className="max-w-4xl mx-auto p-4 mt-4">
        {/* Widok domyślny dla wszystkich */}
        {view === 'board' && <BoardView ads={ads} />}
        
        {/* Widok dodawania tylko dla zalogowanych */}
        {view === 'add' && user && <AddAdView user={user} setView={setView} setMessage={setMessage} />}
        {view === 'add' && !user && (
           <div className="text-center py-20 text-stone-500">
             Musisz się zalogować, aby wystawić towar.
           </div>
        )}
        
        {/* Widok admina tylko dla administratorów */}
        {view === 'admin' && isAdmin && <AdminView ads={ads} setMessage={setMessage} />}
        {view === 'admin' && !isAdmin && (
           <div className="text-center py-20 text-red-500 font-bold">
             Brak uprawnień. Ten panel jest dostępny tylko dla administratorów.
           </div>
        )}
      </main>
    </div>
  );
}