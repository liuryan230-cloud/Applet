import React, { useState, useEffect, useRef } from 'react';
import { GAMES_LIST, Game } from '../games';
import { Command, Theme } from '../types';
import { 
    SearchIcon, GameControllerIcon, TerminalIcon, 
    TrashIcon, SettingsIcon, PaletteIcon, ArrowLeftIcon 
} from './Icons';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunchGame: (url: string, useProxy: boolean) => void;
    onClearChat: () => void;
    onOpenSettings: () => void;
    onToggleTheme: () => void;
    theme: Theme;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ 
    isOpen, onClose, onLaunchGame, onClearChat, onOpenSettings, onToggleTheme, theme 
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    // Accent color based on theme
    const accentClass = {
        cyan: 'text-cyan-400 border-cyan-500/30',
        purple: 'text-purple-400 border-purple-500/30',
        green: 'text-emerald-400 border-emerald-500/30',
        orange: 'text-orange-400 border-orange-500/30',
    }[theme];

    // Define System Commands
    const systemCommands: Command[] = [
        {
            id: 'cmd-clear',
            title: 'Clear Chat History',
            icon: TrashIcon,
            action: onClearChat,
            section: 'Actions',
            shortcut: 'Alt+C'
        },
        {
            id: 'cmd-settings',
            title: 'Open Settings',
            icon: SettingsIcon,
            action: onOpenSettings,
            section: 'Actions',
            shortcut: 'Alt+S'
        },
        {
            id: 'cmd-theme',
            title: 'Toggle Theme',
            icon: PaletteIcon,
            action: onToggleTheme,
            section: 'Actions',
        }
    ];

    // Convert Games to Commands
    const gameCommands: Command[] = GAMES_LIST.map(game => ({
        id: `game-${game.id}`,
        title: `Play ${game.name}`,
        icon: GameControllerIcon,
        action: () => onLaunchGame(game.url, !!game.useProxy),
        section: 'Games'
    }));

    const allCommands = [...systemCommands, ...gameCommands];

    const filteredCommands = allCommands.filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10); // Limit to 10 results

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        // Reset selection when query changes
        setSelectedIndex(0);
    }, [query]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredCommands, selectedIndex, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative w-full max-w-2xl bg-[#0d1117] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.1s_ease-out]">
                <div className="flex items-center px-4 py-3 border-b border-gray-800">
                    <SearchIcon className={`w-5 h-5 ${accentClass.split(' ')[0]}`} />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type a command or search for games..."
                        className="flex-1 bg-transparent border-none outline-none text-white px-3 placeholder-gray-500 text-lg"
                        autoComplete="off"
                    />
                    <div className="flex gap-2">
                        <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">ESC</span>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2" ref={resultRef}>
                    {filteredCommands.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No commands found.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredCommands.map((cmd, index) => (
                                <button
                                    key={cmd.id}
                                    onClick={() => {
                                        cmd.action();
                                        onClose();
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all group ${
                                        index === selectedIndex 
                                        ? `bg-gray-800 text-white` 
                                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-md ${index === selectedIndex ? 'bg-gray-700' : 'bg-gray-900 border border-gray-800'}`}>
                                            <cmd.icon className={`w-4 h-4 ${index === selectedIndex ? 'text-white' : 'text-gray-500'}`} />
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm">{cmd.title}</span>
                                            <span className="ml-2 text-[10px] text-gray-500 uppercase tracking-wider bg-gray-900 px-1.5 rounded">{cmd.section}</span>
                                        </div>
                                    </div>
                                    {cmd.shortcut && (
                                        <span className="text-xs text-gray-500 font-mono">{cmd.shortcut}</span>
                                    )}
                                    {index === selectedIndex && (
                                        <ArrowLeftIcon className="w-4 h-4 text-gray-400 rotate-180" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="bg-gray-900/50 border-t border-gray-800 px-4 py-2 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <div className="flex gap-3">
                        <span>↑↓ to navigate</span>
                        <span>↵ to select</span>
                    </div>
                    <span>Neural OS v2.0</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;