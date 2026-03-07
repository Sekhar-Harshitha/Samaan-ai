import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { Zap, ShieldCheck, Scissors, RefreshCcw, Lock } from 'lucide-react';

const RemediationPage = () => {
    return (
        <PageWrapper>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3.5rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bias <span className="gradient-text">Mitigation</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>SEQUENCE: DEBIASING_ALGORITHM_DEPLOYMENT</p>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.2rem', letterSpacing: '0.1em', marginBottom: '2rem' }}>MITIGATION_ORCHESTRATOR</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {[
                        { n: 'PRE_PROC', i: <Scissors />, desc: 'Weight-balanced re-sampling.', active: false },
                        { n: 'IN_PROC', i: <Zap />, desc: 'Adversarial weight optimization.', active: true },
                        { n: 'POST_PROC', i: <RefreshCcw />, desc: 'Result-parity calibration.', active: false }
                    ].map(algo => (
                        <div
                            key={algo.n}
                            className="glass-panel"
                            style={{
                                padding: '2rem',
                                border: algo.active ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                background: algo.active ? 'rgba(34, 211, 238, 0.05)' : 'rgba(0,0,0,0.2)'
                            }}
                        >
                            <div style={{ color: algo.active ? 'var(--accent-primary)' : 'var(--text-secondary)', marginBottom: '1rem' }}>{algo.i}</div>
                            <h4 style={{ fontSize: '0.85rem', fontFamily: 'JetBrains Mono', marginBottom: '0.5rem' }}>{algo.n}</h4>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{algo.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(34, 211, 238, 0.1)', borderRadius: '0.5rem' }}>
                        <Lock size={24} color="var(--accent-primary)" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', letterSpacing: '0.1em' }}>EXECUTE_MITIGATION_CHAIN</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>ESTIMATED_ACCURACY_STABILITY: 98.2%</p>
                    </div>
                </div>
                <button className="btn-command" style={{ background: 'var(--accent-primary)', color: 'var(--bg-color)' }}>
                    DEPLOY_FIX <ShieldCheck size={18} style={{ marginLeft: '10px' }} />
                </button>
            </div>
        </PageWrapper>
    );
};

export default RemediationPage;
