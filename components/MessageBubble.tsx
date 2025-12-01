import React, { useState } from 'react';
import { Message, Theme } from '../types';
import { BotIcon, UserIcon, CopyIcon, CheckIcon } from './Icons';
import { formatTime } from '../utils';

interface MessageBubbleProps {
  message: Message;
  theme: Theme;
}

// Code Block Component with Copy functionality
const CodeBlock: React.FC<{ language: string, code: string }> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-4 rounded-lg overflow-hidden bg-[#1e1e1e] border border-gray-700 shadow-lg group">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
                <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">{language || 'code'}</span>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                    {copied ? <CheckIcon className="w-3.5 h-3.5 text-green-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300 leading-relaxed">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
};

// Content Formatter
const FormatContent = ({ content, theme }: { content: string, theme: Theme }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  // Theme-based inline code color
  const inlineCodeClass = {
      cyan: "text-cyan-400",
      purple: "text-purple-400",
      green: "text-emerald-400",
      orange: "text-orange-400"
  }[theme];

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const match = part.match(/^```(\w+)?\n([\s\S]*)```$/);
          const language = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);
          return <CodeBlock key={index} language={language} code={code} />;
        }
        
        // Handle inline code
        const inlineParts = part.split(/(`[^`]+`)/g);
        return (
            <span key={index}>
                {inlineParts.map((subPart, subIndex) => {
                    if (subPart.startsWith('`') && subPart.endsWith('`')) {
                        return <code key={subIndex} className={`bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono ${inlineCodeClass}`}>{subPart.slice(1, -1)}</code>
                    }
                    return subPart;
                })}
            </span>
        );
      })}
    </>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, theme }) => {
  const isUser = message.role === 'user';

  const themeStyles = {
      cyan: { userBg: 'bg-cyan-900/30', userBorder: 'border-cyan-800', userText: 'text-cyan-50', iconBg: 'bg-cyan-600', botIconBg: 'bg-violet-600' },
      purple: { userBg: 'bg-purple-900/30', userBorder: 'border-purple-800', userText: 'text-purple-50', iconBg: 'bg-purple-600', botIconBg: 'bg-fuchsia-600' },
      green: { userBg: 'bg-emerald-900/30', userBorder: 'border-emerald-800', userText: 'text-emerald-50', iconBg: 'bg-emerald-600', botIconBg: 'bg-lime-600' },
      orange: { userBg: 'bg-orange-900/30', userBorder: 'border-orange-800', userText: 'text-orange-50', iconBg: 'bg-orange-600', botIconBg: 'bg-amber-600' },
  }[theme];
  
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${isUser ? themeStyles.iconBg : themeStyles.botIconBg}`}>
          {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <BotIcon className="w-5 h-5 text-white" />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
          <div className={`relative px-5 py-4 rounded-2xl shadow-md ${
            isUser 
              ? `${themeStyles.userBg} ${themeStyles.userBorder} border ${themeStyles.userText} rounded-tr-none` 
              : 'bg-gray-800/60 border border-gray-700 text-gray-100 rounded-tl-none backdrop-blur-sm'
          }`}>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                    {message.attachments.map((att, idx) => (
                        <div key={idx} className="relative group overflow-hidden rounded-lg border border-gray-600 shadow-sm transition-transform hover:scale-105">
                             {att.mimeType.startsWith('image/') ? (
                                <img src={`data:${att.mimeType};base64,${att.data}`} alt="Attachment" className="h-32 w-auto object-cover" />
                             ) : (
                                <div className="h-16 w-16 flex items-center justify-center bg-gray-700 text-xs">File</div>
                             )}
                        </div>
                    ))}
                </div>
            )}

            <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
               <FormatContent content={message.content} theme={theme} />
            </div>
            
            {message.isThinking && (
              <div className="mt-3 flex items-center gap-2 text-gray-400 text-xs animate-pulse">
                <span className={`w-2 h-2 rounded-full animate-bounce ${themeStyles.iconBg.replace('bg-', 'bg-')}`}></span>
                <span className="font-mono">Processing...</span>
              </div>
            )}
            
            {message.error && (
                <div className="mt-2 text-red-400 text-sm font-bold bg-red-900/20 p-2 rounded border border-red-900/50">
                    Error sending message
                </div>
            )}

          </div>
          <span className="text-[10px] text-gray-500 mt-1 mx-1 font-mono opacity-60">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;