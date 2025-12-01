
import React, { useState, useEffect } from 'react';
import { AppId, Theme, WindowInstance, VirtualFile, DesktopItemPosition } from '../types';
import { HomeIcon, BotIcon, CalculatorIcon, FileTextIcon, GlobeIcon, TerminalIcon, FolderIcon, FileIcon, CodeIcon, MusicNoteIcon, MessageCircleIcon } from './Icons';
import Window from './Window';

interface DesktopProps {
    windows: WindowInstance[];
    activeWindowId: string;
    onLaunch: (appId: AppId) => void;
    onWindowAction: (action: string, id: string, payload?: any) => void;
    theme: Theme;
    desktopFiles: VirtualFile[];
    onOpenFile: (file: VirtualFile) => void;
    children?: React.ReactNode;
}

const APPS_LIST: { id: AppId, name: string, icon: React.FC<any> }[] = [
    { id: 'store', name: 'App Store', icon: HomeIcon },
    { id: 'assistant', name: 'Assistant', icon: BotIcon },
    { id: 'browser', name: 'Browser', icon: GlobeIcon },
    { id: 'files', name: 'Files', icon: FolderIcon },
    { id: 'code', name: 'Code', icon: CodeIcon },
    { id: 'music', name: 'Music', icon: MusicNoteIcon },
    { id: 'social', name: 'Neural Link', icon: MessageCircleIcon },
];

const Desktop: React.FC<DesktopProps> = ({ 
    windows, activeWindowId, onLaunch, onWindowAction, theme, desktopFiles, onOpenFile, children 
}) => {
    // --- DRAG AND DROP STATE ---
    const [positions, setPositions] = useState<DesktopItemPosition[]>([]);
    const [dragItem, setDragItem] = useState<{ id: string, startX: number, startY: number, initialLeft: number, initialTop: number } | null>(null);

    // Initialize positions if empty (simple grid layout)
    useEffect(() => {
        const saved = localStorage.getItem('desktop_pos');
        if (saved) {
            setPositions(JSON.parse(saved));
        } else {
            // Default Grid
            const newPos: DesktopItemPosition[] = [];
            let row = 0;
            let col = 0;
            const place = (id: string) => {
                newPos.push({ id, x: 20 + col * 100, y: 20 + row * 100 });
                row++;
                if (row > 5) { row = 0; col++; }
            };
            APPS_LIST.forEach(app => place(app.id));
            desktopFiles.forEach(f => place(f.id));
            setPositions(newPos);
        }
    }, [desktopFiles.length]);

    const getPos = (id: string) => positions.find(p => p.id === id) || { x: 20, y: 20 };

    const handleDragStart = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const pos = getPos(id);
        setDragItem({
            id,
            startX: e.clientX,
            startY: e.clientY,
            initialLeft: pos.x,
            initialTop: pos.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragItem) return;
            const dx = e.clientX - dragItem.startX;
            const dy = e.clientY - dragItem.startY;
            
            setPositions(prev => prev.map(p => 
                p.id === dragItem.id 
                ? { ...p, x: dragItem.initialLeft + dx, y: dragItem.initialTop + dy } 
                : p
            ));
        };

        const handleMouseUp = () => {
            if (dragItem) {
                // Snap to Grid (100x100 approx)
                setPositions(prev => {
                    const updated = prev.map(p => {
                        if (p.id === dragItem.id) {
                            return {
                                ...p,
                                x: Math.round(p.x / 20) * 20, // Soft snap
                                y: Math.round(p.y / 20) * 20
                            };
                        }
                        return p;
                    });
                    localStorage.setItem('desktop_pos', JSON.stringify(updated));
                    return updated;
                });
                setDragItem(null);
            }
        };

        if (dragItem) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragItem]);

    const themeBorder = {
        cyan: 'border-cyan-500',
        purple: 'border-purple-500',
        green: 'border-emerald-500',
        orange: 'border-orange-500'
    }[theme];

    return (
        <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden pb-32">
            
            {/* Snap Indicators (Visual) */}
            <div className={`absolute top-0 left-0 bottom-0 w-2 hover:bg-white/10 z-0 transition-colors pointer-events-none`}></div>
            <div className={`absolute top-0 right-0 bottom-0 w-2 hover:bg-white/10 z-0 transition-colors pointer-events-none`}></div>

            {/* Desktop Icons Layer */}
            <div className="absolute inset-0 z-0 min-h-[120vh]">
                {/* Apps */}
                {APPS_LIST.map(app => {
                    const pos = getPos(app.id);
                    return (
                        <div
                            key={app.id}
                            onMouseDown={(e) => handleDragStart(e, app.id)}
                            onDoubleClick={() => onLaunch(app.id)}
                            style={{ left: pos.x, top: pos.y }}
                            className="absolute pointer-events-auto group w-24 flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors focus:bg-white/20 focus:outline-none cursor-default active:cursor-grabbing"
                        >
                            <div className="w-14 h-14 bg-gray-800/80 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform border border-white/5 pointer-events-none">
                                <app.icon className="w-8 h-8" />
                            </div>
                            <span className="text-xs text-white font-medium drop-shadow-md bg-black/40 px-2 py-0.5 rounded-full line-clamp-1 pointer-events-none select-none">{app.name}</span>
                        </div>
                    );
                })}

                {/* Files */}
                {desktopFiles.map(file => {
                     const pos = getPos(file.id);
                     return (
                         <div
                            key={file.id}
                            onMouseDown={(e) => handleDragStart(e, file.id)}
                            onDoubleClick={() => onOpenFile(file)}
                            style={{ left: pos.x, top: pos.y }}
                            className="absolute pointer-events-auto group w-24 flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors focus:bg-white/20 focus:outline-none cursor-default active:cursor-grabbing"
                        >
                            <div className="w-14 h-14 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform pointer-events-none">
                                 {file.type === 'folder' ? (
                                    <FolderIcon className="w-12 h-12 text-blue-400 drop-shadow-lg" />
                                 ) : (
                                    <div className="relative">
                                        <FileIcon className="w-12 h-12 text-gray-200 drop-shadow-lg" />
                                        <div className="absolute top-4 left-0 right-0 text-[8px] text-gray-500 font-mono text-center px-2 line-clamp-3 leading-tight opacity-70">{file.content}</div>
                                    </div>
                                 )}
                            </div>
                            <span className="text-xs text-white font-medium drop-shadow-md bg-black/40 px-2 py-0.5 rounded-full line-clamp-2 text-center break-words w-full pointer-events-none select-none">{file.name}</span>
                        </div>
                     );
                })}
            </div>

            {/* Windows Container */}
            {windows.map(win => (
                <Window
                    key={win.id}
                    window={win}
                    isActive={win.id === activeWindowId}
                    onFocus={() => onWindowAction('focus', win.id)}
                    onClose={() => onWindowAction('close', win.id)}
                    onMinimize={() => onWindowAction('minimize', win.id)}
                    onMaximize={() => onWindowAction('maximize', win.id)}
                    onUpdatePosition={(pos) => onWindowAction('move', win.id, pos)}
                    onUpdateSize={(size) => onWindowAction('resize', win.id, size)}
                    onLaunch={onLaunch}
                    theme={theme}
                >
                    {React.Children.map(children, (child: any) => {
                         if (child.props.appId === win.appId) {
                             return React.cloneElement(child, { 
                                 isActiveWindow: win.id === activeWindowId,
                                 windowParams: win.contentProps 
                             });
                         }
                         return null;
                    })}
                </Window>
            ))}
        </div>
    );
};

export default Desktop;
