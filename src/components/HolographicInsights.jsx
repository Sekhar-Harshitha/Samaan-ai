import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

const HolographicInsights = ({ insights }) => {
    // Determine icon and color based on insight type or default to Zap
    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={14} className="text-error" />;
            case 'success': return <ShieldCheck size={14} className="text-accent" />;
            case 'info': return <Cpu size={14} className="text-primary" />;
            default: return <Zap size={14} className="text-accent" />;
        }
    };

    return (
        <motion.div
            className="holographic-insights-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
                position: 'fixed',
                top: '5rem',
                right: '2rem',
                width: '320px',
                background: 'rgba(1, 4, 9, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--accent-primary)',
                borderRadius: '12px',
                boxShadow: '0 0 25px rgba(34, 211, 238, 0.15)',
                padding: '1.5rem',
                zIndex: 100,
                overflow: 'hidden'
            }}
        >
            {/* Holographic Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '200%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.05), transparent)',
                animation: 'holo-sweep 4s infinite linear'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                <div className="ai-pulse-container" style={{ transform: 'scale(0.8)' }}>
                    <div className="ai-pulse-ring"></div>
                    <div className="ai-pulse-dot"></div>
                </div>
                <h3 style={{ fontSize: '0.9rem', color: '#fff', letterSpacing: '0.1em', margin: 0 }}>AI INSIGHTS</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                    {insights.map((insight, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.2 + 0.5, duration: 0.5 }}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '1rem',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'flex-start',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ marginTop: '2px' }}>
                                {getIcon(insight.type)}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                                {insight.text}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <style jsx>{`
                @keyframes holo-sweep {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
                .holographic-insights-panel {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </motion.div>
    );
};

export default HolographicInsights;
