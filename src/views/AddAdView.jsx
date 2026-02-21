import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

export const AddAdView = ({ user, setView, setMessage }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAd = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("🚨 BŁĄD: Musisz być zalogowany, aby dodać ogłoszenie.");
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
      userId: user.uid,
      authorEmail: user.email // Zapisujemy kto dodał ogłoszenie
    };

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'ads'), newAd);
      setMessage({ text: "Dodano! Czeka na moderację.", type: "success" });
      setView('board');
    } catch (err) {
      console.error(err);
      alert("🚨 BŁĄD ZAPISU: Sprawdź konsolę.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
};
