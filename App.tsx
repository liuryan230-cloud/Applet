
import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatConfig, Theme, WindowInstance, AppId, VirtualFile, Notification } from './types';
import { generateId, toBase64Url } from './utils';
import { streamChatResponse } from './services/geminiService';
import { getFileSystem, saveFileSystem, createFolder } from './services/fileSystem';

import MessageBubble from './components/MessageBubble';
import SettingsApp from './components/SettingsApp';
import CommandPalette from './components/CommandPalette';
import Dock from './components/Dock';
import Library from './components/Library';
import { Calculator, Notepad } from './components/Tools';
import LockScreen from './components/LockScreen';
import Browser from './components/Browser';
import Desktop from './components/Desktop';
import Terminal from './components/Terminal';
import FileExplorer from './components/FileExplorer';
import TaskManager from './components/TaskManager';
import ContextMenu from './components/ContextMenu';
import MusicPlayer from './components/MusicPlayer';
import CodeEditor from './components/CodeEditor';
import QuickSettings from './components/QuickSettings';
import SocialApp from './components/SocialApp';
import Wallpaper from './components/Wallpaper';
import NotificationCenter from './components/NotificationCenter';
import GamePlayer from './components/GamePlayer';

import { GAMES_LIST } from './games';
import { 
    SendIcon, BotIcon, BellIcon, WifiIcon, BatteryIcon
} from './components/Icons';

// --- CONSTANTS ---
const getThemeClasses = (theme: Theme) => ({
      cyan: { primary: 'from-cyan-500 to-blue-600', text: 'text-cyan-400', border: 'border-cyan-500/30' },
      purple: { primary: 'from-purple-500 to-pink-600', text: 'text-purple-400', border: 'border-purple-500/30' },
      green: { primary: 'from-emerald-500 to-lime-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      orange: { primary: 'from-orange-500 to-red-600', text: 'text-orange-400', border: 'border-orange-500/30' },
}[theme]);

// Updated AppWindow to pass windowParams (contentProps) down to children
const AppWindow: React.FC<{ appId: AppId; className?: string; children: React.ReactNode; windowParams?: any; [key: string]: any }> = ({ appId, className, children, windowParams, ...props }) => {
    return (
        <div className={className} {...props}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    // Inject windowParams as props to the child component
                    return React.cloneElement(child, { ...windowParams } as any);
                }
                return child;
            })}
        </div>
    );
};

