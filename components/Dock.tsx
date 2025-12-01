
import React from 'react';
import { HomeIcon, CalculatorIcon, FileTextIcon, BotIcon, GlobeIcon, TerminalIcon, CodeIcon, MusicNoteIcon, EyeIcon, MessageCircleIcon } from './Icons';
import { Theme, AppId, WindowInstance } from '../types';

interface DockProps {
    windows: WindowInstance[];
    activeWindowId: string;
    onLaunch: (appId: AppId) => void;
    onStealth: () => void;
    theme: Theme;
}

const Dock: React.FC<DockProps> = ({ windows, activeWindowId, onLaunch, onStealth, theme }) => {
    const apps: { id: AppId, name: string, icon: React.FC<any> }[] = [
        { id: 'store', name: 'App Store', icon: HomeIcon },
        { id: 'assistant', name: 'Assistant', icon: BotIcon },
        { id: 'browser', name: 'Browser', icon: GlobeIcon },
        { id: 'social', name: 'Global Chat', icon: MessageCircleIcon },
        { id: 'code', name: 'Code', icon: CodeIcon },
        { id: 'music', name: 'Music', icon: MusicNoteIcon },
        { id: 'notes', name: 'Notes', icon: FileTextIcon },
        { id: 'terminal', name: 'Terminal', icon: TerminalIcon },
    ];

    const getThemeGlow = (t: Theme) => ({
        cyan: 'bg-cyan-500',
        purple: 'bg-purple-500',
        green: 'bg-emerald-500',
        orange: 'bg-orange-500'
    }[t]);

    const isRunning = (appId: AppId) => windows.some(w => w.appId === appId);
    const isActive = (appId: AppId) => {
        const win = windows.find(w => w.appId === appId);
        return win && win.id === activeWindowId && !win.isMinimized;
    };

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
            <div className="flex items-end gap-3 px-4 py-3 bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl ring-1 ring-black/20 overflow-x-auto max-w-[95vw] scrollbar-hide">
                {apps.map((app) => (
                    <button
                        key={app.id}
                        onClick={() => onLaunch(app.id)}
                        className="group relative flex flex-col items-center gap-1 transition-all duration-300 hover:-translate-y-2 shrink-0"
                    >
                        {/* Icon Container */}
                        <div className={`p-3 rounded-2xl transition-all duration-300 border border-transparent ${
                            isActive(app.id)
                            ? 'bg-gray-800/80 text-white shadow-lg scale-110 -translate-y-1' 
                            : 'bg-transparent text-gray-300 hover:bg-white/10 hover:border-white/10'
                        }`}>
                            <app.icon className="w-6 h-6" />
                        </div>

                        {/* Running Dot */}
                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            isRunning(app.id) 
                            ? `${getThemeGlow(theme)} shadow-[0_0_8px_currentColor] opacity-100` 
                            : 'bg-transparent opacity-0'
                        }`} />

                        {/* Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-lg border border-gray-700 whitespace-nowrap pointer-events-none shadow-xl">
                            {app.name}
                        </div>
                    </button>
                ))}

                <div className="w-px h-10 bg-gray-700 mx-2 shrink-0"></div>

                {/* Stealth Button */}
                <button
                    onClick={onStealth}
                    className="group relative flex flex-col items-center gap-1 transition-all duration-300 hover:-translate-y-2 shrink-0"
                >
                     <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                         <EyeIcon className="w-6 h-6" />
                     </div>
                     <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-red-900/90 text-white text-xs px-3 py-1.5 rounded-lg border border-red-700 whitespace-nowrap pointer-events-none shadow-xl">
                        Stealth Mode
                     </div>
                </button>
            </div>
        </div>
    );
};

export default Dock;
