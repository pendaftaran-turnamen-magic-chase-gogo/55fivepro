
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, GameResult, Bet, NotificationItem, GameMode, Role, ChatMessage, Transaction } from './types';

const MODE_CONFIG: Record<GameMode, { duration: number, prefix: string }> = {
  '30s': { duration: 30, prefix: '1' },
  '1Min': { duration: 60, prefix: '2' },
  '3Min': { duration: 180, prefix: '3' },
  '5Min': { duration: 300, prefix: '5' }
};

interface AppContextType {
  user: User | null;
  allUsers: User[]; // Admin access to DB
  login: (identity: string, password?: string) => boolean;
  register: (phone: string, pass: string) => boolean;
  logout: () => void;
  
  balance: number;
  isDemo: boolean;
  toggleMode: (demo: boolean) => void;
  resetDemoBalance: () => void;
  updateBalance: (amount: number) => void;
  
  // Admin User Management
  adminUpdateUser: (id: string, data: Partial<User>) => { success: boolean, message: string };
  
  updateProfile: (data: Partial<User>) => { success: boolean, message: string };

  activeGameMode: GameMode;
  setActiveGameMode: (mode: GameMode) => void;
  timeLeft: number;
  periodId: string;
  gameHistory: GameResult[];
  placeBet: (selection: string, amount: number, multiplier: number) => void;
  myBets: Bet[];
  
  // Global Bets for Admin
  allActiveBets: Bet[]; 

  forcedResults: Record<GameMode, number | null>;
  setForcedResult: (mode: GameMode, num: number | null) => void;

  activeNotification: NotificationItem | null;
  addNotification: (type: 'win' | 'loss' | 'info', title: string, message: string, amount?: string, accentColor?: string) => void;

  // Chat System
  csMessages: ChatMessage[];
  sendCSMessage: (text: string, sender: 'user' | 'admin', targetUserId: string) => void;
  markChatAsRead: (targetUserId: string, reader: 'user' | 'admin') => void;

