import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { Activity, ShieldAlert, Crosshair, BarChart3, ArrowRight, ArrowLeft, CheckCircle, RotateCcw, Loader2 } from 'lucide-react';
import AIBiasGrid from '../components/AIBiasGrid';
import AuditFeed from '../components/AuditFeed';
import BiasAlertCard from '../components/BiasAlertCard';
import BiasMap from '../components/BiasMap';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import MitigationSimulator from '../components/MitigationSimulator';
import FairnessCertificate from '../components/FairnessCertificate';
import { useNavigate } from 'react-router-dom';
import { useBias } from '../context/BiasContext';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [stage, setStage] = useState('SCANNING');
    const [fairnessScore, setFairnessScore] = useState(68);
    const { results, metadata, isLoading, error } = useBias();

    // Update fairness score when results arrive
    useEffect(() => {
        if (results) {
            const avgParity = (results.demographic_parity_difference + results.equal_opportunity_difference) / 2;
            const score = Math.round((1 - avgParity) * 100);
            setFairnessScore(score);
            setStage('REVEAL');
        }
    }, [results]);

    // Auto-advance from SCANNING only if not waiting on API
    useEffect(() => {
        if (stage === 'SCANNING' && !isLoading && !results) {
            const timer = setTimeout(() => setStage('REVEAL'), 6000);
            return () => clearTimeout(timer);
        }
    }, [stage, isLoading, results]);

    const handleSimulate = () => {
        setFairnessScore(94);
        setStage('CERTIFICATE');
    };

    const renderStage = () => {
        if (error) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}
                >
                    <div className="glass-panel" style={{ padding: '3rem', border: '1px solid #ef4444' }}>
                        <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
                        <h2 style={{ marginBottom: '1rem', color: '#fff' }}>ANALYSIS_FAILED</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            {error}
                        </p>
                        <button className="btn-command" onClick={() => navigate('/upload')}>
                            <ArrowLeft size={18} /> BACK_TO_INGESTION
                        </button>
                    </div>
                </motion.div>
            );
        }

        switch (stage) {
            case 'SCANNING':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '3rem', alignItems: 'start', minHeight: '60vh' }}
                    >
                        <div style={{ position: 'relative' }}>
                            <AIBiasGrid />
                        </div>
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', fontFamily: 'JetBrains Mono', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                                {isLoading ? 'RUNNING_AI_BIAS_INVESTIGATION...' : 'AI_INVESTIGATION_IN_PROGRESS...'}
                            </h3>
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '8px' }}
                                >
                                    <Loader2 size={16} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--accent-primary)' }}>
                                        COMPUTING FAIRNESS METRICS...
                                    </span>
                                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                                </motion.div>
                            )}
                            <AuditFeed />
                            {results && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    <button className="btn-command" style={{ width: '100%' }} onClick={() => setStage('REVEAL')}>
                                        VIEW_BIAS_REPORT <ArrowRight size={16} />
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );
            case 'REVEAL':
                const maxGap = results ? Math.max(
                    results.demographic_parity_difference,
                    results.equal_opportunity_difference,
                    results.selection_rate_difference
                ) : 0.324;
                const severity = maxGap > 0.3 ? 'CRITICAL' : maxGap > 0.15 ? 'HIGH' : 'LOW';

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}
                    >
                        <BiasAlertCard
                            affectedGroup={metadata ? `Attribute: ${metadata.sensitive_col}` : (results ? "Detected Minority Group" : "Income Strata: Low")}
                            biasGap={results ? `${(maxGap * 100).toFixed(1)}%` : "32.4%"}
                            severity={severity}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center' }}>
                            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1rem' }}>CURRENT_FAIRNESS_SCORE</p>
                                <div className="metric-large">{fairnessScore}</div>
                                <p style={{
                                    color: fairnessScore < 70 ? '#ef4444' : fairnessScore < 90 ? '#f59e0b' : '#10b981',
                                    fontWeight: '700', marginTop: '1rem'
                                }}>
                                    STATUS: {fairnessScore < 70 ? 'FAILED_COMPLIANCE' : fairnessScore < 90 ? 'MARGINAL_RISK' : 'OPTIMAL_FAIRNESS'}
                                </p>
                            </div>
                            <button className="btn-command" onClick={() => setStage('INVESTIGATION')}>
                                START_DEEP_INVESTIGATION <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                );
            case 'INVESTIGATION':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}
                    >
                        <BiasMap />
                        <ExplainabilityPanel />
                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <button className="btn-command" onClick={() => setStage('SIMULATION')}>
                                PROCEED_TO_MITIGATION_LAB <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                );
            case 'SIMULATION':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ maxWidth: '800px', margin: '0 auto' }}
                    >
                        <MitigationSimulator onSimulate={handleSimulate} />
                    </motion.div>
                );
            case 'CERTIFICATE':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <FairnessCertificate />
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                            <button className="btn-command" onClick={() => { setStage('SCANNING'); setFairnessScore(68); }}>
                                RUN_NEW_INVESTIGATION <RotateCcw size={18} />
                            </button>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <PageWrapper>
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '3.5rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Bias <span className="gradient-text">Lab</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
                        STATION: DELTA-9 // STAGE: {stage}{isLoading ? ' // STATUS: ANALYZING...' : ''}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {['SCANNING', 'REVEAL', 'INVESTIGATION', 'SIMULATION', 'CERTIFICATE'].map((s) => (
                        <div
                            key={s}
                            style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: stage === s ? 'var(--accent-primary)' : 'var(--border-color)',
                                boxShadow: stage === s ? '0 0 10px var(--accent-primary)' : 'none',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <div key={stage}>
                    {renderStage()}
                </div>
            </AnimatePresence>
        </PageWrapper>
    );
};

export default DashboardPage;
