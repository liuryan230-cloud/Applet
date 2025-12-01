import React, { useState } from 'react';
import { Theme, VirtualFile } from '../types';
import { 
    FolderIcon, FileIcon, HardDriveIcon, 
    ChevronRightIcon, ArrowLeftIcon, PlusIcon,
    TrashIcon, SearchIcon
} from './Icons';
import { createFolder, createFile, deleteItem } from '../services/fileSystem';

interface FileExplorerProps {
    theme: Theme;
    fs: VirtualFile[];
    setFs: React.Dispatch<React.SetStateAction<VirtualFile[]>>;
    onOpenFile: (file: VirtualFile) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ theme, fs, setFs, onOpenFile }) => {
    const [currentPathId, setCurrentPathId] = useState<string>('root');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Navigation Logic
    const currentFolder = fs.find(f => f.id === currentPathId);
    const children = fs.filter(f => f.parentId === currentPathId);

    const getPath = (id: string): VirtualFile[] => {
        const path: VirtualFile[] = [];
        let curr = fs.find(f => f.id === id);
        while (curr) {
            path.unshift(curr);
            curr = fs.find(f => f.id === curr?.parentId);
        }
        return path;
    };
    const breadcrumbs = getPath(currentPathId);

    const handleOpen = (item: VirtualFile) => {
        if (item.type === 'folder') {
            setCurrentPathId(item.id);
            setSelectedId(null);
        } else {
            onOpenFile(item);
        }
    };

    const handleCreateFolder = () => {
        const name = prompt('Folder Name:', 'New Folder');
        if (name) {
            setFs(prev => createFolder(prev, name, currentPathId));
        }
    };

    const handleCreateFile = () => {
        const name = prompt('File Name:', 'New File.txt');
        if (name) {
            setFs(prev => createFile(prev, name, currentPathId, ''));
        }
    };

    const handleDelete = () => {
        if (selectedId && confirm('Delete item?')) {
            setFs(prev => deleteItem(prev, selectedId));
            setSelectedId(null);
        }
    };

    const themeClass = {
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
        green: 'text-emerald-400',
        orange: 'text-orange-400'
    }[theme];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-gray-200">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b border-gray-800 bg-gray-950">
                <button 
                    onClick={() => currentFolder?.parentId && setCurrentPathId(currentFolder.parentId)}
                    disabled={!currentFolder?.parentId}
                    className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                </button>
                
                {/* Breadcrumbs */}
                <div className="flex-1 flex items-center gap-1 text-sm overflow-hidden px-2 bg-gray-900 border border-gray-800 rounded py-1">
                    <HardDriveIcon className="w-3 h-3 text-gray-500" />
                    {breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={crumb.id}>
                            {i > 0 && <ChevronRightIcon className="w-3 h-3 text-gray-600" />}
                            <button 
                                onClick={() => setCurrentPathId(crumb.id)}
                                className="hover:text-white truncate max-w-[100px]"
                            >
                                {crumb.name}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex gap-1">
                     <button onClick={handleCreateFolder} className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white" title="New Folder">
                        <FolderIcon className="w-4 h-4" />
                        <span className="sr-only">New Folder</span>
                     </button>
                     <button onClick={handleCreateFile} className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white" title="New File">
                        <PlusIcon className="w-4 h-4" />
                        <span className="sr-only">New File</span>
                     </button>
                     <button onClick={handleDelete} disabled={!selectedId} className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400 disabled:opacity-30">
                        <TrashIcon className="w-4 h-4" />
                     </button>
                </div>
            </div>

            {/* Sidebar + Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-40 bg-gray-950/50 border-r border-gray-800 p-2 hidden md:block">
                     <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Favorites</div>
                     {['desktop', 'docs', 'pics'].map(id => {
                         const folder = fs.find(f => f.id === id);
                         if (!folder) return null;
                         return (
                             <button 
                                key={id}
                                onClick={() => setCurrentPathId(id)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${currentPathId === id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <FolderIcon className={`w-4 h-4 ${id === 'desktop' ? 'text-blue-400' : id === 'docs' ? 'text-yellow-400' : 'text-purple-400'}`} />
                                {folder.name}
                             </button>
                         );
                     })}
                </div>

                {/* Grid View */}
                <div className="flex-1 p-4 overflow-y-auto" onClick={() => setSelectedId(null)}>
                    {children.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                            <FolderIcon className="w-16 h-16 mb-2" />
                            <span>Empty Folder</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {children.map(item => (
                                <div
                                    key={item.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
                                    onDoubleClick={() => handleOpen(item)}
                                    className={`
                                        flex flex-col items-center p-3 rounded-lg border transition-all cursor-pointer group
                                        ${selectedId === item.id 
                                            ? `bg-white/10 border-white/20 shadow-lg` 
                                            : 'bg-transparent border-transparent hover:bg-white/5'}
                                    `}
                                >
                                    <div className="mb-2">
                                        {item.type === 'folder' ? (
                                            <FolderIcon className={`w-12 h-12 text-blue-400 drop-shadow-md`} />
                                        ) : (
                                            <div className="relative">
                                                <FileIcon className="w-12 h-12 text-gray-400 drop-shadow-md" />
                                                <div className="absolute top-4 left-0 right-0 text-[8px] text-center font-mono opacity-50 px-2 line-clamp-3">
                                                    {item.content}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs text-center break-all px-1 rounded ${selectedId === item.id ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Status Bar */}
            <div className="bg-gray-950 border-t border-gray-800 px-3 py-1 text-[10px] text-gray-500 flex justify-between">
                 <span>{children.length} items</span>
                 <span>{selectedId ? '1 item selected' : ''}</span>
            </div>
        </div>
    );
};

export default FileExplorer;