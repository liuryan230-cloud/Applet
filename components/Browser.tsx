
import React, { useState, useEffect, useRef } from 'react';
import { generateId, toBase64Url } from '../utils';
import { 
    GlobeIcon, PlusIcon, XIcon, RefreshIcon, 
    ArrowLeftIcon, ArrowRightIcon, SearchIcon, 
    StarIcon, StarFilledIcon, HistoryIcon, CodeIcon
} from './Icons';
import { Theme, Bookmark } from '../types';

interface BrowserProps {
    theme: Theme;
    url?: string; // Passed via windowParams
}

interface Tab {
    id: string;
    url: string;
    title: string;
    isLoading: boolean;
    history: string[];
    historyIndex: number;
}

const Browser: React.FC<BrowserProps> = ({ theme, url: initialUrl }) => {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string>('');
    const [urlInput, setUrlInput] = useState('');
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [showSource, setShowSource] = useState(false);
    const [sourceCode, setSourceCode] = useState('');

    const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});

    // Load Bookmarks
    useEffect(() => {
        const saved = localStorage.getItem('neural_bookmarks');
        if (saved) setBookmarks(JSON.parse(saved));
        
        // Initial Tab
        if (tabs.length === 0) {
             const newTabId = generateId();
             // Normalize initial URL if present
             const startUrl = initialUrl || '';
             
             const newTab: Tab = {
                 id: newTabId,
                 url: startUrl,
                 title: startUrl ? 'Loading...' : 'New Tab',
                 isLoading: !!startUrl,
                 history: startUrl ? [startUrl] : [],
                 historyIndex: 0
             };
             setTabs([newTab]);
             setActiveTabId(newTabId);
             setUrlInput(startUrl);
        }
    }, [initialUrl]); // Add initialUrl dep

    const activeTab = tabs.find(t => t.id === activeTabId);

    // Sync URL Input when Tab Changes
    useEffect(() => {
        if (activeTab) {
            // Strip proxy prefix for display
            let displayUrl = activeTab.url;
            if (displayUrl.includes('/proxy?u=')) {
                try {
                    const params = new URLSearchParams(displayUrl.split('?')[1]);
                    displayUrl = atob(params.get('u') || '');
                } catch(e) {}
            }
            setUrlInput(displayUrl);
        }
    }, [activeTabId, tabs]); 

    // Polling for URL changes inside iframe (Same Origin Proxy Trick)
    useEffect(() => {
        const interval = setInterval(() => {
            if (!activeTabId) return;
            const iframe = iframeRefs.current[activeTabId];
            if (iframe && iframe.contentWindow) {
                try {
                    // Because proxy is same-origin, we can read location!
                    const internalUrl = iframe.contentWindow.location.href;
                    // Only update if it's different and effectively a new page
                    // We need to decode the proxy param to show the real URL
                    if (internalUrl.includes('/proxy?u=')) {
                         const params = new URLSearchParams(internalUrl.split('?')[1]);
                         const realUrl = atob(params.get('u') || '');
                         
                         setTabs(prev => prev.map(t => {
                             if (t.id === activeTabId && t.url !== internalUrl && realUrl) {
                                 // Update tab state silently without triggering reload
                                 // Add to internal history stack if needed? 
                                 // Actually iframe handles its own history, but we want to track it for our UI buttons
                                 return { ...t, url: internalUrl, title: realUrl };
                             }
                             return t;
                         }));
                         
                         // Update input only if not focused? For now, simple sync.
                         if (document.activeElement !== document.querySelector('#browser-input')) {
                             setUrlInput(realUrl);
                         }
                    }
                } catch(e) {
                    // Cross-origin access denied (shouldn't happen with local proxy)
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [activeTabId]);

    const navigate = (tabId: string, url: string) => {
        let finalUrl = url;
        
        // Smart URL handling
        if (!url.startsWith('http') && !url.startsWith('/proxy')) {
             if (url.includes('.') && !url.includes(' ')) {
                 finalUrl = `https://${url}`;
             } else {
                 finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}&udm=14`;
             }
        }

        // Proxy wrapping
        if (finalUrl.startsWith('http')) {
             finalUrl = `/proxy?u=${toBase64Url(finalUrl)}`;
        }

        setTabs(prev => prev.map(t => {
            if (t.id === tabId) {
                const newHistory = [...t.history.slice(0, t.historyIndex + 1), finalUrl];
                return {
                    ...t,
                    url: finalUrl,
                    title: url,
                    isLoading: true,
                    history: newHistory,
                    historyIndex: newHistory.length - 1
                };
            }
            return t;
        }));
    };

    const handleBack = () => {
        if (!activeTab || activeTab.historyIndex <= 0) return;
        const newIndex = activeTab.historyIndex - 1;
        const prevUrl = activeTab.history[newIndex];
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: prevUrl, historyIndex: newIndex, isLoading: true } : t));
    };

    const handleForward = () => {
         if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
         const newIndex = activeTab.historyIndex + 1;
         const nextUrl = activeTab.history[newIndex];
         setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: nextUrl, historyIndex: newIndex, isLoading: true } : t));
    };

    const toggleBookmark = () => {
        if (!activeTab) return;
        const currentUrl = urlInput; // Use the display URL
        const exists = bookmarks.find(b => b.url === currentUrl);
        
        let newBookmarks;
        if (exists) {
            newBookmarks = bookmarks.filter(b => b.url !== currentUrl);
        } else {
            newBookmarks = [...bookmarks, { id: generateId(), title: activeTab.title || 'Bookmark', url: currentUrl }];
        }
        setBookmarks(newBookmarks);
        localStorage.setItem('neural_bookmarks', JSON.stringify(newBookmarks));
    };

    const toggleViewSource = async () => {
        if (!showSource && activeTab?.url) {
            try {
                const res = await fetch(activeTab.url);
                const text = await res.text();
                setSourceCode(text);
            } catch(e) {
                setSourceCode('Error fetching source.');
            }
        }
        setShowSource(!showSource);
    };

    const closeTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newTabs = tabs.filter(t => t.id !== id);
        if (newTabs.length === 0) {
            const newId = generateId();
            setTabs([{ id: newId, url: '', title: 'New Tab', isLoading: false, history: [], historyIndex: -1 }]);
            setActiveTabId(newId);
        } else {
            setTabs(newTabs);
            if (activeTabId === id) setActiveTabId(newTabs[newTabs.length - 1].id);
        }
        delete iframeRefs.current[id];
    };

    const themeColors = {
        cyan: 'bg-cyan-600',
        purple: 'bg-purple-600',
        green: 'bg-emerald-600',
        orange: 'bg-orange-600',
    }[theme];

    return (
        <div className="flex flex-col h-full bg-gray-900">
            {/* Tab Bar */}
            <div className="flex items-center bg-gray-950 px-2 pt-2 gap-1 overflow-x-auto scrollbar-hide shrink-0">
                {tabs.map(tab => (
                    <div 
                        key={tab.id}
                        onClick={() => { setActiveTabId(tab.id); setShowSource(false); }}
                        className={`
                            group relative flex items-center gap-2 px-3 py-2 rounded-t-lg min-w-[120px] max-w-[200px] cursor-pointer transition-colors border-t border-x
                            ${activeTabId === tab.id 
                                ? 'bg-gray-900 border-gray-800 text-white' 
                                : 'bg-gray-950 border-transparent text-gray-500 hover:bg-gray-900/50 hover:text-gray-300'}
                        `}
                    >
                        {tab.isLoading ? (
                            <div className="w-3 h-3 rounded-full border-2 border-gray-500 border-t-white animate-spin"></div>
                        ) : (
                            <GlobeIcon className="w-3 h-3" />
                        )}
                        <span className="text-xs truncate flex-1 font-medium">{tab.title}</span>
                        <button 
                            onClick={(e) => closeTab(e, tab.id)}
                            className={`p-0.5 rounded-full hover:bg-gray-700 opacity-0 group-hover:opacity-100 ${activeTabId === tab.id ? 'opacity-100' : ''}`}
                        >
                            <XIcon className="w-3 h-3" />
                        </button>
                        {activeTabId === tab.id && <div className={`absolute top-0 left-0 right-0 h-0.5 ${themeColors}`}></div>}
                    </div>
                ))}
                <button 
                    onClick={() => {
                        const id = generateId();
                        setTabs([...tabs, { id, url: '', title: 'New Tab', isLoading: false, history: [], historyIndex: -1 }]);
                        setActiveTabId(id);
                    }}
                    className="p-2 text-gray-400 hover:text-white"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation Bar */}
            <div className="bg-gray-900 border-b border-gray-800 p-2 flex flex-col gap-2 shrink-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <button onClick={handleBack} disabled={!activeTab || activeTab.historyIndex <= 0} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 disabled:opacity-30"><ArrowLeftIcon className="w-4 h-4" /></button>
                        <button onClick={handleForward} disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 disabled:opacity-30"><ArrowRightIcon className="w-4 h-4" /></button>
                        <button onClick={() => activeTab && navigate(activeTabId, urlInput)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"><RefreshIcon className="w-4 h-4" /></button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); navigate(activeTabId, urlInput); }} className="flex-1 relative">
                        <input 
                            id="browser-input"
                            className="w-full bg-gray-950 border border-gray-700 rounded-full py-1.5 pl-4 pr-10 text-sm text-gray-200 focus:outline-none focus:border-gray-500 font-mono"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="Enter URL or Search..."
                        />
                        <button 
                            type="button" 
                            onClick={toggleBookmark}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400"
                        >
                            {bookmarks.some(b => b.url === urlInput) ? <StarFilledIcon className="w-4 h-4 text-yellow-400" /> : <StarIcon className="w-4 h-4" />}
                        </button>
                    </form>

                    <button 
                        onClick={toggleViewSource} 
                        className={`p-2 rounded-lg hover:bg-gray-800 ${showSource ? 'text-green-400 bg-gray-800' : 'text-gray-400'}`}
                        title="View Source (DevTools)"
                    >
                        <CodeIcon className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Bookmarks Bar */}
                {bookmarks.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1">
                        {bookmarks.map(b => (
                            <button 
                                key={b.id}
                                onClick={() => navigate(activeTabId, b.url)}
                                className="flex items-center gap-1 bg-gray-800/50 hover:bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 whitespace-nowrap"
                            >
                                <GlobeIcon className="w-3 h-3" />
                                {b.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Viewport */}
            <div className="flex-1 relative bg-white">
                {showSource ? (
                    <div className="absolute inset-0 bg-[#1e1e1e] text-gray-300 font-mono text-xs overflow-auto p-4">
                        <pre>{sourceCode}</pre>
                    </div>
                ) : (
                    tabs.map(tab => (
                        <div 
                            key={tab.id} 
                            className="absolute inset-0 w-full h-full"
                            style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
                        >
                            {tab.url ? (
                                <iframe 
                                    ref={el => { iframeRefs.current[tab.id] = el; }}
                                    src={tab.url}
                                    className="w-full h-full border-0"
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups allow-modals allow-presentation"
                                    onLoad={() => setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, isLoading: false } : t))}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-gray-400">
                                    <GlobeIcon className="w-24 h-24 mb-6 opacity-10" />
                                    <h3 className="text-2xl font-thin text-white mb-2">Neural Browser</h3>
                                    <p className="text-sm opacity-50">Secure • Fast • Proxied</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Browser;
