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
    ScatterChart,
    Scatter,
    ZAxis,
    Cell
} from 'recharts';
import { Info, HelpCircle, AlertTriangle } from 'lucide-react';

const SHAPVisualizationPanel = ({ data }) => {
    if (!data) return null;

    const { top_features = [], top_bias_features = [], shap_summary = [], explanation = "" } = data;

    // Colors for SHAP values (Blue to Red)
    const getShapColor = (value) => {
        return value > 0 ? '#ef4444' : '#3b82f6'; // Red for positive, Blue for negative
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Info className="text-accent" /> SHAP_EXPLAINABILITY_ENGINE
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem' }}>
                        <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }}></div> POSITIVE_IMPACT
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem' }}>
                        <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '2px' }}></div> NEGATIVE_IMPACT
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Global Feature Importance */}
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.1em' }}>GLOBAL_FEATURE_IMPORTANCE</h4>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={top_features} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="feature" type="category" width={100} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--accent-primary)', color: '#fff' }}
                                    itemStyle={{ color: 'var(--accent-primary)' }}
                                />
                                <Bar dataKey="importance" fill="var(--accent-primary)">
                                    {top_features.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.15} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bias Driver Impact */}
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.1em' }}>BIAS_DRIVER_CORRELATION</h4>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={top_bias_features} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="feature" type="category" width={100} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--accent-secondary)', color: '#fff' }}
                                    itemStyle={{ color: 'var(--accent-secondary)' }}
                                />
                                <Bar dataKey="impact" fill="var(--accent-secondary)">
                                    {top_bias_features.map((entry, index) => (
                                        <Cell key={`cell-bias-${index}`} fillOpacity={1 - index * 0.15} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* SHAP Summary Plot Simulation */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>SHAP_SUMMARY_DISTRIBUTION</h4>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                type="number"
                                dataKey="shapValue"
                                name="SHAP Value"
                                tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                                label={{ value: 'Impact on Model Output', position: 'bottom', fill: 'var(--text-secondary)', fontSize: 10 }}
                            />
                            <YAxis
                                type="category"
                                dataKey="feature"
                                name="Feature"
                                width={100}
                                tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                            />
                            <ZAxis type="number" dataKey="featureValue" range={[20, 100]} />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--accent-primary)', color: '#fff' }}
                            />
                            <Scatter data={shap_summary}>
                                {shap_summary.map((entry, index) => (
                                    <Cell key={`cell-summary-${index}`} fill={getShapColor(entry.shapValue)} fillOpacity={0.6} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Reasoning Text */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)', background: 'rgba(0,255,255,0.03)' }}
            >
                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-primary)', fontFamily: 'Inter' }}>
                    <AlertTriangle size={16} className="text-accent" style={{ display: 'inline', marginRight: '10px' }} />
                    {explanation}
                </p>
            </motion.div>
        </div>
    );
};

export default SHAPVisualizationPanel;
