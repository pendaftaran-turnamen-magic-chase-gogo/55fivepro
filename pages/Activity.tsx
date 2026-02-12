
import React, { useState } from 'react';
import { useApp } from '../store';
import { ArrowLeft, History, Trophy, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Activity() {
  const { myBets } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Win' | 'Loss'>('All');

  const filteredBets = myBets.filter(bet => {
      if (filter === 'All') return true;
      return bet.status === filter;
  });

  return (
    <div className="bg-gray-100 min-h-screen pb-20 animate-fade-in">
        <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
            <button onClick={() => navigate(-1)} className="btn-press">
                <ArrowLeft size={24}/>
            </button>
            <h1 className="text-lg font-bold flex-1 text-center mr-6">Riwayat Taruhan</h1>
        </div>

        <div className="p-4">
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {['All', 'Win', 'Loss'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filter === f ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
                    >
                        {f === 'All' ? 'Semua' : f === 'Win' ? 'Menang' : 'Kalah'}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {filteredBets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                        <div className="bg-gray-200 p-4 rounded-full mb-4"><History size={32}/></div>
                        <p>Belum ada riwayat taruhan</p>
                    </div>
                ) : (
                    filteredBets.map(bet => (
                        <div key={bet.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                            {bet.status === 'Win' && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-200 to-transparent opacity-50 rounded-bl-full pointer-events-none"></div>}
                            
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-bold">{bet.gameMode}</span>
                                    <span className="text-xs text-gray-400">Period: {bet.period.slice(-8)}</span>
                                </div>
                                <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    Select: <span className="uppercase">{bet.select}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString()}</div>
                            </div>

                            <div className="text-right z-10">
                                <div className={`font-bold text-lg ${bet.status === 'Win' ? 'text-green-600' : bet.status === 'Loss' ? 'text-red-500' : 'text-orange-400'}`}>
                                    {bet.status === 'Win' ? `+${bet.winAmount?.toLocaleString()}` : `-${(bet.amount * bet.multiplier).toLocaleString()}`}
                                </div>
                                <div className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded ${bet.status === 'Win' ? 'bg-green-100 text-green-700' : bet.status === 'Loss' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {bet.status}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
}
