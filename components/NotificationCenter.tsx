import React from 'react';
import { Notification, Theme } from '../types';
import { BellIcon, XIcon, BotIcon, HomeIcon, MessageCircleIcon } from './Icons';
import { formatTime } from '../utils';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    clearNotifications: () => void;
    theme: Theme;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
    isOpen, onClose, notifications, clearNotifications, theme 
}) => {
    const getIcon = (appId: string) => {
        switch(appId) {
            case 'assistant': return <BotIcon className="w-4 h-4" />;
            case 'store': return <HomeIcon className="w-4 h-4" />;
            case 'social': return <MessageCircleIcon className="w-4 h-4" />;
            default: return <BellIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 shadow-2xl transform transition-transform duration-300 z-[2000] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white">Notifications</h2>
                <div className="flex gap-2">
                    {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800">
                            Clear All
                        </button>
                    )}
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)]">
                {notifications.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No new notifications</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 shadow-sm hover:bg-gray-800 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${theme === 'cyan' ? 'bg-cyan-900/50 text-cyan-400' : 'bg-gray-700 text-gray-300'}`}>
                                    {getIcon(notif.appId)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-sm text-gray-200">{notif.title}</h4>
                                        <span className="text-[10px] text-gray-500">{formatTime(notif.timestamp)}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;