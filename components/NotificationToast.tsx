
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, Trophy } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationToastProps {
  notification: NotificationItem | null;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [notification]);

  if (!notification) return null;

  const getStyles = () => {
    switch (notification.type) {
      case 'win':
        return {
          bg: 'bg-gradient-to-r from-gray-900 to-gray-800',
          icon: <Trophy className="text-yellow-400" size={24} />,
          border: 'border-l-4 border-yellow-400'
        };
      case 'loss':
        return {
          bg: 'bg-white',
          icon: <XCircle className="text-red-500" size={24} />,
          border: 'border-l-4 border-red-500'
        };
      default:
        return {
          bg: 'bg-white',
          icon: <Info className="text-blue-500" size={24} />,
          border: 'border-l-4 border-blue-500'
        };
    }
  };

  const styles = getStyles();
  const isDark = notification.type === 'win';

  return (
    <div 
      className={`fixed top-4 left-4 right-4 z-[100] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
    >
      <div className={`max-w-md mx-auto rounded-lg shadow-2xl overflow-hidden flex ${styles.bg} ${styles.border}`}>
        
        {/* Icon / Ball Section */}
        <div className={`p-3 flex items-center justify-center`}>
            {notification.accentColor ? (
                <div className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center border-2 border-white ${notification.accentColor}`}>
                    {notification.ballNumber && (
                        <span className="text-white font-bold text-lg">{notification.ballNumber}</span>
                    )}
                </div>
            ) : (
                styles.icon
            )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 pl-1">
          <div className="flex justify-between items-start">
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {notification.title}
            </h3>
            <span className={`text-[10px] opacity-70 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>baru saja</span>
          </div>
          <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {notification.message}
          </p>
          {notification.amount && (
             <div className={`mt-1 text-sm font-bold ${notification.type === 'win' ? 'text-green-400' : notification.type === 'loss' ? 'text-red-500' : 'text-blue-600'}`}>
                {notification.amount}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
