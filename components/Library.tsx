
import React, { useState, useEffect } from 'react';
import { Game, GAMES_LIST, GameCategory } from '../games';
import { Theme } from '../types';
import { 
    SearchIcon, StarFilledIcon, StarIcon, TargetIcon, 
    CarIcon, UsersIcon, PuzzleIcon, ZapIcon, ArrowLeftIcon, 
    GlobeIcon, ClockIcon 
} from './Icons';
import { FocusTimer } from './Tools';

interface LibraryProps {
    theme: Theme;
    onLaunchGame: (url: string, useProxy: boolean, name: string) => void;
    onProxySubmit: (url: string) => void;
    onGoogleSubmit: (query: string) => void;
    favorites: Set<string>;
    toggleFavorite: (e: React.MouseEvent, id: string) => void;
    recentlyPlayed: string[];
}

const WidgetClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ClockIcon className="w-24 h-24" />
            </div>
            <div>
                <div className="text-gray-400 font-medium text-sm uppercase tracking-wider">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                <div className="text-5xl font-bold text-white mt-1 tracking-tight">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="flex gap-2 mt-4">
                <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                </div>
            </div>
        </div>
    );
};

const SystemStatus = ({ theme }: { theme: Theme }) => {
    const colorClass = {
        cyan: 'bg-cyan-500',
        purple: 'bg-purple-500',
        green: 'bg-emerald-500',
        orange: 'bg-orange-500'
    }[theme];

    return (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-medium">Neural Link</span>
                <span className="text-white font-mono text-sm">24ms</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full ${colorClass} w-[85%] animate-pulse`}></div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400 text-sm font-medium">Memory</span>
                <span className="text-white font-mono text-sm">12.4 GB</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full ${colorClass} w-[42%]`}></div>
            </div>
        </div>
    );
};

const Library: React.FC<LibraryProps> = ({ 
    theme, onLaunchGame, onProxySubmit, onGoogleSubmit, 
    favorites, toggleFavorite, recentlyPlayed 
}) => {
    const [gameSearch, setGameSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'Favorites'>('Featured');
    const [proxyInput, setProxyInput] = useState('');
    const [googleInput, setGoogleInput] = useState('');

    const categories: { id: GameCategory | 'Favorites', icon: React.FC<any> }[] = [
        { id: 'Favorites', icon: StarFilledIcon },
        { id: 'Featured', icon: StarIcon },
        { id: 'Shooter', icon: TargetIcon },
        { id: 'Driving', icon: CarIcon },
        { id: 'Multiplayer', icon: UsersIcon },
        { id: 'Puzzle', icon: PuzzleIcon },
        { id: 'Arcade', icon: ZapIcon },
    ];

    const filteredGames = GAMES_LIST.filter(game => {
        const matchesSearch = game.name.toLowerCase().includes(gameSearch.toLowerCase()) || 
                              game.description.toLowerCase().includes(gameSearch.toLowerCase());
        
        let matchesCategory = false;
        if (selectedCategory === 'Favorites') {
            matchesCategory = favorites.has(game.id);
        } else if (selectedCategory === 'Featured') {
            matchesCategory = game.category === 'Featured' || game.useProxy === true;
        } else {
            matchesCategory = game.category === selectedCategory;
        }
        return gameSearch ? matchesSearch : (matchesCategory && matchesSearch);
    });

    const recentGames = GAMES_LIST.filter(g => recentlyPlayed.includes(g.id))
        .sort((a, b) => recentlyPlayed.indexOf(a.id) - recentlyPlayed.indexOf(b.id));

    return (
        <div className="flex-1 overflow-y-auto bg-gray-950 custom-scrollbar pb-32">
            <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-10">
                
                {/* Widgets Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-48">
                    <WidgetClock />
                    <FocusTimer theme={theme} />
                    <SystemStatus theme={theme} />
                </div>

                {/* Search Tools */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Google */}
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-white">Secure Search</h3>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); onGoogleSubmit(googleInput); }} className="flex gap-2">
                             <input 
                                value={googleInput}
                                onChange={e => setGoogleInput(e.target.value)}
                                type="text" 
                                placeholder="Search Google..."
                                className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-white/30 outline-none"
                             />
                             <button type="submit" className="bg-gray-800 hover:bg-gray-700 px-4 rounded-xl text-white font-medium text-sm">Go</button>
                        </form>
                    </div>
                    {/* Proxy */}
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <GlobeIcon className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-white">Web Navigator</h3>
                        </div>
                         <form onSubmit={(e) => { e.preventDefault(); onProxySubmit(proxyInput); }} className="flex gap-2">
                             <input 
                                value={proxyInput}
                                onChange={e => setProxyInput(e.target.value)}
                                type="text" 
                                placeholder="https://example.com"
                                className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-white/30 outline-none"
                             />
                             <button type="submit" className="bg-gray-800 hover:bg-gray-700 px-4 rounded-xl text-white font-medium text-sm">Go</button>
                        </form>
                    </div>
                </div>

                {/* Recently Played */}
                {recentGames.length > 0 && (
                     <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recently Played</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {recentGames.map(game => (
                                <button key={game.id} onClick={() => onLaunchGame(game.url, !!game.useProxy, game.name)} className="flex-shrink-0 w-40 h-24 rounded-xl bg-gray-800 relative overflow-hidden group hover:ring-2 ring-white/20 transition-all">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                                    <span className="absolute bottom-2 left-3 font-bold text-white text-sm shadow-black drop-shadow-md">{game.name}</span>
                                </button>
                            ))}
                        </div>
                     </div>
                )}

                {/* Library Grid */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <h2 className="text-2xl font-bold text-white">App Library</h2>
                        <input 
                            value={gameSearch}
                            onChange={e => setGameSearch(e.target.value)}
                            placeholder="Filter apps..."
                            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white w-full md:w-64 focus:outline-none focus:border-gray-500"
                        />
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                         {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                    selectedCategory === cat.id
                                    ? `bg-white text-black`
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <cat.icon className={`w-4 h-4 ${cat.id === 'Favorites' ? 'text-yellow-500' : ''}`} />
                                {cat.id}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredGames.map((game) => (
                             <div
                                key={game.id}
                                onClick={() => onLaunchGame(game.url, !!game.useProxy, game.name)}
                                className="group relative flex flex-col h-40 p-5 rounded-2xl border border-gray-800 bg-gray-900 hover:border-gray-600 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-5 group-hover:opacity-20 transition-opacity`} />
                                <button 
                                    onClick={(e) => toggleFavorite(e, game.id)}
                                    className="absolute top-3 right-3 text-gray-600 hover:text-yellow-400 z-10"
                                >
                                     {favorites.has(game.id) ? <StarFilledIcon className="w-5 h-5 text-yellow-400" /> : <StarIcon className="w-5 h-5" />}
                                </button>
                                <div className="mt-auto z-10">
                                    <h4 className="font-bold text-white leading-tight mb-1">{game.name}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-1">{game.category}</p>
                                </div>
                                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/5 rounded-2xl transition-all"></div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Library;
