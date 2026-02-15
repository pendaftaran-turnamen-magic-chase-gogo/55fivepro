
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store';
import { Volume2, FileText, RotateCw, Wallet, X, Headset, Send, Check, CheckCheck, User, Info, HelpCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GameMode } from '../types';

// Helper for message ticks
const MessageStatus = ({ status }: { status: 'sent' | 'delivered' | 'read' }) => {
    if (status === 'sent') return <Check size={12} className="text-gray-400" />;
    if (status === 'delivered') return <CheckCheck size={12} className="text-gray-400" />;
    return <CheckCheck size={12} className="text-green-500" />;
};

export default function Home() {
  const { user, balance, timeLeft, periodId, gameHistory, placeBet, myBets, activeGameMode, setActiveGameMode, csMessages, sendCSMessage, markChatAsRead } = useApp();
  const [activeTab, setActiveTab] = useState<'Game' | 'Chart' | 'History'>('Game');
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [betAmount, setBetAmount] = useState(1000);
  
  // UI States
  const [showCS, setShowCS] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ref to track previous time to avoid double sounds on re-renders
  const prevTimeRef = useRef(timeLeft);

  // --- Handlers ---

  const handleRefresh = () => {
      setIsRefreshing(true);
      // Simulate data fetch delay
      setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleOpenCS = () => {
      if (user) {
        markChatAsRead(user.id, 'user');
        setShowCS(true);
      } else {
        alert("Silakan login untuk menghubungi CS");
      }
  };

  const handleSendChat = () => {
      if(!chatInput.trim() || !user) return;
      sendCSMessage(chatInput, 'user', user.id);
      setChatInput('');
  };

  // Helper for Ball CSS
  const getBallClass = (num: number) => {
    if ([1, 3, 7, 9].includes(num)) return 'bg-green-500';
    if ([2, 4, 6, 8].includes(num)) return 'bg-red-500';
    if (num === 0) return 'bg-gradient-to-r from-red-500 to-violet-500';
    if (num === 5) return 'bg-gradient-to-r from-green-500 to-violet-500';
    return 'bg-gray-400';
  };

  // Helper for Modal Header Color
  const getHeaderColor = (bet: string) => {
    if (['Violet', '0', '5'].includes(bet)) return 'bg-gradient-to-r from-violet-500 to-violet-700 shadow-violet-200';
    if (['Green', '1', '3', '7', '9'].includes(bet)) return 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-200';
    if (['Red', '2', '4', '6', '8'].includes(bet)) return 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-200';
    if (bet === 'Big') return 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-orange-200';
    if (bet === 'Small') return 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-200';
    return 'bg-gradient-to-r from-gray-700 to-gray-800';
  };

  // Helper for Text Color in Modal
  const getTextColor = (bet: string) => {
    if (['Violet', '0', '5'].includes(bet)) return 'text-violet-600';
    if (['Green', '1', '3', '7', '9'].includes(bet)) return 'text-green-600';
    if (['Red', '2', '4', '6', '8'].includes(bet)) return 'text-red-600';
    if (bet === 'Big') return 'text-orange-500';
    if (bet === 'Small') return 'text-blue-500';
    return 'text-gray-800';
  };

  const handleBetClick = (val: string) => {
    if (timeLeft <= 5) return; // Prevent clicking during countdown
    setSelectedBet(val);
    setMultiplier(1);
    setBetAmount(1000);
  };

  // Tense Sound Effect
  const playTenseTick = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // High pitch "woodblock" style tick
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.05);
        
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  // Effect: Handle Global Countdown (Last 5 seconds)
  useEffect(() => {
    if (timeLeft !== prevTimeRef.current) {
        if (timeLeft <= 5 && timeLeft > 0) {
            // Close modal if it's open because betting is closed
            setSelectedBet(null);
            playTenseTick();
        }
        prevTimeRef.current = timeLeft;
    }
    
    // Safety check: ensure modal is closed if we mount/update into the danger zone
    if (timeLeft <= 5 && selectedBet) {
        setSelectedBet(null);
    }
  }, [timeLeft, selectedBet]);

  const confirmBet = () => {
    if (selectedBet) {
      placeBet(selectedBet, betAmount, multiplier);
      setSelectedBet(null);
    }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return [m, s];
  };

  const [min, sec] = formatTime(timeLeft);
  const myMessages = user ? csMessages.filter(m => m.userId === user.id) : [];

  return (
    <div className="pb-10 animate-fade-in relative">
        <style>{`
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .animate-slide-in-right {
                animation: slideInRight 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }
            @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
            }
            .animate-marquee {
                display: inline-block;
                animation: marquee 20s linear infinite;
                white-space: nowrap;
            }
            @keyframes pulse-scale {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            .animate-pulse-scale {
                animation: pulse-scale 0.5s ease-in-out infinite;
            }
        `}</style>
      
      {/* Header / Wallet Section */}
      <div className="bg-red-600 text-white p-4 pb-8 rounded-b-[24px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">55five</h1>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">www.55five.com</span>
          </div>
          <div className="flex gap-3">
             <button onClick={handleOpenCS} className="btn-press bg-white/10 p-2 rounded-full hover:bg-white/20">
                <Headset size={20} />
             </button>
             <button onClick={handleRefresh} className="btn-press bg-white/10 p-2 rounded-full hover:bg-white/20">
                <RotateCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>
        
        <div className="bg-white text-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-sm flex items-center gap-1"><Wallet size={16}/> Saldo dompet</span>
            <button onClick={handleRefresh} className="text-gray-400 hover:text-red-500 transition-colors">
                <RotateCw size={16} className={isRefreshing ? 'animate-spin' : ''}/>
            </button>
          </div>
          <div className="text-3xl font-bold mb-4">Rp{balance.toLocaleString('id-ID')}</div>
          <div className="flex gap-3">
            <button className="flex-1 bg-red-500 text-white py-2 rounded-full font-bold shadow-md shadow-red-200 btn-press">Withdraw</button>
            <button className="flex-1 bg-green-500 text-white py-2 rounded-full font-bold shadow-md shadow-green-200 btn-press">Deposit</button>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="bg-yellow-50 text-yellow-700 px-4 py-2 text-xs flex items-center gap-2 overflow-hidden">
        <Volume2 size={16} className="flex-shrink-0" />
        <div className="flex-1 overflow-hidden relative h-4">
             <div className="animate-marquee absolute top-0 left-0">
                Selamat datang di 55five! Nikmati permainan Win Go dan menangkan hadiah besar setiap harinya. Pasang taruhan dengan bijak dan nikmati kemenangan Anda.
             </div>
        </div>
        <button onClick={() => setShowRules(true)} className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 btn-press flex-shrink-0 cursor-pointer">
           Rincian
        </button>
      </div>

      {/* Game Mode Selector */}
      <div className="grid grid-cols-4 gap-2 p-4">
        {['30s', '1Min', '3Min', '5Min'].map((mode) => (
           <button 
             key={mode} 
             onClick={() => setActiveGameMode(mode as GameMode)}
             className={`rounded-xl p-2 text-center relative overflow-hidden btn-press transition-all duration-300 ${activeGameMode === mode ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200 scale-105' : 'bg-white text-gray-500'}`}
           >
              <div className="text-[10px] font-bold">Win Go</div>
              <div className="text-sm font-bold">{mode}</div>
              {activeGameMode === mode && <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-white/20 rounded-full"></div>}
           </button>
        ))}
      </div>

      {/* Timer & Period Section */}
      <div className="mx-4 bg-image-pattern bg-cover bg-center rounded-xl p-4 text-white flex justify-between items-center" style={{ backgroundImage: 'linear-gradient(to right, #e0e0e0, #f3f3f3)', color: '#333' }}>
        <div className="flex-1 overflow-hidden">
           <button 
              onClick={() => setShowRules(true)}
              className="flex items-center gap-1 border border-gray-400 rounded-full px-2 py-0.5 w-fit mb-1 hover:bg-white/50 transition-colors"
           >
              <FileText size={12} className="text-red-500"/>
              <span className="text-[10px] text-gray-600 font-bold">Cara bermain</span>
           </button>
           <div className="text-xs text-gray-500 mb-1">Win Go {activeGameMode}</div>
           
           <div className="flex justify-start gap-2 h-8 overflow-hidden mask-gradient-right">
              {[...gameHistory].slice(0, 5).reverse().map((res, i, arr) => {
                 const isNewest = i === arr.length - 1;
                 return (
                    <div 
                        key={`${res.period}-${activeGameMode}`} 
                        className={`min-w-[32px] w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm
                            ${getBallClass(res.number)} 
                            ${isNewest ? 'animate-slide-in-right' : ''}
                        `}
                    >
                        {res.number}
                    </div>
                 );
              })}
           </div>
        </div>

        <div className="text-right ml-4">
           <div className="text-xs text-gray-500 mb-1">Waktu yang tersisa</div>
           <div className="flex gap-1 justify-end">
              <div className="bg-gray-200 text-red-600 font-bold px-2 py-1 rounded text-xl font-mono">{Math.floor(min / 10)}</div>
              <div className="bg-gray-200 text-red-600 font-bold px-2 py-1 rounded text-xl font-mono">{min % 10}</div>
              <div className="text-red-600 font-bold text-xl">:</div>
              <div className="bg-gray-200 text-red-600 font-bold px-2 py-1 rounded text-xl font-mono transition-all duration-300">{Math.floor(sec / 10)}</div>
              <div className="bg-gray-200 text-red-600 font-bold px-2 py-1 rounded text-xl font-mono transition-all duration-300">{sec % 10}</div>
           </div>
           <div className="text-xs text-gray-400 mt-1 font-bold">Period: {periodId.slice(-8)}</div>
        </div>
      </div>

      {/* Betting Board with COUNTDOWN OVERLAY */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow-sm relative overflow-hidden">
         
         {/* --- 5 SECONDS COUNTDOWN OVERLAY --- */}
         {timeLeft <= 5 && (
            <div className="absolute inset-0 z-30 bg-gray-200/50 backdrop-blur-[3px] flex items-center justify-center select-none">
                 <div key={timeLeft} className="text-[150px] font-black text-red-600 leading-none animate-pulse-scale drop-shadow-2xl" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                     {timeLeft}
                 </div>
            </div>
         )}

         <div className="flex justify-between mb-4 gap-2">
            <button onClick={() => handleBetClick('Green')} className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-200 hover:opacity-90 btn-press">Hijau</button>
            <button onClick={() => handleBetClick('Violet')} className="flex-1 bg-violet-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-violet-200 hover:opacity-90 btn-press">Ungu</button>
            <button onClick={() => handleBetClick('Red')} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-red-200 hover:opacity-90 btn-press">Merah</button>
         </div>

         <div className="grid grid-cols-5 gap-3 mb-4">
            {[0,1,2,3,4,5,6,7,8,9].map(num => (
               <button 
                  key={num}
                  onClick={() => handleBetClick(num.toString())}
                  className="aspect-square rounded-full relative flex items-center justify-center overflow-hidden shadow-sm btn-press group"
               >
                  <div className={`absolute inset-0 ${getBallClass(num)} opacity-90 group-active:opacity-100`}></div>
                  <span className="relative z-10 text-white text-xl font-bold heading-font">{num}</span>
               </button>
            ))}
         </div>

         <div className="flex gap-2">
            <button onClick={() => handleBetClick('Big')} className="flex-1 bg-orange-400 text-white py-2 rounded-full font-bold hover:bg-orange-500 btn-press">Besar</button>
            <button onClick={() => handleBetClick('Small')} className="flex-1 bg-blue-500 text-white py-2 rounded-full font-bold hover:bg-blue-600 btn-press">Kecil</button>
         </div>
      </div>

      {/* History / Charts Tabs */}
      <div className="mt-6 bg-white min-h-[400px] rounded-t-[20px] shadow-inner transition-colors duration-300">
         <div className="flex border-b">
            {['Game', 'Chart', 'History'].map(tab => (
               <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 font-bold text-sm transition-all duration-300 relative ${activeTab === tab ? 'text-red-600' : 'text-gray-400'}`}
               >
                  {tab === 'Game' ? 'Hasil permainan' : tab === 'Chart' ? 'Grafik trend' : 'Riwayat saya'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-red-600 rounded-full animate-pop"></div>
                  )}
               </button>
            ))}
         </div>

         <div className="p-4">
            {activeTab === 'Game' && (
               <div className="space-y-0 animate-fade-in">
                  <div className="grid grid-cols-4 bg-red-500 text-white text-xs py-2 rounded-t-lg font-bold text-center">
                     <div>Periode</div>
                     <div>Angka</div>
                     <div>Besar Kecil</div>
                     <div>Warna</div>
                  </div>
                  {gameHistory.map((res, i) => (
                     <div key={i} className={`grid grid-cols-4 text-center py-3 text-sm border-b items-center transition-colors hover:bg-red-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <div className="text-gray-600">{res.period.slice(-11)}</div>
                        <div className={`font-bold text-lg animate-pop`} style={{ color: getBallClass(res.number).includes('red') ? '#ef4444' : getBallClass(res.number).includes('green') ? '#22c55e' : '#a855f7' }}>{res.number}</div>
                        <div className="text-gray-600">{res.size === 'Big' ? 'Besar' : 'Kecil'}</div>
                        <div className="flex justify-center gap-1">
                           {res.color.includes('Green') && <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>}
                           {res.color.includes('Red') && <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>}
                           {res.color.includes('Violet') && <div className="w-3 h-3 rounded-full bg-violet-500 shadow-sm"></div>}
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {activeTab === 'Chart' && (
              <div className="h-64 w-full pt-4 animate-fade-in">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gameHistory.slice(0, 10).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="period" tickFormatter={(val) => val.slice(-4)} tick={{fontSize: 10}} />
                    <YAxis domain={[0, 9]} hide />
                    <Tooltip />
                    <Area type="monotone" dataKey="number" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} animationDuration={1000} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center text-xs text-gray-500">Visualisasi 10 putaran terakhir ({activeGameMode})</div>
              </div>
            )}

            {activeTab === 'History' && (
              <div className="space-y-3 animate-fade-in">
                 {myBets.filter(b => b.gameMode === activeGameMode && b.userId === user?.id).length === 0 ? <div className="text-center text-gray-400 py-10">Tidak ada riwayat untuk mode {activeGameMode}</div> : 
                  myBets.filter(b => b.gameMode === activeGameMode && b.userId === user?.id).map((bet) => (
                    <div key={bet.id} className="border rounded-lg p-3 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                       <div>
                          <div className="text-xs text-gray-400">ID: {bet.period.slice(-11)}</div>
                          <div className="font-bold text-gray-700">Select: {bet.select}</div>
                       </div>
                       <div className="text-right">
                          <div className={`text-sm font-bold ${bet.status === 'Win' ? 'text-green-500' : bet.status === 'Loss' ? 'text-red-500' : 'text-orange-400'}`}>
                             {bet.status}
                          </div>
                          <div className="text-xs font-medium">Rp{bet.amount * bet.multiplier}</div>
                          {bet.status === 'Win' && <div className="text-xs text-green-600 animate-pop">+Rp{bet.winAmount}</div>}
                       </div>
                    </div>
                  ))
                 }
              </div>
            )}
         </div>
      </div>

      {/* RULES MODAL */}
      {showRules && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowRules(false)}>
              <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-pop relative" onClick={e => e.stopPropagation()}>
                  <div className="bg-red-600 p-4 text-white flex justify-between items-center">
                      <h3 className="font-bold flex items-center gap-2"><HelpCircle size={20}/> Aturan Bermain</h3>
                      <button onClick={() => setShowRules(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="p-6 max-h-[70vh] overflow-y-auto">
                      <div className="space-y-6">
                          <div>
                              <h4 className="font-bold text-green-600 mb-2 border-b border-green-100 pb-1">1. Hijau</h4>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                  Jika hasil menunjukkan angka <strong>1, 3, 7, 9</strong>, Anda menang. (Odds 2x) <br/>
                                  Jika hasil menunjukkan angka <strong>5</strong>, Anda menang setengah. (Odds 1.5x)
                              </p>
                          </div>
                          <div>
                              <h4 className="font-bold text-red-600 mb-2 border-b border-red-100 pb-1">2. Merah</h4>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                  Jika hasil menunjukkan angka <strong>2, 4, 6, 8</strong>, Anda menang. (Odds 2x) <br/>
                                  Jika hasil menunjukkan angka <strong>0</strong>, Anda menang setengah. (Odds 1.5x)
                              </p>
                          </div>
                          <div>
                              <h4 className="font-bold text-violet-600 mb-2 border-b border-violet-100 pb-1">3. Ungu</h4>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                  Jika hasil menunjukkan angka <strong>0 atau 5</strong>, Anda menang. (Odds 4.5x)
                              </p>
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">4. Angka (0-9)</h4>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                  Jika hasil angka sama dengan pilihan Anda, Anda menang. (Odds 9x)
                              </p>
                          </div>
                          <div>
                              <h4 className="font-bold text-orange-500 mb-2 border-b border-orange-100 pb-1">5. Besar / Kecil</h4>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                  <strong>Kecil:</strong> Angka 0-4 <br/>
                                  <strong>Besar:</strong> Angka 5-9 <br/>
                                  (Odds 2x)
                              </p>
                          </div>
                      </div>
                      <div className="mt-6 bg-gray-50 p-3 rounded-lg text-[10px] text-gray-500 text-center">
                          *Semua kemenangan dipotong biaya administrasi 2%
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL TARUHAN */}
      {selectedBet && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedBet(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-pop relative" 
            onClick={(e) => e.stopPropagation()}
          >
             {/* Header */}
             <div className={`${getHeaderColor(selectedBet)} p-5 text-white relative overflow-hidden transition-all duration-500`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mt-8 -mr-8 blur-xl"></div>
                <div className="relative z-10 text-center">
                    <h2 className="text-xl font-bold tracking-wide">Win Go {activeGameMode}</h2>
                    <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mt-2">
                        Pilihan Anda: <span className="font-bold text-white uppercase ml-1">{selectedBet}</span>
                    </div>
                </div>
                
                <button 
                onClick={() => setSelectedBet(null)} 
                className="absolute top-4 right-4 bg-white/20 p-1 rounded-full hover:bg-white/30 transition-colors z-50 cursor-pointer"
                >
                    <X size={16} className="text-white"/>
                </button>
             </div>

             <div className="p-6 relative">
                {/* Money Selection */}
                <div className="mb-6">
                    <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">Nominal Taruhan</p>
                    <div className="grid grid-cols-4 gap-2">
                        {[1000, 10000, 100000, 1000000].map(amt => (
                        <button 
                            key={amt}
                            onClick={() => setBetAmount(amt)}
                            className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 border ${betAmount === amt ? 'bg-gray-800 text-white border-gray-800 shadow-md transform scale-105' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'}`}
                        >
                            {amt >= 1000 ? `${amt/1000}k` : amt}
                        </button>
                        ))}
                    </div>
                </div>

                {/* Multiplier */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Jumlah (Multiplier)</p>
                        <span className="text-sm font-bold text-gray-800">x{multiplier}</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-100 rounded-full p-1 mb-3">
                        <button onClick={() => setMultiplier(Math.max(1, multiplier - 1))} className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-lg font-bold text-gray-600 active:scale-90 transition-transform">-</button>
                        <div className="flex-1 text-center font-bold text-xl text-gray-800">{multiplier}</div>
                        <button onClick={() => setMultiplier(multiplier + 1)} className={`w-10 h-10 shadow-lg rounded-full flex items-center justify-center text-lg font-bold text-white active:scale-90 transition-transform ${getHeaderColor(selectedBet).split(' ')[0]}`}>+</button>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {[1, 5, 10, 20, 50, 100].map(mult => (
                        <button 
                            key={mult}
                            onClick={() => setMultiplier(mult)}
                            className={`flex-1 min-w-[40px] py-1.5 rounded-md text-[10px] font-bold transition-colors border ${multiplier === mult ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}
                        >
                            x{mult}
                        </button>
                        ))}
                    </div>
                </div>
                
                {/* Agreement */}
                <div className="flex items-center gap-2 mb-6 p-2 bg-gray-50 rounded-lg">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white ${getHeaderColor(selectedBet).split(' ')[0]}`}>✓</div>
                    <span className="text-[10px] text-gray-500">Saya setuju dengan <span className="font-bold cursor-pointer hover:underline text-gray-700">Peraturan Presale</span></span>
                </div>
                
                {/* Total & Action */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-500">Total Taruhan</span>
                        <span className={`text-2xl font-bold ${getTextColor(selectedBet)}`}>
                            Rp{(betAmount * multiplier).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setSelectedBet(null)} 
                            className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={confirmBet} 
                            className={`flex-[2] py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 relative overflow-hidden
                                ${getHeaderColor(selectedBet)}
                            `}
                        >
                            Pasang Taruhan
                        </button>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* CS Modal */}
      {showCS && user && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm h-[500px] rounded-2xl flex flex-col shadow-2xl animate-pop overflow-hidden">
                  <div className="bg-red-600 text-white p-4 flex justify-between items-center">
                      <div className="font-bold flex items-center gap-2"><Headset/> Customer Support</div>
                      <button onClick={() => setShowCS(false)}><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                      <div className="bg-yellow-50 p-2 rounded text-xs text-gray-500 text-center border border-yellow-200 shadow-sm">Chat Bantuan ({user.username})</div>
                      {myMessages.length === 0 && <div className="text-center text-gray-400 mt-10 bg-white/50 p-2 rounded-lg inline-block mx-auto">Mulai percakapan dengan admin...</div>}
                      {myMessages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm shadow-sm relative ${msg.sender === 'user' ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' : 'bg-white border rounded-tl-none text-gray-700'}`}>
                                  {msg.text}
                                  <div className="text-[9px] text-gray-400 mt-1 flex justify-end items-center gap-1 min-w-[50px]">
                                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      {msg.sender === 'user' && <MessageStatus status={msg.status} />}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="p-3 border-t bg-white flex gap-2">
                      <input 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ketik pesan..."
                          className="flex-1 bg-gray-100 rounded-full px-4 text-sm outline-none border focus:border-green-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                      />
                      <button onClick={handleSendChat} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                          <Send size={18} />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
