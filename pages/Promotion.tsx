
import React, { useState } from 'react';
import { ArrowLeft, Gift, Copy, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Promotion() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleRedeem = () => {
      if(!code) return;
      alert(`Kode "${code}" tidak valid atau sudah kadaluarsa.`);
      setCode('');
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20 animate-fade-in">
         <div className="bg-red-600 p-4 pb-10 rounded-b-[30px] shadow-lg text-white">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => navigate(-1)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><ArrowLeft/></button>
                <h1 className="font-bold text-lg">Hadiah & Promosi</h1>
            </div>
            <div className="text-center">
                <div className="text-sm opacity-90">Bonus Saya</div>
                <div className="text-3xl font-bold mt-1">Rp0</div>
            </div>
         </div>

         <div className="px-4 -mt-6">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Gift className="text-red-500"/> Tukar Kode Hadiah</h3>
                    <div className="flex gap-2">
                        <input 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Masukkan kode promo..." 
                            className="flex-1 bg-gray-100 px-4 py-3 rounded-xl outline-none text-sm"
                        />
                        <button onClick={handleRedeem} className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl shadow-md btn-press">
                            Tukar
                        </button>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Kode Undangan Saya</h3>
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex justify-between items-center">
                        <span className="font-mono font-bold text-lg text-orange-700 tracking-widest">12345678</span>
                        <button className="text-orange-600 hover:text-orange-800"><Copy size={20}/></button>
                    </div>
                    <button className="w-full mt-3 bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md btn-press">
                        <Share2 size={18}/> Bagikan Tautan
                    </button>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                <div className="text-gray-500 font-bold text-sm ml-2">Promosi Tersedia</div>
                {['Bonus Deposit Harian 10%', 'Cashback Mingguan 5%', 'Bonus Referral Rp20.000'].map((promo, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold">
                                %
                            </div>
                            <div>
                                <div className="font-bold text-gray-800 text-sm">{promo}</div>
                                <div className="text-[10px] text-gray-400">Berlaku hingga 31 Des</div>
                            </div>
                        </div>
                        <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-bold">Detail</button>
                    </div>
                ))}
            </div>
         </div>
    </div>
  );
}
