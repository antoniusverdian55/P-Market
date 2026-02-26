'use client';

import { useState, useEffect } from 'react';
import { mockBrief, mockAIInsights } from '@/data/mockData';
import {
    Sparkles, TrendingUp, AlertTriangle, Target, ShieldAlert,
    ChevronRight, Zap,
} from 'lucide-react';
import clsx from 'clsx';

const insightIcons: Record<string, typeof Sparkles> = {
    pattern: TrendingUp,
    alert: AlertTriangle,
    opportunity: Target,
    risk: ShieldAlert,
};

const insightColors: Record<string, string> = {
    pattern: 'text-[var(--color-accent)] bg-[var(--color-accent-bg)]',
    alert: 'text-[var(--color-gold)] bg-[var(--color-gold-bg)]',
    opportunity: 'text-[var(--color-profit)] bg-[var(--color-profit-bg)]',
    risk: 'text-[var(--color-loss)] bg-[var(--color-loss-bg)]',
};

export default function BriefPage() {
    const [activeSection, setActiveSection] = useState('summary');
    const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
    const brief = mockBrief;
    const insights = mockAIInsights;

    useEffect(() => {
        const handleScroll = () => {
            const sections = brief.sections.map((s) => ({
                id: s.id,
                el: document.getElementById(`section-${s.id}`),
            }));

            for (const section of sections.reverse()) {
                if (section.el) {
                    const rect = section.el.getBoundingClientRect();
                    if (rect.top <= 200) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        const container = document.getElementById('brief-content');
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [brief.sections]);

    return (
        <div className="flex h-[calc(100vh-64px)] w-full">
            {/* Scrollspy Sidebar */}
            <aside className="w-[200px] h-full border-r border-[var(--color-border)] py-8 px-4 flex-shrink-0">
                <div className="relative">
                    <div className="absolute left-[7px] top-0 bottom-0 w-[1px] bg-[var(--color-border)]" />
                    <div className="flex flex-col gap-1">
                        {brief.sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setActiveSection(section.id);
                                    document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={clsx(
                                    'flex items-center gap-3 text-left text-sm py-2 pl-0 pr-2 transition-colors duration-200 relative',
                                    activeSection === section.id ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted-dark)] hover:text-[var(--color-muted)]'
                                )}
                            >
                                <span className={clsx(
                                    'w-[15px] h-[15px] rounded-full border-2 flex-shrink-0 transition-all duration-200 z-10',
                                    activeSection === section.id
                                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                                        : 'border-[var(--color-border-focus)] bg-[var(--color-background)]'
                                )} />
                                <span className="truncate">{section.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Article Content */}
            <section id="brief-content" className="flex-1 h-full overflow-y-auto">
                <div className="max-w-3xl mx-auto py-12 px-8">
                    {/* AI Insights Panel */}
                    <div className="mb-10 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={16} className="text-[var(--color-gold)]" />
                            <h3 className="text-sm font-semibold text-[var(--color-foreground)] uppercase tracking-wider">AI Insights</h3>
                            <span className="text-xs text-[var(--color-muted-dark)] bg-[var(--color-border)] px-2 py-0.5 rounded-full ml-auto">{insights.length}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {insights.map((insight) => {
                                const Icon = insightIcons[insight.type] || Zap;
                                const isExpanded = expandedInsight === insight.id;
                                return (
                                    <button
                                        key={insight.id}
                                        onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                                        className="text-left w-full"
                                    >
                                        <div className={clsx(
                                            'flex items-start gap-3 p-3 rounded-lg transition-all duration-200',
                                            isExpanded ? 'bg-[var(--color-card-hover)]' : 'hover:bg-[var(--color-card-hover)]'
                                        )}>
                                            <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', insightColors[insight.type])}>
                                                <Icon size={14} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-[var(--color-foreground)] truncate">{insight.title}</p>
                                                    {insight.ticker && (
                                                        <span className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[var(--color-accent)] bg-[var(--color-accent-bg)] px-1.5 py-0.5 rounded flex-shrink-0">
                                                            {insight.ticker}
                                                        </span>
                                                    )}
                                                    <ChevronRight size={14} className={clsx(
                                                        'text-[var(--color-muted-dark)] flex-shrink-0 transition-transform duration-200 ml-auto',
                                                        isExpanded && 'rotate-90'
                                                    )} />
                                                </div>
                                                {isExpanded && (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-[var(--color-muted)] leading-relaxed">{insight.description}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-xs text-[var(--color-muted-dark)]">
                                                                Confidence: {(insight.confidence * 100).toFixed(0)}%
                                                            </span>
                                                            <div className="w-16 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                                                                <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: `${insight.confidence * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Header Meta */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-sm text-[var(--color-muted)] font-sans tracking-wide">{brief.timeOfDay}</span>
                        <span className="text-[var(--color-border-focus)]">•</span>
                        <span className="text-sm text-[var(--color-muted-dark)] font-sans tracking-wide">{brief.readTime}</span>
                        <span className="text-[var(--color-border-focus)]">•</span>
                        <span className="text-sm text-[var(--color-muted-dark)] font-sans tracking-wide">{brief.date}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-[family-name:var(--font-playfair-display)] text-[var(--color-foreground)] font-medium tracking-tight mb-4 leading-tight">{brief.title}</h1>

                    {/* Subtitle */}
                    <p className="text-lg text-[var(--color-muted)] font-[family-name:var(--font-playfair-display)] mb-10 leading-relaxed">{brief.subtitle}</p>

                    <div className="h-[1px] bg-[var(--color-border)] mb-10" />

                    {/* Sections */}
                    {brief.sections.map((section, idx) => (
                        <div key={section.id} id={`section-${section.id}`} className="mb-12">
                            {idx > 0 && (
                                <h2 className="text-2xl font-[family-name:var(--font-playfair-display)] text-[var(--color-foreground)] font-medium mb-6 tracking-tight">{section.title}</h2>
                            )}
                            <div className={clsx(
                                'text-lg font-[family-name:var(--font-playfair-display)] text-[#D4D4D8] leading-[1.85] whitespace-pre-line',
                                idx === 0 && 'drop-cap'
                            )}>
                                {section.content.split('\n\n').map((paragraph, pIdx) => (
                                    <p key={pIdx} className="mb-6">
                                        {paragraph.split(/(\*\*[^*]+\*\*)/).map((part, partIdx) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={partIdx} className="text-[var(--color-foreground)] font-semibold">{part.slice(2, -2)}</strong>;
                                            }
                                            return <span key={partIdx}>{part}</span>;
                                        })}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="h-[1px] bg-[var(--color-border)] my-12" />
                    <p className="text-sm text-[var(--color-muted-dark)] text-center mb-12 font-[family-name:var(--font-playfair-display)] italic">
                        Analysis generated by Cube Trade Intelligence Engine — powered by GLM-4
                    </p>
                </div>
            </section>
        </div>
    );
}
