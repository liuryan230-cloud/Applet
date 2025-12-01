

import React, { useState, useEffect } from 'react';
import { Theme } from '../types';
import { GameControllerIcon, ZapIcon } from './Icons';

interface GamePlayerProps {
    url: string;
    theme: Theme;
}

const LOADING_MESSAGES = [
    "Do you know human are human because they are human?",
    "Compiling shaders...",
    "Reticulating splines...",
    "Downloading more RAM...",
    "Asking the AI for permission...",
    "Generating terrain...",
    "Loading funny cat videos...",
    "Optimizing optimization...",
    "Please wait while we calibrate the flux capacitor...",
    "Why is the oven called an oven when you of in the cold food of out hot eat the food?",
    "Ensuring 100% fun...",
    "Establishing neural link...",
];

const GamePlayer: React.FC<GamePlayerProps> = ({ url, theme }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [gameContent, setGameContent] = useState<string>('');
    const [fallbackUrl, setFallbackUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Helper to extract original URL if proxy fails
    const getOriginalUrl = (proxyUrl: string) => {
        if (proxyUrl.includes('proxy?u=')) {
            try {
                const parts = proxyUrl.split('u=');
                if (parts.length > 1) {
                    const base64 = parts[1];
                    // Restore Base64URL to Base64
                    const str = base64.replace(/-/g, '+').replace(/_/g, '/');
                    return atob(str);
                }
            } catch (e) {
                console.error("Failed to decode proxy URL", e);
            }
        }
        return proxyUrl;
    };

    // Load Game Content (Copy Method with Timeout)
    useEffect(() => {
        if (!url) return;
        
        // Timeout controller to abort slow downloads (e.g. large Eaglercraft files)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log("Fetch timed out, switching to fallback stream...");
            controller.abort();
        }, 5000); // 5 seconds max to try and "copy" the game

        const loadGame = async () => {
            setIsLoading(true);
            setError(null);
            setGameContent('');
            setFallbackUrl('');
            setProgress(10);

            try {
                // 1. Fetch the game code (Copying the screen/source)
                // IMPORTANT: credentials: 'include' allows cookies (login sessions) to be sent/received
                const response = await fetch(url, { 
                    credentials: 'include',
                    signal: controller.signal 
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Status: ${response.status}`);
                }
                
                setProgress(50);
                const html = await response.text();
                
                // 2. Prepare the content for injection
                const fixedHtml = html.replace('<head>', '<head><style>body { background-color: black; margin: 0; overflow: hidden; }</style>');
                
                setGameContent(fixedHtml);
                setProgress(100);
            } catch (err: any) {
                // If aborted or failed, we fall back to direct loading
                if (err.name === 'AbortError') {
                    console.log("Fetch aborted (timeout), falling back.");
                } else {
                    console.warn("Direct Source Injection failed. Attempting fallback.", err);
                }
                
                // FALLBACK STRATEGY
                const original = getOriginalUrl(url);
                if (original !== url) {
                    console.log("Falling back to original URL (Direct):", original);
                    setFallbackUrl(original);
                } else {
                    console.log("Falling back to standard iframe load:", url);
                    setFallbackUrl(url);
                }
                
                setProgress(100);
            } finally {
                 setTimeout(() => setIsLoading(false), 500);
            }
        };

        loadGame();

        // Message rotation
        const msgInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);

        // Fake progress for visual feedback
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev; 
                return prev + 1;
            });
        }, 200);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
            clearInterval(msgInterval);
            clearInterval(progressInterval);
        };
    }, [url]);

    const themeColor = {
        cyan: 'bg-cyan-500',
        purple: 'bg-purple-500',
        green: 'bg-emerald-500',
        orange: 'bg-orange-500'
    }[theme];

    if (!url) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center text-gray-500">
                <p>No Game URL Loaded.</p>
            </div>
        );
    }

    if (error) {
        return (
             <div className="w-full h-full bg-black flex flex-col items-center justify-center text-red-500 p-4 text-center">
                <ZapIcon className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold">Load Error</h3>
                <p className="text-sm opacity-70 mt-2">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-800 rounded text-white hover:bg-gray-700">Retry</button>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black relative">
            {isLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white">
                    <div className="relative mb-8">
                        <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${themeColor}`}></div>
                        <GameControllerIcon className="w-20 h-20 text-white relative z-10 animate-bounce" />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">Loading Game Resources...</h2>
                    <div className="h-8 text-sm text-gray-400 font-mono mb-8 text-center px-4 max-w-md animate-pulse">
                        {LOADING_MESSAGES[messageIndex]}
                    </div>

                    <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <div 
                            className={`h-full transition-all duration-200 ease-linear ${themeColor}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="mt-2 text-xs font-mono text-gray-500">{progress}%</div>
                </div>
            )}
            
            <iframe 
                src={!gameContent ? fallbackUrl : undefined}
                srcDoc={gameContent || undefined}
                width="100%"
                height="100%"
                className="w-full h-full border-none block"
                allow="fullscreen; autoplay; clipboard-read; clipboard-write; gyroscope; accelerometer"
                allowFullScreen={true}
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-modals allow-popups allow-presentation allow-orientation-lock"
            />
        </div>
    );
};

export default GamePlayer;