
import React, { useState } from 'react';
import { useApp } from '../store';
import { Settings, Copy, Wallet, Gift, BarChart2, MessageSquare, Globe, LogOut, X, Camera, RefreshCw, User as UserIcon, Mail, Phone, Lock, Headset, Send, Check, CheckCheck, Bell, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper for message ticks
const MessageStatus = ({ status }: { status: 'sent' | 'delivered' | 'read' }) => {
    if (status === 'sent') return <Check size={12} className="text-gray-400" />;
    if (status === 'delivered') return <CheckCheck size={12} className="text-gray-400" />;
    return <CheckCheck size={12} className="text-green-500" />;
};

export default function Profile() {
  const { user, balance, logout, isDemo, toggleMode, resetDemoBalance, updateProfile, csMessages, sendCSMessage, markChatAsRead } = useApp();
  const navigate = useNavigate();
  
  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showCS, setShowCS] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [chatInput, setChatInput] = useState('');
  const [language, setLanguage] = useState('Indonesia');

  if (!user) return null;

  const handleSendChat = () => {
      if(!chatInput.trim() || !user) return;
      sendCSMessage(chatInput, 'user', user.id);
      setChatInput('');
  };

  const handleOpenCS = () => {
      markChatAsRead(user.id, 'user');
      setShowCS(true);
  };

  const myMessages = user ? csMessages.filter(m => m.userId === user.id) : [];

  return (
    <div className="pb-10 bg-gray-50 min-h-screen animate-fade-in">
       {/* User Header */}
       <div className={`text-white px-5 pt-8 pb-16 rounded-b-[40px] relative shadow-lg transition-colors duration-500 ${isDemo ? 'bg-gray-800' : 'bg-red-600'}`}>
          <div className="flex items-center gap-4 animate-slide-up">
             <img 
               src={user.avatar || "https://picsum.photos/100/100"} 
               alt="Avatar" 
               className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover"
             />
             <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <h2 className="font-bold text-lg">{user.name || "Member"}</h2>
                   <div className="bg-white/20 px-2 rounded-full text-[10px] flex items-center gap-1">
                      <span>{isDemo ? 'TRIAL' : 'VIP0'}</span>
                   </div>
                </div>
                <div className="bg-black/20 rounded-full px-3 py-1 inline-flex items-center gap-2 text-xs hover:bg-black/30 transition-colors cursor-pointer active:scale-95">
                   <span>UID | {user.id}</span>
                   <Copy size={12} className="cursor-pointer"/>
                </div>
                <div className="text-[10px] mt-1 opacity-80">Login terakhir: {new Date().toLocaleString()}</div>
             </div>
             <button onClick={() => setShowSettings(true)} className="btn-press">
                <Settings className="text-white/80 hover:rotate-45 transition-transform duration-500" />
             </button>
          </div>
       </div>

       {/* Balance Card & Mode Switcher */}
       <div className="mx-4 -mt-10 bg-white rounded-xl shadow-lg p-4 relative z-10 animate-slide-up" style={{animationDelay: '0.1s'}}>
          
          {/* Account Mode Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-full mb-4 relative">
             <div 
                className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-sm transition-all duration-300 ${isDemo ? 'translate-x-full left-[-4px]' : 'translate-x-0 left-1'}`}
             ></div>
             <button 
                onClick={() => toggleMode(false)}
                className={`flex-1 relative z-10 text-xs font-bold py-2 rounded-full transition-colors ${!isDemo ? 'text-red-600' : 'text-gray-500'}`}
             >
                Akun Real
             </button>
             <button 
                onClick={() => toggleMode(true)}
                className={`flex-1 relative z-10 text-xs font-bold py-2 rounded-full transition-colors ${isDemo ? 'text-gray-800' : 'text-gray-500'}`}
             >
                Akun Demo
             </button>
          </div>

          <div className="flex justify-between items-start mb-4">
             <div>
                <div className="text-sm text-gray-500 mb-1">Jumlah saldo ({isDemo ? 'Demo' : 'IDR'})</div>
                <div className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                   Rp{balance.toLocaleString('id-ID')}
                   <span className="bg-gray-100 p-1 rounded-full animate-spin-slow"><BarChart2 size={12}/></span>
                </div>
             </div>
             
             {isDemo && balance < 5000 && (
                <button 
                   onClick={resetDemoBalance}
                   className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-orange-200 animate-pop btn-press"
                >
                   <RefreshCw size={12}/> Reset
                </button>
             )}
          </div>
          
          {/* Top Action Buttons */}
          <div className="grid grid-cols-3 gap-2 text-center">
             <button onClick={() => navigate('/wallet')} className="flex flex-col items-center btn-press">
                <div className="bg-red-100 p-2 rounded-full mb-1"><Wallet className="text-red-500" size={20}/></div>
                <span className="text-xs text-gray-600">Dompet</span>
             </button>
             <button onClick={() => navigate('/wallet', { state: { view: 'Deposit' } })} className="flex flex-col items-center btn-press">
                <div className="bg-orange-100 p-2 rounded-full mb-1"><Gift className="text-orange-500" size={20}/></div>
                <span className="text-xs text-gray-600">Deposit</span>
             </button>
             <button onClick={() => navigate('/wallet', { state: { view: 'Withdraw' } })} className="flex flex-col items-center btn-press">
                <div className="bg-blue-100 p-2 rounded-full mb-1"><BarChart2 className="text-blue-500" size={20}/></div>
                <span className="text-xs text-gray-600">Withdraw</span>
             </button>
          </div>
       </div>

       {/* Menu Grid */}
       <div className="grid grid-cols-2 gap-3 p-4">
          <MenuCard 
            icon={<BarChart2 className="text-blue-500"/>} 
            title="Taruhan" 
            subtitle="Riwayat taruhan" 
            delay={0.2} 
            onClick={() => navigate('/activity')}
          />
          <MenuCard 
            icon={<Settings className="text-green-500"/>} 
            title="Transaksi" 
            subtitle="Riwayat transaksi" 
            delay={0.3} 
            onClick={() => navigate('/wallet', { state: { view: 'History' } })}
          />
          <MenuCard 
            icon={<Wallet className="text-red-500"/>} 
            title="Deposit" 
            subtitle="Riwayat deposit" 
            delay={0.4} 
            onClick={() => navigate('/wallet', { state: { view: 'History' } })}
          />
          <MenuCard 
            icon={<Gift className="text-orange-500"/>} 
            title="Withdraw" 
            subtitle="Riwayat withdraw" 
            delay={0.5} 
            onClick={() => navigate('/wallet', { state: { view: 'History' } })}
          />
       </div>

       {/* List Menu */}
       <div className="bg-white mt-2 animate-slide-up" style={{animationDelay: '0.6s'}}>
          <MenuItem 
            icon={<Bell size={20} className="text-red-400"/>} 
            title="Pemberitahuan" 
            onClick={() => setShowNotifications(true)}
          />
          <MenuItem 
            icon={<Headset size={20} className="text-red-400"/>} 
            title="Pelayanan Pelanggan" 
            onClick={handleOpenCS} 
          />
          <MenuItem 
            icon={<Gift size={20} className="text-red-400"/>} 
            title="Hadiah" 
            onClick={() => navigate('/promotion')}
          />
          <MenuItem 
            icon={<BarChart2 size={20} className="text-red-400"/>} 
            title="Statistik permainan" 
            onClick={() => navigate('/statistics')}
          />
          <MenuItem 
            icon={<Globe size={20} className="text-red-400"/>} 
            title="Bahasa" 
            onClick={() => setShowLanguage(true)}
            value={language}
          />
       </div>
       
       <div className="p-4 animate-slide-up" style={{animationDelay: '0.7s'}}>
          <button 
             onClick={logout}
             className="w-full border border-red-500 text-red-500 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors btn-press"
          >
             <LogOut size={18}/> Keluar
          </button>
       </div>

       {/* --- MODALS --- */}

       {/* Settings Modal */}
       {showSettings && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
             <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto animate-slide-up shadow-2xl relative">
                <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200">
                   <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-6 text-center">Pengaturan Profil</h2>
                {/* Avatar Edit */}
                <div className="flex flex-col items-center mb-8">
                   <div className="relative group">
                      <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-gray-100 object-cover" />
                      <button className="absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 btn-press">
                         <Camera size={16} />
                      </button>
                   </div>
                   <p className="text-xs text-gray-400 mt-2">Ketuk untuk ganti foto</p>
                </div>
                {/* Inputs */}
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">Nama Panggilan</label>
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-transparent focus-within:border-red-500 focus-within:bg-white transition-all">
                         <UserIcon size={18} className="text-gray-400"/>
                         <input type="text" value={user.name} onChange={(e) => updateProfile({ name: e.target.value })} className="bg-transparent flex-1 outline-none text-sm font-medium" />
                      </div>
                   </div>
                   {/* ... (Other inputs can be here) ... */}
                   <div className="mt-8">
                        <button onClick={() => setShowSettings(false)} className="w-full bg-red-600 text-white font-bold py-3 rounded-full shadow-lg shadow-red-200 btn-press">Simpan Perubahan</button>
                   </div>
                </div>
             </div>
          </div>
       )}

       {/* Language Modal */}
       {showLanguage && (
           <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setShowLanguage(false)}>
               <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up">
                    <h3 className="font-bold text-lg mb-4 text-center">Pilih Bahasa</h3>
                    <div className="space-y-2">
                        {['Indonesia', 'English'].map(lang => (
                            <button 
                                key={lang} 
                                onClick={() => { setLanguage(lang); setShowLanguage(false); }}
                                className={`w-full p-4 rounded-xl flex items-center justify-between border ${language === lang ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-600'}`}
                            >
                                <span className="font-bold">{lang}</span>
                                {language === lang && <CheckCircle size={20} />}
                            </button>
                        ))}
                    </div>
               </div>
           </div>
       )}

       {/* Notifications Modal */}
       {showNotifications && (
           <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-slide-in-right">
               <div className="bg-white p-4 shadow-sm flex items-center gap-4">
                   <button onClick={() => setShowNotifications(false)}><X size={24}/></button>
                   <h2 className="font-bold text-lg">Pemberitahuan</h2>
               </div>
               <div className="p-4 space-y-3 overflow-y-auto">
                   <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
                       <h4 className="font-bold text-sm mb-1">Selamat Datang!</h4>
                       <p className="text-xs text-gray-500">Selamat bergabung di 55Five. Nikmati permainan dan menangkan hadiah menarik setiap hari.</p>
                       <div className="text-[10px] text-gray-400 mt-2 text-right">Baru saja</div>
                   </div>
                   <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                       <h4 className="font-bold text-sm mb-1">Deposit Berhasil</h4>
                       <p className="text-xs text-gray-500">Deposit pertama anda telah berhasil ditambahkan. Selamat bermain!</p>
                       <div className="text-[10px] text-gray-400 mt-2 text-right">Kemarin</div>
                   </div>
               </div>
           </div>
       )}

       {/* CS Modal */}
      {showCS && (
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

const MenuCard = ({ icon, title, subtitle, delay, onClick }: { icon: any, title: string, subtitle: string, delay: number, onClick: () => void }) => (
   <button 
     onClick={onClick}
     className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 text-left btn-press animate-slide-up hover:bg-gray-50"
     style={{animationDelay: `${delay}s`}}
   >
      <div className="bg-gray-50 p-2 rounded-lg">{icon}</div>
      <div>
         <div className="font-bold text-sm">{title}</div>
         <div className="text-[10px] text-gray-400">{subtitle}</div>
      </div>
   </button>
);

const MenuItem = ({ icon, title, onClick, value }: { icon: any, title: string, onClick?: () => void, value?: string }) => (
   <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 border-b border-gray-100 list-item-touch hover:bg-gray-50"
   >
      <div className="flex items-center gap-3">
         {icon}
         <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-gray-500">{value}</span>}
        <span className="text-gray-300 text-lg"><ChevronRight size={16}/></span>
      </div>
   </button>
);
