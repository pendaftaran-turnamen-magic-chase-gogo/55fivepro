
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, User as UserIcon, Activity, Gift, ShieldAlert, TrendingUp } from 'lucide-react';
import { useApp } from '../store';
import NotificationToast from './NotificationToast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeNotification } = useApp();

  const navItems = [
    { icon: <Home size={24} />, label: 'Home', path: '/' },
    { icon: <Activity size={24} />, label: 'Activity', path: '/activity' },
    { icon: <TrendingUp size={24} />, label: 'Trading', path: '/trading' },
    { icon: <Wallet size={24} />, label: 'Wallet', path: '/wallet' },
    { icon: <UserIcon size={24} />, label: 'Account', path: '/profile' },
  ];

  const showNav = user && !['/login', '/register', '/admin'].includes(location.pathname);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-lg relative flex flex-col">
        {/* Global Notification */}
        <NotificationToast notification={activeNotification} />

        <main className={`flex-1 overflow-y-auto no-scrollbar bg-[#f7f8ff] ${showNav ? 'pb-20' : ''}`}>
          {children}
        </main>

        {/* ADMIN SHORTCUT BUTTON */}
        {isAdmin && (
            <button 
                onClick={() => navigate(location.pathname === '/admin' ? '/' : '/admin')}
                className="fixed bottom-24 right-4 z-[999] w-12 h-12 bg-black text-white rounded-full shadow-2xl border-2 border-white flex items-center justify-center animate-bounce cursor-pointer btn-press"
                title="Switch Admin/User View"
            >
                {location.pathname === '/admin' ? <Home size={20}/> : <ShieldAlert size={24} className="text-red-500"/>}
            </button>
        )}

        {showNav && (
          <div className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-200 flex justify-between items-center px-4 py-2 z-50">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 ${isActive ? 'text-red-500 -translate-y-1' : 'text-gray-400'}`}
                >
                  <div className={`${isActive ? 'animate-pop' : ''}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
