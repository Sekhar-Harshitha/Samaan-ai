import React from 'react';
import { motion } from 'framer-motion';

const BiasMap = () => {
    const groups = ["Gender", "Income", "Region", "Age"];
    const categories = ["High Risk", "Warning", "Nominal", "Ideal"];

    // Mock data for the heatmap
    const data = [
        [0.4, 0.2, 0.8, 0.9],
        [0.6, 0.3, 0.7, 0.8],
        [0.8, 0.5, 0.9, 0.9],
        [0.9, 0.8, 1.0, 1.0],
    ];

    const getColor = (val) => {
        if (val < 0.4) return "rgba(239, 68, 68, 0.6)"; // Red
        if (val < 0.7) return "rgba(245, 158, 11, 0.6)"; // Amber
        return "rgba(16, 185, 129, 0.6)"; // Green
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontFamily: 'JetBrains Mono' }}>BIAS_INTERSECTIONALITY_MAP</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '30px' }}>
                    {groups.map(g => (
                        <div key={g} style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{g}</div>
                    ))}
                </div>

                <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        {categories.map(c => (
                            <div key={c} style={{ flex: 1, fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'center' }}>{c}</div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: '4px' }}>
                        {data.map((row, i) => (
                            <div key={i} style={{ display: 'flex', gap: '4px' }}>
                                {row.map((val, j) => (
                                    <motion.div
                                        key={`${i}-${j}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: (i * 4 + j) * 0.02 }}
                                        whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                                        style={{
                                            flex: 1,
                                            height: '50px',
                                            background: getColor(val),
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: '700'
                                        }}
                                    >
                                        {(val * 100).toFixed(0)}%
                                    </motion.div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.6)', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '0.65rem' }}>CRITICAL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(245, 158, 11, 0.6)', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '0.65rem' }}>WARNING</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.6)', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '0.65rem' }}>STABLE</span>
                </div>
            </div>
        </div>
    );
};

export default BiasMap;
