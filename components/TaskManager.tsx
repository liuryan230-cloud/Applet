import React, { useState, useEffect } from 'react';
import { WindowInstance, Theme } from '../types';
import { CpuIcon, ActivityIcon, XIcon } from './Icons';

interface TaskManagerProps {
    windows: WindowInstance[];
    onKill: (id: string) => void;
    theme: Theme;
}

const TaskManager: React.FC<TaskManagerProps> = ({ windows, onKill, theme }) => {
    const [cpu, setCpu] = useState(12);
    const [mem, setMem] = useState(24);

    useEffect(() => {
        const t = setInterval(() => {
            setCpu(Math.floor(Math.random() * 30) + 5);
            setMem(Math.floor(Math.random() * 10) + 20 + windows.length * 5);
        }, 2000);
        return () => clearInterval(t);
    }, [windows.length]);

    const getBarColor = (val: number) => {
        if (val > 80) return 'bg-red-500';
        if (val > 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-gray-200 font-mono text-sm">
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-950 border-b border-gray-800">
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <CpuIcon className="w-4 h-4" /> CPU
                    </div>
                    <div className="text-2xl font-bold text-white">{cpu}%</div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${getBarColor(cpu)}`} style={{ width: `${cpu}%` }}></div>
                    </div>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <ActivityIcon className="w-4 h-4" /> MEMORY
                    </div>
                    <div className="text-2xl font-bold text-white">{mem}%</div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${getBarColor(mem)}`} style={{ width: `${mem}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Process List */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-950 text-gray-500 text-xs uppercase tracking-wider sticky top-0">
                        <tr>
                            <th className="p-3 border-b border-gray-800">Task Name</th>
                            <th className="p-3 border-b border-gray-800 w-24">ID</th>
                            <th className="p-3 border-b border-gray-800 w-24">Status</th>
                            <th className="p-3 border-b border-gray-800 w-16">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {windows.map(win => (
                            <tr key={win.id} className="hover:bg-white/5 transition-colors border-b border-gray-800/50">
                                <td className="p-3 font-medium text-white flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${win.isMinimized ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                    {win.title}
                                </td>
                                <td className="p-3 text-gray-500 text-xs">{win.id.substring(0,6)}</td>
                                <td className="p-3 text-xs">
                                    {win.isMinimized ? <span className="text-yellow-400">Sleeping</span> : <span className="text-green-400">Running</span>}
                                </td>
                                <td className="p-3">
                                    <button 
                                        onClick={() => onKill(win.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1 rounded"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {/* Fake kernel processes */}
                         <tr className="opacity-50">
                            <td className="p-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>kernel_task</td>
                            <td className="p-3 text-xs">000000</td>
                            <td className="p-3 text-xs">System</td>
                            <td className="p-3"></td>
                        </tr>
                        <tr className="opacity-50">
                            <td className="p-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>window_server</td>
                            <td className="p-3 text-xs">000001</td>
                            <td className="p-3 text-xs">System</td>
                            <td className="p-3"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskManager;