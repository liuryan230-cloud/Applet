import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  isThinking?: boolean;
  error?: boolean;
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
  name?: string;
}

export type ModelId = 'gemini-2.5-flash' | 'gemini-3-pro-preview';

export interface ChatConfig {
  model: ModelId;
  temperature: number;
  thinkingBudget: number; // 0 to disable
  systemInstruction: string;
}

export interface StreamChunk {
  text: string;
  done: boolean;
}

export type Theme = 'cyan' | 'purple' | 'green' | 'orange';

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  icon: React.FC<any>;
}

export interface Command {
  id: string;
  title: string;
  icon: React.FC<any>;
  action: () => void;
  shortcut?: string;
  section: 'Navigation' | 'Actions' | 'Games';
}

// --- V5, V6 & V7 UPGRADE TYPES ---
export type AppId = 'store' | 'assistant' | 'calculator' | 'notes' | 'browser' | 'terminal' | 'settings' | 'files' | 'taskmanager' | 'music' | 'code' | 'social' | 'game';

export interface WindowInstance {
  id: string;
  appId: AppId;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number, y: number };
  size: { width: number, height: number };
  contentProps?: any; // Pass initialURL, fileId, etc
}

export interface VirtualFile {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string; // For files
    parentId: string | null;
    createdAt: number;
}

export interface DesktopItemPosition {
    id: string;
    x: number;
    y: number;
}

// --- SOCIAL APP TYPES ---
export interface SocialUser {
    id: string;
    username: string;
    avatar: string; // Emoji
    status: 'online' | 'offline' | 'away';
}

export interface SocialMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    content: string;
    timestamp: number;
    channel: string;
}

// --- V8 BROWSER & SYSTEM TYPES ---
export interface Bookmark {
    id: string;
    title: string;
    url: string;
    icon?: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    appId: AppId;
    read: boolean;
}