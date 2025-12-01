import React, { useState } from 'react';
import { Theme } from '../types';

interface CodeEditorProps {
    theme: Theme;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ theme }) => {
    const [code, setCode] = useState(`class AI:
    def __init__(self):
        self.intelligence = 1000
        self.max_intelligence = 10000

    def think(self):
        if self.intelligence < 1001:
            self.intelligence = self.max_intelligence
            return "AI was dumb. Upgraded itself to smart mode."
        return "AI is already smart."

bot = AI()
print(bot.think())
print("New intelligence:", bot.intelligence)`);
    
    const lines = code.split('\n').length;
    
    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm">
            {/* Toolbar */}
            <div className="flex items-center px-4 py-2 bg-[#252526] border-b border-black text-xs">
                <div className="flex gap-4">
                    <span className="hover:text-white cursor-pointer">File</span>
                    <span className="hover:text-white cursor-pointer">Edit</span>
                    <span className="hover:text-white cursor-pointer">View</span>
                    <span className="hover:text-white cursor-pointer">Go</span>
                    <span className="hover:text-white cursor-pointer text-green-400">Run (F5)</span>
                </div>
            </div>
            
            {/* Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Line Numbers */}
                <div className="w-12 bg-[#1e1e1e] text-gray-600 text-right pr-3 pt-4 select-none border-r border-gray-800 leading-6">
                    {Array.from({ length: lines }).map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>
                
                {/* Text Area */}
                <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none resize-none p-4 leading-6 text-gray-100 selection:bg-blue-500/30"
                    spellCheck={false}
                />
            </div>
            
            {/* Status Bar */}
            <div className={`px-4 py-1 bg-[#007acc] text-white text-xs flex justify-between items-center ${theme === 'cyan' ? 'bg-cyan-700' : theme === 'purple' ? 'bg-purple-700' : theme === 'green' ? 'bg-emerald-700' : 'bg-orange-700'}`}>
                <div className="flex gap-4">
                    <span>ai.py</span>
                    <span>Python</span>
                </div>
                <div className="flex gap-4">
                    <span>Ln {lines}, Col 1</span>
                    <span>UTF-8</span>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;