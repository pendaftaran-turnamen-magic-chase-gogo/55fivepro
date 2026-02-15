
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, GameResult, Bet, NotificationItem, GameMode, Role, ChatMessage, Transaction, WithdrawAccount, TradingPosition, MarketType, TradingDataPoint } from './types';

const MODE_CONFIG: Record<GameMode, { duration: number, prefix: string }> = {
  '30s': { duration: 30, prefix: '1' },
  '1Min': { duration: 60, prefix: '2' },
  '3Min': { duration: 180, prefix: '3' },
  '5Min': { duration: 300, prefix: '5' }
};

interface AppContextType {
  user: User | null;
  allUsers: User[]; 
  login: (identity: string, password?: string) => boolean;
  register: (phone: string, pass: string) => boolean;
  logout: () => void;
  
  balance: number;
  isDemo: boolean;
  toggleMode: (demo: boolean) => void;
  resetDemoBalance: () => void;
  updateBalance: (amount: number) => void;
  
  adminUpdateUser: (id: string, data: Partial<User>) => { success: boolean, message: string };
  toggleUserBan: (id: string) => void;
  updateProfile: (data: Partial<User>) => { success: boolean, message: string };
  addWithdrawAccount: (account: WithdrawAccount) => void;
  removeWithdrawAccount: (id: string) => void;

  activeGameMode: GameMode;
  setActiveGameMode: (mode: GameMode) => void;
  timeLeft: number;
  periodId: string;
  gameHistory: GameResult[];
  placeBet: (selection: string, amount: number, multiplier: number) => void;
  myBets: Bet[];
  allActiveBets: Bet[]; 

  forcedResults: Record<GameMode, number | null>;
  predictedResults: Record<GameMode, number>; 
  setForcedResult: (mode: GameMode, num: number | null) => void;

  activeNotification: NotificationItem | null;
  addNotification: (type: 'win' | 'loss' | 'info', title: string, message: string, amount?: string, accentColor?: string) => void;

  csMessages: ChatMessage[];
  sendCSMessage: (text: string, sender: 'user' | 'admin', targetUserId: string, image?: string) => void;
  markChatAsRead: (targetUserId: string, reader: 'user' | 'admin') => void;

  transactions: Transaction[];
  requestDeposit: (amount: number, proofImage: string) => void;
  requestWithdraw: (amount: number, details: WithdrawAccount) => void;
  processTransaction: (id: string, action: 'approve' | 'reject') => void;
  adminQrisImage: string;
  setAdminQrisImage: (url: string) => void;

