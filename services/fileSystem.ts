import { VirtualFile } from '../types';
import { generateId } from '../utils';

const INITIAL_FS: VirtualFile[] = [
    { id: 'root', name: 'root', type: 'folder', parentId: null, createdAt: Date.now() },
    { id: 'desktop', name: 'Desktop', type: 'folder', parentId: 'root', createdAt: Date.now() },
    { id: 'docs', name: 'Documents', type: 'folder', parentId: 'root', createdAt: Date.now() },
    { id: 'pics', name: 'Pictures', type: 'folder', parentId: 'root', createdAt: Date.now() },
    { id: 'welcome', name: 'Welcome.txt', type: 'file', parentId: 'desktop', content: 'Welcome to Neural OS v6.0!\n\nThis is a simulated file system. You can create files, folders, and organize your digital life here.\n\nEnjoy the upgrade!', createdAt: Date.now() },
    { id: 'project', name: 'Project Alpha', type: 'folder', parentId: 'docs', createdAt: Date.now() },
    { id: 'notes', name: 'Ideas.txt', type: 'file', parentId: 'project', content: '- Neural Link integration\n- AI Core optimization\n- Coffee break', createdAt: Date.now() },
];

export const getFileSystem = (): VirtualFile[] => {
    try {
        const saved = localStorage.getItem('neural_fs');
        return saved ? JSON.parse(saved) : INITIAL_FS;
    } catch {
        return INITIAL_FS;
    }
};

export const saveFileSystem = (fs: VirtualFile[]) => {
    localStorage.setItem('neural_fs', JSON.stringify(fs));
};

export const createFile = (fs: VirtualFile[], name: string, parentId: string, content: string = ''): VirtualFile[] => {
    const newFile: VirtualFile = {
        id: generateId(),
        name,
        type: 'file',
        parentId,
        content,
        createdAt: Date.now()
    };
    return [...fs, newFile];
};

export const createFolder = (fs: VirtualFile[], name: string, parentId: string): VirtualFile[] => {
    const newFolder: VirtualFile = {
        id: generateId(),
        name,
        type: 'folder',
        parentId,
        createdAt: Date.now()
    };
    return [...fs, newFolder];
};

export const deleteItem = (fs: VirtualFile[], id: string): VirtualFile[] => {
    // Recursive delete
    const idsToDelete = new Set<string>();
    const findChildren = (parentId: string) => {
        idsToDelete.add(parentId);
        fs.filter(f => f.parentId === parentId).forEach(child => findChildren(child.id));
    };
    findChildren(id);
    return fs.filter(f => !idsToDelete.has(f.id));
};
