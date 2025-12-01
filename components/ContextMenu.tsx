import React from 'react';
import { RefreshIcon, FolderIcon, ImageIcon, SettingsIcon } from './Icons';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onRefresh: () => void;
    onCreateFolder: () => void;
    onChangeWallpaper: () => void;
    onOpenSettings: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onRefresh, onCreateFolder, onChangeWallpaper, onOpenSettings }) => {
    
    // Adjust position to not overflow screen
    // Simple clamp not fully implemented, assuming reasonable clicks
    
    return (
        <>
            <div className="fixed inset-0 z-[9998]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }}></div>
            <div 
                className="fixed z-[9999] w-56 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl overflow-hidden py-1 animate-[fadeIn_0.1s_ease-out]"
                style={{ top: y, left: x }}
            >
                <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 mb-1">
                    Neural OS
                </div>
                
                <button onClick={() => { onCreateFolder(); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white text-gray-300 text-sm flex items-center gap-2 transition-colors">
                    <FolderIcon className="w-4 h-4" /> New Folder
                </button>
                <button onClick={() => { onRefresh(); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white text-gray-300 text-sm flex items-center gap-2 transition-colors">
                    <RefreshIcon className="w-4 h-4" /> Refresh
                </button>
                
                <div className="h-px bg-gray-800 my-1 mx-2"></div>
                
                <button onClick={() => { onChangeWallpaper(); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white text-gray-300 text-sm flex items-center gap-2 transition-colors">
                    <ImageIcon className="w-4 h-4" /> Next Wallpaper
                </button>
                <button onClick={() => { onOpenSettings(); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white text-gray-300 text-sm flex items-center gap-2 transition-colors">
                    <SettingsIcon className="w-4 h-4" /> Personalize
                </button>
            </div>
        </>
    );
};

export default ContextMenu;