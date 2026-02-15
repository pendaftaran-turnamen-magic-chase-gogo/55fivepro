
import React from 'react';
import { useApp } from '../store';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TradingHistory() {
  const { tradingPositions } = useApp();
  const navigate = useNavigate();

  const closedPositions = tradingPositions.filter(p => p.status === 'Closed').sort((a,b) => (b.closeTime || 0) - (a.closeTime || 0));

  const totalProfit = closedPositions.reduce((acc, curr) => acc + (curr.profit || 0), 0);

  return (
    <div className="bg-gray-100 min-h-screen animate-fade-in pb-10">
        <div className="bg-black text-white p-4 sticky top-0 z-10 shadow-md">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><ArrowLeft/></button>
                <h1 className="font-bold text-lg flex-1">Riwayat Trading</h1>
            </div>
        </div>

        <div className="p-4">
             {/* Summary Card */}
             <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex justify-between items-center">
                 <div>
                     <div className="text-xs text-gray-500">Total Profit/Loss</div>
                     <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                         {totalProfit >= 0 ? '+' : ''}Rp{Math.round(totalProfit).toLocaleString()}
                     </div>
                 </div>
                 <div className="text-right">
                     <div className="text-xs text-gray-500">Total Transaksi</div>
                     <div className="text-xl font-bold text-gray-800">{closedPositions.length}</div>
                 </div>
             </div>

             {/* List */}
             <div className="space-y-3">
                 {closedPositions.length === 0 ? (
                     <div className="text-center py-20 text-gray-400">Tidak ada riwayat</div>
                 ) : (
                     closedPositions.map(pos => {
                         const percent = ((pos.closePrice! - pos.entryPrice) / pos.entryPrice) * 100;
                         return (
                             <div key={pos.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                                 {pos.profit! >= 0 ? (
                                     <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-100 to-transparent rounded-bl-full opacity-50"></div>
                                 ) : (
                                     <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-100 to-transparent rounded-bl-full opacity-50"></div>
                                 )}
                                 
                                 <div className="flex justify-between items-start mb-2 relative z-10">
                                     <div>
                                         <div className="flex items-center gap-2">
                                             <span className="font-bold text-gray-800">Ticket #{pos.id.slice(-6)}</span>
                                             <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500">CLOSED</span>
                                         </div>
                                         <div className="text-xs text-gray-400 mt-1">{new Date(pos.closeTime!).toLocaleString()}</div>
                                     </div>
                                     <div className={`text-right font-bold ${pos.profit! >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                         <div className="text-lg">{pos.profit! >= 0 ? '+' : ''}Rp{Math.round(pos.profit!).toLocaleString()}</div>
                                         <div className="text-xs flex items-center justify-end gap-1">
                                             {pos.profit! >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                             {percent.toFixed(2)}%
                                         </div>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100 relative z-10">
                                     <div>
                                         <div className="text-[10px] text-gray-400">Harga Beli</div>
                                         <div className="font-mono text-sm font-bold">{pos.entryPrice.toFixed(2)}</div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-gray-400">Harga Jual</div>
                                         <div className="font-mono text-sm font-bold">{pos.closePrice?.toFixed(2)}</div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-gray-400">Modal</div>
                                         <div className="font-mono text-sm font-bold">Rp{pos.amount.toLocaleString()}</div>
                                     </div>
                                      <div>
                                         <div className="text-[10px] text-gray-400">Waktu Tahan</div>
                                         <div className="font-mono text-sm font-bold">{Math.round(((pos.closeTime || 0) - pos.timestamp) / 1000)}s</div>
                                     </div>
                                 </div>
                             </div>
                         )
                     })
                 )}
             </div>
        </div>
    </div>
  );
}
