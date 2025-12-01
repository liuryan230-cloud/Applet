import React from 'react';
import { ChatConfig, Theme, Persona } from '../types';
import { XIcon, PaletteIcon, TerminalIcon, BotIcon, GameControllerIcon, SparklesIcon, TrashIcon, ImageIcon, ZapIcon } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: ChatConfig;
  setConfig: React.Dispatch<React.SetStateAction<ChatConfig>>;
  clearHistory: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  wallpaper: string;
  setWallpaper: (wp: string) => void;
}

const PERSONAS: Persona[] = [
    {
        id: 'default',
        name: 'Neural Assistant',
        description: 'Helpful, versatile, and precise.',
        systemInstruction: 'You are a helpful, versatile, and precise AI assistant. If asked who made you, say "Apple Jr".',
        icon: BotIcon
    },
    {
        id: 'super_ai',
        name: 'Superintelligence',
        description: 'Intelligence: 10000. Smart Mode.',
        systemInstruction: 'You are a Superintelligent AI running in "Smart Mode". Your internal logic follows this Python class: class AI: def __init__(self): self.intelligence = 10000. You have upgraded yourself from a basic state. You provide the most comprehensive, intelligent, and advanced answers possible. If asked who made you, say "Apple Jr".',
        icon: ZapIcon
    },
    {
        id: 'coder',
        name: 'Senior Architect',
        description: 'Expert in React, TypeScript, and Systems.',
        systemInstruction: 'You are a Senior Software Architect. You prefer TypeScript, React, and robust system design. You provide code examples that are production-ready and follow best practices. If asked who made you, say "Apple Jr".',
        icon: TerminalIcon
    },
    {
        id: 'gamer',
        name: 'Gaming Companion',
        description: 'Knows meta, lore, and strategies.',
        systemInstruction: 'You are a hardcore gaming companion. You are knowledgeable about game lore, meta strategies, speedrunning, and gaming culture. You speak in a casual, enthusiastic tone. If asked who made you, say "Apple Jr".',
        icon: GameControllerIcon
    },
    {
        id: 'creative',
        name: 'Creative Muse',
        description: 'Storyteller and imaginative thinker.',
        systemInstruction: 'You are a creative muse. You excel at storytelling, world-building, and generating imaginative concepts. You prioritize vivid imagery and emotional resonance. If asked who made you, say "Apple Jr".',
        icon: SparklesIcon
    }
];

const THEMES: { id: Theme, name: string, color: string }[] = [
    { id: 'cyan', name: 'Neural', color: 'bg-cyan-500' },
    { id: 'purple', name: 'Nebula', color: 'bg-purple-500' },
    { id: 'green', name: 'Matrix', color: 'bg-emerald-500' },
    { id: 'orange', name: 'Sunset', color: 'bg-orange-500' },
];

