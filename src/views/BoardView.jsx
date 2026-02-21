import React, { useMemo, useState } from 'react';
import { MapPin, Users } from 'lucide-react';
import { Badge } from '../components/Badge';

export const BoardView = ({ ads }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAds = useMemo(() => {
    return ads.filter(ad => ad.status === 'verified' && 
      (ad.product || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [ads, searchTerm]);

  return (
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
  );
};
