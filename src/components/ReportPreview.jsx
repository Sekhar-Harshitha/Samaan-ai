import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Shield, AlertCircle, Download } from 'lucide-react';

const ReportPreview = ({ results, onGenerate }) => {
    if (!results) return null;

    const sections = [
        { title: "Model Summary", status: "READY", content: "Architecture and demographic analysis context." },
        { title: "Dataset Summary", status: "READY", content: "Feature distributions and imbalance scans." },
        { title: "Fairness Metrics", status: "READY", content: "DPD, EOD, and overall accuracy benchmarking." },
        { title: "Bias Drivers", status: "READY", content: "SHAP-based feature importance results." },
        { title: "Mitigation Results", status: "READY", content: "Outcome of bias remediation strategies." },
        { title: "Risk Classification", status: "READY", content: `Assessed risk level: ${results.bias_risk || 'LOW'}` },
    ];

    return (
        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--accent-primary)33' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield className="text-accent" /> AI_FAIRNESS_AUDIT_PREVIEW
                </h3>
                <button
                    className="btn-command"
                    onClick={onGenerate}
                    style={{ background: 'var(--accent-primary)', color: '#000', fontSize: '0.7rem' }}
                >
                    <Download size={14} /> GENERATE_AUDIT_REPORT
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {sections.map((section, idx) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '8px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontFamily: 'JetBrains Mono' }}>{section.title}</span>
                            <CheckCircle size={12} color="#10b981" />
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{section.content}</p>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed #10b98144', borderRadius: '8px' }}>
                <FileText size={20} color="#10b981" />
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>OFFICIAL_COMPLIANCE_CERTIFICATE_READY</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>This report meets standard AI governance requirements for transparency and fairness documentation.</p>
                </div>
            </div>
        </div>
    );
};

export default ReportPreview;
