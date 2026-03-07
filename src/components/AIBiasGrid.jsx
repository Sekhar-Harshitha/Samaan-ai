import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Target, Scale, AlertTriangle, GitBranch, CheckCircle, Activity } from 'lucide-react';
import { useBias } from '../context/BiasContext';

// ── Metric card template data (mock values used when no API results) ──────────
const METRIC_TEMPLATES = [
    {
        id: 'demographic_parity',
        title: 'Demographic Parity',
        label: 'DEMOGRAPHIC_PARITY',
        mockScore: 72,
        unit: '%',
        explanation: 'Positive outcome rates across demographic groups.',
        icon: Scale,
        getScore: (results) =>
            results ? Math.round((1 - results.demographic_parity_difference) * 100) : null,
        getStatus: (score) => score >= 80 ? 'NOMINAL' : score >= 65 ? 'WARNING' : 'CRITICAL',
    },
    {
        id: 'equal_opportunity',
        title: 'Equal Opportunity',
        label: 'EQUAL_OPPORTUNITY',
        mockScore: 88,
        unit: '%',
        explanation: 'True positive rate parity across protected classes.',
        icon: ShieldCheck,
        getScore: (results) =>
            results ? Math.round((1 - results.equal_opportunity_difference) * 100) : null,
        getStatus: (score) => score >= 80 ? 'NOMINAL' : score >= 65 ? 'WARNING' : 'CRITICAL',
    },
    {
        id: 'selection_rate_parity',
        title: 'Selection Parity',
        label: 'SELECTION_PARITY',
        mockScore: 61,
        unit: '%',
        explanation: 'Consistency in positive selection rates across attributes.',
        icon: GitBranch,
        getScore: (results) =>
            results ? Math.round((1 - results.selection_rate_difference) * 100) : null,
        getStatus: (score) => score >= 85 ? 'NOMINAL' : score >= 70 ? 'WARNING' : 'CRITICAL',
    },
    {
        id: 'bias_risk_index',
        title: 'Bias Risk Index',
        label: 'BIAS_RISK_INDEX',
        mockScore: 34,
        unit: '',
        explanation: 'Composite risk score derived from multi-axis bias analysis.',
        icon: AlertTriangle,
        getScore: (results) =>
            results
                ? Math.round(
                    ((results.demographic_parity_difference + results.equal_opportunity_difference + results.selection_rate_difference) / 3) * 100
                )
                : null,
        getStatus: (score) => score <= 10 ? 'NOMINAL' : score <= 25 ? 'WARNING' : 'CRITICAL',
    },
    {
        id: 'predictive_consistency',
        title: 'FPR Consistency',
        label: 'FPR_CONSISTENCY',
        mockScore: 83,
        unit: '%',
        explanation: 'False Positive Rate parity across identity categories.',
        icon: Activity,
        getScore: (results) =>
            results
                ? Math.round((1 - results.false_positive_rate_difference) * 100)
                : null,
        getStatus: (score) => score >= 80 ? 'NOMINAL' : score >= 65 ? 'WARNING' : 'CRITICAL',
    },
];

const STATUS_CONFIG = {
    NOMINAL: { color: '#10b981', glow: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.5)' },
    WARNING: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', border: 'rgba(245, 158, 11, 0.5)' },
    CRITICAL: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)' },
};

// ── Animated counter ──────────────────────────────────────────────────────────
const AnimatedScore = ({ target, unit, color, delay = 0 }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        setCurrent(0);
        let startTime = null;
        const duration = 1400;
        let raf;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.round(eased * target));
            if (progress < 1) raf = requestAnimationFrame(step);
        };

        const id = setTimeout(() => { raf = requestAnimationFrame(step); }, delay * 1000);
        return () => { clearTimeout(id); cancelAnimationFrame(raf); };
    }, [target, delay]);

    return (
        <span style={{
            color, fontFamily: 'JetBrains Mono', fontWeight: 900, fontSize: '2.4rem',
            lineHeight: 1, textShadow: `0 0 20px ${color}`,
        }}>
            {current}{unit}
        </span>
    );
};

// ── Skeleton pulse card ───────────────────────────────────────────────────────
const SkeletonCard = ({ index }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.08 }}
        style={{
            background: 'rgba(5, 12, 25, 0.75)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px', padding: '1.4rem 1.5rem',
            backdropFilter: 'blur(16px)',
        }}
    >
        {[{ w: '60%', h: '10px', mb: '0.5rem' }, { w: '40%', h: '34px', mb: '0.75rem' }, { w: '80%', h: '10px', mb: '0.4rem' }, { w: '50%', h: '10px', mb: '0' }]
            .map((s, i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                    style={{
                        width: s.w, height: s.h, marginBottom: s.mb,
                        background: 'rgba(255,255,255,0.07)', borderRadius: '4px',
                    }}
                />
            ))}
    </motion.div>
);

