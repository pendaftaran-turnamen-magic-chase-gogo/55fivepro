
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Mail, Lock, Eye, EyeOff, Headset, Gift, Send, X, User, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../store';

// Helper component for message ticks
export const MessageStatus = ({ status }: { status: 'sent' | 'delivered' | 'read' }) => {
    if (status === 'sent') return <Check size={12} className="text-gray-400" />;
    if (status === 'delivered') return <CheckCheck size={12} className="text-gray-400" />;
    return <CheckCheck size={12} className="text-green-500" />;
};

export const Login = () => {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showCS, setShowCS] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const { login, csMessages, sendCSMessage, allUsers, markChatAsRead } = useApp();

  // Chat Local State
  const [chatInput, setChatInput] = useState('');
  const [csStep, setCsStep] = useState<'verify' | 'chat'>('verify');
  const [csIdentityInput, setCsIdentityInput] = useState('');
  const [activeCsId, setActiveCsId] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identity || !password) {
        setErrorMsg("Mohon isi Nomor HP/Email dan Kata Sandi!");
        return;
    }
    
    const success = login(identity, password);
    
    if(success) {
        // Redirection logic 
        const targetUser = allUsers.find(u => {
            const dbPhone = u.phone.replace(/^0/, '');
            const inputPhone = identity.replace(/^0/, '');
            const isPhoneMatch = dbPhone === inputPhone || u.phone === identity;
            const isEmailMatch = u.email && (u.email.toLowerCase() === identity.toLowerCase());
            return (isPhoneMatch || isEmailMatch) && u.password === password;
        });

        if (targetUser && (targetUser.role === 'admin' || targetUser.role === 'super_admin')) {
            navigate('/admin');
        } else {
            navigate('/');
        }
    } else {
        setErrorMsg("Login Gagal! Nomor HP/Email atau Password salah.");
    }
  };

  const handleVerifyCS = () => {
      setErrorMsg('');
      if (!csIdentityInput.trim()) {
          setErrorMsg("Mohon masukkan Nomor HP, Email, atau Username!");
          return;
      }
      
      const found = allUsers.find(u => 
          u.phone === csIdentityInput || 
          u.email === csIdentityInput || 
          u.username === csIdentityInput
      );

      if (found) {
          setActiveCsId(found.id);
          markChatAsRead(found.id, 'user'); // Mark admin messages as read
          setCsStep('chat');
      } else {
          setErrorMsg("Data akun tidak ditemukan! Pastikan anda sudah terdaftar.");
      }
  };

  const handleSendChat = () => {
      if(!chatInput.trim() || !activeCsId) return;
      sendCSMessage(chatInput, 'user', activeCsId);
      setChatInput('');
  };

  const openCS = () => {
      setCsStep('verify');
      setCsIdentityInput('');
      setActiveCsId('');
      setErrorMsg('');
      setShowCS(true);
  };

  const myMessages = activeCsId ? csMessages.filter(m => m.userId === activeCsId) : [];

  return (
    <div className="flex flex-col min-h-screen bg-white animate-fade-in relative">
      {/* Header */}
      <div className="bg-red-600 text-white p-6 pb-12 rounded-b-[30px] shadow-lg">
        <h1 className="text-2xl font-bold mb-2 animate-slide-up">Login</h1>
        <p className="text-sm opacity-90 animate-slide-up" style={{animationDelay: '0.1s'}}>Silakan masuk melalui Nomor Ponsel atau Email</p>
        <p className="text-xs opacity-80 animate-slide-up" style={{animationDelay: '0.2s'}}>Jika lupa kata sandi, Silakan hubungi Customer Service</p>
      </div>

      {/* Form Container */}
      <div className="px-6 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
          {/* Error Notification */}
          {errorMsg && !showCS && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded text-xs flex items-center gap-2 animate-pop">
                  <AlertCircle size={16}/>
                  {errorMsg}
              </div>
          )}

          {/* Tabs */}
          <div className="flex mb-6 border-b">
            <button
              className={`flex-1 pb-3 text-center font-medium transition-colors duration-300 ${method === 'phone' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => { setMethod('phone'); setIdentity(''); setErrorMsg(''); }}
            >
              <div className="flex justify-center items-center gap-2">
                <Smartphone size={18} /> Nomor HP
              </div>
            </button>
            <button
              className={`flex-1 pb-3 text-center font-medium transition-colors duration-300 ${method === 'email' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => { setMethod('email'); setIdentity(''); setErrorMsg(''); }}
            >
               <div className="flex justify-center items-center gap-2">
                <Mail size={18} /> Email
              </div>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {method === 'phone' ? (
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-transparent input-focus transition-all duration-200">
                <span className="text-gray-500 font-bold">+62</span>
                <input 
                    type="tel" 
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder="Silakan masukkan nomor telepon" 
                    className="bg-transparent w-full outline-none text-gray-700" 
                    
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-transparent input-focus transition-all duration-200">
                <Mail className="text-red-400" size={20} />
                <input 
                    type="email" 
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder="Silakan isi email anda" 
                    className="bg-transparent w-full outline-none text-gray-700" 
                    
                />
              </div>
            )}

            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-transparent input-focus transition-all duration-200">
              <Lock className="text-red-400" size={20} />
              <input 
                type={showPass ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi" 
                className="bg-transparent w-full outline-none text-gray-700" 
                
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="hover:scale-110 transition-transform">
                {showPass ? <Eye size={20} className="text-gray-400"/> : <EyeOff size={20} className="text-gray-400"/>}
              </button>
            </div>

            <button 
              type="button" 
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2 cursor-pointer w-fit"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                {rememberMe && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className="text-sm text-gray-500">Ingat kata sandi</span>
            </button>

            <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-600 transition-all shadow-md shadow-red-200 btn-press">
              Login
            </button>

            <button type="button" onClick={() => navigate('/register')} className="w-full border border-red-600 text-red-600 font-bold py-3 rounded-full hover:bg-red-50 transition-colors btn-press">
              Daftar
            </button>
          </form>
        </div>

        <div className="flex justify-center gap-8 mt-12">
            <button className="flex flex-col items-center gap-2 cursor-pointer btn-press" onClick={openCS}>
                <div className="bg-red-100 p-3 rounded-full">
                    <Lock className="text-red-500" size={24} />
                </div>
                <span className="text-xs text-gray-500">Lupa kata sandi</span>
            </button>
            <button className="flex flex-col items-center gap-2 cursor-pointer btn-press" onClick={openCS}>
                <div className="bg-red-100 p-3 rounded-full">
                    <Headset className="text-red-500" size={24} />
                </div>
                <span className="text-xs text-gray-500">Pelayanan pelanggan</span>
            </button>
        </div>
      </div>

      {/* CS Modal */}
      {showCS && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm h-[500px] rounded-2xl flex flex-col shadow-2xl animate-pop overflow-hidden">
                  <div className="bg-red-600 text-white p-4 flex justify-between items-center">
                      <div className="font-bold flex items-center gap-2"><Headset/> Customer Support</div>
                      <button onClick={() => setShowCS(false)}><X size={20}/></button>
                  </div>
                  
                  {/* Internal Error for CS Modal */}
                  {errorMsg && csStep === 'verify' && (
                       <div className="bg-red-100 text-red-600 text-xs p-2 text-center border-b border-red-200">
                           {errorMsg}
                       </div>
                   )}

                  {csStep === 'verify' ? (
                      <div className="flex-1 p-6 flex flex-col justify-center">
                          <div className="text-center mb-6">
                              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                  <User size={32} />
                              </div>
                              <h3 className="font-bold text-gray-800">Verifikasi Akun</h3>
                              <p className="text-sm text-gray-500 mt-2">Masukkan No. HP, Email, atau Username untuk memulai chat bantuan.</p>
                          </div>
                          
                          <div className="space-y-4">
                              <div className="bg-gray-50 p-3 rounded-xl border focus-within:border-red-500 transition-colors">
                                  <input 
                                      className="w-full bg-transparent outline-none text-sm"
                                      placeholder="Nomor HP / Email / Username"
                                      value={csIdentityInput}
                                      onChange={e => { setCsIdentityInput(e.target.value); setErrorMsg(''); }}
                                  />
                              </div>
                              <button 
                                  onClick={handleVerifyCS}
                                  className="w-full bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 btn-press"
                              >
                                  Mulai Chat
                              </button>
                          </div>
                      </div>
                  ) : (
                      <>
                        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                            <div className="bg-yellow-50 p-2 rounded text-xs text-gray-500 text-center border border-yellow-200 shadow-sm">Terhubung ke layanan bantuan</div>
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
                      </>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export const Register = () => {
    const navigate = useNavigate();
    const { register } = useApp();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    // Visibility States
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission
        setErrorMsg('');
        
        if (!phone || !password || !confirmPassword) {
            setErrorMsg("Harap isi semua kolom!");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("Konfirmasi kata sandi tidak cocok!");
            return;
        }
        
        const success = register(phone, password);
        if (success) {
            alert("Pendaftaran Berhasil! Silakan Login.");
            navigate('/login');
        } else {
            setErrorMsg("Nomor ponsel sudah terdaftar!");
        }
    };
    
    return (
        <div className="flex flex-col min-h-screen bg-white animate-fade-in">
          <div className="bg-red-600 text-white p-6 pb-12 rounded-b-[30px] shadow-lg">
            <h1 className="text-2xl font-bold mb-2 animate-slide-up">Daftar</h1>
            <p className="text-sm opacity-90 animate-slide-up">Silakan registrasi dengan Nomor Ponsel atau Email</p>
          </div>
    
          <div className="px-6 -mt-8 pb-10">
            <form onSubmit={handleRegister} className="bg-white rounded-xl shadow-lg p-6 space-y-5 animate-slide-up" style={{animationDelay: '0.1s'}}>
                {/* Error Notification */}
                {errorMsg && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded text-xs flex items-center gap-2 animate-pop">
                        <AlertCircle size={16}/>
                        {errorMsg}
                    </div>
                )}
                
                <div className="text-center text-red-600 font-bold border-b border-red-600 pb-2">Registrasi Nomor Ponsel</div>
                
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Smartphone size={16} className="text-red-500"/> Nomor Ponsel</label>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-transparent input-focus transition-all duration-200">
                        <span className="text-gray-500 font-bold">+62</span>
                        <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); setErrorMsg(''); }}
                            placeholder="Silakan masukkan nomor telepon" 
                            className="bg-transparent w-full outline-none text-gray-700" 
                            
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Lock size={16} className="text-red-500"/> Tetapkan kata sandi</label>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-transparent input-focus transition-all duration-200">
                        <input 
                            type={showPass ? "text" : "password"} 
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                            placeholder="Tetapkan kata sandi" 
                            className="bg-transparent w-full outline-none text-gray-700" 
                            
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="focus:outline-none">
                            {showPass ? <Eye size={20} className="text-red-500"/> : <EyeOff size={20} className="text-gray-400"/>}
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Lock size={16} className="text-red-500"/> Konfirmasi sandi</label>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-transparent input-focus transition-all duration-200">
                        <input 
                            type={showConfirmPass ? "text" : "password"} 
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                            placeholder="Konfirmasi sandi" 
                            className="bg-transparent w-full outline-none text-gray-700" 
                            
                        />
                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="focus:outline-none">
                            {showConfirmPass ? <Eye size={20} className="text-red-500"/> : <EyeOff size={20} className="text-gray-400"/>}
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Gift size={16} className="text-red-500"/> Kode undangan</label>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-transparent input-focus transition-all duration-200">
                        <input type="text" value="78843597" readOnly className="bg-transparent w-full outline-none text-gray-700" />
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1 accent-red-600" defaultChecked required />
                    <span className="text-xs text-gray-500">Saya telah membaca dan setuju <span className="text-red-500">【Perjanjian Privasi】</span></span>
                </div>

                <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-200 btn-press">
                  Daftar
                </button>

                <button type="button" onClick={() => navigate('/login')} className="w-full text-gray-500 text-sm py-2 btn-press">
                    Saya memiliki akun <span className="text-red-600 font-bold">Login</span>
                </button>
            </form>
          </div>
        </div>
    )
}