  // Transaction System
  transactions: Transaction[];
  requestDeposit: (amount: number, proofImage: string) => void;
  requestWithdraw: (amount: number, bankInfo: string) => void;
  processTransaction: (id: string, action: 'approve' | 'reject') => void;
  adminQrisImage: string;
  setAdminQrisImage: (url: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_USERS: User[] = [
    { id: 'ADMIN_001', username: 'SuperAdmin', name: 'Master Control', phone: '83896425349', email: 'aryaarshal5445321@gmail.com', password: 'Arshal5445@', balance: 999999999, role: 'super_admin', token: 'adm-token', avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff' },
    { id: 'CS_001', username: 'AdminCS', name: 'Customer Service', phone: '08123456789', password: 'password', balance: 0, role: 'admin', token: 'cs-token', avatar: 'https://ui-avatars.com/api/?name=CS&background=blue&color=fff' },
    { id: 'USER_123', username: 'Sultan_Gacor', name: 'Budi Santoso', phone: '08999999999', password: 'user123', balance: 15000000, role: 'user', token: 'u1-token', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'USER_456', username: 'Newbie01', name: 'Siti Aminah', phone: '08777777777', password: 'user123', balance: 50000, role: 'user', token: 'u2-token', avatar: 'https://i.pravatar.cc/150?u=2' },
];

const generateResult = (period: string, forcedNumber: number | null = null): GameResult => {
  const num = forcedNumber !== null ? forcedNumber : Math.floor(Math.random() * 10);
  const size = num >= 5 ? 'Big' : 'Small';
  let color: GameResult['color'] = 'Red';
  if ([1, 3, 7, 9].includes(num)) color = 'Green';
  else if ([2, 4, 6, 8].includes(num)) color = 'Red';
  else if (num === 0) color = 'RedViolet';
  else if (num === 5) color = 'GreenViolet';

  return { period, number: num, size, color };
};

const getSelectionColor = (sel: string): string => {
    if (['Green', '1', '3', '7', '9'].includes(sel)) return 'bg-green-500';
    if (['Red', '2', '4', '6', '8'].includes(sel)) return 'bg-red-500';
    if (['Violet', '0', '5'].includes(sel)) return 'bg-violet-500';
    if (sel === 'Big') return 'bg-orange-400';
    if (sel === 'Small') return 'bg-blue-400';
    return 'bg-gray-400';
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  
  const [realBalance, setRealBalance] = useState(0);
  const [demoBalance, setDemoBalance] = useState(50000);
  const [isDemo, setIsDemo] = useState(false);
  const [activeGameMode, setActiveGameMode] = useState<GameMode>('30s');
  
  // Per-Mode Forced Results
  const [forcedResults, setForcedResults] = useState<Record<GameMode, number | null>>({
      '30s': null, '1Min': null, '3Min': null, '5Min': null
  });

  const [histories, setHistories] = useState<Record<GameMode, GameResult[]>>({ '30s': [], '1Min': [], '3Min': [], '5Min': [] });
  const [timeLeft, setTimeLeft] = useState(0);
  const [periodId, setPeriodId] = useState('');
  
  // Bet State
  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [allActiveBets, setAllActiveBets] = useState<Bet[]>([]); // For Admin View

  // Chat State
  const [csMessages, setCsMessages] = useState<ChatMessage[]>([
      { id: 'msg_0', userId: 'USER_123', sender: 'system', text: 'Halo Sultan! Ada yang bisa kami bantu?', timestamp: Date.now(), status: 'read' },
      { id: 'msg_1', userId: 'USER_123', sender: 'user', text: 'Saya mau tanya soal deposit', timestamp: Date.now() + 1000, status: 'delivered' }
  ]);

  // Transaction State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminQrisImage, setAdminQrisImage] = useState('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png');

  const [notificationQueue, setNotificationQueue] = useState<NotificationItem[]>([]);
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);

  const addNotification = (type: 'win' | 'loss' | 'info', title: string, message: string, amount?: string, accentColor?: string, ballNumber?: string) => {
      setNotificationQueue(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          type, title, message, amount, accentColor, ballNumber
      }]);
  };

  useEffect(() => {
      if (!activeNotification && notificationQueue.length > 0) {
          setActiveNotification(notificationQueue[0]);
          setNotificationQueue(prev => prev.slice(1));
          setTimeout(() => setActiveNotification(null), 3000);
      }
  }, [activeNotification, notificationQueue]);

  // Init History
  useEffect(() => {
    const newHistories: any = {};
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    (['30s', '1Min', '3Min', '5Min'] as GameMode[]).forEach(mode => {
       const initialHistory: GameResult[] = [];
       const modeInterval = MODE_CONFIG[mode].duration / 60; 
       const totalMinutes = now.getHours() * 60 + now.getMinutes();
       const basePeriod = Math.floor(totalMinutes / (modeInterval < 1 ? 1 : modeInterval)) * (modeInterval < 1 ? 2 : 1);
       let currentSeq = 1000 + basePeriod;
       for (let i = 0; i < 20; i++) {
          initialHistory.push(generateResult(`${dateStr}${MODE_CONFIG[mode].prefix}${currentSeq - i}`));
       }
       newHistories[mode] = initialHistory;
    });
    setHistories(newHistories);
  }, []);

  // Main Game Loop (Process ALL modes simultaneously)
  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const totalSeconds = Math.floor(now.getTime() / 1000);

        // 1. UPDATE UI STATE (Only for the currently Active Game Mode)
        const activeConfig = MODE_CONFIG[activeGameMode];
        const activeCycle = totalSeconds % activeConfig.duration;
        const activeRemaining = activeConfig.duration - activeCycle;
        const activeTotalIntervals = Math.floor(totalSeconds / activeConfig.duration);
        
