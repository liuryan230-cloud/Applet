import React, { useState, useEffect } from 'react';
import { LockIcon, ZapIcon } from './Icons';

interface LockScreenProps {
    onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
    const [time, setTime] = useState(new Date());
    const [isScanning, setIsScanning] = useState(false);
    const [status, setStatus] = useState('Click to Initialize');

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const handleUnlock = () => {
        setIsScanning(true);
        setStatus('Authenticating...');
        setTimeout(() => {
            setStatus('Access Granted');
            setTimeout(onUnlock, 500);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black animate-pulse"></div>
            
            <div className="z-10 flex flex-col items-center space-y-12">
                <div className="text-center">
                    <div className="text-8xl font-thin tracking-tighter">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                    <div className="text-xl text-gray-400 font-light mt-2">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>

                <div 
                    onClick={handleUnlock}
                    className="relative group cursor-pointer"
                >
                    <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isScanning ? 'border-green-500 shadow-[0_0_30px_#10b981]' : 'border-white/20 hover:border-white/50'}`}>
                        {isScanning ? (
                            <div className="text-green-500 animate-pulse">
                                <ZapIcon className="w-10 h-10" />
                            </div>
                        ) : (
                            <LockIcon className="w-10 h-10 text-white/70 group-hover:text-white transition-colors" />
                        )}
                    </div>
                    {/* Ripple */}
                    {isScanning && (
                         <div className="absolute inset-0 rounded-full border border-green-500/50 animate-ping"></div>
                    )}
                </div>

                <div className={`font-mono text-sm tracking-widest uppercase transition-colors duration-300 ${isScanning ? 'text-green-500' : 'text-gray-500'}`}>
                    {status}
                </div>
            </div>
            
            <div className="absolute bottom-8 text-xs text-gray-600 font-mono">
                NEURAL OS v4.0.1 // SECURE BOOT
            </div>
        </div>
    );
};

export default LockScreen;
