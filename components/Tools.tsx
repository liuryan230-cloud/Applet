import React, { useState, useEffect } from 'react';
import { Theme } from '../types';
import { TrashIcon, ClockIcon } from './Icons';

interface ToolProps {
    theme: Theme;
}

// --- CALCULATOR ---
export const Calculator: React.FC<ToolProps> = ({ theme }) => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    const handlePress = (val: string) => {
        if (val === 'C') {
            setDisplay('0');
            setEquation('');
        } else if (val === '=') {
            try {
                // eslint-disable-next-line no-eval
                const result = eval(equation + display);
                setDisplay(String(result));
                setEquation('');
            } catch (e) {
                setDisplay('Error');
            }
        } else if (['+', '-', '*', '/'].includes(val)) {
            setEquation(equation + display + val);
            setDisplay('0');
        } else {
            setDisplay(display === '0' ? val : display + val);
        }
    };

    const buttons = [
        'C', '(', ')', '/',
        '7', '8', '9', '*',
        '4', '5', '6', '-',
        '1', '2', '3', '+',
        '0', '.', '=', ''
    ];

    return (
        <div className="flex items-center justify-center h-full p-4">
            <div className="w-full max-w-xs bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-3xl p-6 shadow-2xl">
                <div className="mb-6 bg-gray-950/50 rounded-xl p-4 text-right">
                    <div className="text-sm text-gray-500 h-5">{equation}</div>
                    <div className="text-4xl font-bold text-white truncate">{display}</div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {buttons.map((btn, idx) => (
                        btn === '' ? <div key={idx}></div> :
                        <button
                            key={idx}
                            onClick={() => handlePress(btn)}
                            className={`h-14 rounded-2xl text-xl font-medium transition-all ${
                                btn === '=' 
                                    ? `bg-${theme === 'cyan' ? 'cyan' : theme === 'purple' ? 'purple' : theme === 'green' ? 'emerald' : 'orange'}-600 text-white`
                                    : btn === 'C' 
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                            }`}
                        >
                            {btn}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- NOTEPAD ---
export const Notepad: React.FC<ToolProps> = () => {
    const [note, setNote] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('neural_notes');
        if (saved) setNote(saved);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNote(val);
        localStorage.setItem('neural_notes', val);
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Neural Notes</h2>
                <button 
                    onClick={() => { setNote(''); localStorage.removeItem('neural_notes'); }}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            <textarea 
                value={note}
                onChange={handleChange}
                placeholder="Start typing..."
                className="flex-1 w-full bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-gray-700 text-lg leading-relaxed shadow-inner"
            />
        </div>
    );
};

// --- FOCUS TIMER ---
export const FocusTimer: React.FC<ToolProps> = ({ theme }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound?
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };
    
    const setTimerMode = (m: 'focus' | 'break') => {
        setMode(m);
        setIsActive(false);
        setTimeLeft(m === 'focus' ? 25 * 60 : 5 * 60);
    };

    const themeColor = {
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
        green: 'text-emerald-400',
        orange: 'text-orange-400'
    }[theme];

    return (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-6">
            <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">
                <button 
                    onClick={() => setTimerMode('focus')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'focus' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Focus
                </button>
                <button 
                    onClick={() => setTimerMode('break')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'break' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Break
                </button>
            </div>
            
            <div className={`text-6xl font-black font-mono tracking-tighter ${themeColor}`}>
                {formatTime(timeLeft)}
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={toggleTimer}
                    className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white transition-colors border border-gray-700`}
                >
                    {isActive ? '||' : '▶'}
                </button>
                <button 
                    onClick={resetTimer}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border border-gray-700"
                >
                    <ClockIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};