
import React, { useState, useEffect, useRef } from 'react';
import { MinusIcon, SquareIcon, XIcon, MessageCircleIcon } from './Icons';
import { WindowInstance, Theme, AppId } from '../types';

interface WindowProps {
    window: WindowInstance;
    isActive: boolean;
    onFocus: () => void;
    onClose: () => void;
    onMinimize: () => void;
    onMaximize: () => void;
    onUpdatePosition: (pos: { x: number, y: number }) => void;
    onUpdateSize: (size: { width: number, height: number }) => void;
    onLaunch?: (appId: AppId) => void;
    theme: Theme;
    children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ 
    window: win, 
    isActive, onFocus, onClose, onMinimize, onMaximize, 
    onUpdatePosition, onUpdateSize, onLaunch, theme, children 
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const windowRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (win.isMaximized) return;
        onFocus();
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - win.position.x,
            y: e.clientY - win.position.y
        });
    };

    const handleResizeDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (win.isMaximized) return;
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                onUpdatePosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            } else if (isResizing) {
                onUpdateSize({
                    width: Math.max(300, e.clientX - win.position.x),
                    height: Math.max(200, e.clientY - win.position.y)
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, win.position, onUpdatePosition, onUpdateSize]);

    if (win.isMinimized) return null;

    const themeColors = {
        cyan: 'border-cyan-500/30',
        purple: 'border-purple-500/30',
        green: 'border-emerald-500/30',
        orange: 'border-orange-500/30',
    }[theme];

    // Use fixed position for maximized windows to ensure they don't scroll with desktop icons
    const style: React.CSSProperties = win.isMaximized ? {
        top: 0, left: 0, right: 0, bottom: '80px', // Fixed to viewport, minus dock area
        width: '100%', 
        height: 'auto', // Handled by bottom constraint
        transform: 'none',
        borderRadius: 0
    } : {
        top: win.position.y,
        left: win.position.x,
        width: win.size.width,
        height: win.size.height,
    };

    return (
        <div 
            ref={windowRef}
            style={{ ...style, zIndex: win.zIndex }}
            className={`${win.isMaximized ? 'fixed' : 'absolute'} flex flex-col bg-gray-900/90 backdrop-blur-xl border shadow-2xl overflow-hidden transition-shadow duration-200 ${themeColors} ${win.isMaximized ? '' : 'rounded-xl'}`}
            onMouseDown={onFocus}
        >
            {/* Header / Drag Handle */}
            <div 
                className={`h-10 bg-gray-950/80 border-b border-gray-800 flex items-center justify-between px-3 select-none ${win.isMaximized ? '' : 'cursor-grab active:cursor-grabbing'}`}
                onMouseDown={handleMouseDown}
                onDoubleClick={onMaximize}
            >
                <div className="flex gap-2 items-center">
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center group">
                        <XIcon className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center group">
                        <MinusIcon className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center group">
                        <SquareIcon className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
                    </button>
                    
                    {/* Chat Button (Mobile Only) */}
                    {isMobile && onLaunch && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); onLaunch('social'); }} 
                            className="ml-2 w-6 h-6 rounded-full bg-blue-500/20 hover:bg-blue-500 flex items-center justify-center text-blue-400 hover:text-white transition-colors"
                            title="Open Global Chat"
                        >
                            <MessageCircleIcon className="w-3 h-3" />
                         </button>
                    )}
                </div>
                
                <div className="text-sm font-medium text-gray-400 pointer-events-none truncate px-2">{win.title}</div>
                <div className="w-14"></div> {/* Spacer for balance */}
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                
                {/* Touch Scrolling Gutters (Mobile Only) */}
                {isMobile && (
                    <>
                        <div className="absolute top-0 left-0 w-8 h-full z-40 bg-transparent pointer-events-auto" />
                        <div className="absolute top-0 right-0 w-8 h-full z-40 bg-transparent pointer-events-auto" />
                    </>
                )}

                {/* Pointer Events Overlay for Dragging */}
                {(isDragging || isResizing) && (
                    <div className="absolute inset-0 z-50 bg-transparent" />
                )}
                
                {children}
            </div>

            {/* Resize Handle */}
            {!win.isMaximized && (
                <div 
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-white/10 rounded-tl"
                    onMouseDown={handleResizeDown}
                />
            )}
        </div>
    );
};

export default Window;
