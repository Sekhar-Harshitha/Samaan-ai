import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';

const AIRiskMonitor = ({ riskScore, biasRisk, fairnessScore }) => {
    // Gauge data: [value, remaining]
    // 0 is best, 1 is worst.
    const data = [
        { name: 'Risk', value: Math.min(riskScore, 1) },
        { name: 'Safe', value: Math.max(1 - riskScore, 0) },
    ];

    const COLORS = [
        biasRisk === 'LOW' ? '#10b981' : biasRisk === 'MEDIUM' ? '#f59e0b' : '#ef4444',
        'rgba(255, 255, 255, 0.05)'
    ];

    const getStatusText = () => {
        if (biasRisk === 'LOW') return 'OPTIMAL';
        if (biasRisk === 'MEDIUM') return 'MODERATE';
        return 'CRITICAL';
    };

    const Icon = biasRisk === 'LOW' ? ShieldCheck : biasRisk === 'MEDIUM' ? AlertTriangle : AlertCircle;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', alignSelf: 'flex-start' }}>
                <div style={{ width: '4px', height: '16px', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                <h3 style={{ fontSize: '0.9rem', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>AI_RISK_MONITOR</h3>
            </div>

            <div style={{ width: '100%', height: '200px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: COLORS[0], textShadow: `0 0 20px ${COLORS[0]}44` }}>
                        {fairnessScore}%
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>FAIRNESS_INDEX</span>
                </div>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: `${COLORS[0]}11`, border: `1px solid ${COLORS[0]}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Icon size={20} color={COLORS[0]} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>BIAS RISK LEVEL</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: COLORS[0] }}>{biasRisk}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>MODEL FAIRNESS</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{getStatusText()}</p>
                </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, opacity: 0.8 }}>
                {biasRisk === 'LOW'
                    ? "Model exhibits minimal bias across protected attributes. Compliance thresholds satisfied."
                    : biasRisk === 'MEDIUM'
                        ? "Moderate bias detected. Mitigation recommended to ensure equitable outcomes for all groups."
                        : "High bias risk detected. Significant disparity in model predictions requires immediate remediation."}
            </p>
        </motion.div>
    );
};

export default AIRiskMonitor;