// ── Individual metric card ────────────────────────────────────────────────────
const MetricCard = ({ template, score, index }) => {
    const status = template.getStatus(score);
    const cfg = STATUS_CONFIG[status];
    const Icon = template.icon;

    return (
        <motion.div
            key={`${template.id}-${score}`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
            whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
            style={{
                background: 'rgba(5, 12, 25, 0.75)',
                border: `1px solid ${cfg.border}`,
                borderRadius: '14px', padding: '1.4rem 1.5rem',
                backdropFilter: 'blur(16px)',
                boxShadow: `0 0 24px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                cursor: 'default', position: 'relative', overflow: 'hidden',
            }}
        >
            {/* Top accent bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
                opacity: 0.8,
            }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{
                        fontFamily: 'JetBrains Mono', fontSize: '0.6rem', letterSpacing: '0.12em',
                        color: 'var(--text-secondary)', marginBottom: '0.3rem', opacity: 0.7,
                    }}>{template.label}</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.2 }}>
                        {template.title}
                    </p>
                </div>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'rgba(5,12,25,0.9)',
                    border: `1px solid ${cfg.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 12px ${cfg.glow}`, flexShrink: 0,
                }}>
                    <Icon size={18} color={cfg.color} />
                </div>
            </div>

            {/* Animated score */}
            <AnimatedScore target={score} unit={template.unit} color={cfg.color} delay={index * 0.1 + 0.2} />

            {/* Explanation */}
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, opacity: 0.75 }}>
                {template.explanation}
            </p>

            {/* Status badge */}
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', alignSelf: 'flex-start',
                padding: '0.3rem 0.75rem', borderRadius: '999px',
                background: cfg.glow, border: `1px solid ${cfg.border}`,
            }}>
                <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: cfg.color, boxShadow: `0 0 6px ${cfg.color}`,
                }} />
                <span style={{
                    fontFamily: 'JetBrains Mono', fontSize: '0.6rem',
                    color: cfg.color, fontWeight: 700, letterSpacing: '0.1em',
                }}>{status}</span>
            </div>
        </motion.div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AIBiasGrid = () => {
    const { results, isLoading } = useBias();

    // Derive scores for each metric
    const scores = METRIC_TEMPLATES.map((t) => {
        const apiScore = t.getScore(results);
        return apiScore !== null ? apiScore : t.mockScore;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}
            >
                <div style={{ width: '30px', height: '1px', background: 'var(--accent-primary)' }} />
                <span style={{
                    fontFamily: 'JetBrains Mono', fontSize: '0.7rem',
                    color: 'var(--accent-primary)', letterSpacing: '0.25em', fontWeight: 800,
                }}>
                    AI_BIAS_ANALYSIS_GRID
                </span>
                <motion.div
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)',
                    }}
                />
                {results && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.25rem 0.75rem', borderRadius: '999px',
                            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                        }}
                    >
                        <CheckCircle size={12} color="#10b981" />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#10b981', fontWeight: 700 }}>
                            LIVE_DATA
                        </span>
                    </motion.div>
                )}
            </motion.div>

            {/* Accuracy banner — only shown when real results exist */}
            <AnimatePresence>
                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '0.75rem 1.25rem', borderRadius: '10px',
                            background: 'rgba(0, 212, 255, 0.08)',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                        }}
                    >
                        <Activity size={16} color="var(--accent-primary)" />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            MODEL_ACCURACY
                        </span>
                        <span style={{
                            fontFamily: 'JetBrains Mono', fontWeight: 900, fontSize: '1.1rem',
                            color: 'var(--accent-primary)', textShadow: '0 0 12px var(--accent-primary)',
                        }}>
                            {Math.round(results.accuracy * 100)}%
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: 'var(--text-secondary)', marginLeft: 'auto', opacity: 0.6 }}>
                            DP_DIFF: {results.demographic_parity_difference.toFixed(4)} &nbsp;|&nbsp;
                            EO_DIFF: {results.equal_opportunity_difference.toFixed(4)}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid of metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
                {isLoading
                    ? METRIC_TEMPLATES.slice(0, 4).map((_, i) => <SkeletonCard key={i} index={i} />)
                    : METRIC_TEMPLATES.slice(0, 4).map((t, i) => (
                        <MetricCard key={t.id} template={t} score={scores[i]} index={i} />
                    ))}

                {/* 5th card centred full-width */}
                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '50%' }}>
                        {isLoading
                            ? <SkeletonCard index={4} />
                            : <MetricCard template={METRIC_TEMPLATES[4]} score={scores[4]} index={4} />
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIBiasGrid;