  // Trading System (Dual Market)
  marketPrices: Record<MarketType, number>;
  marketHistories: Record<MarketType, TradingDataPoint[]>;
  tradingPositions: TradingPosition[];
  openPosition: (amount: number, market: MarketType, direction: 'Buy' | 'Sell') => void;
  closePosition: (positionId: string) => void;
  closeAllPositions: (type: 'All' | 'Profit' | 'Loss', market: MarketType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data (Same as before)
const INITIAL_USERS: User[] = [
    { id: 'ADMIN_001', username: 'SuperAdmin', name: 'Master Control', phone: '83896425349', email: 'aryaarshal5445321@gmail.com', password: 'Arshal5445@', balance: 999999999, role: 'super_admin', token: 'adm-token', avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff', device: 'MacBook Pro M1', ip: '192.168.1.1' },
    { id: 'CS_001', username: 'AdminCS', name: 'Customer Service', phone: '08123456789', password: 'password', balance: 0, role: 'admin', token: 'cs-token', avatar: 'https://ui-avatars.com/api/?name=CS&background=blue&color=fff', device: 'Windows PC', ip: '10.0.0.5' },
    { id: 'USER_123', username: 'Sultan_Gacor', name: 'Budi Santoso', phone: '08999999999', password: 'user123', balance: 150000000, role: 'user', token: 'u1-token', avatar: 'https://i.pravatar.cc/150?u=1', device: 'iPhone 13 Pro', ip: '36.80.20.11' },
    { id: 'USER_456', username: 'Newbie01', name: 'Siti Aminah', phone: '08777777777', password: 'user123', balance: 50000, role: 'user', token: 'u2-token', avatar: 'https://i.pravatar.cc/150?u=2', device: 'Samsung S21', ip: '114.120.5.2' },
    { id: 'USER_789', username: 'Raja_Slot', name: 'Doni Tata', phone: '08555555555', password: 'user123', balance: 25000000, role: 'user', token: 'u3-token', avatar: 'https://i.pravatar.cc/150?u=3', device: 'Oppo Reno', ip: '100.20.10.1' },
];

const generateResult = (period: string, forcedNumber: number | null = null): GameResult => {
  const num = forcedNumber !== null ? forcedNumber : Math.floor(Math.random() * 10);
  const size = num >= 5 ? 'Big' : 'Small';
  let color: GameResult['color'] = 'Red';
  if ([1, 3, 7, 9].includes(num)) color = 'Green';
  else if ([2, 4, 6, 8].includes(num)) color = 'Red';
  else if (num === 0) return { period, number: 0, size: 'Small', color: 'RedViolet' };
  else if (num === 5) return { period, number: 5, size: 'Big', color: 'GreenViolet' };

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
  
  const [forcedResults, setForcedResults] = useState<Record<GameMode, number | null>>({
      '30s': null, '1Min': null, '3Min': null, '5Min': null
  });

  const [predictedResults, setPredictedResults] = useState<Record<GameMode, number>>({
      '30s': Math.floor(Math.random() * 10), 
      '1Min': Math.floor(Math.random() * 10), 
      '3Min': Math.floor(Math.random() * 10), 
      '5Min': Math.floor(Math.random() * 10)
  });

  const [histories, setHistories] = useState<Record<GameMode, GameResult[]>>({ '30s': [], '1Min': [], '3Min': [], '5Min': [] });
  const [timeLeft, setTimeLeft] = useState(0);
  const [periodId, setPeriodId] = useState('');
  
  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [allActiveBets, setAllActiveBets] = useState<Bet[]>([]); 

  const [csMessages, setCsMessages] = useState<ChatMessage[]>([
      { id: 'msg_0', userId: 'USER_123', sender: 'system', text: 'Halo Sultan! Ada yang bisa kami bantu?', timestamp: Date.now(), status: 'read' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminQrisImage, setAdminQrisImage] = useState('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png');

  const [notificationQueue, setNotificationQueue] = useState<NotificationItem[]>([]);
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);

  // Trading State
  const [marketPrices, setMarketPrices] = useState<Record<MarketType, number>>({
      '55Five': 42000.00,
      'PreA': 1000.00 // Start base price for PreA
  });
  
  const [marketHistories, setMarketHistories] = useState<Record<MarketType, TradingDataPoint[]>>({
      '55Five': [],
      'PreA': []
  });
  
  const [tradingPositions, setTradingPositions] = useState<TradingPosition[]>([]);
  
  const lastProcessedPeriods = useRef<Record<GameMode, string>>({
      '30s': '', '1Min': '', '3Min': '', '5Min': ''
  });

  // --- WEBSOCKET FOR REAL MARKET (55Five = BTC/USDT) ---
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.e === 'kline') {
            const k = message.k;
            const currentPrice = parseFloat(k.c);
            setMarketPrices(prev => ({...prev, '55Five': currentPrice}));
            setMarketHistories(prev => {
                const newPoint: TradingDataPoint = {
                    time: k.t, price: currentPrice, open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: parseFloat(k.c)
                };
                const currentHistory = prev['55Five'];
                // Update or Append
                const lastPoint = currentHistory[currentHistory.length - 1];
                let newHistory;
                if (lastPoint && lastPoint.time === newPoint.time) {
                     // Update current minute candle
                    newHistory = [...currentHistory.slice(0, -1), newPoint];
                } else {
                    // New minute candle
                    newHistory = [...currentHistory, newPoint];
                }
                return { ...prev, '55Five': newHistory.slice(-100) };
            });
        }
    };
    return () => { ws.close(); };
  }, []);

  // Initialize PreA History (Synthetic)
  useEffect(() => {
     const initPreA = () => {
         const data: TradingDataPoint[] = [];
         let p = 1000.00;
         const now = Date.now();
         for(let i=0; i<50; i++) {
             // Fake volatility for initial chart
             p = p * (1 + (Math.random() - 0.5) * 0.01);
             data.push({ time: now - (50-i)*60000, price: p, open: p, high: p, low: p, close: p });
         }
         setMarketHistories(prev => ({...prev, 'PreA': data}));
         setMarketPrices(prev => ({...prev, 'PreA': p}));
     };
     initPreA();
  }, []);

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

