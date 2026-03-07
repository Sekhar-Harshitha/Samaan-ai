import React, { useState } from 'react';
import { Play, UploadCloud, Activity, Zap, ShieldCheck } from 'lucide-react';
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
        if (!files.model || !files.dataset) {
            setError('Both model (.pkl) and dataset (.csv) are required.');
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
            const response = await fetch('http://localhost:8000/mitigate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message || 'Mitigation failed.');
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!results) return [];
        return [
            {
                metric: 'Accuracy',
                Before: results.before_mitigation.accuracy,
                After: results.after_mitigation.accuracy,
            },
            {
                metric: 'Fairness Score',
                Before: results.before_mitigation.fairness_score,
                After: results.after_mitigation.fairness_score,
            },
            {
                metric: 'Demographic Parity Diff',
                Before: results.before_mitigation.demographic_parity_difference,
                After: results.after_mitigation.demographic_parity_difference,
            },
            {
                metric: 'Equal Opportunity Diff',
                Before: results.before_mitigation.equal_opportunity_difference,
                After: results.after_mitigation.equal_opportunity_difference,
            }
        ];
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

                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>APPLIED_STRATEGY: </span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{results.recommended_strategy}</span>
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
                                    <span>Accuracy:</span> <strong>{results.before_mitigation.accuracy}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Fairness Score:</span> <strong>{results.before_mitigation.fairness_score}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>DPD:</span> <strong className="text-error">{results.before_mitigation.demographic_parity_difference}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>EOD:</span> <strong className="text-error">{results.before_mitigation.equal_opportunity_difference}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="metric-card" style={{ border: '1px solid var(--accent-primary)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>AFTER_MITIGATION</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Accuracy:</span> <strong>{results.after_mitigation.accuracy}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Fairness Score:</span> <strong className="text-accent">{results.after_mitigation.fairness_score}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>DPD:</span> <strong className="text-accent">{results.after_mitigation.demographic_parity_difference}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>EOD:</span> <strong className="text-accent">{results.after_mitigation.equal_opportunity_difference}</strong>
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
