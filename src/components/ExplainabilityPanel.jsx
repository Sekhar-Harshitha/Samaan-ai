import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { useBias } from '../context/BiasContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div style={{ background: 'rgba(0,0,0,0.85)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
                <p style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>FEATURE: {label}</p>
                <p style={{ color: 'var(--accent-primary)' }}>IMPORTANCE: {data.value.toFixed(4)}</p>
                {data.isDriver && <p style={{ color: '#c026d3', marginTop: '5px' }}>⚠️ IDENTIFIED AS BIAS DRIVER</p>}
            </div>
        );
    }
    return null;
};

const ExplainabilityPanel = () => {
    const { explainResults, isExplainLoading, explainError } = useBias();

    const chartData = useMemo(() => {
        if (!explainResults || !explainResults.top_features) return [];
        // Recharts renders from bottom to top for YAxis type="category", 
        // but we want the highest importance at the top, so we reverse the array.
        return [...explainResults.top_features].reverse().map(f => ({
            name: f.feature,
            value: f.importance,
            isDriver: explainResults.bias_drivers.includes(f.feature)
        }));
    }, [explainResults]);

    if (isExplainLoading) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <Loader2 size={32} color="var(--accent-primary)" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
                <p style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-primary)', fontSize: '0.8rem' }}>COMPUTING_EXPLANATIONS...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (explainError) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', border: '1px solid #ef4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#ef4444' }}>
                    <AlertTriangle size={24} />
                    <h3 style={{ fontFamily: 'JetBrains Mono', fontSize: '1rem' }}>EXPLAINABILITY_ENGINE_ERROR</h3>
                </div>
                <p style={{ color: '#fca5a5', fontSize: '0.85rem' }}>{explainError}</p>
            </div>
        );
    }

    if (!explainResults) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>AWAITING_ANALYSIS_DATA</p>
            </div>
        );
    }

    const { bias_drivers, explanation } = explainResults;


    return (
        <motion.div
            className="glass-panel"
            style={{ padding: '2rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BarChart3 size={20} color="#c026d3" /> {/* Purple accent for explainability */}
                    <h3 style={{ fontSize: '1rem', color: '#fff', fontFamily: 'JetBrains Mono' }}>AI_REASONING_ENGINE</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>
                    <Info size={14} />
                    <span>FEATURE_INFLUENCE_MAP</span>
                </div>
            </div>

            {/* Feature Importance Chart */}
            <div style={{ height: '280px', width: '100%', marginBottom: '1.5rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'Space Grotesk' }}
                            width={100}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={1500}>
                            {
                                chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.isDriver ? '#c026d3' : 'var(--accent-primary)'} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Bias Driver Highlight Tags */}
            {bias_drivers.length > 0 && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', marginRight: '0.5rem' }}>DETECTED_DRIVERS:</span>
                    {bias_drivers.map(driver => (
                        <span key={driver} style={{
                            background: 'rgba(192, 38, 211, 0.15)',
                            color: '#e879f9',
                            border: '1px solid rgba(192, 38, 211, 0.4)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontFamily: 'JetBrains Mono',
                            boxShadow: '0 0 10px rgba(192, 38, 211, 0.2)'
                        }}>
                            {driver}
                        </span>
                    ))}
                </div>
            )}

            {/* Explanation Text Panel */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{
                    padding: '1.25rem',
                    border: '1px dashed rgba(192, 38, 211, 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    borderLeft: '4px solid #c026d3'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <Info size={18} color="#c026d3" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6', fontFamily: 'Space Grotesk' }}>
                        <span style={{ color: '#c026d3', fontWeight: '700', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', marginRight: '8px' }}>SYSTEM_ANALYSIS:</span>
                        {explanation}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ExplainabilityPanel;
