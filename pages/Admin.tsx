
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { ShieldAlert, Users, DollarSign, Lock, RefreshCcw, Search, Check, CheckCheck, MessageSquare, Send, Crown, ArrowLeft, Headset, RotateCw, Image as ImageIcon, Upload, Circle, Copy, Save, Edit2, Smartphone, Mail, Info, X, Ban, Trash2, Eye } from 'lucide-react';
import { GameMode, Role, User } from '../types';

const MessageStatus = ({ status }: { status: 'sent' | 'delivered' | 'read' }) => {
    if (status === 'sent') return <Check size={12} className="text-gray-400" />;
    if (status === 'delivered') return <CheckCheck size={12} className="text-gray-400" />;
    return <CheckCheck size={12} className="text-blue-500" />;
};

const CopyButton = ({ text, label }: { text: string | undefined, label: string }) => {
    const [copied, setCopied] = useState(false);
    const val = text || '-';

    const handleCopy = () => {
        if(!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy} 
            className="flex items-center justify-between w-full text-xs bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded border border-gray-200 transition-colors group"
            title={`Copy ${label}`}
        >
            <span className="truncate font-mono text-gray-700 mr-2">{val}</span>
            {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14} className="text-gray-400 group-hover:text-gray-600"/>}
        </button>
    );
};

