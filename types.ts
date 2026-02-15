
export type Role = 'user' | 'admin' | 'super_admin';

export interface WithdrawAccount {
  id: string;
  type: 'Bank' | 'E-Wallet';
  bankName: string; // e.g., BCA, DANA, OVO
  accountName: string;
  accountNumber: string;
}

export type MarketType = '55Five' | 'PreA';

export interface TradingPosition {
  id: string;
  userId: string;
  market: MarketType; 
  direction: 'Buy' | 'Sell'; // New: Long or Short
  entryPrice: number;
  amount: number; // Rupiah value invested
  leverage: number; // Multiplier like MT5 (e.g. 10x, 50x)
  timestamp: number; // Entry Time
  status: 'Open' | 'Closed';
  closePrice?: number;
  closeTime?: number; // Exit Time
  profit?: number; // Nominal Profit/Loss
}

// Updated for Real Candle Data
export interface TradingDataPoint {
    time: string | number;
    price: number; // Current/Close price
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  username: string; // Unique ID handle
  avatar?: string;
  balance: number; 
  password?: string; // Stored for Admin view simulation
  token: string;
  role: Role;
  isBanned?: boolean;
  savedAccounts?: WithdrawAccount[]; // New: Saved withdraw methods
  device?: string; // Mock device info for CS
  ip?: string; // Mock IP for CS
}

export type GameMode = '30s' | '1Min' | '3Min' | '5Min';

export interface GameResult {
  period: string;
  number: number;
  size: 'Big' | 'Small';
  color: 'Red' | 'Green' | 'Violet' | 'RedViolet' | 'GreenViolet';
}

export interface Bet {
  id: string;
  userId: string;
  username: string; // Snapshot of username at betting time
  period: string;
  gameMode: GameMode;
  select: string;
  amount: number;
  multiplier: number;
  status: 'Pending' | 'Win' | 'Loss';
  winAmount?: number;
  mode: 'Real' | 'Demo';
}

export interface NotificationItem {
  id: string;
  type: 'win' | 'loss' | 'info';
  title: string;
  message: string;
  amount?: string;
  accentColor?: string;
  ballNumber?: string | number;
}

export interface ChatMessage {
  id: string;
  userId: string; // ID of the conversation owner (User ID)
  sender: 'user' | 'admin' | 'system';
  text: string;
  image?: string; // New: Base64 image support
  timestamp: number;
  status: 'sent' | 'delivered' | 'read'; // WhatsApp style status
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  date: string; // ISO String
  method: string;
  proofImage?: string; // Base64 string for deposit proof
  withdrawDetails?: WithdrawAccount; // New
}

export const WIN_GO_TIME = 30;
