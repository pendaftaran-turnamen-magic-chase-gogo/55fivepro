
import React, { useState } from 'react';
import { useApp } from '../store';
import { ShieldAlert, Users, DollarSign, Activity, Lock, RefreshCcw, Search, Edit2, Check, CheckCheck, X, MessageSquare, Send, Trophy, Crown, Eye, EyeOff, User as UserIcon, ArrowLeft, Headset, RotateCw, Wallet, CreditCard, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { GameMode, Role, User } from '../types';

// Helper for message ticks in admin
const MessageStatus = ({ status }: { status: 'sent' | 'delivered' | 'read' }) => {
    if (status === 'sent') return <Check size={12} className="text-gray-400" />;
    if (status === 'delivered') return <CheckCheck size={12} className="text-gray-400" />;
    return <CheckCheck size={12} className="text-blue-500" />; // Blue for admin view usually
};

export default function Admin() {
  const { 
      user, allUsers, adminUpdateUser, 
      timeLeft, periodId, activeGameMode, 
      forcedResults, setForcedResult, gameHistory,
      allActiveBets, csMessages, sendCSMessage, markChatAsRead,
      transactions, processTransaction, adminQrisImage, setAdminQrisImage
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Game' | 'LiveBets' | 'Users' | 'CS' | 'Deposit'>('Dashboard');
  const [selectedMode, setSelectedMode] = useState<GameMode>('30s');
  
  // User Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Chat State
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatText, setChatText] = useState('');

  // Deposit State
  const [viewProof, setViewProof] = useState<string | null>(null);

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return <div className="p-10 text-center text-red-500 font-bold">ACCESS DENIED</div>;
  }
  const isSuperAdmin = user.role === 'super_admin';

  // --- Helpers ---
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');

  const getBallClass = (num: number) => {
    if ([1, 3, 7, 9].includes(num)) return 'bg-green-500';
    if ([2, 4, 6, 8].includes(num)) return 'bg-red-500';
    if (num === 0) return 'bg-gradient-to-r from-red-500 to-violet-500';
    if (num === 5) return 'bg-gradient-to-r from-green-500 to-violet-500';
    return 'bg-gray-400';
  };

  const handleEditSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUser) return;
      const res = adminUpdateUser(editingUser.id, editingUser);
      if (res.success) {
          alert("User updated!");
          setEditingUser(null);
      } else {
          alert("Error: " + res.message);
      }
  };

  const handleSelectChatUser = (uid: string) => {
      setSelectedChatUser(uid);
      markChatAsRead(uid, 'admin'); // Mark this user's messages as read
  };

  const handleSendChat = () => {
      if(!chatText.trim() || !selectedChatUser) return;
      sendCSMessage(chatText, 'admin', selectedChatUser);
      setChatText('');
  };

  // --- Force Result Logic by Category ---
  const handleForceCategory = (category: 'Green' | 'Violet' | 'Red' | 'Big' | 'Small') => {
      let options: number[] = [];
      if (category === 'Green') options = [1, 3, 7, 9];
      else if (category === 'Red') options = [2, 4, 6, 8];
      else if (category === 'Violet') options = [0, 5];
      else if (category === 'Big') options = [5, 6, 7, 8, 9];
      else if (category === 'Small') options = [0, 1, 2, 3, 4];

      if (options.length > 0) {
          const randomNum = options[Math.floor(Math.random() * options.length)];
          setForcedResult(selectedMode, randomNum);
      }
  };

  // --- Filtering & Sorting ---
  const filteredUsers = allUsers.filter(u => 
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedActiveBets = [...allActiveBets]
    .filter(b => b.gameMode === selectedMode) // Filter by selected mode for visibility
    .sort((a, b) => (b.amount * b.multiplier) - (a.amount * a.multiplier));

  // --- Chat Derived Data ---
  const uniqueChatUsers = Array.from(new Set(csMessages.map(m => m.userId)));
  const currentChatMessages = selectedChatUser ? csMessages.filter(m => m.userId === selectedChatUser) : [];

  return (
    <div className="bg-gray-100 min-h-screen pb-24">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 rounded-b-[30px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex justify-between items-center relative z-10">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {isSuperAdmin ? <Crown className="text-yellow-400" /> : <ShieldAlert className="text-blue-400" />} 
                        {isSuperAdmin ? 'Super Admin' : 'Administrator'}
                    </h1>
                    <p className="text-gray-400 text-xs mt-1">Control Panel V2.0</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setActiveTab('CS')} 
                        className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors border border-gray-700 relative"
                        title="Customer Service"
                    >
                         <Headset size={20} className={activeTab === 'CS' ? 'text-green-400' : 'text-gray-400'} />
                    </button>
                    <button 
                        onClick={handleRefresh} 
                        className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors border border-gray-700"
                        title="Refresh Data"
                    >
                         <RotateCw size={20} className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="text-right ml-2 border-l border-gray-700 pl-3">
                        <div className="text-xs text-gray-500">Current Period ({activeGameMode})</div>
                        <div className="font-mono font-bold text-red-500 text-lg">{periodId.slice(-4)} | {timeLeft}s</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <div className="px-4 mt-4 overflow-x-auto no-scrollbar">
            <div className="bg-white rounded-full p-1 flex shadow-sm min-w-max">
                {['Dashboard', 'Game', 'LiveBets', 'Users', 'Deposit', 'CS'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${activeTab === tab ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        {tab === 'Deposit' && pendingDeposits.length > 0 && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                        {tab === 'LiveBets' ? 'Live Bets' : tab}
                    </button>
                ))}
            </div>
        </div>

        <div className="p-4 space-y-4">
            {/* === DASHBOARD === */}
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
                    <button onClick={() => setActiveTab('Deposit')} className="col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <Wallet className="text-orange-500" size={24}/>
                            <div>
                                <div className="font-bold text-gray-800">Pending Deposits</div>
                                <div className="text-xs text-gray-500">{pendingDeposits.length} Request</div>
                            </div>
                        </div>
                        <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Manage</div>
                    </button>
                </div>
            )}

            {/* === DEPOSIT MANAGEMENT === */}
            {activeTab === 'Deposit' && (
                <div className="space-y-4">
                    {/* Admin QRIS Setting */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-2 text-sm">Default QRIS Image</h3>
                        <div className="flex items-center gap-4">
                            <img src={adminQrisImage} className="w-16 h-16 object-cover border rounded"/>
                            <div className="flex-1">
                                <input 
                                    className="w-full text-xs border p-2 rounded mb-2"
                                    placeholder="Enter Image URL"
                                    value={adminQrisImage}
                                    onChange={(e) => setAdminQrisImage(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-400">Paste a new URL to update the QR code shown to users.</p>
                            </div>
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <h3 className="font-bold text-gray-700 mt-4">Deposit Requests ({pendingDeposits.length})</h3>
                    {pendingDeposits.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 bg-white rounded-xl">No pending deposits</div>
                    ) : (
                        pendingDeposits.map(tx => (
                            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-orange-500 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-gray-800">{tx.username}</div>
                                        <div className="text-xs text-gray-400">{tx.userId} • {new Date(tx.date).toLocaleTimeString()}</div>
                                    </div>
                                    <div className="text-lg font-bold text-green-600">+Rp{tx.amount.toLocaleString()}</div>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">Method: {tx.method}</div>
                                    {tx.proofImage && (
                                        <button 
                                            onClick={() => setViewProof(tx.proofImage!)}
                                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-200"
                                        >
                                            <ImageIcon size={12}/> View Proof
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => processTransaction(tx.id, 'reject')}
                                        className="flex-1 py-2 border border-red-500 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => processTransaction(tx.id, 'approve')}
                                        className="flex-1 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 shadow-md shadow-green-200"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* === USERS MANAGEMENT === */}
            {activeTab === 'Users' && (
                <div>
                    <div className="bg-white p-2 rounded-lg flex items-center gap-2 shadow-sm mb-4">
                        <Search size={18} className="text-gray-400 ml-2"/>
                        <input 
                            className="flex-1 outline-none text-sm"
                            placeholder="Search UID, Name, Email, Phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                                {u.role === 'super_admin' && <div className="absolute top-0 right-0 bg-yellow-400 text-white text-[9px] px-2 py-0.5 rounded-bl font-bold">SUPER</div>}
                                {u.role === 'admin' && <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-bl font-bold">ADMIN</div>}
                                
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <img src={u.avatar} className="w-10 h-10 rounded-full bg-gray-200"/>
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">{u.username}</div>
                                            <div className="text-xs text-gray-400">{u.id}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600 text-sm">Rp{u.balance.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="mt-3 flex gap-2 border-t pt-2">
                                    <button 
                                        onClick={() => setEditingUser(u)}
                                        className="flex-1 bg-gray-900 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1"
                                    >
                                        <Edit2 size={12}/> Manage
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'Game' && (
                <div className="bg-white p-5 rounded-xl shadow-lg border border-red-100 relative">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><RefreshCcw size={16}/> Game Controller</h3>
                    
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                        {(['30s', '1Min', '3Min', '5Min'] as GameMode[]).map(m => (
                            <button 
                                key={m} 
                                onClick={() => setSelectedMode(m)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold border ${selectedMode === m ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-500 border-gray-200'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500">Active Setting for {selectedMode}</span>
                            {forcedResults[selectedMode] !== null ? 
                                <span className="text-red-600 font-bold text-xs animate-pulse">FORCED: {forcedResults[selectedMode]} (Size: {forcedResults[selectedMode]! >= 5 ? 'Big' : 'Small'})</span> : 
                                <span className="text-green-600 font-bold text-xs">RANDOM</span>
                            }
                        </div>
                    </div>
                    {/* ... Rest of Game controls ... */}
                    <div className="grid grid-cols-5 gap-3 mb-6">
                        {[0,1,2,3,4,5,6,7,8,9].map(num => (
                            <button
                                key={num}
                                onClick={() => setForcedResult(selectedMode, num)}
                                className={`aspect-square rounded-full flex items-center justify-center font-bold text-lg shadow-md transition-all active:scale-95 relative overflow-hidden group
                                    ${forcedResults[selectedMode] === num 
                                        ? 'ring-4 ring-offset-2 ring-gray-800 scale-110 z-10' 
                                        : 'opacity-90 hover:opacity-100 hover:scale-105'}
                                `}
                            >
                                <div className={`absolute inset-0 ${getBallClass(num)}`}></div>
                                <span className="relative z-10 text-white drop-shadow-md">{num}</span>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setForcedResult(selectedMode, null)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors">
                        Reset to Random Result
                    </button>
                </div>
            )}
            
            {activeTab === 'LiveBets' && (
                <div>
                     <div className="flex gap-2 mb-4 overflow-x-auto">
                        {(['30s', '1Min', '3Min', '5Min'] as GameMode[]).map(m => (
                            <button 
                                key={m} 
                                onClick={() => setSelectedMode(m)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold border ${selectedMode === m ? 'bg-gray-900 text-white border-gray-900' : 'text-white bg-gray-400 border-transparent'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2">
                        {sortedActiveBets.length === 0 ? <div className="text-center text-gray-400 py-10">No active bets for {selectedMode}</div> :
                        sortedActiveBets.map((bet, idx) => (
                                <div key={bet.id} className="bg-white p-3 rounded-xl border flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-gray-800">{bet.username}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400">Select: <span className="font-bold text-gray-600">{bet.select}</span></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-red-600">Rp{(bet.amount * bet.multiplier).toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-400">Pending</div>
                                    </div>
                                </div>
                        ))}
                    </div>
                </div>
            )}

            {/* === CUSTOMER SERVICE === */}
            {activeTab === 'CS' && (
                <div className="bg-white rounded-xl shadow-lg h-[600px] flex overflow-hidden border border-gray-200">
                    <div className={`w-full md:w-1/3 bg-gray-50 border-r flex flex-col ${selectedChatUser ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b bg-gray-100 font-bold text-gray-700">Chats</div>
                        <div className="flex-1 overflow-y-auto">
                            {uniqueChatUsers.map(uid => (
                                    <button key={uid} onClick={() => handleSelectChatUser(uid)} className={`w-full text-left p-3 border-b flex items-center gap-3 hover:bg-gray-100 transition-colors ${selectedChatUser === uid ? 'bg-white border-l-4 border-l-red-500 shadow-sm' : ''}`}>
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden"><UserIcon size={20}/></div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="font-bold text-sm text-gray-800 truncate">{allUsers.find(u=>u.id===uid)?.username || uid}</div>
                                            <div className="text-xs text-gray-500 truncate">Click to chat</div>
                                        </div>
                                    </button>
                            ))}
                        </div>
                    </div>
                    <div className={`flex-1 flex flex-col bg-white ${!selectedChatUser ? 'hidden md:flex' : 'flex'}`}>
                         {selectedChatUser ? (
                            <>
                                <div className="p-3 border-b bg-gray-100 flex justify-between items-center shadow-sm">
                                    <button onClick={() => setSelectedChatUser(null)}><ArrowLeft/></button>
                                    <span className="font-bold">{allUsers.find(u=>u.id===selectedChatUser)?.username}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]" style={{backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat'}}>
                                    {currentChatMessages.map(msg => (
                                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm shadow-sm relative ${msg.sender === 'admin' ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                                                {msg.text}
                                                <div className="text-[9px] text-gray-400 text-right mt-1 flex justify-end gap-1 items-center">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    {msg.sender === 'admin' && <MessageStatus status={msg.status} />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-gray-100 border-t flex gap-2">
                                    <input value={chatText} onChange={(e) => setChatText(e.target.value)} className="flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none border border-gray-300" placeholder="Type a message..." />
                                    <button onClick={handleSendChat} className="bg-green-500 text-white p-2 rounded-full"><Send size={18} /></button>
                                </div>
                            </>
                         ) : <div className="flex-1 flex items-center justify-center text-gray-400">Select chat</div>}
                    </div>
                </div>
            )}
        </div>

        {/* Proof Modal */}
        {viewProof && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setViewProof(null)}>
                <div className="relative max-w-lg w-full">
                    <button onClick={() => setViewProof(null)} className="absolute -top-10 right-0 text-white"><X size={32}/></button>
                    <img src={viewProof} className="w-full rounded-lg shadow-2xl" />
                </div>
            </div>
        )}

        {/* Edit User Modal (Same as before) */}
        {editingUser && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative animate-slide-up">
                    <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-gray-400"><X size={20}/></button>
                    <h2 className="text-xl font-bold mb-4">User Details</h2>
                    <div className="flex flex-col items-center mb-6">
                        <img src={editingUser.avatar || "https://i.pravatar.cc/150"} className="w-20 h-20 rounded-full bg-gray-200 mb-2"/>
                        <div className="font-bold text-lg">{editingUser.username}</div>
                        <div className="text-sm text-gray-500">{editingUser.id}</div>
                    </div>
                    <form onSubmit={handleEditSave} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Username</label>
                            <input className="w-full border rounded-lg p-2 text-sm bg-gray-50" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500">Balance</label>
                                <input type="number" className="w-full border rounded-lg p-2 text-sm font-bold text-green-600" value={editingUser.balance} onChange={e => setEditingUser({...editingUser, balance: parseInt(e.target.value) || 0})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Role</label>
                                <div className="text-sm bg-gray-100 p-2 rounded text-gray-500 capitalize">{editingUser.role}</div>
                            </div>
                        </div>
                        <div className="pt-2"><button type="submit" className="w-full bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-100">Save Changes</button></div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
