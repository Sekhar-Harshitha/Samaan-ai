import React from 'react';
import { motion } from 'framer-motion';
import { Download, ShieldCheck, Award, CheckCircle } from 'lucide-react';
import { useBias } from '../context/BiasState';

const FairnessCertificate = ({ modelName = "Credit_Risk_Model_v4", date = new Date().toLocaleDateString() }) => {
    const { generateCertificate } = useBias();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{
                padding: '4rem',
                border: '2px double var(--accent-primary)',
                textAlign: 'center',
                background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.05), transparent)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Decorative background watermark */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, zIndex: 0 }}>
                <ShieldCheck size={400} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ color: 'var(--accent-primary)', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <Award size={80} />
                    </motion.div>
                </div>

                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '0.1em' }}>FAIRNESS_CERTIFICATE</h2>
                <p style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.3em', marginBottom: '3rem' }}>AI_GOVERNANCE_COMPLIANCE_VERIFIED</p>

                <div style={{ margin: '3rem 0', padding: '2rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        This is to certify that <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{modelName}</span> has undergone
                        rigorous bias investigation and mitigation.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>MODEL_PARITY</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>98.2%</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>MITIGATION_METHOD</p>
                            <p style={{ fontSize: '1rem', fontWeight: '700' }}>EQ_ODDS_OPTIMIZED</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>VERIFIED_ON</p>
                            <p style={{ fontSize: '1rem', fontWeight: '700' }}>{date}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                    <button
                        className="btn-command"
                        style={{ padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        onClick={() => generateCertificate()}
                    >
                        DOWNLOAD_PDF <Download size={18} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.8rem' }}>
                        <CheckCircle size={16} />
                        <span>BLOCKCHAIN_VERIFIED_HASH: 0x8f2...e4a</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FairnessCertificate;
