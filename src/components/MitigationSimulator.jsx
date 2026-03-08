import React, { useState } from 'react';
import { Play, UploadCloud, Activity, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MitigationSimulator = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const [files, setFiles] = useState({ model: null, dataset: null });
    const [sensitiveCol, setSensitiveCol] = useState('gender');
    const [targetCol, setTargetCol] = useState('income');
    const [technique, setTechnique] = useState('Threshold Adjustment');

    const handleFileChange = (e, type) => {
        setFiles({ ...files, [type]: e.target.files[0] });
    };

    const runMitigation = async () => {
        console.log("[MITIGATION_PROTOCOL] Initializing simulation...");
        console.log(`[VALIDATION] Model loaded: ${!!files.model}, Dataset loaded: ${!!files.dataset}`);
        console.log(`[VALIDATION] Sensitive: ${sensitiveCol}, Target: ${targetCol}`);

        if (!files.model || !files.dataset) {
            console.warn("[VALIDATION_FAILED] Missing required files.");
            setError('Please upload both the model binary (.pkl) and evaluation dataset (.csv) before initiating mitigation.');
            return;
        }

        if (!sensitiveCol || !targetCol) {
            console.warn("[VALIDATION_FAILED] Missing column identifiers.");
            setError('Sensitive attribute and Target variable identifiers are required for protocol execution.');
            return;
        }

        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('model_file', files.model);
        formData.append('dataset_file', files.dataset);
        formData.append('sensitive_col', sensitiveCol);
        formData.append('target_col', targetCol);
        formData.append('technique', technique);

        try {
            console.log(`[API_REQUEST] POST /mitigate // Technique: ${technique}`);
            const response = await fetch('http://localhost:8000/mitigate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP Protocol Error: ${response.status}`);
            }

            const data = await response.json();
            console.log("[API_RESPONSE] Received mitigation metrics:", data);

            if (data.status === 'error') {
                console.error("[MITIGATION_FAILED] Backend reported error:", data.message);
                setError(data.message);
            } else {
                setResults(data);
            }
        } catch (err) {
            console.error("[CRITICAL_FAILURE] Error during mitigation pipeline:", err);
            setError(`MITIGATION_FAILURE_NODE_COMMUNICATION: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!results || results.status === 'error') {
            console.log("[CHART_DATA] Skipping mapping: No valid results available.");
            return [];
        }

        const data = [
            {
                metric: 'Accuracy',
                Before: results.accuracy_before || results.before_mitigation?.accuracy || 0,
                After: results.accuracy_after || results.after_mitigation?.accuracy || 0,
            },
            {
                metric: 'Fairness Score',
                Before: results.fairness_before || results.before_mitigation?.fairness_score || 0,
                After: results.fairness_after || results.after_mitigation?.fairness_score || 0,
            },
            {
                metric: 'Demographic Parity Diff',
                Before: results.dpd_before || results.before_mitigation?.demographic_parity_difference || 0,
                After: results.dpd_after || results.after_mitigation?.demographic_parity_difference || 0,
            },
            {
                metric: 'Equal Opportunity Diff',
                Before: results.eod_before || results.before_mitigation?.equal_opportunity_difference || 0,
                After: results.eod_after || results.after_mitigation?.equal_opportunity_difference || 0,
            }
        ];
        console.log("[CHART_DATA] Mapped visualization data:", data);
        return data;
    };

    return (
        <div className="mitigation-simulator" style={{ marginTop: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap className="text-accent" /> CONFIGURE_SIMULATION
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>MODEL BINARY (.PKL)</label>
                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                            <input type="file" accept=".pkl" onChange={(e) => handleFileChange(e, 'model')} style={{ color: 'var(--text-primary)' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>EVALUATION DATASET (.CSV)</label>
                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                            <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, 'dataset')} style={{ color: 'var(--text-primary)' }} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>SENSITIVE ATTRIBUTE</label>
                        <input
                            type="text"
                            value={sensitiveCol}
                            onChange={(e) => setSensitiveCol(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>TARGET VARIABLE</label>
                        <input
                            type="text"
                            value={targetCol}
                            onChange={(e) => setTargetCol(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>MITIGATION TECHNIQUE</label>
                    <select
                        value={technique}
                        onChange={(e) => setTechnique(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer' }}
                    >
                        <option value="Reweighing">Reweighing (Pre-processing)</option>
                        <option value="Threshold Adjustment">Threshold Adjustment (Post-processing)</option>
                    </select>
                </div>

                {error && <div style={{ color: 'var(--alert-error)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                {results?.auto_detected_sensitive && (
                    <div style={{ color: '#f59e0b', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={14} /> Sensitive attribute not detected. Using automatic detection.
                    </div>
                )}
                {results?.auto_detected_target && (
                    <div style={{ color: '#f59e0b', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={14} /> Target variable not detected. Using automatic detection.
                    </div>
                )}

                <button
                    className="btn-command"
                    onClick={runMitigation}
                    disabled={loading}
                    style={{ width: '100%', padding: '1rem', background: 'var(--accent-primary)', color: 'var(--bg-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                >
                    {loading ? <Activity className="animate-pulse" /> : <Play size={18} />}
                    {loading ? 'SIMULATING_FAIRNESS_CONSTRAINTS...' : 'INITIATE_MITIGATION_PROTOCOL'}
                </button>
            </div>

            {results && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', letterSpacing: '0.1em', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
                        <ShieldCheck /> MITIGATION_RESULTS
                    </h3>

                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(34, 211, 238, 0.05)',
                        borderRadius: '8px',
                        marginBottom: '2rem',
                        border: '1px solid var(--accent-primary)',
                        boxShadow: '0 0 20px rgba(34, 211, 238, 0.15)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                    }}>
                        <div className="ai-pulse-container" style={{ marginTop: '4px' }}>
                            <div className="ai-pulse-ring"></div>
                            <div className="ai-pulse-dot"></div>
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--accent-primary)', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
                                AI_RECOMMENDATION_SYSTEM
                            </span>
                            <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                {results.recommended_strategy}
                            </span>
                        </div>
                    </div>

                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={getChartData()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="metric" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid var(--accent-primary)' }}
                                />
                                <Legend />
                                <Bar dataKey="Before" fill="rgba(255, 68, 68, 0.7)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="After" fill="rgba(34, 211, 238, 0.8)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                        <div className="metric-card">
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>BEFORE_MITIGATION</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Accuracy:</span> <strong>{results.before_mitigation?.accuracy ?? 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Fairness Score:</span> <strong>{results.before_mitigation?.fairness_score ?? 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>DPD:</span> <strong className="text-error">{results.before_mitigation?.demographic_parity_difference ?? 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>EOD:</span> <strong className="text-error">{results.before_mitigation?.equal_opportunity_difference ?? 0}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="metric-card" style={{ border: '1px solid var(--accent-primary)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>AFTER_MITIGATION</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Accuracy:</span> <strong>{results.after_mitigation?.accuracy ?? 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Fairness Score:</span> <strong className="text-accent">{results.after_mitigation?.fairness_score ?? 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>DPD:</span> <strong className="text-accent">{results.after_mitigation?.demographic_parity_difference ?? 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>EOD:</span> <strong className="text-accent">{results.after_mitigation?.equal_opportunity_difference ?? 0}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MitigationSimulator;