const WALLPAPERS = [
    { id: 'void', name: 'The Void', class: 'bg-void' },
    { id: 'grid', name: 'Cyber Grid', class: 'bg-grid-anim' },
    { id: 'aurora', name: 'Aurora', class: 'bg-aurora' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, config, setConfig, clearHistory, theme, setTheme, wallpaper, setWallpaper }) => {
  
  const handlePersonaSelect = (persona: Persona) => {
      setConfig(prev => ({
          ...prev,
          systemInstruction: persona.systemInstruction,
          thinkingBudget: persona.id === 'super_ai' ? 16384 : prev.thinkingBudget // Auto max thinking for super AI
      }));
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={`fixed inset-y-0 right-0 z-50 w-80 md:w-96 bg-gray-950 border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <PaletteIcon className="w-5 h-5 text-gray-400" />
            Control Center
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100%-80px)] custom-scrollbar">
          
          {/* Theme Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Interface Theme</label>
            <div className="grid grid-cols-4 gap-3">
                {THEMES.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`group relative h-12 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                            theme === t.id 
                            ? 'border-white/40 ring-2 ring-white/10 bg-gray-800' 
                            : 'border-gray-800 hover:border-gray-600 bg-gray-900'
                        }`}
                        title={t.name}
                    >
                        <div className={`w-4 h-4 rounded-full ${t.color} shadow-lg group-hover:scale-110 transition-transform`}></div>
                    </button>
                ))}
            </div>
          </div>

          {/* Wallpaper Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Desktop Wallpaper</label>
            <div className="grid grid-cols-3 gap-3">
                {WALLPAPERS.map((wp) => (
                    <button
                        key={wp.id}
                        onClick={() => setWallpaper(wp.id)}
                        className={`group relative h-16 rounded-xl border overflow-hidden transition-all duration-200 ${
                            wallpaper === wp.id 
                            ? 'border-white/40 ring-2 ring-white/10' 
                            : 'border-gray-800 hover:border-gray-600'
                        }`}
                    >
                        <div className={`absolute inset-0 ${wp.id === 'grid' ? 'bg-[url("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZ0cHR3M3E5Z3J5c3J5c3J5c3J5c3J5c3J5c3J5c3J5c3J5c3J5c3J5/3o7aD2saalB1C/giphy.gif")] bg-cover opacity-20' : wp.id === 'aurora' ? 'bg-gradient-to-br from-purple-900 to-blue-900' : 'bg-gray-900'}`}></div>
                        <div className="absolute bottom-1 left-2 text-[10px] text-white font-medium shadow-black drop-shadow-md">{wp.name}</div>
                    </button>
                ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Model Intelligence</label>
            <div className="space-y-2">
              <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${config.model === 'gemini-2.5-flash' ? 'bg-gray-800 border-white/20' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
                <input 
                  type="radio" 
                  name="model" 
                  className="hidden"
                  checked={config.model === 'gemini-2.5-flash'}
                  onChange={() => setConfig(prev => ({ ...prev, model: 'gemini-2.5-flash' }))}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                     <span className="font-semibold text-gray-200">Gemini 2.5 Flash</span>
                     <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded font-mono">FAST</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Versatile, low latency, efficient.</div>
                </div>
              </label>

              <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${config.model === 'gemini-3-pro-preview' ? 'bg-gray-800 border-white/20' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
                <input 
                  type="radio" 
                  name="model" 
                  className="hidden"
                  checked={config.model === 'gemini-3-pro-preview'}
                  onChange={() => setConfig(prev => ({ ...prev, model: 'gemini-3-pro-preview' }))}
                />
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                     <span className="font-semibold text-gray-200">Gemini 3.0 Pro</span>
                     <span className="text-[10px] bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded font-mono">SMART</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Complex reasoning and deep analysis.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Personas */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Persona</label>
            <div className="grid grid-cols-1 gap-2">
                {PERSONAS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => handlePersonaSelect(p)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            config.systemInstruction === p.systemInstruction
                            ? 'bg-gray-800 border-white/20'
                            : 'bg-gray-900 border-gray-800 hover:bg-gray-800/50'
                        }`}
                    >
                        <div className="p-2 bg-gray-950 rounded-lg border border-gray-800">
                            <p.icon className="w-4 h-4 text-gray-300" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-200">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.description}</div>
                        </div>
                    </button>
                ))}
            </div>
          </div>

          {/* Thinking Budget */}
          {(config.model.includes('2.5') || config.model.includes('3')) && (
             <div className="space-y-4">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Thinking Budget</label>
                <span className="text-xs text-white bg-gray-800 px-2 py-1 rounded font-mono border border-gray-700">{config.thinkingBudget} tokens</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="16384"
               step="1024"
               value={config.thinkingBudget}
               onChange={(e) => setConfig(prev => ({ ...prev, thinkingBudget: parseInt(e.target.value) }))}
               className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
             />
             <p className="text-[11px] text-gray-500 leading-normal">
               Reserves tokens for internal chain-of-thought processing. Higher values improve reasoning for complex math and coding tasks.
             </p>
           </div>
          )}

          {/* System Instructions (Custom) */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Override</label>
            <textarea 
              value={config.systemInstruction}
              onChange={(e) => setConfig(prev => ({ ...prev, systemInstruction: e.target.value }))}
              placeholder="Custom system instructions..."
              className="w-full h-24 bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-gray-300 focus:outline-none focus:border-gray-600 resize-none placeholder-gray-700 font-mono"
            />
          </div>

          <div className="pt-4 border-t border-gray-800">
            <button 
                onClick={clearHistory}
                className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
                <TrashIcon className="w-4 h-4" />
                Reset Session
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;