import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, BarChart, HardDrive, FileText, CheckCircle, AlertTriangle, Trophy, Plus, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../lib/api';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import PageWrapper from '../components/PageWrapper';

const ModelComparisonDashboard = () => {
    const [modelFiles, setModelFiles] = useState([]);
    const [datasetFile, setDatasetFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);
    const [error, setError] = useState(null);

    const handleModelChange = (e) => {
        const files = Array.from(e.target.files);
        setModelFiles(prev => [...prev, ...files]);
    };

    const handleDatasetChange = (e) => {
        setDatasetFile(e.target.files[0]);
    };

    const removeModel = (index) => {
        setModelFiles(prev => prev.filter((_, i) => i !== index));
    };

    const runComparison = async () => {
        if (modelFiles.length === 0 || !datasetFile) {
            setError("Please upload at least one model and a dataset.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();
        modelFiles.forEach(file => formData.append('model_files', file));
        formData.append('dataset_file', datasetFile);
        formData.append('sensitive_col', 'gender'); // Defaulting for demo
        formData.append('target_col', 'income');   // Defaulting for demo

        try {
            console.log("DEBUG: Executing comparison for", modelFiles.length, "models");
            const response = await axios.post(`${API}/compare_models`, formData);
            console.log("DEBUG: Comparison Response:", response.data);
            setComparisonData(response.data.models);
        } catch (err) {
            console.error(err);
            setError("Comparison failed. Ensure the backend is running and files are valid.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const bestModel = comparisonData ? [...comparisonData].filter(m => m.status === 'success').sort((a, b) => {
        // Simple heuristic: 0.7 * fairness + 0.3 * accuracy
        const scoreA = 0.7 * a.fairness + 0.3 * a.accuracy;
        const scoreB = 0.7 * b.fairness + 0.3 * b.accuracy;
        return scoreB - scoreA;
    })[0] : null;

    console.log("DEBUG: Current Comparison Data:", comparisonData);
    console.log("DEBUG: Recommended Model:", bestModel);

    return (
        <PageWrapper>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3.5rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Model <span className="gradient-text">Comparison</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
                    MULTI-MODEL SIMULTANEOUS BENCHMARKING // STRESS_TEST_SUITE
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Upload Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <HardDrive size={18} color="var(--accent-primary)" />
                            <h3 style={{ fontSize: '0.9rem', fontFamily: 'JetBrains Mono' }}>MODEL_INGESTION</h3>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="btn-command" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', width: '100%', padding: '0.75rem' }}>
                                <Plus size={16} /> ADD_MODEL (.pkl)
                                <input type="file" multiple accept=".pkl" onChange={handleModelChange} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                            {modelFiles.map((file, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                    <button onClick={() => removeModel(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {modelFiles.length === 0 && <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No models added</p>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <FileText size={18} color="var(--accent-primary)" />
                            <h3 style={{ fontSize: '0.9rem', fontFamily: 'JetBrains Mono' }}>DATA_BENCHMARK</h3>
                        </div>

                        <label className="btn-command" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', width: '100%', padding: '0.75rem', borderStyle: 'dashed' }}>
                            <Upload size={16} /> {datasetFile ? datasetFile.name : 'UPLOAD_DATASET (.csv)'}
                            <input type="file" accept=".csv" onChange={handleDatasetChange} style={{ display: 'none' }} />
                        </label>

                        <button
                            className="btn-command"
                            style={{ width: '100%', marginTop: '2rem', background: 'var(--accent-primary)', color: '#000' }}
                            onClick={runComparison}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> ANALYZING...</> : 'EXECUTE_COMPARISON'}
                        </button>
                    </div>

                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}
                </div>

                {!comparisonData ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                        <BarChart size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>AWAITING_DATA_INPUT...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {/* Accuracy vs Fairness Scatter Plot Area */}
                        <div>
                            <h3 style={{ fontSize: '0.9rem', fontFamily: 'JetBrains Mono', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>ACCURACY_VS_FAIRNESS_MATRIX</h3>
                            <div style={{ width: '100%', height: '400px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
                                {comparisonData.filter(m => m.status === 'success').length < 2 ? (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: '0.8rem', fontFamily: 'JetBrains Mono', textAlign: 'center' }}>
                                        <AlertTriangle size={16} style={{ marginRight: '0.5rem' }} />
                                        UPLOAD AT LEAST TWO MODELS TO RUN A COMPARISON.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis
                                                type="number"
                                                dataKey="accuracy"
                                                name="Accuracy"
                                                unit="%"
                                                domain={[0, 100]}
                                                stroke="var(--text-secondary)"
                                                fontSize={10}
                                                label={{ value: 'Accuracy (%)', position: 'bottom', fill: 'var(--text-secondary)', fontSize: 10 }}
                                            />
                                            <YAxis
                                                type="number"
                                                dataKey="fairness"
                                                name="Fairness"
                                                unit="%"
                                                domain={[0, 100]}
                                                stroke="var(--text-secondary)"
                                                fontSize={10}
                                                label={{ value: 'Fairness Score (%)', angle: -90, position: 'left', fill: 'var(--text-secondary)', fontSize: 10 }}
                                            />
                                            <ZAxis type="category" dataKey="model" name="Model" />
                                            <Tooltip
                                                cursor={{ strokeDasharray: '3 3' }}
                                                contentStyle={{ background: '#05070d', border: '1px solid var(--accent-primary)', fontSize: '12px' }}
                                                itemStyle={{ color: 'var(--accent-primary)' }}
                                                formatter={(value, name) => [value, name]}
                                            />
                                            <Scatter name="Models" data={comparisonData.filter(m => m.status === 'success')} fill="var(--accent-primary)">
                                                {comparisonData.filter(m => m.status === 'success').map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fairness > 80 ? '#10B981' : entry.fairness > 60 ? '#f59e0b' : '#ef4444'} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Best Model Card */}
                        {bestModel && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ padding: '1.5rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid var(--accent-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                            >
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)' }}>
                                    <Trophy size={30} color="var(--accent-primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontFamily: 'JetBrains Mono', fontWeight: 800 }}>RECOMMENDED_MODEL</p>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{bestModel.model}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        Highest weighted balance between Fairness ({bestModel.fairness}%) and Predictive Accuracy ({bestModel.accuracy}%).
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Comparison Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>MODEL_NAME</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>ACCURACY</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>FAIRNESS</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>BIAS_RISK</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonData.map((model, idx) => (
                                        <tr key={idx} style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            background: model.status === 'error' ? 'rgba(239, 68, 68, 0.05)' : (bestModel && model.model === bestModel.model ? 'rgba(56, 189, 248, 0.03)' : 'transparent')
                                        }}>
                                            <td style={{ padding: '1rem', fontWeight: 700 }}>
                                                {model.model}
                                                {model.status === 'error' && (
                                                    <div style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 400, marginTop: '0.25rem' }}>
                                                        {model.error_message}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>{model.status === 'success' ? `${model.accuracy}%` : '--'}</td>
                                            <td style={{ padding: '1rem' }}>{model.status === 'success' ? `${model.fairness}%` : '--'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                {model.status === 'success' ? (
                                                    <span style={{
                                                        color: model.bias_risk === 'LOW' ? '#10b981' : model.bias_risk === 'MEDIUM' ? '#f59e0b' : '#ef4444',
                                                        fontWeight: 700, fontSize: '0.7rem', fontFamily: 'JetBrains Mono'
                                                    }}>
                                                        {model.bias_risk}
                                                    </span>
                                                ) : '--'}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                {model.status === 'success' ? (
                                                    model.fairness > 80 ? <CheckCircle size={16} color="#10b981" /> : <AlertTriangle size={16} color="#f59e0b" />
                                                ) : (
                                                    <X size={16} color="#ef4444" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};

export default ModelComparisonDashboard;