  // Init Game Histories (Runs once)
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
          const res = generateResult(`${dateStr}${MODE_CONFIG[mode].prefix}${currentSeq - i}`);
          initialHistory.push(res);
       }
       newHistories[mode] = initialHistory;
       lastProcessedPeriods.current[mode] = initialHistory[0].period; 
    });
    setHistories(newHistories);
  }, []);

  // Main Game Loop & PreA Pricing Logic
  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const totalSeconds = Math.floor(now.getTime() / 1000);
        const timeString = now.getTime();

        // Update TimeLeft for Active Mode
        const activeConfig = MODE_CONFIG[activeGameMode];
        const activeCycle = totalSeconds % activeConfig.duration;
        setTimeLeft(activeConfig.duration - activeCycle);
        setPeriodId(`${dateStr}${activeConfig.prefix}${Math.floor(totalSeconds / activeConfig.duration)}`);

        // Flag to track if PreA price needs update in this tick
        let preAPriceChangePercent = 0;
        let preAUpdated = false;

        (['30s', '1Min', '3Min', '5Min'] as GameMode[]).forEach(mode => {
            const config = MODE_CONFIG[mode];
            const currentPeriodIndex = Math.floor(totalSeconds / config.duration);
            const finishedPeriodId = `${dateStr}${config.prefix}${currentPeriodIndex - 1}`;
            
            if (lastProcessedPeriods.current[mode] !== finishedPeriodId && lastProcessedPeriods.current[mode] !== '') {
                // Determine Result
                const forcedNum = forcedResults[mode];
                const predictedNum = predictedResults[mode];
                const finalNum = forcedNum !== null ? forcedNum : predictedNum;
                const newResult = generateResult(finishedPeriodId, finalNum);
                
                // Reset Force/Predict
                if (forcedNum !== null) setForcedResults(prev => ({ ...prev, [mode]: null }));
                setPredictedResults(prev => ({ ...prev, [mode]: Math.floor(Math.random() * 10) }));

                // Update History
                setHistories(prev => ({
                    ...prev,
                    [mode]: [newResult, ...(prev[mode] || [])]
                }));
                lastProcessedPeriods.current[mode] = finishedPeriodId;

                // --- PreA Pricing Logic ---
                // 5,6,7,8,9 = +1% Profit | 0,1,2,3,4 = -1.5% Loss (Mines)
                if (newResult.number >= 5) {
                    preAPriceChangePercent += 0.01; // +1%
                } else {
                    preAPriceChangePercent -= 0.015; // -1.5%
                }
                preAUpdated = true;

                // Process WIN GO Bets
                setMyBets(prevBets => prevBets.map(bet => {
                    if (bet.gameMode === mode && bet.period === finishedPeriodId && bet.status === 'Pending') {
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
                                if (user) setAllUsers(users => users.map(u => u.id === user.id ? { ...u, balance: u.balance + winAmt } : u));
                            }
                            addNotification('win', 'Menang!', `${mode}: ${bet.select}`, `+Rp${winAmt.toLocaleString('id-ID')}`, getSelectionColor(bet.select), bet.select.length === 1 && !isNaN(parseInt(bet.select)) ? bet.select : undefined);
                        } else {
                            addNotification('loss', 'Kalah', `${mode}: ${bet.select}`, `-Rp${betCost.toLocaleString('id-ID')}`, getSelectionColor(bet.select));
                        }
                        return { ...bet, status: win ? 'Win' : 'Loss', winAmount: winAmt };
                    }
                    return bet;
                }));
                
                setAllActiveBets(prev => prev.filter(b => !(b.gameMode === mode && b.period === finishedPeriodId)));
            }
        });

        // --- Update PreA Price if changed ---
        if (preAUpdated) {
             setMarketPrices(prev => {
                const oldPrice = prev['PreA'];
                let newPrice = oldPrice * (1 + preAPriceChangePercent);
                if (newPrice < 10) newPrice = 10; // Floor price

                setMarketHistories(h => {
                    // Update history
                    return { 
                        ...h, 
                        'PreA': [...h['PreA'], { time: timeString, price: newPrice, open: oldPrice, high: Math.max(oldPrice, newPrice), low: Math.min(oldPrice, newPrice), close: newPrice }].slice(-100) 
                    };
                });
                return { ...prev, 'PreA': newPrice };
            });
        }

    }, 1000);
    return () => clearInterval(timer);
  }, [activeGameMode, forcedResults, realBalance, user, predictedResults]);

  // --- TRADING LOGIC (MT5 Style) ---
  const openPosition = (amount: number, market: MarketType, direction: 'Buy' | 'Sell') => {
      const currentBal = isDemo ? demoBalance : realBalance;
      if (currentBal < amount) { alert("Saldo tidak mencukupi!"); return; }
      
      updateBalance(-amount); // Deduct margin
      
      const newPos: TradingPosition = { 
          id: 'pos_' + Date.now(), 
          userId: user?.id || 'guest', 
          market, 
          direction,
          entryPrice: marketPrices[market], 
          amount: amount, 
          leverage: 1, // Simplified 1x leverage for this implementation
          timestamp: Date.now(), 
          status: 'Open' 
      };
      
      setTradingPositions(prev => [newPos, ...prev]);
      addNotification('info', 'Trading Opened', `${direction} ${market}`, `Rp${amount.toLocaleString()}`, direction === 'Buy' ? 'bg-green-500' : 'bg-red-500');
  };

  const closePosition = (positionId: string) => {
      setTradingPositions(prev => prev.map(pos => {
          if (pos.id === positionId && pos.status === 'Open') {
              const currentPrice = marketPrices[pos.market];
              
              // Calculate PnL based on Direction
              let pnlPercent = 0;
              if (pos.direction === 'Buy') {
                  pnlPercent = (currentPrice - pos.entryPrice) / pos.entryPrice;
              } else {
                  pnlPercent = (pos.entryPrice - currentPrice) / pos.entryPrice;
              }
              
              const profit = pos.amount * pnlPercent * pos.leverage;
              const returnAmount = pos.amount + profit;

              updateBalance(returnAmount); // Return margin + profit (or margin - loss)
              
              addNotification(profit >= 0 ? 'win' : 'loss', 'Trading Closed', profit >= 0 ? 'Profit' : 'Loss', `Rp${Math.round(profit).toLocaleString()}`, profit >= 0 ? 'bg-green-500' : 'bg-red-500');
              
              return { ...pos, status: 'Closed', closePrice: currentPrice, closeTime: Date.now(), profit: profit };
          }
          return pos;
      }));
  };

  const closeAllPositions = (type: 'All' | 'Profit' | 'Loss', market: MarketType) => {
      // Create a temporary copy to iterate safely
      const currentPositions = [...tradingPositions]; 
      const activePositions = currentPositions.filter(p => p.status === 'Open' && p.market === market);
      
      activePositions.forEach(pos => {
          const currentPrice = marketPrices[market];
          // Recalculate PnL
          let pnlPercent = 0;
          if (pos.direction === 'Buy') pnlPercent = (currentPrice - pos.entryPrice) / pos.entryPrice;
          else pnlPercent = (pos.entryPrice - currentPrice) / pos.entryPrice;
          
          const profit = pos.amount * pnlPercent * pos.leverage;

          if (type === 'All') closePosition(pos.id);
          else if (type === 'Profit' && profit > 0) closePosition(pos.id);
          else if (type === 'Loss' && profit < 0) closePosition(pos.id);
      });
  };

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
            alert("Akun anda telah DIBEKUKAN/BANNED oleh Administrator. Hubungi CS.");
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
          name: 'Member Baru',
          isBanned: false,
          savedAccounts: [],
          device: 'Unknown',
          ip: '127.0.0.1'
      };
      setAllUsers(prev => [...prev, newUser]);
      return true;
  };

  const logout = () => { setUser(null); setIsDemo(false); };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return { success: false, message: 'No user' };
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    setAllUsers(users => users.map(u => u.id === user.id ? updatedUser : u));
    return { success: true, message: 'Profil diperbarui' };
  };

  const setForcedResult = (mode: GameMode, num: number | null) => {
      setForcedResults(prev => ({ ...prev, [mode]: num }));
  };

  const adminUpdateUser = (id: string, data: Partial<User>) => {
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
  
  const toggleUserBan = (id: string) => {
      setAllUsers(users => users.map(u => {
          if (u.id === id && u.role === 'user') {
              const newState = !u.isBanned;
              addNotification('info', 'User Status Changed', `${u.username} is now ${newState ? 'BANNED' : 'ACTIVE'}`, '', newState ? 'bg-red-600' : 'bg-green-600');
              return { ...u, isBanned: newState };
          }
          return u;
      }));
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

  const addWithdrawAccount = (account: WithdrawAccount) => {
      if (!user) return;
      const updatedUser = { ...user, savedAccounts: [...(user.savedAccounts || []), account] };
      setUser(updatedUser);
      setAllUsers(users => users.map(u => u.id === user.id ? updatedUser : u));
  };

  const removeWithdrawAccount = (id: string) => {
      if (!user) return;
      const updatedUser = { ...user, savedAccounts: (user.savedAccounts || []).filter(acc => acc.id !== id) };
      setUser(updatedUser);
      setAllUsers(users => users.map(u => u.id === user.id ? updatedUser : u));
  };

  const requestDeposit = (amount: number, proofImage: string) => {
      if (!user) return;
      const newTx: Transaction = {
          id: `DEP_${Date.now()}`,
          userId: user.id, username: user.username, type: 'deposit', amount, status: 'pending', date: new Date().toISOString(), method: 'QRIS', proofImage
      };
      setTransactions(prev => [newTx, ...prev]);
  };

  const requestWithdraw = (amount: number, details: WithdrawAccount) => {
      if (!user) return;
      updateBalance(-amount);
      const newTx: Transaction = {
          id: `WD_${Date.now()}`, userId: user.id, username: user.username, type: 'withdraw', amount, status: 'pending', date: new Date().toISOString(), method: details.type, withdrawDetails: details
      };
      setTransactions(prev => [newTx, ...prev]);
  };

  const processTransaction = (id: string, action: 'approve' | 'reject') => {
      const tx = transactions.find(t => t.id === id);
      if (!tx) return;
      if (action === 'approve') {
          if (tx.type === 'deposit') {
              setAllUsers(users => users.map(u => {
                  if (u.id === tx.userId) {
                      const newBal = u.balance + tx.amount;
                      if (user && user.id === u.id) setRealBalance(newBal);
                      return { ...u, balance: newBal };
                  }
                  return u;
              }));
          }
      } else if (action === 'reject') {
          if (tx.type === 'withdraw') {
              setAllUsers(users => users.map(u => {
                  if (u.id === tx.userId) {
                      const newBal = u.balance + tx.amount;
                      if (user && user.id === u.id) setRealBalance(newBal);
                      return { ...u, balance: newBal };
                  }
                  return u;
              }));
          }
      }
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: action === 'approve' ? 'success' : 'failed' } : t));
  };

  const placeBet = (selection: string, amount: number, multiplier: number) => {
    const currentBal = isDemo ? demoBalance : realBalance;
    const totalCost = amount * multiplier;
    if (currentBal < totalCost) { alert("Saldo tidak mencukupi!"); return; }
    
    updateBalance(-totalCost);
    const newBet: Bet = {
      id: Math.random().toString(36).substr(2, 9), userId: user?.id || 'guest', username: user?.username || 'Guest', period: periodId, gameMode: activeGameMode, select: selection, amount, multiplier, status: 'Pending', mode: isDemo ? 'Demo' : 'Real'
    };
    setMyBets(prev => [newBet, ...prev]);
    if (!isDemo) setAllActiveBets(prev => [...prev, newBet]);
    addNotification('info', 'Taruhan Berhasil', `Memasang ${selection}`, `Rp${totalCost.toLocaleString('id-ID')}`, getSelectionColor(selection));
  };

  const sendCSMessage = (text: string, sender: 'user' | 'admin', targetUserId: string, image?: string) => {
      const msgId = Math.random().toString();
      const msg: ChatMessage = { id: msgId, userId: targetUserId, sender, text, image, timestamp: Date.now(), status: 'sent' };
      setCsMessages(prev => [...prev, msg]);
      setTimeout(() => { setCsMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m)); }, 1000);
  };

  const markChatAsRead = (targetUserId: string, reader: 'user' | 'admin') => {
      setCsMessages(prev => prev.map(m => {
          if (reader === 'user' && m.userId === targetUserId && m.sender === 'admin' && m.status !== 'read') return { ...m, status: 'read' };
          if (reader === 'admin' && m.userId === targetUserId && m.sender === 'user' && m.status !== 'read') return { ...m, status: 'read' };
          return m;
      }));
  };

  const currentBalance = isDemo ? demoBalance : realBalance;

  return (
    <AppContext.Provider value={{
      user, allUsers, login, register, logout, 
      balance: currentBalance, isDemo, toggleMode, resetDemoBalance, updateBalance,
      updateProfile, adminUpdateUser, toggleUserBan,
      addWithdrawAccount, removeWithdrawAccount,
      activeGameMode, setActiveGameMode, timeLeft, periodId, gameHistory: histories[activeGameMode] || [], 
      placeBet, myBets, allActiveBets,
      forcedResults, predictedResults, setForcedResult,
      activeNotification, addNotification,
      csMessages, sendCSMessage, markChatAsRead,
      transactions, requestDeposit, requestWithdraw, processTransaction,
      adminQrisImage, setAdminQrisImage,
      marketPrices, marketHistories, tradingPositions, openPosition, closePosition, closeAllPositions
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
