import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown } from 'lucide-react';

const BiasAlertCard = ({ affectedGroup = "Gender: Female", biasGap = "15.2%", severity = "HIGH" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-panel"
            style={{
                padding: '2rem',
                border: '1px solid #ef4444',
                background: 'rgba(239, 68, 68, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.1)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444' }}>
                <AlertTriangle size={24} />
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.2em' }}>CRITICAL_BIAS_DETECTED</span>
            </div>

            <div style={{ margin: '1rem 0' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>MOST_AFFECTED_DEMOGRAPHIC</p>
                <h3 style={{ fontSize: '2rem', color: '#fff' }}>{affectedGroup}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>PARITY_GAP</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
                        <TrendingDown size={18} />
                        <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{biasGap}</span>
                    </div>
                </div>
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>SEVERITY_LEVEL</p>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '800'
                    }}>
                        {severity}
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: '1.4' }}>
                The model shows significant disparate impact against {affectedGroup.toLowerCase()}.
                Heuristic analysis recommends applying 'Equalized Odds' mitigation.
            </p>
        </motion.div>
    );
};

export default BiasAlertCard;