        setTimeLeft(activeRemaining);
        setPeriodId(`${dateStr}${activeConfig.prefix}${activeTotalIntervals}`);

        // 2. PROCESS LOGIC FOR ALL MODES (Background Loop)
        // This ensures bets are processed even if the user/admin is looking at a different mode/page
        (['30s', '1Min', '3Min', '5Min'] as GameMode[]).forEach(mode => {
            const config = MODE_CONFIG[mode];
            const totalIntervals = Math.floor(totalSeconds / config.duration);
            const currentPeriodId = `${dateStr}${config.prefix}${totalIntervals}`;
            const prevPeriodId = `${dateStr}${config.prefix}${totalIntervals - 1}`;

            setHistories(prevHistories => {
                const currentModeHistory = prevHistories[mode] || [];
                const lastStoredPeriod = currentModeHistory[0]?.period;
                
                // If a new period has started for this mode
                if (lastStoredPeriod !== prevPeriodId) {
                    // Generate Result (Check Forced)
                    const forcedNum = forcedResults[mode];
                    const newResult = generateResult(prevPeriodId, forcedNum);
                    
                    // Clear forced result after use
                    if (forcedNum !== null) {
                        setForcedResults(prev => ({ ...prev, [mode]: null }));
                    }

                    // Process MY Bets
                    setMyBets(prevBets => prevBets.map(bet => {
                        // CRITICAL: Check against 'mode' loop variable, not 'activeGameMode'
                        if (bet.gameMode === mode && bet.period === prevPeriodId && bet.status === 'Pending') {
                            let win = false;
                            if (bet.select === 'Green' && (newResult.color.includes('Green'))) win = true;
                            if (bet.select === 'Red' && (newResult.color.includes('Red'))) win = true;
                            if (bet.select === 'Violet' && (newResult.color.includes('Violet'))) win = true;
                            if (bet.select === newResult.number.toString()) win = true;
                            if (bet.select === newResult.size) win = true;

                            const betCost = bet.amount * bet.multiplier;
                            const winAmt = win ? betCost * 1.9 : 0;
                            
                            if (win) {
                                if (bet.mode === 'Demo') setDemoBalance(b => b + winAmt);
                                else {
                                    setRealBalance(b => b + winAmt);
                                    // Update User in DB if Real
                                    if (user) {
                                        setAllUsers(users => users.map(u => u.id === user.id ? { ...u, balance: u.balance + winAmt } : u));
                                    }
                                }
                                addNotification('win', 'Menang!', `${mode}: ${bet.select}`, `+Rp${winAmt.toLocaleString('id-ID')}`, getSelectionColor(bet.select), bet.select.length === 1 && !isNaN(parseInt(bet.select)) ? bet.select : undefined);
                            } else {
                                addNotification('loss', 'Kalah', `${mode}: ${bet.select}`, `-Rp${betCost.toLocaleString('id-ID')}`, getSelectionColor(bet.select));
                            }
                            return { ...bet, status: win ? 'Win' : 'Loss', winAmount: winAmt };
                        }
                        return bet;
                    }));

                    // Process ALL Active Bets (Admin View) - Remove finished bets
                    setAllActiveBets(prev => prev.filter(b => {
                        const isFinished = b.gameMode === mode && b.period === prevPeriodId;
                        return !isFinished; // Keep bets that haven't finished yet
                    }));

                    return { ...prevHistories, [mode]: [newResult, ...currentModeHistory] };
                }
                return prevHistories;
            });
        });

    }, 1000);
    return () => clearInterval(timer);
  }, [activeGameMode, forcedResults, realBalance, user]);

  // Actions
  const login = (identity: string, pass?: string) => {
    const foundUser = allUsers.find(u => {
        const dbPhone = u.phone.replace(/^0/, '');
        const inputPhone = identity.replace(/^0/, '');
        const isPhoneMatch = dbPhone === inputPhone || u.phone === identity;
        const isEmailMatch = u.email && (u.email.toLowerCase() === identity.toLowerCase());
        return (isPhoneMatch || isEmailMatch) && u.password === pass;
    });

    if (foundUser) {
        if(foundUser.isBanned) {
            alert("Akun anda telah dibekukan. Hubungi CS.");
            return false;
        }
        setUser(foundUser);
        setRealBalance(foundUser.balance);
        setIsDemo(false);
        if (foundUser.role !== 'user') addNotification('info', `Mode ${foundUser.role}`, 'Welcome back, Administrator', '', 'bg-black');
        return true;
    }
    return false;
  };

  const register = (phone: string, pass: string) => {
      if (allUsers.some(u => u.phone === phone)) return false;
      const newUser: User = {
          id: `USER_${Date.now().toString().slice(-6)}`,
          username: `Member${Math.floor(Math.random() * 90000) + 10000}`,
          phone: phone,
          password: pass,
          balance: 0,
          role: 'user',
          token: `token_${Date.now()}`,
          avatar: `https://ui-avatars.com/api/?name=Member&background=random&color=fff`,
          name: 'Member Baru'
      };
      setAllUsers(prev => [...prev, newUser]);
      return true;
  };

  const logout = () => { setUser(null); setIsDemo(false); };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return { success: false, message: 'No user' };
    if (data.username && data.username !== user.username) {
        if (allUsers.some(u => u.username === data.username)) {
            return { success: false, message: 'Username sudah digunakan!' };
        }
    }
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    setAllUsers(users => users.map(u => u.id === user.id ? updatedUser : u));
    return { success: true, message: 'Profil diperbarui' };
  };

  const setForcedResult = (mode: GameMode, num: number | null) => {
      setForcedResults(prev => ({ ...prev, [mode]: num }));
      if(num !== null) addNotification('info', 'Admin System', `Hasil ${mode} periode berikutnya diatur: ${num}`, '', 'bg-gray-800');
  };

  const adminUpdateUser = (id: string, data: Partial<User>) => {
      if (data.username) {
         const existing = allUsers.find(u => u.username === data.username && u.id !== id);
         if (existing) return { success: false, message: 'Username Conflict' };
      }
      setAllUsers(users => users.map(u => {
          if (u.id === id) {
              const updated = { ...u, ...data };
              if (user && user.id === id) {
                  setUser(updated);
                  if (data.balance !== undefined) setRealBalance(data.balance);
              }
              return updated;
          }
          return u;
      }));
      return { success: true, message: 'User updated successfully' };
  };

  const toggleMode = (demo: boolean) => setIsDemo(demo);
  const resetDemoBalance = () => { if (isDemo && demoBalance < 5000) setDemoBalance(50000); };
  
  const updateBalance = (amount: number) => {
    if (isDemo) setDemoBalance(prev => prev + amount);
    else {
        setRealBalance(prev => {
            const newBal = prev + amount;
            if (user) {
                setAllUsers(users => users.map(u => u.id === user?.id ? { ...u, balance: newBal } : u));
            }
            return newBal;
        });
    }
  };

  // --- Transaction Logic ---
  const requestDeposit = (amount: number, proofImage: string) => {
      if (!user) return;
      const newTx: Transaction = {
          id: `DEP_${Date.now()}`,
          userId: user.id,
          username: user.username,
          type: 'deposit',
          amount,
          status: 'pending',
          date: new Date().toISOString(),
          method: 'QRIS',
          proofImage
      };
      setTransactions(prev => [newTx, ...prev]);
  };

  const requestWithdraw = (amount: number, bankInfo: string) => {
      if (!user) return;
      // In main UI we block this, but here is the logic just in case
      const newTx: Transaction = {
          id: `WD_${Date.now()}`,
          userId: user.id,
          username: user.username,
          type: 'withdraw',
          amount,
          status: 'pending',
          date: new Date().toISOString(),
          method: 'Bank Transfer'
      };
      setTransactions(prev => [newTx, ...prev]);
  };

  const processTransaction = (id: string, action: 'approve' | 'reject') => {
      const tx = transactions.find(t => t.id === id);
      if (!tx) return;

      if (action === 'approve') {
          if (tx.type === 'deposit') {
              // Add balance to user
              setAllUsers(users => users.map(u => {
                  if (u.id === tx.userId) {
                      const newBal = u.balance + tx.amount;
                      // Update active user state if it's me
                      if (user && user.id === u.id) setRealBalance(newBal);
                      return { ...u, balance: newBal };
                  }
                  return u;
              }));
          }
          // For withdraw, balance is usually deducted at request time, but here we don't implement full WD flow
      }

      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: action === 'approve' ? 'success' : 'failed' } : t));
  };

  const placeBet = (selection: string, amount: number, multiplier: number) => {
    const currentBal = isDemo ? demoBalance : realBalance;
    const totalCost = amount * multiplier;
    if (currentBal < totalCost) { alert("Saldo tidak mencukupi!"); return; }
    
    updateBalance(-totalCost);
    const newBet: Bet = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'guest',
      username: user?.username || 'Guest',
      period: periodId, 
      gameMode: activeGameMode,
      select: selection,
      amount,
      multiplier,
      status: 'Pending',
      mode: isDemo ? 'Demo' : 'Real'
    };
    setMyBets(prev => [newBet, ...prev]);
    
    if (!isDemo) {
        setAllActiveBets(prev => [...prev, newBet]);
        const botBet: Bet = {
            id: 'bot_' + Math.random(),
            userId: 'BOT',
            username: ['Sultan', 'Dragon', 'Lucky', 'Winner'][Math.floor(Math.random()*4)] + Math.floor(Math.random()*99),
            period: periodId,
            gameMode: activeGameMode,
            select: Math.floor(Math.random()*10).toString(),
            amount: [1000, 50000, 100000, 500000][Math.floor(Math.random()*4)],
            multiplier: 1,
            status: 'Pending',
            mode: 'Real'
        };
        setAllActiveBets(prev => [...prev, botBet]);
    }
    addNotification('info', 'Taruhan Berhasil', `Memasang ${selection}`, `Rp${totalCost.toLocaleString('id-ID')}`, getSelectionColor(selection));
  };

  const sendCSMessage = (text: string, sender: 'user' | 'admin', targetUserId: string) => {
      const msgId = Math.random().toString();
      const msg: ChatMessage = {
          id: msgId,
          userId: targetUserId,
          sender,
          text,
          timestamp: Date.now(),
          status: 'sent'
      };
      setCsMessages(prev => [...prev, msg]);
      setTimeout(() => {
          setCsMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m));
      }, 1000);
  };

  const markChatAsRead = (targetUserId: string, reader: 'user' | 'admin') => {
      setCsMessages(prev => prev.map(m => {
          if (reader === 'user' && m.userId === targetUserId && m.sender === 'admin' && m.status !== 'read') {
              return { ...m, status: 'read' };
          }
          if (reader === 'admin' && m.userId === targetUserId && m.sender === 'user' && m.status !== 'read') {
              return { ...m, status: 'read' };
          }
          return m;
      }));
  };

  const currentBalance = isDemo ? demoBalance : realBalance;

  return (
    <AppContext.Provider value={{
      user, allUsers, login, register, logout, 
      balance: currentBalance, isDemo, toggleMode, resetDemoBalance, updateBalance,
      updateProfile, adminUpdateUser,
      activeGameMode, setActiveGameMode, timeLeft, periodId, gameHistory: histories[activeGameMode] || [], 
      placeBet, myBets, allActiveBets,
      forcedResults, setForcedResult,
      activeNotification, addNotification,
      csMessages, sendCSMessage, markChatAsRead,
      transactions, requestDeposit, requestWithdraw, processTransaction,
      adminQrisImage, setAdminQrisImage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
