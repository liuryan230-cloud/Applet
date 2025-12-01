import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';

interface TerminalProps {
    theme: Theme;
    onClose: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ theme, onClose }) => {
    const [history, setHistory] = useState(['Neural OS v5.0 [Kernel 4.2.0]', 'Type "help" for available commands.']);
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();
            const newHistory = [...history, `$ ${input}`];
            
            switch(cmd.toLowerCase()) {
                case 'help':
                    newHistory.push('Available commands: help, clear, date, whoami, exit, python ai.py');
                    break;
                case 'clear':
                    setHistory([]);
                    setInput('');
                    return; // early return to skip setHistory append
                case 'date':
                    newHistory.push(new Date().toString());
                    break;
                case 'whoami':
                    newHistory.push('user@neural-os');
                    break;
                case 'python ai.py':
                case 'python3 ai.py':
                    newHistory.push('AI was dumb. Upgraded itself to smart mode.');
                    newHistory.push('New intelligence: 10000');
                    break;
                case 'exit':
                    onClose();
                    break;
                default:
                    if (cmd.startsWith('echo ')) {
                        newHistory.push(cmd.substring(5));
                    } else if (cmd) {
                        newHistory.push(`Command not found: ${cmd}`);
                    }
                    break;
            }
            
            setHistory(newHistory);
            setInput('');
        }
    };

    const textColor = {
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
        green: 'text-emerald-400',
        orange: 'text-orange-400',
    }[theme];

    return (
        <div className="h-full bg-black/90 p-4 font-mono text-sm overflow-y-auto custom-scrollbar" onClick={() => document.getElementById('term-input')?.focus()}>
            {history.map((line, i) => (
                <div key={i} className="mb-1 text-gray-300 break-words">{line}</div>
            ))}
            <div className="flex gap-2 text-white">
                <span className={textColor}>➜</span>
                <span className="text-blue-400">~</span>
                <input 
                    id="term-input"
                    className="flex-1 bg-transparent outline-none border-none text-white"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    autoComplete="off"
                />
            </div>
            <div ref={endRef} />
        </div>
    );
};

export default Terminal;