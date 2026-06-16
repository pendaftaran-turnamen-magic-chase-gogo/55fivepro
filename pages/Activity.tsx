import React, { useState } from 'react';
import { useApp } from '../store';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Activity() {
  const { user, myBets } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Win' | 'Loss'>('All');

  // Filter data specifically for the current user
  const userBets = myBets.filter(b => b.userId === user?.id);

  // Betting Stats
  const totalBetWin = userBets.filter(b => b.status === 'Win').reduce((acc, curr) => acc + (curr.winAmount || 0), 0);
  const totalBetLoss = userBets.filter(b => b.status === 'Loss').reduce((acc, curr) => acc + (curr.amount * curr.multiplier), 0);
  
  // Filter Logic for Display
  const filteredBets = userBets.filter(bet => filter === 'All' ? true : bet.status === filter);

  return (
    <div className="bg-gray-100 min-h-screen pb-20 animate-fade-in">
        <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
            <button onClick={() => navigate(-1)} className="btn-press"><ArrowLeft size={24}/></button>
            <h1 className="text-lg font-bold flex-1 text-center mr-6">Aktivitas & Riwayat</h1>
        </div>

        {/* Summary Card */}
        <div className="p-4">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-4 shadow-lg mb-4">
                 <div className="text-xs opacity-70 mb-1">Total Net Profit (All Time)</div>
                 <div className={`text-2xl font-bold ${(totalBetWin - totalBetLoss) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                     Rp{(totalBetWin - totalBetLoss).toLocaleString()}
                 </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 mb-4">
                {['All', 'Win', 'Loss'].map(f => (
                    <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${filter === f ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}>{f}</button>
                ))}
            </div>

            {/* LIST CONTENT */}
            <div className="space-y-3">
                {filteredBets.length === 0 ? <div className="text-center py-10 text-gray-400">Tidak ada data</div> :
                filteredBets.map(bet => (
                    <div key={bet.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                         {bet.status === 'Win' && <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full opacity-50"></div>}
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-gray-100 text-[10px] px-1.5 py-0.5 rounded font-bold">{bet.gameMode}</span>
                                <span className="text-xs text-gray-400">#{bet.period.slice(-6)}</span>
                            </div>
                            <div className="font-bold text-gray-800">Select: {bet.select}</div>
                        </div>
                        <div className="text-right z-10">
                            <div className={`font-bold ${bet.status === 'Win' ? 'text-green-600' : 'text-red-500'}`}>
                                {bet.status === 'Win' ? `+${bet.winAmount?.toLocaleString()}` : `-${(bet.amount * bet.multiplier).toLocaleString()}`}
                            </div>
                            <div className="text-[10px] text-gray-400">{bet.status}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