export default function Admin() {
  const { 
      user, allUsers, adminUpdateUser, toggleUserBan,
      activeGameMode, forcedResults, predictedResults, setForcedResult, allActiveBets,
      csMessages, sendCSMessage, markChatAsRead,
      transactions, processTransaction, adminQrisImage, setAdminQrisImage,
      marketPrices, tradingPositions, periodId, timeLeft
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Game' | 'Users' | 'CS' | 'Deposit' | 'Trading'>('Dashboard');
  const [selectedMode, setSelectedMode] = useState<GameMode>('30s');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Chat State
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatText, setChatText] = useState('');
  const [showUserDetailsMobile, setShowUserDetailsMobile] = useState(false); 
  
  // Edit States
  const [editBalance, setEditBalance] = useState<string>('');
  const [editUserRole, setEditUserRole] = useState<Role>('user');

  useEffect(() => {
      if (selectedChatUser) {
          const u = allUsers.find(user => user.id === selectedChatUser);
          if (u) setEditBalance(u.balance.toString());
          setShowUserDetailsMobile(false);
      }
  }, [selectedChatUser, allUsers]);

  useEffect(() => {
    if(selectedUserDetail) {
        setEditBalance(selectedUserDetail.balance.toString());
        setEditUserRole(selectedUserDetail.role);
    }
  }, [selectedUserDetail]);
  
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return <div className="p-10 text-center text-red-500 font-bold">ACCESS DENIED</div>;
  }
  const isSuperAdmin = user.role === 'super_admin';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSendChat = () => {
      if((!chatText.trim()) || !selectedChatUser) return;
      sendCSMessage(chatText, 'admin', selectedChatUser);
      setChatText('');
  };

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => { setAdminQrisImage(reader.result as string); };
          reader.readAsDataURL(file);
      }
  };

  const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && selectedChatUser) {
          const reader = new FileReader();
          reader.onloadend = () => {
              sendCSMessage('', 'admin', selectedChatUser, reader.result as string);
          };
          reader.readAsDataURL(file);
      }
      e.target.value = ''; 
  };

  const handleUpdateUser = () => {
      if (selectedUserDetail && editBalance) {
          adminUpdateUser(selectedUserDetail.id, { 
              balance: parseInt(editBalance),
              role: editUserRole
          });
          alert("Data user berhasil diperbarui!");
          setSelectedUserDetail(null);
      }
  };

  const handleQuickSetResult = (type: string) => {
      let candidateNumbers: number[] = [];
      
      if (type === 'Green') candidateNumbers = [1, 3, 7, 9, 5];
      else if (type === 'Red') candidateNumbers = [2, 4, 6, 8, 0];
      else if (type === 'Violet') candidateNumbers = [0, 5];
      else if (type === 'Big') candidateNumbers = [5, 6, 7, 8, 9];
      else if (type === 'Small') candidateNumbers = [0, 1, 2, 3, 4];
      
      if (candidateNumbers.length > 0) {
          const randomNum = candidateNumbers[Math.floor(Math.random() * candidateNumbers.length)];
          setForcedResult(selectedMode, randomNum);
      }
  };

  // Helper for Ball CSS (Matching User UI)
  const getBallClass = (num: number) => {
    if ([1, 3, 7, 9].includes(num)) return 'bg-green-500';
    if ([2, 4, 6, 8].includes(num)) return 'bg-red-500';
    if (num === 0) return 'bg-gradient-to-r from-red-500 to-violet-500';
    if (num === 5) return 'bg-gradient-to-r from-green-500 to-violet-500';
    return 'bg-gray-400';
  };

  const getHeaderColor = (bet: string) => {
    if (['Violet', '0', '5'].includes(bet)) return 'bg-gradient-to-r from-violet-500 to-violet-700 shadow-violet-200';
    if (['Green', '1', '3', '7', '9'].includes(bet)) return 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-200';
    if (['Red', '2', '4', '6', '8'].includes(bet)) return 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-200';
    if (bet === 'Big') return 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-orange-200';
    if (bet === 'Small') return 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-200';
    return 'bg-gradient-to-r from-gray-700 to-gray-800';
  };

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');

  const filteredUsers = allUsers.filter(u => 
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm)
  );
  
  const sortedUsersByBalance = [...allUsers].sort((a,b) => b.balance - a.balance).slice(0, 5);

  const uniqueChatUsers = Array.from(new Set(csMessages.map(m => m.userId)));
  const currentChatMessages = selectedChatUser ? csMessages.filter(m => m.userId === selectedChatUser) : [];
  const currentChatUserProfile = selectedChatUser ? allUsers.find(u => u.id === selectedChatUser) : null;

  return (
    <div className="bg-gray-100 min-h-screen pb-24 font-sans">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 rounded-b-[30px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex justify-between items-center relative z-10">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {isSuperAdmin ? <Crown className="text-yellow-400" /> : <ShieldAlert className="text-blue-400" />} 
                        Admin Panel
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveTab('CS')} className="bg-gray-800 p-2 rounded-full border border-gray-700 relative hover:bg-gray-700 transition-colors">
                         <Headset size={20} className={activeTab === 'CS' ? 'text-green-400' : 'text-gray-400'} />
                         {csMessages.filter(m => m.sender === 'user' && m.status !== 'read').length > 0 && 
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-gray-900"></span>
                         }
                    </button>
                    <button onClick={handleRefresh} className="bg-gray-800 p-2 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors">
                         <RotateCw size={20} className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <div className="px-4 mt-4 overflow-x-auto no-scrollbar">
            <div className="bg-white rounded-full p-1 flex shadow-sm min-w-max">
                {(['Dashboard', 'Game', 'Users', 'Deposit', 'CS', 'Trading'] as const).map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${activeTab === tab ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        {tab === 'Deposit' && pendingDeposits.length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        {tab === 'CS' && csMessages.filter(m => m.sender === 'user' && m.status !== 'read').length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        <div className="p-4 space-y-4">
            {activeTab === 'Dashboard' && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Users className="text-blue-500 mb-2" size={20}/>
                        <div className="text-2xl font-bold">{allUsers.length}</div>
                        <div className="text-xs text-gray-500">Total Users</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <DollarSign className="text-green-500 mb-2" size={20}/>
                        <div className="text-2xl font-bold">Rp{allUsers.reduce((acc, u) => acc + u.balance, 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total User Balance</div>
                    </div>
                </div>
            )}

            {/* === USER MANAGEMENT TAB === */}
            {activeTab === 'Users' && (
                 <div>
                    {/* Top 5 Sultan Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 shadow-lg mb-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10"><Crown className="text-yellow-400"/> Top 5 Sultan (Highest Balance)</h3>
                        <div className="space-y-3 relative z-10">
                            {sortedUsersByBalance.map((u, index) => {
                                let rankColor = "bg-gray-700";
                                let rankIcon = <span className="font-bold text-gray-400">{index+1}</span>;
                                if(index === 0) { rankColor = "bg-gradient-to-r from-yellow-400 to-yellow-600"; rankIcon = <Crown size={14} className="text-white"/>; }
                                if(index === 1) { rankColor = "bg-gradient-to-r from-gray-300 to-gray-400"; rankIcon = <span className="font-bold text-white">2</span>; }
                                if(index === 2) { rankColor = "bg-gradient-to-r from-orange-400 to-orange-600"; rankIcon = <span className="font-bold text-white">3</span>; }

                                return (
                                    <div key={u.id} className="flex items-center justify-between bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/5 hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setSelectedUserDetail(u)}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${rankColor}`}>
                                                {rankIcon}
                                            </div>
                                            <img src={u.avatar} className="w-8 h-8 rounded-full border border-white/20"/>
                                            <div>
                                                <div className="font-bold text-xs">{u.name || u.username}</div>
                                                <div className="text-[10px] opacity-70">UID: {u.id}</div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm text-yellow-400">Rp{u.balance.toLocaleString()}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-lg flex items-center gap-2 shadow-sm mb-4 border border-gray-200">
                        <Search size={18} className="text-gray-400 ml-2"/>
                        <input className="flex-1 outline-none text-sm bg-transparent" placeholder="Search users by name, id, or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                    
                    <div className="space-y-3">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedUserDetail(u)}>
                                <div className="flex items-center gap-3">
                                    <img src={u.avatar} className="w-10 h-10 rounded-full bg-gray-100 object-cover"/>
                                    <div>
                                        <div className="font-bold text-gray-800">{u.username}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            {u.role === 'admin' ? <ShieldAlert size={10} className="text-blue-500"/> : <Users size={10}/>} 
                                            {u.role} • {u.phone}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-bold text-gray-800 text-sm">Rp{u.balance.toLocaleString()}</span>
                                    {u.isBanned && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded font-bold">BANNED</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
            
            {/* === GAME CONTROL TAB === */}
            {activeTab === 'Game' && (
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Crown size={18} className="text-yellow-500"/> Win Go Control</h3>
                        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">Period: {periodId.slice(-8)}</div>
                    </div>

                    {/* Mode Selector */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        {['30s', '1Min', '3Min', '5Min'].map((m) => (
                            <button 
                                key={m}
                                onClick={() => setSelectedMode(m as GameMode)}
                                className={`py-2 text-xs font-bold rounded-lg border transition-all ${selectedMode === m ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* Result Indicators */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center relative overflow-hidden">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">System Result</div>
                            <div className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-900`}>
                                {predictedResults[selectedMode]}
                            </div>
                            <div className="absolute top-2 right-2 text-gray-300"><RotateCw size={12} className="animate-spin-slow"/></div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center relative overflow-hidden">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Admin Force</div>
                            {forcedResults[selectedMode] !== null ? (
                                <div className="text-3xl font-bold text-red-600 animate-pop">
                                    {forcedResults[selectedMode]}
                                </div>
                            ) : (
                                <div className="text-sm font-bold text-gray-400 mt-2">None</div>
                            )}
                            {forcedResults[selectedMode] !== null && (
                                <button onClick={() => setForcedResult(selectedMode, null)} className="absolute top-1 right-1 bg-red-100 p-1 rounded text-red-500 hover:bg-red-200"><X size={12}/></button>
                            )}
                        </div>
                    </div>

                    {/* Control Board (Identical to User UI) */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                        <div className="text-center text-xs text-gray-400 font-bold mb-3 uppercase">Set Result for Next Period</div>
                        
                        <div className="flex justify-between mb-4 gap-2">
                            <button onClick={() => handleQuickSetResult('Green')} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold shadow-lg shadow-green-200 hover:opacity-90 active:scale-95 transition-transform text-xs">Hijau</button>
                            <button onClick={() => handleQuickSetResult('Violet')} className="flex-1 bg-violet-500 text-white py-2 rounded-lg font-bold shadow-lg shadow-violet-200 hover:opacity-90 active:scale-95 transition-transform text-xs">Ungu</button>
                            <button onClick={() => handleQuickSetResult('Red')} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold shadow-lg shadow-red-200 hover:opacity-90 active:scale-95 transition-transform text-xs">Merah</button>
                        </div>

                        <div className="grid grid-cols-5 gap-3 mb-4">
                            {[0,1,2,3,4,5,6,7,8,9].map(num => (
                                <button 
                                    key={num}
                                    onClick={() => setForcedResult(selectedMode, num)}
                                    className={`
                                        aspect-square rounded-full relative flex items-center justify-center overflow-hidden shadow-sm active:scale-90 transition-transform group
                                        ${forcedResults[selectedMode] === num ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : ''}
                                    `}
                                >
                                    <div className={`absolute inset-0 ${getBallClass(num)} opacity-90 group-hover:opacity-100`}></div>
                                    <span className="relative z-10 text-white font-bold text-lg shadow-sm">{num}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => handleQuickSetResult('Big')} className="flex-1 bg-orange-400 text-white py-2 rounded-full font-bold hover:bg-orange-500 active:scale-95 transition-transform text-xs shadow-orange-200 shadow-md">Besar</button>
                            <button onClick={() => handleQuickSetResult('Small')} className="flex-1 bg-blue-500 text-white py-2 rounded-full font-bold hover:bg-blue-600 active:scale-95 transition-transform text-xs shadow-blue-200 shadow-md">Kecil</button>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Bets ({selectedMode})</div>
                            <div className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Total: Rp{allActiveBets.filter(b => b.gameMode === selectedMode).reduce((acc, b) => acc + (b.amount * b.multiplier), 0).toLocaleString()}</div>
                        </div>
                         <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {allActiveBets.filter(b => b.gameMode === selectedMode).length === 0 ? <div className="text-xs text-gray-400 italic text-center py-4">No active bets</div> :
                                allActiveBets
                                .filter(b => b.gameMode === selectedMode)
                                .sort((a,b) => (b.amount * b.multiplier) - (a.amount * a.multiplier)) // Sort by amount descending
                                .map((bet, idx) => (
                                    <div key={bet.id} className={`flex justify-between items-center text-xs p-3 rounded border ${idx < 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-5 h-5 flex items-center justify-center rounded-full font-bold text-[10px] ${idx < 3 ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                                {idx+1}
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-700 block">{bet.username}</span>
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] text-white font-bold mt-0.5 ${getHeaderColor(bet.select).split(' ')[0]}`}>{bet.select}</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-800 text-sm">Rp{(bet.amount * bet.multiplier).toLocaleString()}</span>
                                    </div>
                                ))
                            }
                         </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'Deposit' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Permintaan Deposit ({pendingDeposits.length})</h3>
                        <div className="text-xs text-gray-500">Menampilkan transaksi pending</div>
                    </div>
                    {pendingDeposits.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl shadow-sm text-gray-400">
                            Tidak ada permintaan deposit baru
                        </div>
                    ) : (
                        pendingDeposits.map(tx => (
                            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => window.open(tx.proofImage)}>
                                    {tx.proofImage ? <img src={tx.proofImage} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <div className="font-bold text-gray-800">{tx.username} <span className="text-xs font-normal text-gray-500">({tx.userId})</span></div>
                                        <div className="text-xs text-gray-400">{new Date(tx.date).toLocaleString()}</div>
                                    </div>
                                    <div className="text-xl font-bold text-blue-600 mb-2">Rp{tx.amount.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 mb-4">Method: {tx.method} | Ref: {tx.id}</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => processTransaction(tx.id, 'approve')} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-600">Terima</button>
                                        <button onClick={() => processTransaction(tx.id, 'reject')} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold text-xs hover:bg-red-600">Tolak</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            
            {activeTab === 'Trading' && (
                <div className="bg-white p-5 rounded-xl shadow-lg">
                    <h3 className="font-bold text-gray-800 mb-4">Trading Market Control</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="border p-3 rounded-lg">
                            <div className="text-xs text-gray-500">55Five Price</div>
                            <div className="font-bold text-xl">{marketPrices['55Five'].toFixed(2)}</div>
                        </div>
                        <div className="border p-3 rounded-lg">
                            <div className="text-xs text-gray-500">PreA Price</div>
                            <div className="font-bold text-xl">{marketPrices['PreA'].toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-800 mb-2 text-sm">Open Positions ({tradingPositions.filter(p=>p.status==='Open').length})</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                         {tradingPositions.filter(p=>p.status==='Open').map(pos => {
                             const currentPrice = marketPrices[pos.market];
                             const growth = currentPrice / pos.entryPrice;
                             const profit = (pos.amount * growth) - pos.amount;
                             return (
                                 <div key={pos.id} className="bg-gray-50 p-2 rounded text-xs flex justify-between items-center">
                                     <div>
                                         <div className="font-bold">{pos.market} - {pos.userId}</div>
                                         <div>Entry: {pos.entryPrice.toFixed(2)}</div>
                                     </div>
                                     <div className={`font-bold ${profit>=0?'text-green-600':'text-red-600'}`}>
                                         {profit>=0?'+':''}Rp{Math.round(profit).toLocaleString()}
                                     </div>
                                 </div>
                             )
                         })}
                    </div>
                </div>
            )}

             {activeTab === 'CS' && (
                <div className="bg-white rounded-xl shadow-lg h-[80vh] flex overflow-hidden border border-gray-200 relative">
                     <div className={`w-full md:w-72 bg-gray-50 border-r flex flex-col ${selectedChatUser ? 'hidden md:flex' : 'flex'}`}>
                         <div className="p-3 border-b bg-gray-100 font-bold text-gray-600 text-sm">Percakapan</div>
                         <div className="flex-1 overflow-y-auto">
                            {uniqueChatUsers.map(uid => {
                                const u = allUsers.find(u=>u.id===uid);
                                const unread = csMessages.filter(m => m.userId === uid && m.sender === 'user' && m.status !== 'read').length;
                                const lastMsg = csMessages.filter(m=>m.userId===uid).slice(-1)[0];
                                return (
                                    <button 
                                        key={uid} 
                                        onClick={() => { setSelectedChatUser(uid); markChatAsRead(uid, 'admin'); }} 
                                        className={`w-full text-left p-3 border-b hover:bg-white flex justify-between items-center transition-colors ${selectedChatUser === uid ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                                                <img src={u?.avatar} className="w-full h-full object-cover"/>
                                            </div>
                                            <div className="truncate flex-1">
                                                <div className="font-bold text-sm text-gray-800 truncate">{u?.username || uid}</div>
                                                <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                                    {lastMsg?.image && <ImageIcon size={10}/>}
                                                    {lastMsg?.text || (lastMsg?.image ? 'Sent an image' : 'No messages')}
                                                </div>
                                            </div>
                                        </div>
                                        {unread > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 animate-bounce">{unread}</span>}
                                    </button>
                                );
                            })}
                         </div>
                     </div>

                     <div className={`flex-1 flex flex-col bg-[#e5ddd5] relative h-full ${!selectedChatUser ? 'hidden md:flex' : 'flex'}`}>
                         {selectedChatUser ? (
                             <>
                                 <div className="p-3 bg-gray-100 border-b flex justify-between items-center shadow-sm z-10">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedChatUser(null)} className="md:hidden p-1 hover:bg-gray-200 rounded-full"><ArrowLeft/></button>
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
                                            <img src={currentChatUserProfile?.avatar} className="w-full h-full object-cover"/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">{currentChatUserProfile?.username}</div>
                                            <div className="text-[10px] text-green-600 flex items-center gap-1"><Circle size={6} fill="currentColor"/> Online</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowUserDetailsMobile(!showUserDetailsMobile)} 
                                        className="p-2 bg-white rounded-full text-blue-600 shadow-sm lg:hidden active:scale-95 transition-transform"
                                    >
                                        <Info size={20} />
                                    </button>
                                 </div>

                                 <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                                     {currentChatMessages.map(m => (
                                         <div key={m.id} className={`flex flex-col ${m.sender==='admin'?'items-end':'items-start'}`}>
                                             <div className={`max-w-[75%] p-2 rounded-lg text-sm shadow-md relative ${m.sender==='admin'?'bg-[#dcf8c6] rounded-tr-none':'bg-white rounded-tl-none'}`}>
                                                 {m.image && (
                                                     <img src={m.image} className="w-full rounded-lg mb-2 cursor-pointer border hover:opacity-90 transition-opacity" onClick={() => window.open(m.image)}/>
                                                 )}
                                                 {m.text && <span className="break-words leading-relaxed">{m.text}</span>}
                                                 <div className="text-[9px] text-gray-400 mt-1 flex justify-end gap-1">
                                                     {new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                     {m.sender === 'admin' && <MessageStatus status={m.status}/>}
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>

                                 <div className="p-3 bg-gray-100 flex items-center gap-2 border-t">
                                     <label className="cursor-pointer text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                                         <ImageIcon size={24}/>
                                         <input type="file" accept="image/*" className="hidden" onChange={handleChatImageUpload}/>
                                     </label>
                                     <input 
                                        className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 outline-none focus:border-green-500 bg-white text-sm" 
                                        placeholder="Ketik pesan..."
                                        value={chatText} 
                                        onChange={e=>setChatText(e.target.value)} 
                                        onKeyPress={e => e.key === 'Enter' && handleSendChat()}
                                     />
                                     <button onClick={() => handleSendChat()} className="bg-[#00a884] text-white p-2.5 rounded-full hover:bg-[#008f6f] shadow-sm transform active:scale-95 transition-all"><Send size={18}/></button>
                                 </div>
                             </>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                                 <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                                     <MessageSquare size={48} className="text-gray-300"/>
                                 </div>
                                 <p className="font-medium">Pilih user untuk memulai chat</p>
                             </div>
                         )}
                     </div>

                     {selectedChatUser && showUserDetailsMobile && (
                        <div className="absolute inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setShowUserDetailsMobile(false)}></div>
                     )}

                     <div className={`
                        absolute inset-y-0 right-0 w-80 bg-white border-l flex flex-col h-full shadow-2xl z-40 overflow-y-auto custom-scrollbar transform transition-transform duration-300 ease-in-out
                        lg:relative lg:translate-x-0 lg:block
                        ${selectedChatUser && showUserDetailsMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                     `}>
                        {currentChatUserProfile && (
                            <div className="p-4 space-y-4">
                                <div className="text-center">
                                    <img src={currentChatUserProfile.avatar} className="w-20 h-20 rounded-full mx-auto mb-2"/>
                                    <h3 className="font-bold">{currentChatUserProfile.name}</h3>
                                    <div className="text-xs text-gray-500">{currentChatUserProfile.id}</div>
                                </div>
                                <div className="space-y-2">
                                     <div>
                                         <label className="text-[10px] font-bold text-gray-400 uppercase">Username</label>
                                         <CopyButton text={currentChatUserProfile.username} label="Username" />
                                     </div>
                                     <div>
                                         <label className="text-[10px] font-bold text-gray-400 uppercase">Password</label>
                                         <CopyButton text={currentChatUserProfile.password} label="Password" />
                                     </div>
                                </div>
                            </div>
                        )}
                     </div>
                </div>
            )}
        </div>

        {/* --- DETAILED USER MODAL --- */}
        {selectedUserDetail && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedUserDetail(null)}>
                <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-pop" onClick={e => e.stopPropagation()}>
                    {/* Modal Header */}
                    <div className="bg-gray-900 text-white p-4 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-10 -mr-10"></div>
                        <h3 className="font-bold flex items-center gap-2 relative z-10"><UserIcon size={20}/> Detail User</h3>
                        <button onClick={() => setSelectedUserDetail(null)} className="hover:bg-white/20 p-1 rounded-full relative z-10"><X size={20}/></button>
                    </div>

                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex flex-col items-center mb-6">
                             <div className="relative">
                                <img src={selectedUserDetail.avatar} className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-lg object-cover"/>
                                {selectedUserDetail.isBanned && (
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-red-500 font-bold border-2 border-red-500 transform rotate-[-15deg]">BANNED</div>
                                )}
                             </div>
                             <h2 className="text-xl font-bold text-gray-800 mt-2">{selectedUserDetail.name}</h2>
                             <div className="flex items-center gap-2 mt-1">
                                 <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">{selectedUserDetail.role}</span>
                                 <span className="text-xs text-gray-400">{selectedUserDetail.id}</span>
                             </div>
                        </div>

                        {/* Balance Editor */}
                        <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                             <label className="text-xs font-bold text-blue-600 uppercase mb-1 block">Saldo Dompet</label>
                             <div className="flex gap-2">
                                 <div className="flex items-center bg-white border border-blue-200 rounded-lg px-3 w-full shadow-sm focus-within:ring-2 ring-blue-200">
                                     <span className="font-bold text-gray-500 mr-1">Rp</span>
                                     <input 
                                        type="number" 
                                        value={editBalance} 
                                        onChange={e => setEditBalance(e.target.value)}
                                        className="w-full bg-transparent outline-none font-bold text-gray-800 py-2"
                                     />
                                 </div>
                             </div>
                        </div>

                        {/* Details List */}
                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Username</label>
                                    <CopyButton text={selectedUserDetail.username} label="Username"/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
                                    <CopyButton text={selectedUserDetail.phone} label="Phone"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Email</label>
                                <CopyButton text={selectedUserDetail.email} label="Email"/>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-red-400 uppercase flex items-center gap-1"><Lock size={10}/> Password</label>
                                <CopyButton text={selectedUserDetail.password} label="Password"/>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Role</label>
                                    <select 
                                        value={editUserRole}
                                        onChange={e => setEditUserRole(e.target.value as Role)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs font-bold outline-none"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Device Info</label>
                                    <div className="text-xs bg-gray-50 p-2 rounded text-gray-600 truncate">{selectedUserDetail.device || 'Unknown'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                             <button 
                                onClick={() => { toggleUserBan(selectedUserDetail.id); setSelectedUserDetail(null); }}
                                className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${selectedUserDetail.isBanned ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                             >
                                 <Ban size={16}/> {selectedUserDetail.isBanned ? 'Unban User' : 'Ban User'}
                             </button>
                             <button 
                                onClick={handleUpdateUser}
                                className="bg-gray-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 shadow-lg"
                             >
                                 <Save size={16}/> Simpan Perubahan
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

// Icon helper needed inside Admin but defined outside in snippet context usually
const UserIcon = ({size}: {size:number}) => <Users size={size} />;
