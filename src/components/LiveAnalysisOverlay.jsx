import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, X, ArrowLeft } from 'lucide-react';
import { useBias } from '../context/BiasState';

const LiveAnalysisOverlay = ({ onComplete, onCancel }) => {
    const { progress, isLargeDataset, results, error, analysisMessage } = useBias();

    const [streams] = useState(() =>
        [...Array(15)].map((_, i) => ({
            id: i,
            duration: 1 + Math.random() * 2,
            delay: Math.random() * 2,
            left: Math.random() * 100,
            height: Math.random() * 50 + 20,
        })));

    // Navigate to dashboard when results arrive
    useEffect(() => {
        if (results) {
            const t = setTimeout(onComplete, 800);
            return () => clearTimeout(t);
        }
    }, [results, onComplete]);

    // Safety: auto-navigate after 5 minutes
    useEffect(() => {
        const t = setTimeout(onComplete, 300_000);
        return () => clearTimeout(t);
    }, [onComplete]);

    const label = isLargeDataset
        ? 'OPTIMIZING FOR LARGE DATASET...'
        : (analysisMessage || 'ANALYZING FAIRNESS METRICS...');

    const hasError = !!error;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
                position: 'fixed', top: 0, left: 0,
                width: '100vw', height: '100vh',
                background: 'rgba(5, 7, 13, 0.95)',
                backdropFilter: 'blur(12px)',
                zIndex: 9999,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                color: 'var(--accent-primary)',
                overflow: 'hidden',
            }}
        >
            {/* Cancel button */}
            <button
                onClick={onCancel}
                title="Cancel analysis"
                style={{
                    position: 'absolute', top: '2rem', right: '2rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px', padding: '0.5rem 1rem',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.75rem', fontFamily: 'JetBrains Mono'
                }}
            >
                <X size={14} /> CANCEL
            </button>

            {/* Background data streams */}
            {!hasError && streams.map((s) => (
                <motion.div
                    key={s.id}
                    animate={{ y: ['100vh', '-10vh'], opacity: [0, 0.5, 0] }}
                    transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'linear' }}
                    style={{
                        position: 'absolute', left: `${s.left}vw`, bottom: 0,
                        width: '2px', height: `${s.height}px`,
                        background: 'linear-gradient(to top, transparent, var(--accent-primary))',
                        zIndex: 0,
                    }}
                />
            ))}

            {/* Central icon */}
            <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                <motion.div
                    animate={{ rotate: hasError ? 0 : 360 }}
                    transition={{ duration: 8, repeat: hasError ? 0 : Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute', width: '100%', height: '100%',
                        border: `2px dashed ${hasError ? 'rgba(239,68,68,0.4)' : 'rgba(34,211,238,0.3)'}`,
                        borderRadius: '50%'
                    }}
                />
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', width: '130px', height: '130px',
                        border: `2px solid ${hasError ? 'rgba(239,68,68,0.8)' : 'rgba(34,211,238,0.8)'}`,
                        borderRadius: '50%',
                        boxShadow: `0 0 20px ${hasError ? 'rgba(239,68,68,0.3)' : 'var(--accent-glow)'}`
                    }}
                />
                <motion.div
                    animate={{ rotate: hasError ? 0 : -360 }}
                    transition={{ duration: 10, repeat: hasError ? 0 : Infinity, ease: 'linear' }}
                >
                    <Activity size={45} color={hasError ? '#ef4444' : 'var(--accent-primary)'} />
                </motion.div>
            </div>

            {/* Status text */}
            <div style={{ marginTop: '2.5rem', textAlign: 'center', zIndex: 1, maxWidth: '400px', padding: '0 2rem' }}>
                {hasError ? (
                    <>
                        <h2 style={{ fontSize: '1.1rem', letterSpacing: '0.15em', marginBottom: '1rem', fontFamily: 'JetBrains Mono', color: '#ef4444' }}>
                            CONNECTION_ERROR
                        </h2>
                        <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                            {error}
                        </p>
                        <button
                            onClick={onCancel}
                            className="btn-command"
                            style={{ borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                        >
                            <ArrowLeft size={16} /> GO BACK
                        </button>
                    </>
                ) : (
                    <>
                        <h2 style={{ fontSize: '1.1rem', letterSpacing: '0.2em', marginBottom: '1rem', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>
                            {label}
                        </h2>

                        {/* Progress bar */}
                        <div style={{ width: '320px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', margin: '0 auto' }}>
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{
                                    height: '100%',
                                    background: 'var(--accent-primary)',
                                    boxShadow: '0 0 10px var(--accent-primary)',
                                }}
                            />
                        </div>

                        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
                            {progress}% — {progress < 20 ? 'UPLOADING_FILES' : progress < 80 ? 'COMPUTING_METRICS' : 'FINALIZING_RESULTS'}
                        </p>

                        {progress < 10 && (
                            <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono' }}>
                                Connecting to analysis engine...
                            </p>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default LiveAnalysisOverlay;
