import React, { useState, useEffect } from 'react';
import { ChatSession, Language } from '../types';
import { translations } from '../utils/helpers';
import { Send, Search, User, Clock, MoreVertical, MessageCircle, ChevronLeft } from 'lucide-react';

interface LiveChatProps {
    language: Language;
    onUnreadChange?: (count: number) => void;
}

// Mock Chat Data
const mockSessions: ChatSession[] = [
    {
        id: '1',
        guestName: 'Sarah Miller',
        lastMessage: 'Is the spa open until late?',
        unreadCount: 2,
        status: 'active',
        messages: [
            { id: 'm1', sender: 'guest', text: 'Hi, I am looking to book for next weekend.', timestamp: '10:30 AM' },
            { id: 'm2', sender: 'agent', text: 'Hello Sarah! We would love to host you. What specific dates are you looking at?', timestamp: '10:32 AM' },
            { id: 'm3', sender: 'guest', text: 'Friday to Sunday. Is the spa open until late?', timestamp: '10:35 AM' }
        ]
    },
    {
        id: '2',
        guestName: 'Mehmet Yılmaz',
        lastMessage: 'Thank you for the information.',
        unreadCount: 0,
        status: 'active',
        messages: [
             { id: 'm4', sender: 'guest', text: 'Do you have airport shuttle?', timestamp: '09:15 AM' },
             { id: 'm5', sender: 'agent', text: 'Yes, we provide private transfers. It is 50 EUR per way.', timestamp: '09:20 AM' },
             { id: 'm6', sender: 'guest', text: 'Thank you for the information.', timestamp: '09:22 AM' }
        ]
    }
];

const LiveChat: React.FC<LiveChatProps> = ({ language, onUnreadChange }) => {
    const t = translations[language];
    // On mobile, if activeSessionId is null, we show list. If set, we show chat.
    // On desktop, we always show both.
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState(mockSessions);
    const [replyText, setReplyText] = useState('');

    const activeSession = sessions.find(s => s.id === activeSessionId);

    // Sync unread count on mount and when sessions change
    useEffect(() => {
        if (onUnreadChange) {
            const totalUnread = sessions.reduce((acc, s) => acc + s.unreadCount, 0);
            onUnreadChange(totalUnread);
        }
    }, [sessions, onUnreadChange]);

    const handleSelectSession = (id: string) => {
        setActiveSessionId(id);
        // Mark as read when selected
        setSessions(prev => prev.map(s => s.id === id ? { ...s, unreadCount: 0 } : s));
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !activeSessionId) return;

        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                return {
                    ...s,
                    messages: [...s.messages, {
                        id: Date.now().toString(),
                        sender: 'agent',
                        text: replyText,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }],
                    lastMessage: replyText
                };
            }
            return s;
        }));
        setReplyText('');
    };

    return (
        <div className="animate-fade-in h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] flex bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Sidebar List - Hidden on mobile if chat is active */}
            <div className={`w-full md:w-80 border-r border-slate-100 dark:border-slate-700 flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">{t.messages || 'Messages'}</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search guests..." 
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg py-2 pl-10 text-sm outline-none focus:border-primary-300 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.map(session => (
                        <div 
                            key={session.id}
                            onClick={() => handleSelectSession(session.id)}
                            className={`p-4 border-b border-slate-50 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${activeSessionId === session.id ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm font-bold ${activeSessionId === session.id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-200'}`}>{session.guestName}</h4>
                                {session.unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{session.unreadCount}</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.lastMessage}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area - Hidden on mobile if no chat active */}
            <div className={`flex-1 flex-col bg-slate-50/50 dark:bg-slate-900/50 ${!activeSessionId ? 'hidden md:flex' : 'flex'}`}>
                {activeSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setActiveSessionId(null)}
                                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-full"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{activeSession.guestName}</h3>
                                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                                    </div>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {activeSession.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                                        msg.sender === 'agent' 
                                        ? 'bg-slate-900 text-white dark:bg-primary-600 rounded-tr-none' 
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm'
                                    }`}>
                                        <p>{msg.text}</p>
                                        <div className={`text-[10px] mt-1 text-right ${msg.sender === 'agent' ? 'text-slate-400 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 safe-area-bottom">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={t.typeMessage || 'Type a message...'}
                                    className="flex-1 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 dark:bg-slate-900 dark:text-white"
                                />
                                <button type="submit" className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageCircle size={48} className="mb-4 opacity-20" />
                        <p>{t.noActiveChats || 'No active chat selected'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveChat;