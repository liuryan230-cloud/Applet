import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';
import { PlayIcon, PauseIcon, SkipForwardIcon, MusicNoteIcon } from './Icons';

interface MusicPlayerProps {
    theme: Theme;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ theme }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    // Simulated Visualizer Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let bars = 30;
        let barWidth = canvas.width / bars;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Color based on theme
            const color = theme === 'cyan' ? '#06b6d4' : theme === 'purple' ? '#9333ea' : theme === 'green' ? '#10b981' : '#f97316';
            ctx.fillStyle = color;

            for (let i = 0; i < bars; i++) {
                const height = isPlaying 
                    ? Math.random() * canvas.height * 0.8 + 10 
                    : 5;
                ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
            }

            animationRef.current = requestAnimationFrame(render);
        };

        render();
        return () => { if(animationRef.current) cancelAnimationFrame(animationRef.current); };
    }, [isPlaying, theme]);

    const themeClass = {
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
        green: 'text-emerald-400',
        orange: 'text-orange-400'
    }[theme];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
                {/* Album Art Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-50"></div>
                <div className="z-10 w-40 h-40 rounded-2xl bg-gray-800 shadow-2xl flex items-center justify-center border border-gray-700">
                    <MusicNoteIcon className={`w-20 h-20 ${themeClass}`} />
                </div>
                
                {/* Visualizer Overlay */}
                <canvas ref={canvasRef} width={600} height={200} className="absolute bottom-0 w-full h-32 opacity-50" />
            </div>

            <div className="p-6 bg-gray-950 border-t border-gray-800">
                <div className="mb-4">
                    <h3 className="text-lg font-bold">Neural Lofi Beats</h3>
                    <p className="text-xs text-gray-500">Synthetic Minds</p>
                </div>

                <div className="w-full bg-gray-800 h-1.5 rounded-full mb-6 overflow-hidden">
                    <div className={`h-full ${isPlaying ? 'w-1/3 animate-[pulse_3s_infinite]' : 'w-0'} bg-white transition-all`}></div>
                </div>

                <div className="flex items-center justify-center gap-8">
                     <button className="text-gray-400 hover:text-white transition-colors rotate-180">
                        <SkipForwardIcon className="w-6 h-6" />
                     </button>
                     
                     <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 transition-transform`}
                     >
                        {isPlaying ? <PauseIcon className="w-6 h-6 fill-current" /> : <PlayIcon className="w-6 h-6 fill-current" />}
                     </button>
                     
                     <button className="text-gray-400 hover:text-white transition-colors">
                        <SkipForwardIcon className="w-6 h-6" />
                     </button>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;