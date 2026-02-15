
import React, { useState, useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, X, Activity, MoreHorizontal, ChevronDown, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { MarketType } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Trading() {
  const navigate = useNavigate();
  const { marketPrices, marketHistories, tradingPositions, openPosition, closePosition, closeAllPositions, balance, isDemo } = useApp();
  
  const [selectedMarket, setSelectedMarket] = useState<MarketType>('55Five');
  const [amount, setAmount] = useState<number>(10000);
  
  // Timeframe State
  const [timeframe55, setTimeframe55] = useState('1m');
  const [timeframePreA, setTimeframePreA] = useState('30s');

  const currentPrice = marketPrices[selectedMarket];
  const fullHistory = marketHistories[selectedMarket];
  const activePositions = tradingPositions.filter(p => p.status === 'Open' && p.market === selectedMarket);

  // Configuration
  const TIME_FRAMES_55 = ['1s', '30s', '1m', '3m', '5m', '1h', '10h', '24h', '1w', '1m', '1y'];
  const TIME_FRAMES_PREA = ['30s', '1Min', '3Min', '5Min'];

  // Handle Chart Data Slicing (Simulate Timeframe View)
  const chartData = useMemo(() => {
    const activeTimeframe = selectedMarket === '55Five' ? timeframe55 : timeframePreA;
    let limit = 100;

    // Simulation: Zoom level based on timeframe
    if (selectedMarket === '55Five') {
        if (['1s', '30s'].includes(activeTimeframe)) limit = 30;
        else if (['1m', '3m'].includes(activeTimeframe)) limit = 60;
        else if (['5m', '1h'].includes(activeTimeframe)) limit = 150;
        else limit = 300; // Wide view for long timeframes
    } else {
        // PreA Logic
        if (activeTimeframe === '30s') limit = 30;
        else if (activeTimeframe === '1Min') limit = 60;
        else if (activeTimeframe === '3Min') limit = 180;
        else limit = 300;
    }

    return fullHistory.slice(-limit);
  }, [fullHistory, selectedMarket, timeframe55, timeframePreA]);

  // Calculate stats for chart color
  const startPrice = chartData.length > 0 ? chartData[0].price : 0;
  const isUp = currentPrice >= startPrice;
  const chartColor = isUp ? '#10b981' : '#ef4444'; // Green or Red

  const handleOpenPosition = (direction: 'Buy' | 'Sell') => {
      if (amount < 1000) {
          alert("Minimal trading Rp1.000");
          return;
      }
      openPosition(amount, selectedMarket, direction);
  };

  const handleCloseAll = (type: 'All' | 'Profit' | 'Loss') => {
      if (activePositions.length === 0) return;
      if (confirm(`Yakin ingin menutup ${type === 'All' ? 'SEMUA' : type} posisi di ${selectedMarket}?`)) {
          closeAllPositions(type, selectedMarket);
      }
  };

  // Profit Calculation for Summary
  const currentFloatingPL = activePositions.reduce((acc, pos) => {
        let pnlPercent = 0;
        if (pos.direction === 'Buy') pnlPercent = (currentPrice - pos.entryPrice) / pos.entryPrice;
        else pnlPercent = (pos.entryPrice - currentPrice) / pos.entryPrice;
        return acc + (pos.amount * pnlPercent * pos.leverage);
  }, 0);

  return (
    <div className="bg-[#0b0e11] min-h-screen text-[#d1d4dc] font-sans flex flex-col pb-[140px] animate-fade-in overflow-hidden">
        {/* HEADER MINIMALIST */}
        <div className="flex items-center justify-between p-4 bg-[#0b0e11] z-20">
            <div className="flex items-center gap-3">
                 <button onClick={() => navigate(-1)} className="text-[#848e9c] hover:text-white p-1 rounded-full active:bg-[#1e222d]"><ArrowLeft/></button>
                 <div className="flex flex-col">
                     <button className="flex items-center gap-1 font-bold text-lg text-white">
                        {selectedMarket} <ChevronDown size={14}/>
                     </button>
                     <span className={`text-xs font-mono font-bold ${isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                        {currentPrice.toFixed(2)}
                     </span>
                 </div>
            </div>
            <div className="flex gap-2">
                {(['55Five', 'PreA'] as MarketType[]).map(m => (
                    <button 
                        key={m}
                        onClick={() => setSelectedMarket(m)}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all border ${selectedMarket === m ? 'bg-[#2962ff] border-[#2962ff] text-white' : 'bg-transparent border-[#2a2e39] text-[#848e9c]'}`}
                    >
                        {m === '55Five' ? 'CRYPTO' : 'PRE-A'}
                    </button>
                ))}
            </div>
        </div>

        {/* TIMEFRAME SELECTOR (SCROLLABLE) */}
        <div className="border-b border-[#1e222d]">
            <div className="flex overflow-x-auto no-scrollbar px-4 py-2 gap-4">
                {(selectedMarket === '55Five' ? TIME_FRAMES_55 : TIME_FRAMES_PREA).map((tf) => (
                    <button
                        key={tf}
                        onClick={() => selectedMarket === '55Five' ? setTimeframe55(tf) : setTimeframePreA(tf)}
                        className={`text-xs font-medium whitespace-nowrap transition-colors relative ${
                            (selectedMarket === '55Five' ? timeframe55 : timeframePreA) === tf 
                            ? 'text-[#2962ff]' 
                            : 'text-[#848e9c] hover:text-white'
                        }`}
                    >
                        {tf}
                        {(selectedMarket === '55Five' ? timeframe55 : timeframePreA) === tf && (
                            <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#2962ff]"></span>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* CHART AREA */}
        <div className="h-[40vh] w-full bg-[#0b0e11] relative my-2">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e222d" />
                    <XAxis 
                        dataKey="time" 
                        tickFormatter={(t) => new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} 
                        tick={{fontSize: 9, fill: '#555'}}
                        minTickGap={40}
                        axisLine={false}
                        tickLine={false}
                        height={20}
                    />
                    <YAxis 
                        domain={['auto', 'auto']} 
                        orientation="right" 
                        tick={{fontSize: 9, fill: '#555'}}
                        tickCount={5}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={chartColor} 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        isAnimationActive={false} 
                        strokeWidth={1.5}
                    />
                </AreaChart>
            </ResponsiveContainer>
            
            {/* Live PnL Overlay */}
            {activePositions.length > 0 && (
                <div className="absolute top-2 left-4">
                    <div className="text-[10px] text-[#848e9c]">Floating PnL</div>
                    <div className={`text-lg font-bold ${currentFloatingPL >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                        {currentFloatingPL > 0 ? '+' : ''}{Math.round(currentFloatingPL).toLocaleString()}
                    </div>
                </div>
            )}
        </div>

        {/* POSITIONS & CONTROLS CONTAINER */}
        <div className="flex-1 bg-[#1e222d] rounded-t-[24px] p-4 relative shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
             
             {/* DRAG HANDLE */}
             <div className="w-12 h-1 bg-[#2a2e39] rounded-full mx-auto mb-4"></div>

             {/* BULK CLOSE ACTIONS */}
             <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-sm text-white">Posisi ({activePositions.length})</h3>
                 <div className="flex gap-2">
                     <button onClick={() => handleCloseAll('Profit')} className="px-3 py-1.5 rounded-full bg-[#0ECB81]/10 text-[#0ECB81] text-[10px] font-bold border border-[#0ECB81]/20 hover:bg-[#0ECB81]/20">
                        TP Profit
                     </button>
                     <button onClick={() => handleCloseAll('Loss')} className="px-3 py-1.5 rounded-full bg-[#F6465D]/10 text-[#F6465D] text-[10px] font-bold border border-[#F6465D]/20 hover:bg-[#F6465D]/20">
                        CL Loss
                     </button>
                     <button onClick={() => handleCloseAll('All')} className="px-3 py-1.5 rounded-full bg-[#2a2e39] text-[#848e9c] text-[10px] font-bold border border-[#848e9c]/20 hover:bg-[#363a45]">
                        Close All
                     </button>
                 </div>
             </div>

             {/* POSITIONS LIST */}
             <div className="space-y-2 overflow-y-auto max-h-[200px] no-scrollbar pb-20">
                 {activePositions.length === 0 ? (
                     <div className="text-center py-8 text-[#2a2e39]">
                         <Activity size={32} className="mx-auto mb-2 opacity-20"/>
                         <div className="text-xs font-bold opacity-40">Tidak ada posisi terbuka</div>
                     </div>
                 ) : (
                     activePositions.map(pos => {
                         let pnlPercent = 0;
                         if (pos.direction === 'Buy') pnlPercent = (currentPrice - pos.entryPrice) / pos.entryPrice;
                         else pnlPercent = (pos.entryPrice - currentPrice) / pos.entryPrice;
                         const profit = pos.amount * pnlPercent * pos.leverage;
                         const isProfit = profit >= 0;

                         return (
                             <div key={pos.id} className="bg-[#131722] p-3 rounded-xl border border-[#2a2e39] flex justify-between items-center group">
                                 <div className="flex items-center gap-3">
                                     <div className={`w-1 rounded-full h-8 ${pos.direction === 'Buy' ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'}`}></div>
                                     <div>
                                         <div className="flex items-center gap-2">
                                             <span className={`text-[10px] font-black ${pos.direction === 'Buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                                                 {pos.direction.toUpperCase()}
                                             </span>
                                             <span className="text-[10px] text-[#848e9c]">x{pos.leverage}</span>
                                         </div>
                                         <div className="text-xs font-mono text-white mt-0.5">{pos.entryPrice.toFixed(2)}</div>
                                     </div>
                                 </div>
                                 
                                 <div className="text-center">
                                     <div className="text-[10px] text-[#848e9c] mb-0.5">Margin</div>
                                     <div className="text-xs font-bold text-white">{pos.amount/1000}k</div>
                                 </div>

                                 <div className="text-right">
                                     <div className={`font-mono font-bold text-sm ${isProfit ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                                         {isProfit ? '+' : ''}{Math.round(profit).toLocaleString()}
                                     </div>
                                     <button onClick={() => closePosition(pos.id)} className="text-[10px] text-[#848e9c] hover:text-white underline decoration-dotted">
                                         Tutup
                                     </button>
                                 </div>
                             </div>
                         )
                     })
                 )}
             </div>
        </div>

        {/* FOOTER CONTROLS - FIXED BOTTOM */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1e222d] p-4 z-40 border-t border-[#2a2e39] shadow-2xl">
             {/* Margin Selector */}
             <div className="flex justify-between items-center mb-3 px-1">
                 <div className="text-xs text-[#848e9c]">Saldo: <span className="text-white font-bold">Rp{balance.toLocaleString()}</span></div>
                 <div className="flex gap-1">
                     {[10000, 50000, 100000].map(amt => (
                         <button 
                            key={amt} 
                            onClick={() => setAmount(amt)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${amount === amt ? 'bg-white text-black border-white' : 'bg-[#2a2e39] text-[#848e9c] border-[#848e9c]/30'}`}
                         >
                             {amt/1000}k
                         </button>
                     ))}
                 </div>
             </div>

             {/* Big Action Buttons */}
             <div className="flex gap-3 h-12">
                 <button 
                    onClick={() => handleOpenPosition('Buy')}
                    className="flex-1 bg-[#0ECB81] hover:brightness-110 text-white rounded-lg font-bold shadow-[0_4px_0_#059669] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                 >
                     <TrendingUp size={18} strokeWidth={3}/>
                     <span>BUY UP</span>
                 </button>
                 <button 
                    onClick={() => handleOpenPosition('Sell')}
                    className="flex-1 bg-[#F6465D] hover:brightness-110 text-white rounded-lg font-bold shadow-[0_4px_0_#DC2626] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                 >
                     <TrendingDown size={18} strokeWidth={3}/>
                     <span>SELL DOWN</span>
                 </button>
             </div>
        </div>
    </div>
  );
}
