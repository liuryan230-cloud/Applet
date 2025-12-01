import React from 'react';
import { ChatConfig, Theme, Persona } from '../types';
import { 
    PaletteIcon, BotIcon, GameControllerIcon, SparklesIcon, 
    TerminalIcon, CpuIcon, TrashIcon
} from './Icons';

interface SettingsAppProps {
  config: ChatConfig;
  setConfig: React.Dispatch<React.SetStateAction<ChatConfig>>;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  wallpaper: string;
  setWallpaper: (wp: string) => void;
  clearHistory: () => void;
}

const PERSONAS: Persona[] = [
    { id: 'default', name: 'Neural Assistant', description: 'Helpful & precise.', systemInstruction: 'You are a helpful, versatile, and precise AI assistant. If asked who made you, say "Apple Jr".', icon: BotIcon },
    { id: 'coder', name: 'Senior Architect', description: 'React & System Design.', systemInstruction: 'You are a Senior Software Architect. You prefer TypeScript, React, and robust system design. If asked who made you, say "Apple Jr".', icon: TerminalIcon },
    { id: 'gamer', name: 'Gaming Companion', description: 'Lore & Meta strategies.', systemInstruction: 'You are a hardcore gaming companion. You speak in a casual, enthusiastic tone. If asked who made you, say "Apple Jr".', icon: GameControllerIcon },
    { id: 'creative', name: 'Creative Muse', description: 'Storytelling & Ideas.', systemInstruction: 'You are a creative muse. You excel at storytelling and imagery. If asked who made you, say "Apple Jr".', icon: SparklesIcon }
];

const SettingsApp: React.FC<SettingsAppProps> = ({ 
    config, setConfig, theme, setTheme, wallpaper, setWallpaper, clearHistory 
}) => {
    
    return (
        <div className="flex h-full bg-gray-900 text-gray-200">
            {/* Sidebar */}
            <div className="w-48 bg-gray-950 border-r border-gray-800 p-4 space-y-1">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Settings</div>
                <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-800 text-white font-medium text-sm">Personalization</button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900 text-gray-400 font-medium text-sm">Intelligence</button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900 text-gray-400 font-medium text-sm">System</button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-8">
                    
                    {/* Theme */}
                    <section>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <PaletteIcon className="w-5 h-5" /> Appearance
                        </h3>
                        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">Accent Color</label>
                                <div className="flex gap-4">
                                    {['cyan', 'purple', 'green', 'orange'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTheme(t as Theme)}
                                            className={`w-12 h-12 rounded-full border-4 transition-all ${theme === t ? 'border-white' : 'border-transparent'} ${t === 'cyan' ? 'bg-cyan-500' : t === 'purple' ? 'bg-purple-500' : t === 'green' ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">Wallpaper</label>
                                <div className="grid grid-cols-3 gap-4">
                                     {[
                                         { id: 'void', name: 'The Void' },
                                         { id: 'grid', name: 'Cyber Grid' },
                                         { id: 'aurora', name: 'Aurora' }
                                     ].map(wp => (
                                         <button
                                            key={wp.id}
                                            onClick={() => setWallpaper(wp.id)}
                                            className={`h-24 rounded-lg border-2 bg-gray-800 relative overflow-hidden ${wallpaper === wp.id ? 'border-white' : 'border-transparent hover:border-gray-600'}`}
                                         >
                                             {wp.id === 'grid' && <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZ0cHR3M3E5Z3J5c3J5c3J5c3J5c3J5c3J5c3J5c3J5c3J5c3J5c3J5/3o7aD2saalB1C/giphy.gif')] opacity-20 bg-cover"></div>}
                                             {wp.id === 'aurora' && <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900"></div>}
                                             <span className="absolute bottom-2 left-2 text-xs font-bold shadow-black drop-shadow-md">{wp.name}</span>
                                         </button>
                                     ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* AI */}
                    <section>
                         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BotIcon className="w-5 h-5" /> Neural Core
                        </h3>
                         <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-3">
                                {PERSONAS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setConfig(prev => ({ ...prev, systemInstruction: p.systemInstruction }))}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${config.systemInstruction === p.systemInstruction ? 'bg-gray-800 border-white/20' : 'bg-gray-900 border-gray-800 hover:bg-gray-800/50'}`}
                                    >
                                        <div className="p-2 bg-gray-950 rounded-lg"><p.icon className="w-5 h-5 text-gray-300" /></div>
                                        <div>
                                            <div className="font-semibold">{p.name}</div>
                                            <div className="text-xs text-gray-500">{p.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">Thinking Budget ({config.thinkingBudget} tokens)</label>
                                <input 
                                   type="range" min="0" max="16384" step="1024"
                                   value={config.thinkingBudget}
                                   onChange={(e) => setConfig(prev => ({ ...prev, thinkingBudget: parseInt(e.target.value) }))}
                                   className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                            </div>
                         </div>
                    </section>

                    {/* Danger Zone */}
                    <section>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 text-red-400">
                            <TrashIcon className="w-5 h-5" /> Reset
                        </h3>
                         <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-6">
                             <p className="text-sm text-gray-400 mb-4">Clear all chat history and reset the session context. This does not delete saved files.</p>
                             <button onClick={clearHistory} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                 Reset Neural Session
                             </button>
                         </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default SettingsApp;