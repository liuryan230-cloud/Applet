import React from 'react';
import { WifiIcon, BluetoothIcon, SunIcon, VolumeIcon, BatteryIcon } from './Icons';
import { Theme } from '../types';

interface QuickSettingsProps {
    theme: Theme;
    onClose: () => void;
}

const QuickSettings: React.FC<QuickSettingsProps> = ({ theme, onClose }) => {
    const activeColor = {
        cyan: 'bg-cyan-500 text-white',
        purple: 'bg-purple-500 text-white',
        green: 'bg-emerald-500 text-white',
        orange: 'bg-orange-500 text-white'
    }[theme];

    return (
        <div className="absolute bottom-16 right-4 w-80 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-4 animate-[fadeIn_0.2s_ease-out] z-[9999]">
             <div className="grid grid-cols-2 gap-3 mb-4">
                 <button className={`${activeColor} p-3 rounded-xl flex flex-col gap-2 transition-transform active:scale-95`}>
                     <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                         <WifiIcon className="w-5 h-5" />
                     </div>
                     <span className="text-xs font-bold text-left">Wi-Fi<br/><span className="font-normal opacity-80">NeuralNet</span></span>
                 </button>
                 <button className={`bg-gray-800 text-gray-300 p-3 rounded-xl flex flex-col gap-2 transition-transform active:scale-95`}>
                     <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center">
                         <BluetoothIcon className="w-5 h-5" />
                     </div>
                     <span className="text-xs font-bold text-left">Bluetooth<br/><span className="font-normal opacity-80">Off</span></span>
                 </button>
             </div>

             <div className="bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-700/50">
                 <div className="space-y-2">
                     <div className="flex items-center gap-3 text-gray-400">
                         <SunIcon className="w-4 h-4" />
                         <input type="range" className="flex-1 h-2 bg-gray-700 rounded-full appearance-none accent-white" />
                     </div>
                 </div>
                 <div className="space-y-2">
                     <div className="flex items-center gap-3 text-gray-400">
                         <VolumeIcon className="w-4 h-4" />
                         <input type="range" className="flex-1 h-2 bg-gray-700 rounded-full appearance-none accent-white" />
                     </div>
                 </div>
             </div>
             
             <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
                 <span>Battery</span>
                 <div className="flex items-center gap-2">
                     <span>84%</span>
                     <BatteryIcon className="w-5 h-5 text-green-400" />
                 </div>
             </div>
        </div>
    );
};

export default QuickSettings;