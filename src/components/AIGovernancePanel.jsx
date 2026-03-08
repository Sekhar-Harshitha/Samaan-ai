import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, AlertTriangle, XCircle, Database, Eye, Zap } from 'lucide-react';
import { useBias } from '../context/BiasState';

// eslint-disable-next-line no-unused-vars
const ComplianceItem = ({ label, status, icon: IconComponent, description }) => {
    const isPass = status === 'PASS';
    const isWarning = status === 'WARNING';
    const color = isPass ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444';
    const bgColor = isPass ? 'rgba(16, 185, 129, 0.1)' : isWarning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)';

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem',
            borderRadius: '12px', background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden'
        }}>
            <div style={{
                width: '45px', height: '45px', borderRadius: '10px',
                background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <IconComponent size={22} color={color} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{label}</h4>
                    <span style={{
                        fontSize: '0.6rem', fontWeight: 800, fontFamily: 'JetBrains Mono',
                        padding: '0.2rem 0.5rem', borderRadius: '4px', background: color, color: '#000'
                    }}>
                        {status}
                    </span>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.8 }}>{description}</p>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '3px', height: '100%', background: color }} />
        </div>
    );
};

const AIGovernancePanel = ({ compliance }) => {
    const { generateCertificate } = useBias();
    const [loading, setLoading] = React.useState(false);

    if (!compliance) return null;

    const checks = [
        {
            label: 'Fairness Compliance',
            status: compliance.fairness_check,
            icon: Shield,
            description: 'Model risk score evaluation against regulatory standards.'
        },
        {
            label: 'Dataset Balance',
            status: compliance.dataset_bias,
            icon: Database,
            description: 'Representative distribution across sensitive identity groups.'
        },
        {
            label: 'Transparency Index',
            status: compliance.transparency,
            icon: Eye,
            description: 'Model interpretability and architectural complexity analysis.'
        },
        {
            label: 'Bias Mitigation',
            status: compliance.bias_mitigation_applied,
            icon: Zap,
            description: 'Verification of fairness-aware algorithmic adjustments.'
        }
    ];

    const isTotalPass = compliance.eu_ai_act_compliance === 'PASS';
    const totalColor = isTotalPass ? 'var(--accent-primary)' : compliance.eu_ai_act_compliance === 'WARNING' ? '#f59e0b' : '#ef4444';

    const handleGenerate = async () => {
        setLoading(true);
        const success = await generateCertificate();
        if (success) {
            alert("AI Compliance Certificate Generated Successfully");
        } else {
            alert("Run Bias Analysis before generating certificate.");
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '4px', height: '16px', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                    <h3 style={{ fontSize: '0.9rem', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>AI_GOVERNANCE_PANEL</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: totalColor }}>{compliance.eu_ai_act_compliance} COMPLIANCE</span>
                    {isTotalPass ? <CheckCircle2 size={16} color={totalColor} /> : <AlertTriangle size={16} color={totalColor} />}
                </div>
            </div>

            <div style={{ background: 'rgba(34, 211, 238, 0.05)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                        <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.4rem' }}>EU AI Act Alignment</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Evaluation based on high-risk system requirements including technical transparency, human oversight, and bias prevention.
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {checks.map((check, idx) => (
                    <ComplianceItem key={idx} {...check} />
                ))}
            </div>

            <button
                className="btn-command"
                style={{ width: '100%', padding: '0.75rem', opacity: loading ? 0.5 : 1 }}
                onClick={handleGenerate}
                disabled={loading}
            >
                {loading ? 'GENERATING...' : 'GENERATE_CERTIFICATE'}
            </button>
        </motion.div>
    );
};

export default AIGovernancePanel;
