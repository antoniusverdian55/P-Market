'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { mockConversations, mockChatMessages, mockNews, mockSentimentData, mockWorkspaces } from '@/data/mockData';
import {
    Plus, Send, Mic, Sparkles, MessageSquare,
    Newspaper, TrendingUp, TrendingDown, Minus,
    ArrowUpRight, ArrowDownRight, X, Layers,
} from 'lucide-react';
import clsx from 'clsx';

const sentimentIcon = { up: ArrowUpRight, down: ArrowDownRight, stable: Minus };
const sentimentColor = {
    Bullish: 'text-[var(--color-profit)]',
    Bearish: 'text-[var(--color-loss)]',
    Neutral: 'text-[var(--color-muted)]',
};

export default function ResearchPage() {
    const { chatMode, setChatMode, isAiTyping, setIsAiTyping } = useAppStore();

    const [conversations] = useState(mockConversations);
    const [activeConvId, setActiveConvId] = useState('conv-1');
    const [messages, setMessages] = useState(mockChatMessages);
    const [inputValue, setInputValue] = useState('');
    const [showNews, setShowNews] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAiTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const userMessage = {
            id: `msg-${Date.now()}`,
            role: 'user' as const,
            content: inputValue.trim(),
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsAiTyping(true);

        setTimeout(() => {
            const aiResponse = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant' as const,
                content:
                    "Based on the current market structure and your portfolio composition, here's my analysis:\n\n### Technical Overview\n\nThe broader market is showing signs of **bullish continuation** after consolidating near the previous swing high. Key observations:\n\n1. **Volume Profile** suggests institutional accumulation in the $500-$510 range for VOO\n2. **Moving Averages** — The 20 EMA has crossed above the 50 EMA on the daily timeframe, confirming short-term bullish momentum\n3. **RSI** is currently at 62, showing room for further upside before reaching overbought territory\n\n> 💡 Given your current portfolio beta of 1.12, any broad market rally should amplify your returns. However, your NVDA concentration (31.8% of portfolio) remains elevated risk.",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsAiTyping(false);
        }, 2500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] w-full">
            {/* Conversation Sidebar */}
            <aside className="w-[260px] h-full overflow-y-auto border-r border-[var(--color-border)] p-4 flex flex-col flex-shrink-0">
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-muted)] hover:border-[var(--color-border-focus)] hover:text-[var(--color-foreground)] transition-all duration-200 mb-4">
                    <Plus size={16} />
                    New Conversation
                </button>

                <div className="flex flex-col gap-1 flex-1">
                    {conversations.map((conv) => (
                        <button key={conv.id} onClick={() => setActiveConvId(conv.id)}
                            className={clsx('text-left p-3 rounded-lg transition-all duration-150 group',
                                activeConvId === conv.id ? 'bg-[var(--color-border)]/50 border border-[var(--color-border)]' : 'hover:bg-[var(--color-card)]')}>
                            <div className="flex items-start gap-2">
                                <MessageSquare size={14} className={clsx('mt-0.5 flex-shrink-0', activeConvId === conv.id ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted-dark)]')} />
                                <div className="min-w-0">
                                    <p className={clsx('text-sm font-medium truncate', activeConvId === conv.id ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)]')}>{conv.title}</p>
                                    <p className="text-xs text-[var(--color-muted-dark)] truncate mt-0.5">{conv.lastMessage}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Sentiment Summary at bottom */}
                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-muted-dark)] uppercase tracking-wider mb-3">Market Sentiment</p>
                    <div className="flex flex-col gap-2">
                        {mockSentimentData.map((s) => {
                            const TrendIcon = sentimentIcon[s.trending];
                            return (
                                <div key={s.ticker} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--color-foreground)]">{s.ticker}</span>
                                    <div className="flex items-center gap-1.5">
                                        <TrendIcon size={12} className={sentimentColor[s.label]} />
                                        <span className={clsx('text-xs font-[family-name:var(--font-jetbrains-mono)]', sentimentColor[s.label])}>
                                            {s.label}
                                        </span>
                                        <div className="w-8 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden ml-1">
                                            <div
                                                className={clsx('h-full rounded-full', s.score > 0 ? 'bg-[var(--color-profit)]' : s.score < 0 ? 'bg-[var(--color-loss)]' : 'bg-[var(--color-muted)]')}
                                                style={{ width: `${Math.abs(s.score) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* Chat Main */}
            <section className="flex-1 h-full flex flex-col">
                {/* Workspace Tabs */}
                <div className="flex items-center gap-0 border-b border-[var(--color-border)] bg-[var(--color-card)] overflow-x-auto">
                    {mockWorkspaces.map((ws) => (
                        <button key={ws.id}
                            className={clsx('flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-r border-[var(--color-border)] transition-colors min-w-max',
                                ws.id === 'ws-1' ? 'text-[var(--color-foreground)] bg-[var(--color-background)]' : 'text-[var(--color-muted-dark)] hover:text-[var(--color-muted)] hover:bg-[var(--color-card-hover)]')}>
                            <Layers size={12} />
                            {ws.title}
                            <X size={12} className="text-[var(--color-muted-dark)] hover:text-[var(--color-loss)] transition-colors ml-1" />
                        </button>
                    ))}
                    <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-[var(--color-muted-dark)] hover:text-[var(--color-foreground)] transition-colors">
                        <Plus size={12} /> New
                    </button>
                </div>

                {/* Mode Toggle + News Toggle */}
                <div className="flex items-center justify-between py-3 px-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-1">
                        <button onClick={() => setChatMode('simple')}
                            className={clsx('px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                                chatMode === 'simple' ? 'bg-[var(--color-border)] text-[var(--color-foreground)]' : 'text-[var(--color-muted-dark)] hover:text-[var(--color-muted)]')}>
                            Simple
                        </button>
                        <button onClick={() => setChatMode('advanced')}
                            className={clsx('px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5',
                                chatMode === 'advanced' ? 'bg-[var(--color-border)] text-[var(--color-foreground)]' : 'text-[var(--color-muted-dark)] hover:text-[var(--color-muted)]')}>
                            <Sparkles size={12} /> Advanced
                        </button>
                    </div>
                    <button onClick={() => setShowNews(!showNews)}
                        className={clsx('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
                            showNews ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]')}>
                        <Newspaper size={14} /> News Feed
                    </button>
                </div>

                {/* Messages + News Split */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Chat Messages */}
                    <div className={clsx('flex-1 overflow-y-auto px-8 py-6', showNews && 'border-r border-[var(--color-border)]')}>
                        <div className="max-w-3xl mx-auto flex flex-col gap-6">
                            {messages.map((msg) => (
                                <div key={msg.id} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div className={clsx('max-w-[85%] rounded-2xl px-5 py-3.5',
                                        msg.role === 'user' ? 'bg-[var(--color-border)] text-[var(--color-foreground)] rounded-br-md' : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[#D4D4D8] rounded-bl-md')}>
                                        {msg.role === 'assistant' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles size={12} className="text-[var(--color-gold)]" />
                                                <span className="text-xs text-[var(--color-muted-dark)] font-medium">GLM-4</span>
                                            </div>
                                        )}
                                        <div className="text-sm leading-relaxed whitespace-pre-line">
                                            {msg.content.split('\n').map((line, i) => {
                                                if (line.startsWith('### '))
                                                    return <h3 key={i} className="text-base font-semibold text-[var(--color-foreground)] mt-3 mb-2">{line.replace('### ', '')}</h3>;
                                                if (line.startsWith('> '))
                                                    return <blockquote key={i} className="border-l-2 border-[var(--color-gold)] pl-3 py-1 my-2 text-[var(--color-muted)] italic">{line.replace('> ', '')}</blockquote>;
                                                if (line.match(/^\d+\.\s/))
                                                    return <p key={i} className="ml-4 my-1">{line.split(/(\*\*[^*]+\*\*)/).map((part, j) => part.startsWith('**') && part.endsWith('**') ? <strong key={j} className="text-[var(--color-foreground)] font-semibold">{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>)}</p>;
                                                if (line.startsWith('- '))
                                                    return <p key={i} className="ml-4 my-1">• {line.replace('- ', '')}</p>;
                                                return <p key={i} className={line === '' ? 'h-2' : 'my-0.5'}>{line.split(/(\*\*[^*]+\*\*)/).map((part, j) => part.startsWith('**') && part.endsWith('**') ? <strong key={j} className="text-[var(--color-foreground)] font-semibold">{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>)}</p>;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isAiTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl rounded-bl-md px-5 py-3.5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles size={12} className="text-[var(--color-gold)]" />
                                            <span className="text-xs text-[var(--color-muted-dark)] font-medium">GLM-4 is analyzing...</span>
                                        </div>
                                        <div className="dot-loading"><span /><span /><span /></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* News Panel (collapsible) */}
                    {showNews && (
                        <aside className="w-[340px] h-full overflow-y-auto p-4 flex-shrink-0">
                            <div className="flex items-center gap-2 mb-4">
                                <Newspaper size={16} className="text-[var(--color-accent)]" />
                                <h3 className="text-sm font-semibold text-[var(--color-foreground)] uppercase tracking-wider">Latest News</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                {mockNews.map((article) => (
                                    <div key={article.id} className="p-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-border-focus)] transition-colors group cursor-pointer">
                                        <div className="flex items-start gap-2">
                                            <div className={clsx('w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0',
                                                article.sentiment === 'positive' ? 'bg-[var(--color-profit)]' : article.sentiment === 'negative' ? 'bg-[var(--color-loss)]' : 'bg-[var(--color-muted)]')} />
                                            <div>
                                                <p className="text-sm text-[var(--color-foreground)] font-medium leading-snug group-hover:text-[var(--color-accent)] transition-colors">{article.title}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-xs text-[var(--color-muted-dark)]">{article.source}</span>
                                                    <span className="text-xs text-[var(--color-border-focus)]">•</span>
                                                    <span className="text-xs text-[var(--color-muted-dark)]">{new Date(article.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {article.tickers.length > 0 && article.tickers.map((t) => (
                                                        <span key={t} className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-accent)] bg-[var(--color-accent-bg)] px-1.5 py-0.5 rounded">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-[var(--color-border)] p-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-[var(--color-border-focus)] transition-all duration-200">
                            <input ref={inputRef} type="text" value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                                placeholder="Ask about your portfolio, market analysis, or any financial topic..."
                                className="flex-1 bg-transparent text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-dark)] outline-none" />
                            <button className="p-1.5 text-[var(--color-muted-dark)] hover:text-[var(--color-muted)] transition-colors">
                                <Mic size={16} />
                            </button>
                            <button onClick={handleSend} disabled={!inputValue.trim()}
                                className={clsx('p-2 rounded-lg transition-all duration-200',
                                    inputValue.trim() ? 'bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90' : 'bg-[var(--color-border)] text-[var(--color-muted-dark)] cursor-not-allowed')}>
                                <Send size={14} />
                            </button>
                        </div>
                        <p className="text-center text-xs text-[var(--color-muted-dark)] mt-2">
                            Cube Trade uses GLM-4 for analysis. Verify important financial decisions independently.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
