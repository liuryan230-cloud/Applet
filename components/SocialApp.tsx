
import React, { useState, useEffect, useRef } from 'react';
import { Theme, SocialMessage, SocialUser } from '../types';
import { 
    SendIcon, UserIcon, HashIcon, AtSignIcon, 
    MessageCircleIcon, UserPlusIcon, SettingsIcon,
    GameControllerIcon, TerminalIcon
} from './Icons';
import { generateId, formatTime } from '../utils';

interface SocialAppProps {
    theme: Theme;
}

const AVATARS = ['👽', '🤖', '👾', '👻', '🤡', '👹', '👺', '💀', '🎃', '😺', '🐶', '🦊', '🦁', '🐯', '🦄', '🐲'];

const CHANNELS = [
    { id: 'global', name: 'Global Chat', icon: HashIcon },
    { id: 'gaming', name: 'Gaming', icon: GameControllerIcon },
    { id: 'tech', name: 'Tech & Code', icon: TerminalIcon },
];

const SocialApp: React.FC<SocialAppProps> = ({ theme }) => {
    const [user, setUser] = useState<SocialUser | null>(null);
    const [activeChannel, setActiveChannel] = useState('global');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<SocialMessage[]>([]);
    const [view, setView] = useState<'chat' | 'profile'>('chat');
    
    // For profile editing
    const [tempUsername, setTempUsername] = useState('');
    const [tempAvatar, setTempAvatar] = useState('👽');

    const channelRef = useRef<BroadcastChannel | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    // Initialize User & Load Messages
    useEffect(() => {
        // Load User
        const savedUser = localStorage.getItem('social_user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            setTempUsername(parsed.username);
            setTempAvatar(parsed.avatar);
        } else {
            setView('profile'); // Force setup
        }

        // Load Messages
        const savedMsgs = localStorage.getItem('social_messages');
        if (savedMsgs) {
            setMessages(JSON.parse(savedMsgs));
        } else {
            // Seed initial messages
            const seed: SocialMessage[] = [
                { id: '1', senderId: 'sys', senderName: 'System', senderAvatar: '🤖', content: 'Welcome to Neural Link! Connect with others on this node.', timestamp: Date.now() - 100000, channel: 'global' },
                { id: '2', senderId: 'bot', senderName: 'NeuralBot', senderAvatar: '👾', content: 'I am always watching...', timestamp: Date.now() - 50000, channel: 'global' },
            ];
            setMessages(seed);
            localStorage.setItem('social_messages', JSON.stringify(seed));
        }

        // Connect to Broadcast Channel
        channelRef.current = new BroadcastChannel('neural_social');
        channelRef.current.onmessage = (event) => {
            const msg: SocialMessage = event.data;
            setMessages(prev => {
                const next = [...prev, msg];
                localStorage.setItem('social_messages', JSON.stringify(next.slice(-100))); // Keep last 100
                return next;
            });
        };

        return () => channelRef.current?.close();
    }, []);

    // Auto-scroll
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeChannel, view]);

    const handleSaveProfile = () => {
        if (!tempUsername.trim()) return;
        const newUser: SocialUser = {
            id: user?.id || generateId(),
            username: tempUsername,
            avatar: tempAvatar,
            status: 'online'
        };
        setUser(newUser);
        localStorage.setItem('social_user', JSON.stringify(newUser));
        setView('chat');
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !user) return;

        const newMsg: SocialMessage = {
            id: generateId(),
            senderId: user.id,
            senderName: user.username,
            senderAvatar: user.avatar,
            content: input,
            timestamp: Date.now(),
            channel: activeChannel
        };

        setMessages(prev => {
            const next = [...prev, newMsg];
            localStorage.setItem('social_messages', JSON.stringify(next.slice(-100)));
            return next;
        });

        // Broadcast to other tabs
        channelRef.current?.postMessage(newMsg);
        setInput('');
    };

    const filteredMessages = messages.filter(m => m.channel === activeChannel);

    const themeColors = {
        cyan: 'text-cyan-400 bg-cyan-500',
        purple: 'text-purple-400 bg-purple-500',
        green: 'text-emerald-400 bg-emerald-500',
        orange: 'text-orange-400 bg-orange-500'
    }[theme];

    const accentText = themeColors.split(' ')[0];
    const accentBg = themeColors.split(' ')[1];

    if (view === 'profile') {
        return (
            <div className="flex flex-col h-full bg-gray-900 items-center justify-center p-6">
                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Setup Profile</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Choose Avatar</label>
                            <div className="grid grid-cols-8 gap-2">
                                {AVATARS.map(av => (
                                    <button
                                        key={av}
                                        onClick={() => setTempAvatar(av)}
                                        className={`text-2xl p-2 rounded-lg transition-colors ${tempAvatar === av ? 'bg-gray-700 ring-2 ring-white/20' : 'hover:bg-gray-700/50'}`}
                                    >
                                        {av}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3">
                                <AtSignIcon className="w-5 h-5 text-gray-500" />
                                <input 
                                    value={tempUsername}
                                    onChange={e => setTempUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="bg-transparent outline-none text-white w-full"
                                    maxLength={15}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveProfile}
                            disabled={!tempUsername.trim()}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${!tempUsername.trim() ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : `${accentBg} hover:opacity-90`}`}
                        >
                            Join Neural Link
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-900 text-gray-200">
            {/* Sidebar Channels */}
            <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-white">
                        <MessageCircleIcon className={`w-5 h-5 ${accentText}`} />
                        Neural Link
                    </div>
                    <button onClick={() => setView('profile')} className="text-gray-500 hover:text-white">
                        <SettingsIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 p-2 space-y-1">
                    <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Channels</div>
                    {CHANNELS.map(ch => (
                        <button
                            key={ch.id}
                            onClick={() => setActiveChannel(ch.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeChannel === ch.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'}`}
                        >
                            <ch.icon className="w-4 h-4" />
                            {ch.name}
                        </button>
                    ))}
                </div>

                {/* User Status */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-xl">
                            {user?.avatar}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="font-bold text-sm truncate text-white">{user?.username}</div>
                        <div className="text-xs text-gray-500">Online</div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-900">
                {/* Header */}
                <div className="h-14 border-b border-gray-800 flex items-center px-6 gap-3 shadow-sm bg-gray-900/95 backdrop-blur z-10">
                    <HashIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-bold text-white">{CHANNELS.find(c => c.id === activeChannel)?.name}</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {filteredMessages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id;
                        const showHeader = idx === 0 || filteredMessages[idx-1].senderId !== msg.senderId || (msg.timestamp - filteredMessages[idx-1].timestamp > 60000);

                        return (
                            <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''} group`}>
                                {showHeader ? (
                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl shrink-0 shadow-sm">
                                        {msg.senderAvatar}
                                    </div>
                                ) : <div className="w-10 shrink-0" />}
                                
                                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    {showHeader && (
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-sm font-bold text-gray-200">{msg.senderName}</span>
                                            <span className="text-[10px] text-gray-500">{formatTime(msg.timestamp)}</span>
                                        </div>
                                    )}
                                    <div className={`px-4 py-2 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                                        isMe 
                                        ? `${accentBg} text-white rounded-tr-none` 
                                        : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={endRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-gray-900 border-t border-gray-800">
                    <form onSubmit={handleSend} className="relative flex items-center gap-3">
                         <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                            <UserPlusIcon className="w-5 h-5" />
                         </button>
                         <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={`Message #${activeChannel}...`}
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gray-600 transition-colors"
                         />
                         <button 
                            type="submit" 
                            disabled={!input.trim()}
                            className={`p-3 rounded-xl transition-all ${input.trim() ? `${accentBg} text-white hover:scale-105 shadow-lg` : 'bg-gray-800 text-gray-600'}`}
                         >
                            <SendIcon className="w-5 h-5" />
                         </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SocialApp;
