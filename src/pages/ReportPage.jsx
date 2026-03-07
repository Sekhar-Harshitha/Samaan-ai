import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { FileCode, Download, CheckCircle, Database } from 'lucide-react';

const ReportPage = () => {
    return (
        <PageWrapper>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3.5rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Audit <span className="gradient-text">Manifest</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>CERTIFICATION: REGULATORY_COMPLIANCE_COMPLETE</p>
            </div>

            <div className="glass-panel" style={{ padding: '5rem', textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
                {/* Hologram Effect */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2.5rem',
                        border: '1px solid #10b981',
                        boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
                    }}>
                        <CheckCircle size={50} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '2rem', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>SYSTEM_VALIDATED</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 3rem', fontSize: '0.9rem' }}>
                        Final verification protocol successful. The model adheres to demographic parity standards for global deployment.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <button className="btn-command" style={{ background: 'var(--accent-primary)', color: 'var(--bg-color)', border: 'none' }}>
                            EXPORT_MANIFEST <Download size={18} style={{ marginLeft: '10px' }} />
                        </button>
                        <button className="btn-command">
                            VIEW_JSON_TRACE
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--accent-primary)' }}>
                        <Database size={24} color="var(--accent-primary)" />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>BLOCKCHAIN_AUDIT_TRAIL</h4>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>HASH: 0x92f...A9B2</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--accent-secondary)' }}>
                        <FileCode size={24} color="var(--accent-secondary)" />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>REGULATORY_DISCLOSURE</h4>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>STATUS: READY_FOR_SUBMISSION</p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default ReportPage;
