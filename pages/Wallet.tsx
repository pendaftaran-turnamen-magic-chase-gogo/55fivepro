
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { ArrowLeft, RefreshCw, CreditCard, Wallet as WalletIcon, History, Upload, Image as ImageIcon, Copy, AlertTriangle, X, CheckCircle, Trash2, Plus, Building2, Smartphone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WithdrawAccount } from '../types';

type WalletView = 'Main' | 'Deposit' | 'Withdraw' | 'History';

export default function Wallet() {
  const { balance, adminQrisImage, requestDeposit, requestWithdraw, transactions, user, addNotification, addWithdrawAccount, removeWithdrawAccount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<WalletView>('Main');

  // Handle navigation state from Profile page
  useEffect(() => {
    if (location.state && location.state.view) {
        setView(location.state.view as WalletView);
        // Clear state to prevent stuck navigation
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Deposit State
  const [amount, setAmount] = useState<number | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  
  // Add Account Form
  const [accType, setAccType] = useState<'Bank' | 'E-Wallet'>('Bank');
  const [bankName, setBankName] = useState('');
  const [accName, setAccName] = useState('');
  const [accNumber, setAccNumber] = useState('');

  const amounts = [20000, 50000, 150000, 200000, 500000, 1000000, 3000000, 5000000];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setProofImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handlePayClick = () => {
      if (!amount || amount < 20000) {
          alert("Minimal deposit Rp20.000");
          return;
      }
      setShowPaymentModal(true);
  };

  const submitDeposit = () => {
      if (!amount) return;
      if (!proofImage) {
          alert("Wajib upload bukti pembayaran!");
          return;
      }
      
      requestDeposit(amount, proofImage);
      addNotification('info', 'Deposit Diproses', 'Permintaan deposit sedang menunggu konfirmasi admin.', '', 'bg-blue-500');
      
      // Reset
      setAmount(null);
      setProofImage(null);
      setShowPaymentModal(false);
      setView('History');
  };

  const saveAccount = () => {
      if(!bankName || !accName || !accNumber) {
          alert("Mohon lengkapi data!");
          return;
      }
      const newAcc: WithdrawAccount = {
          id: Math.random().toString(36).substr(2, 9),
          type: accType,
          bankName,
          accountName: accName,
          accountNumber: accNumber
      };
      addWithdrawAccount(newAcc);
      setShowAddAccount(false);
      setBankName(''); setAccName(''); setAccNumber('');
  };

  const submitWithdraw = () => {
      if (!withdrawAmount || withdrawAmount < 50000) {
          alert("Minimal withdraw Rp50.000");
          return;
      }
      if (withdrawAmount > balance) {
          alert("Saldo tidak mencukupi");
          return;
      }
      if (!selectedAccount) {
          alert("Pilih metode penarikan");
          return;
      }
      
      const accDetails = user?.savedAccounts?.find(a => a.id === selectedAccount);
      if(!accDetails) return;

      requestWithdraw(withdrawAmount, accDetails);
      addNotification('info', 'Withdraw Diproses', 'Permintaan penarikan sedang diproses.', '', 'bg-orange-500');
      setWithdrawAmount(null);
      setView('History');
  };

  const handleBack = () => {
      if (showPaymentModal) {
          setShowPaymentModal(false);
          setProofImage(null);
          return;
      }
      if (view !== 'Main') {
          setView('Main');
          setAmount(null);
          return;
      }
      navigate('/');
  };

  const BalanceCard = () => (
      <div className="p-4 bg-gradient-to-r from-red-500 to-orange-400 text-white rounded-xl shadow-lg relative overflow-hidden mx-4 mt-4">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        <div className="text-sm flex items-center gap-2 opacity-90 mb-1">
           <WalletIcon size={16} /> Saldo
        </div>
        <div className="text-3xl font-bold flex items-center gap-2">
           Rp{balance.toLocaleString('id-ID')}
           <RefreshCw size={18} className="opacity-70"/>
        </div>
        <div className="flex justify-end mt-4 text-xs opacity-70 tracking-widest">**** **** **** 8829</div>
      </div>
  );

  const Header = ({ title }: { title: string }) => (
      <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
         <button onClick={handleBack} className="btn-press">
             <ArrowLeft size={24}/>
         </button>
         <h1 className="text-lg font-bold flex-1 text-center mr-6">{title}</h1>
         {view !== 'History' && (
             <button onClick={() => setView('History')} className="text-xs text-gray-500 btn-press">Riwayat</button>
         )}
      </div>
  );

  // --- VIEWS ---

  if (view === 'Main') {
      return (
          <div className="bg-gray-100 min-h-screen animate-fade-in pb-20">
              <div className="bg-red-600 text-white p-6 pb-12 rounded-b-[30px] shadow-lg">
                <h1 className="text-2xl font-bold text-center">Dompet</h1>
              </div>
              <div className="-mt-10">
                  <BalanceCard />
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 mt-4">
                  <button onClick={() => { setView('Deposit'); }} className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 btn-press">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <WalletIcon size={24} />
                      </div>
                      <span className="font-bold text-gray-700">Deposit</span>
                  </button>
                  <button onClick={() => setView('Withdraw')} className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 btn-press">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                          <CreditCard size={24} />
                      </div>
                      <span className="font-bold text-gray-700">Withdraw</span>
                  </button>
              </div>

              <div className="bg-white mx-4 rounded-xl shadow-sm overflow-hidden">
                  <button onClick={() => setView('History')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                          <History className="text-gray-400"/>
                          <span className="font-medium text-gray-700">Riwayat Transaksi</span>
                      </div>
                      <span className="text-gray-400">›</span>
                  </button>
              </div>
          </div>
      );
  }

  if (view === 'Deposit') {
      return (
        <div className="bg-gray-100 min-h-screen pb-32 animate-fade-in relative">
          <Header title="Deposit" />
          <BalanceCard />

          {/* Amount Selection */}
          <div className="px-4 mt-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                  <WalletIcon size={16} className="text-red-500"/>
                  <span className="font-bold text-gray-700">Total Deposit</span>
              </div>
              
              {/* Custom Input */}
              <div className="bg-white rounded p-3 flex items-center gap-2 mb-4 border border-gray-200 input-focus transition-all shadow-sm">
                  <span className="text-red-500 font-bold">Rp</span>
                  <input 
                  type="number" 
                  value={amount || ''} 
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  placeholder="Masukkan jumlah..." 
                  className="w-full outline-none text-gray-700 font-bold text-lg"
                  />
              </div>

              {/* Amount Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                  {amounts.map(a => (
                  <button 
                      key={a}
                      onClick={() => setAmount(a)}
                      className={`py-3 rounded text-sm font-bold border transition-all btn-press ${amount === a ? 'border-red-500 text-white bg-red-500 shadow-md transform scale-105' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                      {a >= 1000000 ? `${a/1000000} Juta` : `${a/1000}K`}
                  </button>
                  ))}
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-red-500 font-bold text-sm">
                  <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                  Instruksi
                  </div>
                  <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                      <li>Pilih nominal deposit.</li>
                      <li>Klik tombol "Bayar" untuk menampilkan kode QRIS.</li>
                      <li>Minimal deposit Rp20.000.</li>
                  </ul>
              </div>

              {/* PAY BUTTON - Static Position Below Instructions */}
              <div className="mt-6 mb-8">
                  <div className="flex justify-between items-center mb-3 px-1">
                      <span className="text-sm font-bold text-gray-500">Total Pembayaran</span>
                      <span className="text-2xl font-bold text-red-600">{amount ? `Rp${amount.toLocaleString('id-ID')}` : 'Rp0'}</span>
                  </div>
                  <button 
                    disabled={!amount}
                    onClick={handlePayClick}
                    className={`w-full py-4 rounded-full font-bold text-white shadow-xl transition-all btn-press flex items-center justify-center gap-2 ${amount ? 'bg-red-600 shadow-red-200 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
                   >
                    <WalletIcon size={20} fill="currentColor" className="text-white/30" />
                    Bayar Sekarang
                   </button>
              </div>
          </div>

          {/* PAYMENT MODAL POPUP */}
          {showPaymentModal && (
              <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-pop relative max-h-[90vh] overflow-y-auto">
                      <div className="bg-red-600 p-4 text-white flex justify-between items-center sticky top-0 z-10">
                          <h3 className="font-bold flex items-center gap-2"><CreditCard size={18}/> Pembayaran QRIS</h3>
                          <button onClick={() => setShowPaymentModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={20}/></button>
                      </div>
                      
                      <div className="p-6 flex flex-col items-center">
                            <div className="text-center mb-6 w-full border-b pb-4">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total Pembayaran</p>
                                <h2 className="text-3xl font-bold text-gray-800 mt-1">Rp{amount?.toLocaleString()}</h2>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.1)] border border-gray-200 mb-6">
                                <img src={adminQrisImage} alt="QRIS" className="w-52 h-52 object-cover" />
                            </div>

                            <div className="flex items-center justify-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-8 border border-gray-200 w-full">
                                <span className="text-xs font-mono text-gray-600 font-bold">NMID: ID123456789</span>
                                <button className="text-gray-400 hover:text-gray-600 active:scale-95 transition-transform"><Copy size={14}/></button>
                            </div>

                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                        <Upload size={14}/>
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm">Upload Bukti Transfer</span>
                                </div>
                                <label className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-red-300 transition-all relative h-40 mb-4 group bg-gray-50">
                                    {proofImage ? (
                                        <>
                                            <img src={proofImage} className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                <span className="text-white text-xs font-bold border border-white px-3 py-1 rounded-full">Ganti Gambar</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="text-red-400" size={24} />
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium">Klik untuk upload bukti</span>
                                            <span className="text-xs text-gray-400 mt-1">Format: JPG, PNG</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>

                                <button 
                                    onClick={submitDeposit}
                                    disabled={!proofImage}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all btn-press flex items-center justify-center gap-2 ${proofImage ? 'bg-green-500 shadow-green-200 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}`}
                                >
                                    {proofImage && <CheckCircle size={18}/>}
                                    Konfirmasi & Kirim
                                </button>
                            </div>
                      </div>
                  </div>
              </div>
          )}
        </div>
      );
  }

  if (view === 'Withdraw') {
      return (
          <div className="bg-gray-100 min-h-screen pb-20 animate-fade-in">
              <Header title="Withdraw" />
              <BalanceCard />

              <div className="p-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-800">Metode Penarikan</span>
                        <button onClick={() => setShowAddAccount(true)} className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                            <Plus size={12}/> Tambah
                        </button>
                      </div>

                      {(!user?.savedAccounts || user.savedAccounts.length === 0) ? (
                          <div className="text-center py-6 text-gray-400 text-xs border border-dashed rounded-lg">Belum ada rekening tersimpan</div>
                      ) : (
                          <div className="space-y-3">
                              {user.savedAccounts.map(acc => (
                                  <div 
                                    key={acc.id} 
                                    onClick={() => setSelectedAccount(acc.id)}
                                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${selectedAccount === acc.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                                  >
                                      <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${acc.type === 'Bank' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                              {acc.type === 'Bank' ? <Building2 size={16}/> : <Smartphone size={16}/>}
                                          </div>
                                          <div>
                                              <div className="font-bold text-sm text-gray-800">{acc.bankName}</div>
                                              <div className="text-xs text-gray-500">{acc.accountNumber} - {acc.accountName}</div>
                                          </div>
                                      </div>
                                      <button onClick={(e) => { e.stopPropagation(); removeWithdrawAccount(acc.id); }} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                          <span className="text-red-600 font-bold text-xl">Rp</span>
                          <span className="text-gray-400 text-sm">Silakan masukkan jumlah</span>
                      </div>
                      
                      <div className="flex gap-2 items-center mb-4 border-b pb-2">
                         <span className="text-red-500 font-bold">Rp</span>
                         <input 
                            type="number"
                            value={withdrawAmount || ''}
                            onChange={(e) => setWithdrawAmount(parseInt(e.target.value))}
                            className="w-full text-lg font-bold outline-none text-gray-800"
                            placeholder="0"
                         />
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500 mb-6">
                          <span>Saldo yang dapat ditarik <span className="text-orange-500">Rp{balance.toLocaleString()}</span></span>
                          <button onClick={() => setWithdrawAmount(balance)} className="text-red-500 font-bold border border-red-500 px-2 py-0.5 rounded">Semua</button>
                      </div>

                      <button onClick={submitWithdraw} className="w-full bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 transition-colors btn-press shadow-lg shadow-red-200">
                          Withdraw
                      </button>
                  </div>
              </div>

              {/* Add Account Modal */}
              {showAddAccount && (
                  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
                      <div className="bg-white w-full max-w-sm rounded-2xl p-6 animate-pop">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-lg">Tambah Rekening</h3>
                              <button onClick={() => setShowAddAccount(false)}><X size={20}/></button>
                          </div>
                          
                          <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                              <button onClick={() => setAccType('Bank')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${accType === 'Bank' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Bank Transfer</button>
                              <button onClick={() => setAccType('E-Wallet')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${accType === 'E-Wallet' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>E-Wallet</button>
                          </div>

                          <div className="space-y-3">
                              <div>
                                  <label className="text-xs font-bold text-gray-500">Nama Bank / E-Wallet</label>
                                  <input placeholder={accType === 'Bank' ? "BCA, BRI, Mandiri..." : "DANA, OVO, GoPay..."} className="w-full border rounded-lg p-3 text-sm mt-1 bg-gray-50" value={bankName} onChange={e => setBankName(e.target.value)} />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500">Nama Pemilik Akun</label>
                                  <input placeholder="Sesuai KTP/Buku Tabungan" className="w-full border rounded-lg p-3 text-sm mt-1 bg-gray-50" value={accName} onChange={e => setAccName(e.target.value)} />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500">Nomor Rekening / HP</label>
                                  <input type="number" placeholder="Contoh: 1234567890" className="w-full border rounded-lg p-3 text-sm mt-1 bg-gray-50" value={accNumber} onChange={e => setAccNumber(e.target.value)} />
                              </div>
                          </div>

                          <button onClick={saveAccount} className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-xl shadow-md">Simpan</button>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  if (view === 'History') {
      const myTx = transactions.filter(t => t.userId === user?.id);
      return (
          <div className="bg-gray-100 min-h-screen animate-fade-in">
              <Header title="Riwayat Transaksi" />
              <div className="p-4 space-y-3">
                  {myTx.length === 0 ? (
                      <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                          <div className="bg-gray-200 p-4 rounded-full mb-4"><History size={32}/></div>
                          <p>Belum ada transaksi</p>
                      </div>
                  ) : (
                      myTx.map(tx => (
                          <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                              <div className="flex justify-between items-start mb-2">
                                  <div>
                                      <div className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-orange-500'}`}>
                                          {tx.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                                      </div>
                                      <div className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleString()}</div>
                                  </div>
                                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                                      tx.status === 'success' ? 'bg-green-100 text-green-600' :
                                      tx.status === 'failed' ? 'bg-red-100 text-red-600' :
                                      'bg-yellow-100 text-yellow-600'
                                  }`}>
                                      {tx.status === 'success' ? 'Selesai' : tx.status === 'failed' ? 'Gagal' : 'Pending'}
                                  </div>
                              </div>
                              <div className="flex justify-between items-center">
                                  <div className="text-gray-500 text-xs">
                                    {tx.method} 
                                    {tx.withdrawDetails && ` • ${tx.withdrawDetails.bankName} (${tx.withdrawDetails.accountNumber})`}
                                  </div>
                                  <div className="font-bold text-gray-800">Rp{tx.amount.toLocaleString()}</div>
                              </div>
                              {tx.status === 'pending' && tx.type === 'deposit' && (
                                  <div className="mt-2 bg-yellow-50 text-yellow-700 text-[10px] p-2 rounded flex items-center gap-2">
                                      <AlertTriangle size={12}/> Menunggu konfirmasi admin
                                  </div>
                              )}
                          </div>
                      ))
                  )}
              </div>
          </div>
      );
  }

  return null;
}
