import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { Database, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const DatasetAuditPanel = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>AUDITING_DATASET_DISTRIBUTIONS...</p>
            </div>
        );
    }

    if (!data) return null;

    const { dataset_bias = {}, risk_level = "LOW", total_rows = 0, attribute_count = 0 } = data;

    const COLORS = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0000', '#0000ff'];

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Database className="text-accent" /> DATASET_BIAS_SCANNER
                </h3>
                <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    background: risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : risk_level === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: risk_level === 'HIGH' ? '#ef4444' : risk_level === 'MEDIUM' ? '#f59e0b' : '#10b981',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    border: `1px solid ${risk_level === 'HIGH' ? '#ef4444' : risk_level === 'MEDIUM' ? '#f59e0b' : '#10b981'}`
                }}>
                    RISK_LEVEL: {risk_level}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {Object.entries(dataset_bias).map(([attr, stats], idx) => {
                    const chartData = Object.entries(stats)
                        .filter(([key]) => key !== 'imbalance_score')
                        .map(([name, value]) => ({ name, value }));

                    const isHighImbalance = stats.imbalance_score > 30;

                    return (
                        <motion.div
                            key={attr}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-panel"
                            style={{
                                padding: '1.5rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: isHighImbalance ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{attr}</h4>
                                {isHighImbalance && <AlertTriangle size={14} color="#ef4444" />}
                            </div>

                            <div style={{ height: '180px', marginBottom: '1rem' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--accent-primary)', color: '#fff', fontSize: '10px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>IMBALANCE_SCORE</span>
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    color: isHighImbalance ? '#ef4444' : 'var(--text-primary)'
                                }}>
                                    {stats.imbalance_score}%
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Info size={16} className="text-accent" />
                <span>
                    Analyzed <strong>{total_rows}</strong> records across <strong>{attribute_count}</strong> features.
                    Imbalance scores exceeding 30% are flagged as high risk for training proxy bias.
                </span>
            </div>
        </div>
    );
};

export default DatasetAuditPanel;
