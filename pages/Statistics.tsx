
import React from 'react';
import { ArrowLeft, PieChart, TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Statistics() {
  const navigate = useNavigate();
  const { gameHistory, activeGameMode } = useApp();

  // Mock stats since we don't store full betting history persistently in this demo
  const data = [
      { name: 'Mon', win: 4000, loss: 2400 },
      { name: 'Tue', win: 3000, loss: 1398 },
      { name: 'Wed', win: 2000, loss: 9800 },
      { name: 'Thu', win: 2780, loss: 3908 },
      { name: 'Fri', win: 1890, loss: 4800 },
      { name: 'Sat', win: 2390, loss: 3800 },
      { name: 'Sun', win: 3490, loss: 4300 },
  ];

  // Calculate Ball Frequency
  const frequencyMap: Record<number, number> = {};
  gameHistory.forEach(res => {
      frequencyMap[res.number] = (frequencyMap[res.number] || 0) + 1;
  });

  const getBallColorName = (num: number) => {
    if ([1, 3, 7, 9].includes(num)) return 'Hijau';
    if ([2, 4, 6, 8].includes(num)) return 'Merah';
    if (num === 0) return 'Ungu Merah';
    if (num === 5) return 'Ungu Hijau';
    return 'Unknown';
  };
  
  const getBallColorClass = (num: number) => {
    if ([1, 3, 7, 9].includes(num)) return 'bg-green-500';
    if ([2, 4, 6, 8].includes(num)) return 'bg-red-500';
    if (num === 0) return 'bg-gradient-to-r from-red-500 to-violet-500';
    if (num === 5) return 'bg-gradient-to-r from-green-500 to-violet-500';
    return 'bg-gray-400';
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20 animate-fade-in">
        <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
            <button onClick={() => navigate(-1)} className="btn-press">
                <ArrowLeft size={24}/>
            </button>
            <h1 className="text-lg font-bold flex-1 text-center mr-6">Statistik Permainan</h1>
        </div>

        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><TrendingUp size={14}/> Total Menang</div>
                    <div className="font-bold text-xl">65%</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Activity size={14}/> Total Putaran</div>
                    <div className="font-bold text-xl">1,240</div>
                </div>
            </div>
            
            {/* BALL FREQUENCY SECTION */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">Frekuensi Angka (20 Putaran Terakhir)</h3>
                <div className="space-y-3">
                    {[0,1,2,3,4,5,6,7,8,9].map(num => {
                        const count = frequencyMap[num] || 0;
                        const max = Math.max(...Object.values(frequencyMap), 1);
                        const percent = (count / 20) * 100;
                        
                        if (count === 0) return null;

                        return (
                            <div key={num} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${getBallColorClass(num)}`}>
                                    {num}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-gray-700">Bola {getBallColorName(num)} {num}</span>
                                        <span className="text-gray-500">Muncul {count}x</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gray-800 rounded-full" style={{ width: `${(count / max) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">Analisa Mingguan</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" tick={{fontSize: 10}} />
                            <Tooltip />
                            <Bar dataKey="win" fill="#4ade80" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="loss" fill="#f87171" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">Trend Angka ({activeGameMode})</h3>
                <div className="h-40 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={gameHistory.slice(0, 20).reverse()}>
                            <defs>
                                <linearGradient id="colorNum" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip />
                            <Area type="monotone" dataKey="number" stroke="#ef4444" fillOpacity={1} fill="url(#colorNum)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-center text-[10px] text-gray-400 mt-2">20 Putaran Terakhir</div>
            </div>
        </div>
    </div>
  );
}
