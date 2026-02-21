import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  query, doc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  Search, MapPin, CheckCircle, PlusCircle, 
  TrendingUp, ShieldCheck, Users, Settings, X, Trash2 
} from 'lucide-react';

// --- 1. TWOJA KONFIGURACJA (Musisz podmienić te wartości na SWOJE z Firebase Console!) ---
const firebaseConfig = {
  apiKey: "AIzaSyB0hPBT6uttx-GjBk2PtGRr9mQ_xunINSU",
  authDomain: "lokalnyplon.firebaseapp.com",
  projectId: "lokalnyplon",
  storageBucket: "lokalnyplon.firebasestorage.app",
  messagingSenderId: "489756854017",
  appId: "1:489756854017:web:3b7336f071140435b73d00",
  measurementId: "G-VHEKXV97GN"
};
// --- 2. INICJALIZACJA ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'lokalny-plon-v1';

// --- KOMPONENTY POMOCNICZE ---
const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    default: 'bg-stone-100 text-stone-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[variant]}`}>{children}</span>;
};

// --- GŁÓWNA APLIKACJA ---
export default function App() {
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [view, setView] = useState('board'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminTab, setAdminTab] = useState('pending'); // Nowy stan dla zakładek w panelu admina

  // 3. LOGOWANIE ANONIMOWE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        signInAnonymously(auth).catch(err => {
          console.error("Błąd autoryzacji:", err);
          setMessage({ text: "Włącz metodę 'Anonymous' w Firebase Authentication!", type: "error" });
        });
      }
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 4. POBIERANIE DANYCH 
  useEffect(() => {
    if (!user) return;
    const adsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'ads');
    const unsubscribe = onSnapshot(query(adsCollection), 
      (snapshot) => {
        setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error("Błąd Firestore:", error);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Logika filtrowania
  const filteredAds = useMemo(() => {
    return ads.filter(ad => ad.status === 'verified' && 
      (ad.product || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [ads, searchTerm]);

  // Funkcje Admina
  const handleVerify = async (id) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ads', id), { status: 'verified' });
    setMessage("Ogłoszenie zatwierdzone i widoczne na tablicy!");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Czy na pewno chcesz trwale usunąć to ogłoszenie?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ads', id));
      setMessage("Ogłoszenie zostało usunięte.");
    }
  };

  // --- WYSYŁANIE FORMULARZA ---
  const handleAddAd = async (e) => {
    e.preventDefault();

    // TARCZA 1: Sprawdzenie, czy klucze zostały podmienione
    if (firebaseConfig.apiKey === "TWOJE_API_KEY") {
      alert("🚨 BŁĄD: Musisz wkleić swoje prawdziwe klucze w zmiennej 'firebaseConfig' na górze pliku!");
      return;
    }

    // TARCZA 2: Sprawdzenie, czy autoryzacja działa
    if (!user) {
      alert("🚨 BŁĄD: Brak połączenia z kontem. Czy włączyłeś opcję 'Anonymous' w zakładce Authentication w Firebase?");
      return;
    }

    setIsSubmitting(true);
    const fd = new FormData(e.target);
    const newAd = {
      farmer: fd.get('farmer'),
      product: fd.get('product'),
      price: fd.get('price'),
      location: fd.get('location'),
      status: 'pending',
      createdAt: serverTimestamp(),
      userId: user.uid
    };

    try {
      // Timeout hack: Jeśli Firebase jest zablokowany, wywali błąd po 5 sekundach zamiast wisieć w nieskończoność
      const addDocPromise = addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'ads'), newAd);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 5000));
      
      await Promise.race([addDocPromise, timeoutPromise]);
      
      setMessage({ text: "Dodano! Czeka na moderację.", type: "success" });
      setView('board');
      e.target.reset();
    } catch (err) {
      console.error(err);
      if (err.message === "TIMEOUT") {
        alert("🚨 BŁĄD: Połączenie zablokowane! Masz włączonego AdBlocka, uBlocka lub korzystasz z przeglądarki Brave. Wyłącz je lub odpal stronę w trybie Incognito.");
      } else {
        alert("🚨 BŁĄD ZAPISU: Sprawdź reguły (Rules) w Firestore Database. Muszą być ustawione na tryb testowy.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 text-white flex items-center gap-2 ${message.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      <nav className="bg-emerald-900 text-white p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('board')}>
            <TrendingUp className="text-emerald-400" />
            <span className="font-black">LOKALNY PLON</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView('board')} className="text-xs font-bold hidden sm:block">TABLICA</button>
            <button onClick={() => setView('add')} className="bg-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-500 transition">WYSTAW TOWAR</button>
            
            {/* Rozbudowany przycisk Panelu Admina */}
            <div className="w-px h-6 bg-emerald-700 mx-1 hidden sm:block"></div>
            <button 
              onClick={() => setView('admin')} 
              className={`flex items-center gap-1.5 text-xs font-bold transition ${view === 'admin' ? 'text-emerald-400' : 'opacity-80 hover:opacity-100'}`}
            >
              <Settings size={16}/> 
              <span className="hidden sm:inline">PANEL ADMINA</span>
              {ads.filter(a => a.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                  {ads.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4">
        {view === 'board' && (
          <div className="space-y-6">
            <input 
              type="text" placeholder="Szukaj produktu..." 
              className="w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAds.map(ad => (
                <div key={ad.id} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
                  <Badge variant="success">{ad.category || "Inne"}</Badge>
                  <h3 className="text-xl font-bold mt-2">{ad.product}</h3>
                  <p className="text-emerald-600 font-bold">{ad.price}</p>
                  <p className="text-sm text-stone-500 mt-2"><MapPin size={14} className="inline mr-1"/>{ad.location}</p>
                  <p className="text-sm text-stone-500 mt-1"><Users size={14} className="inline mr-1"/>{ad.farmer}</p>
                </div>
              ))}
            </div>
            {filteredAds.length === 0 && <p className="text-center text-stone-400 py-10">Brak ogłoszeń na tablicy.</p>}
          </div>
        )}

        {view === 'add' && (
          <div className="bg-white p-8 rounded-3xl border shadow-sm max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6">Dodaj ogłoszenie</h2>
            <form onSubmit={handleAddAd} className="space-y-4">
              <input name="farmer" placeholder="Twoja nazwa / gospodarstwo" className="w-full p-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
              <input name="product" placeholder="Co sprzedajesz?" className="w-full p-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
              <input name="price" placeholder="Cena (np. 15 zł/kg)" className="w-full p-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
              <input name="location" placeholder="Miejsce (np. Rynek, ul. Polna)" className="w-full p-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
              <button disabled={isSubmitting} className={`w-full py-4 font-bold rounded-xl text-white transition ${isSubmitting ? 'bg-stone-400 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
                {isSubmitting ? 'WYSYŁANIE...' : 'WYŚLIJ DO MODERACJI'}
              </button>
            </form>
          </div>
        )}

        {view === 'admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h2 className="text-2xl font-black">Dział Moderacji</h2>
                <p className="text-stone-500 text-sm">Zarządzaj ogłoszeniami przed ich publikacją na tablicy.</p>
              </div>
              
              {/* Zakładki (Filtry Admina) */}
              <div className="flex gap-2 bg-stone-200 p-1 rounded-xl w-full sm:w-auto">
                <button 
                  onClick={() => setAdminTab('pending')} 
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${adminTab === 'pending' ? 'bg-white shadow-sm text-amber-600' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  OCZEKUJĄCE ({ads.filter(a => a.status === 'pending').length})
                </button>
                <button 
                  onClick={() => setAdminTab('verified')} 
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${adminTab === 'verified' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  ZAAKCEPTOWANE ({ads.filter(a => a.status === 'verified').length})
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-[10px] font-bold uppercase text-stone-500 border-b">
                    <tr>
                      <th className="p-4 whitespace-nowrap">Dane ogłoszenia</th>
                      <th className="p-4 hidden md:table-cell">Lokalizacja & Cena</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {ads.filter(a => a.status === adminTab).map(ad => (
                      <tr key={ad.id} className={`text-sm transition hover:bg-stone-50 ${ad.status === 'pending' ? 'bg-amber-50/20' : ''}`}>
                        <td className="p-4">
                          <div className="font-bold text-stone-800">{ad.product}</div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
                            <Users size={12}/> {ad.farmer}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="font-medium text-emerald-700">{ad.price}</div>
                          <div className="text-[11px] text-stone-500 mt-1">{ad.location}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant={ad.status === 'verified' ? 'success' : 'warning'}>
                            {ad.status === 'pending' ? 'OCZEKUJE' : 'AKTYWNE'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {ad.status === 'pending' && (
                              <button 
                                onClick={() => handleVerify(ad.id)} 
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition font-bold text-xs"
                              >
                                <CheckCircle size={14}/> <span className="hidden sm:inline">ZATWIERDŹ</span>
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(ad.id)} 
                              className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition" 
                              title="Usuń całkowicie"
                            >
                              <Trash2 size={18}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Komunikat o braku danych */}
              {ads.filter(a => a.status === adminTab).length === 0 && (
                <div className="text-center text-stone-400 py-16">
                  <ShieldCheck size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Brak ogłoszeń w tej zakładce.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}