// --- CHAT COMPONENT ---
const ChatView: React.FC<any> = (props) => {
    const { messages, theme, input, setInput, handleSendMessage, isStreaming, messagesEndRef } = props;
    useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
    
    return (
        <div className="flex flex-col h-full w-full bg-gray-900/50">
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {messages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <BotIcon className="w-16 h-16 mb-4 text-gray-600" />
                        <h2 className="text-2xl font-bold text-white">Neural Assistant</h2>
                        <p className="text-gray-400">Ready to assist.</p>
                     </div>
                ) : (
                    messages.map((msg: any) => <MessageBubble key={msg.id} message={msg} theme={theme} />)
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-800 bg-gray-950">
                 <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-2">
                     <input 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Message Neural AI..."
                        className="flex-1 bg-transparent outline-none text-white px-2"
                     />
                     <button onClick={handleSendMessage} disabled={isStreaming} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-white">
                        <SendIcon className="w-4 h-4" />
                     </button>
                 </div>
            </div>
        </div>
    );
};

// --- APP ---
const App: React.FC = () => {
  // --- STATE ---
  const [isLocked, setIsLocked] = useState(true);
  const [bootSequence, setBootSequence] = useState(true); 
  const [theme, setTheme] = useState<Theme>('cyan');
  const [wallpaper, setWallpaper] = useState('grid'); // Default to grid matrix
  
  // File System State
  const [fs, setFs] = useState<VirtualFile[]>([]);
  
  // Window Manager State
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string>('');
  const [zCounter, setZCounter] = useState(10);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [config, setConfig] = useState<ChatConfig>({ model: 'gemini-2.5-flash', temperature: 1, thinkingBudget: 0, systemInstruction: 'You are a helpful AI assistant. If asked who made you, say "Apple Jr".' });
  
  // Persistence
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  
  // UI
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<{id: string, text: string}[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    setTimeout(() => setBootSequence(false), 2000);

    const savedConfig = localStorage.getItem('chatConfig');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    const savedFavs = localStorage.getItem('favorites');
    if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)));
    const savedRecent = localStorage.getItem('recentlyPlayed');
    if (savedRecent) setRecentlyPlayed(JSON.parse(savedRecent));
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme as Theme);
    const savedWP = localStorage.getItem('wallpaper');
    if (savedWP) setWallpaper(savedWP);
    
    setFs(getFileSystem());
    
    // Welcome Notification
    setTimeout(() => {
        addNotification('System', 'Welcome to Neural OS v8.0', 'assistant');
    }, 3000);
  }, []);

  useEffect(() => { localStorage.setItem('chatConfig', JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem('favorites', JSON.stringify(Array.from(favorites))); }, [favorites]);
  useEffect(() => { localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed)); }, [recentlyPlayed]);
  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('wallpaper', wallpaper); }, [wallpaper]);
  useEffect(() => { saveFileSystem(fs); }, [fs]);

  useEffect(() => {
    const handleKD = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen(p => !p);
        }
    };
    window.addEventListener('keydown', handleKD);
    return () => window.removeEventListener('keydown', handleKD);
  }, []);

  // --- ACTIONS ---
  const addToast = (text: string) => {
      const id = generateId();
      setToasts(p => [...p, { id, text }]);
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const addNotification = (title: string, message: string, appId: AppId) => {
      setNotifications(prev => [{
          id: generateId(), title, message, appId, timestamp: Date.now(), read: false
      }, ...prev]);
      addToast(title);
  };

  const launchApp = (appId: AppId, contentProps?: any) => {
      const existing = windows.find(w => w.appId === appId && appId !== 'game'); // Allow multiple game windows
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      
      if (existing && appId !== 'browser' && appId !== 'code' && appId !== 'game') { 
          if (existing.isMinimized) {
              setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, isMinimized: false, zIndex: zCounter + 1 } : w));
              setActiveWindowId(existing.id);
              setZCounter(c => c + 1);
          } else {
              setActiveWindowId(existing.id);
              setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, zIndex: zCounter + 1 } : w));
              setZCounter(c => c + 1);
          }
          if(contentProps) {
              setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, contentProps } : w));
          }
      } else {
          const id = generateId();
          const newWindow: WindowInstance = {
              id,
              appId,
              title: contentProps?.title || getAppTitle(appId),
              isMinimized: false,
              // Force maximize on mobile for better experience
              isMaximized: isMobile || appId === 'browser' || appId === 'store' || appId === 'files' || appId === 'code' || appId === 'social' || appId === 'game',
              position: { x: 50 + (windows.length * 30), y: 50 + (windows.length * 30) },
              size: { width: isMobile ? window.innerWidth : 900, height: isMobile ? window.innerHeight : 650 },
              zIndex: zCounter + 1,
              contentProps
          };
          setWindows(prev => [...prev, newWindow]);
          setActiveWindowId(id);
          setZCounter(c => c + 1);
      }
  };

  const getAppTitle = (id: AppId) => {
      switch(id) {
          case 'store': return 'App Store';
          case 'assistant': return 'Neural Assistant';
          case 'browser': return 'Web Browser';
          case 'calculator': return 'Calculator';
          case 'notes': return 'Notes';
          case 'terminal': return 'Terminal';
          case 'settings': return 'System Settings';
          case 'files': return 'File Explorer';
          case 'taskmanager': return 'Task Manager';
          case 'music': return 'Sonic Player';
          case 'code': return 'Neural Code';
          case 'social': return 'Neural Link';
          case 'game': return 'Game Player';
          default: return 'Application';
      }
  };

  const handleWindowAction = (action: string, id: string, payload?: any) => {
      setWindows(prev => {
          return prev.map(w => {
              if (w.id !== id) return w;
              switch(action) {
                  case 'focus': 
                      setActiveWindowId(id);
                      return { ...w, zIndex: zCounter + 1 };
                  case 'close': return null as any; 
                  case 'minimize': return { ...w, isMinimized: true };
                  case 'maximize': return { ...w, isMaximized: !w.isMaximized };
                  case 'move': return { ...w, position: payload };
                  case 'resize': return { ...w, size: payload };
                  default: return w;
              }
          }).filter(Boolean);
      });
      if (action === 'focus') setZCounter(c => c + 1);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Message = { id: generateId(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setIsStreaming(true);
    const botId = generateId();
    setMessages(p => [...p, { id: botId, role: 'model', content: '', timestamp: Date.now(), isThinking: true }]);
    try {
        const stream = streamChatResponse(messages, userMsg.content, [], config);
        let text = '';
        for await (const chunk of stream) {
            text += chunk;
            setMessages(p => p.map(m => m.id === botId ? { ...m, content: text, isThinking: false } : m));
        }
    } catch (e) {
        setMessages(p => p.map(m => m.id === botId ? { ...m, error: true, content: 'Error.' } : m));
    } finally {
        setIsStreaming(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setFavorites(prev => {
          const next = new Set(prev);
          if (next.has(id)) { next.delete(id); addToast('Removed from Favorites'); } 
          else { next.add(id); addToast('Added to Favorites'); }
          return next;
      });
  };

  const handleLaunchGame = (url: string, useProxy: boolean, name: string) => {
      const target = useProxy ? `/proxy?u=${toBase64Url(url)}` : url;
      // Launch as separate game window, NOT browser
      launchApp('game', { url: target, title: name });
      const game = GAMES_LIST.find(g => g.url === url);
      if (game) {
          setRecentlyPlayed(prev => [game.id, ...prev.filter(id => id !== game.id)].slice(0, 5));
      }
  };
  
  const handleOpenFile = (file: VirtualFile) => {
      if (file.type === 'folder') {
          launchApp('files'); 
      } else {
          launchApp('notes', { fileId: file.id, initialContent: file.content });
      }
  };
  
  const desktopFiles = fs.filter(f => f.parentId === 'desktop');
  
  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleStealth = () => {
      // Minimize all windows
      setWindows(prev => prev.map(w => ({ ...w, isMinimized: true })));
      // Open a harmless browser tab
      launchApp('browser', { url: 'https://en.wikipedia.org/wiki/Homework' });
  };

  // --- RENDER ---
  if (bootSequence) {
      return (
          <div className="h-screen w-screen bg-black text-green-500 font-mono p-10 flex flex-col justify-end pb-20">
              <div className="space-y-1">
                  <div>[ OK ] Mounted Root Filesystem</div>
                  <div>[ OK ] Started Neural Core Services</div>
                  <div>[ OK ] Initialized Graphics Engine (Vulkan)</div>
                  <div>[ OK ] Loaded User Profile (Apple Jr)</div>
                  <div className="animate-pulse">_</div>
              </div>
          </div>
      );
  }

  if (isLocked) {
      return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div 
        className={`h-screen w-screen text-gray-100 font-sans overflow-hidden flex flex-col relative selection:bg-${theme}-500/30 bg-gray-950`} 
        onContextMenu={handleContextMenu}
        onClick={() => { setContextMenu(null); setShowQuickSettings(false); setShowNotificationCenter(false); }}
    >
        {/* Wallpaper Layer */}
        <Wallpaper type={wallpaper} />

        {/* Top Status Bar */}
        <div className="absolute top-4 right-4 z-[900] flex gap-2">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowNotificationCenter(!showNotificationCenter); }}
                className="flex items-center gap-2 bg-gray-900/60 backdrop-blur border border-gray-700 rounded-full px-3 py-1.5 hover:bg-gray-800 transition-colors"
            >
                <WifiIcon className="w-3 h-3 text-white" />
                <BatteryIcon className="w-3 h-3 text-white" />
                <span className="text-xs font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {notifications.some(n => !n.read) && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
            </button>
        </div>

        {/* Overlays */}
        {showQuickSettings && <QuickSettings theme={theme} onClose={() => setShowQuickSettings(false)} />}
        <NotificationCenter 
            isOpen={showNotificationCenter} 
            onClose={() => setShowNotificationCenter(false)} 
            notifications={notifications}
            clearNotifications={() => setNotifications([])}
            theme={theme}
        />

        {/* Toasts */}
        <div className="fixed top-14 right-6 z-[2000] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg shadow-xl animate-[slideInRight_0.3s_ease-out] flex items-center gap-2">
                    <BellIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs">{t.text}</span>
                </div>
            ))}
        </div>

        {/* Desktop */}
        <Desktop 
            windows={windows} 
            activeWindowId={activeWindowId} 
            onLaunch={launchApp} 
            onWindowAction={handleWindowAction}
            theme={theme}
            desktopFiles={desktopFiles}
            onOpenFile={handleOpenFile}
        >
            <AppWindow appId="store" className="h-full bg-gray-950">
                 <Library 
                    theme={theme}
                    onLaunchGame={handleLaunchGame}
                    onProxySubmit={(url) => handleLaunchGame(url, true, 'Web Proxy')}
                    onGoogleSubmit={(q) => launchApp('browser', { url: `https://google.com/search?q=${q}&udm=14` })}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    recentlyPlayed={recentlyPlayed}
                />
            </AppWindow>

            <AppWindow appId="assistant" className="h-full">
                <ChatView 
                    messages={messages} theme={theme} input={input} setInput={setInput} 
                    handleSendMessage={handleSendMessage} isStreaming={isStreaming} messagesEndRef={messagesEndRef}
                />
            </AppWindow>

            <AppWindow appId="calculator" className="h-full">
                <Calculator theme={theme} />
            </AppWindow>

            <AppWindow appId="notes" className="h-full bg-gray-950">
                <Notepad theme={theme} />
            </AppWindow>

            <AppWindow appId="browser" className="h-full">
                <Browser theme={theme} />
            </AppWindow>

            <AppWindow appId="terminal" className="h-full">
                <Terminal theme={theme} onClose={() => { const w = windows.find(x => x.appId === 'terminal'); if(w) handleWindowAction('close', w.id); }} />
            </AppWindow>
            
            <AppWindow appId="files" className="h-full">
                <FileExplorer theme={theme} fs={fs} setFs={setFs} onOpenFile={handleOpenFile} />
            </AppWindow>
            
            <AppWindow appId="settings" className="h-full">
                <SettingsApp 
                    config={config} setConfig={setConfig} 
                    theme={theme} setTheme={setTheme} 
                    wallpaper={wallpaper} setWallpaper={setWallpaper}
                    clearHistory={() => setMessages([])}
                />
            </AppWindow>
            
            <AppWindow appId="taskmanager" className="h-full">
                <TaskManager windows={windows} theme={theme} onKill={(id) => handleWindowAction('close', id)} />
            </AppWindow>
            
            <AppWindow appId="music" className="h-full">
                <MusicPlayer theme={theme} />
            </AppWindow>
            
            <AppWindow appId="code" className="h-full">
                <CodeEditor theme={theme} />
            </AppWindow>

            <AppWindow appId="social" className="h-full">
                <SocialApp theme={theme} />
            </AppWindow>

            {/* Dedicated Game Player Window */}
            <AppWindow appId="game" className="h-full">
                <GamePlayer theme={theme} url="" /> {/* Props injected automatically by AppWindow */}
            </AppWindow>
        </Desktop>

        {/* Dock */}
        <Dock 
            windows={windows} activeWindowId={activeWindowId} onLaunch={launchApp} onStealth={handleStealth} theme={theme} 
        />

        {/* Context Menu */}
        {contextMenu && (
            <ContextMenu 
                x={contextMenu.x} 
                y={contextMenu.y} 
                onClose={() => setContextMenu(null)}
                onRefresh={() => window.location.reload()}
                onCreateFolder={() => setFs(p => createFolder(p, 'New Folder', 'desktop'))}
                onChangeWallpaper={() => setWallpaper(w => w === 'void' ? 'grid' : w === 'grid' ? 'aurora' : 'void')}
                onOpenSettings={() => launchApp('settings')}
            />
        )}

        <CommandPalette 
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onLaunchGame={(url, useProxy) => handleLaunchGame(url, useProxy, 'Game')}
            onClearChat={() => setMessages([])}
            onOpenSettings={() => launchApp('settings')}
            onToggleTheme={() => setTheme(t => t === 'cyan' ? 'purple' : t === 'purple' ? 'green' : t === 'green' ? 'orange' : 'cyan')}
            theme={theme}
        />
    </div>
  );
};

export default App;
