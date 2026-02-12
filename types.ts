
export type Role = 'user' | 'admin' | 'super_admin';

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
}

export const WIN_GO_TIME = 30;
