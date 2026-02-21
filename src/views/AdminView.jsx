import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { ShieldCheck, Users, CheckCircle, Trash2 } from 'lucide-react';
import { Badge } from '../components/Badge';

export const AdminView = ({ ads, setMessage }) => {
  const [adminTab, setAdminTab] = useState('pending');

  const handleVerify = async (id) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ads', id), { status: 'verified' });
    setMessage({ text: "Ogłoszenie zatwierdzone!", type: "success" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ads', id));
      setMessage({ text: "Usunięto.", type: "success" });
    }
  };

  const filteredAds = ads.filter(a => a.status === adminTab);
  const pendingCount = ads.filter(a => a.status === 'pending').length;
  const verifiedCount = ads.filter(a => a.status === 'verified').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black">Dział Moderacji</h2>
          <p className="text-stone-500 text-sm">Zarządzaj ogłoszeniami przed ich publikacją na tablicy.</p>
        </div>
        
        <div className="flex gap-2 bg-stone-200 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setAdminTab('pending')} 
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${adminTab === 'pending' ? 'bg-white shadow-sm text-amber-600' : 'text-stone-500 hover:text-stone-800'}`}
          >
            OCZEKUJĄCE ({pendingCount})
          </button>
          <button 
            onClick={() => setAdminTab('verified')} 
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition ${adminTab === 'verified' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-500 hover:text-stone-800'}`}
          >
            ZAAKCEPTOWANE ({verifiedCount})
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
              {filteredAds.map(ad => (
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
                        <button onClick={() => handleVerify(ad.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition font-bold text-xs">
                          <CheckCircle size={14}/> <span className="hidden sm:inline">ZATWIERDŹ</span>
                        </button>
                      )}
                      <button onClick={() => handleDelete(ad.id)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition" title="Usuń całkowicie">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAds.length === 0 && (
          <div className="text-center text-stone-400 py-16">
            <ShieldCheck size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">Brak ogłoszeń w tej zakładce.</p>
          </div>
        )}
      </div>
    </div>
  );
};