import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ShieldCheck, Zap } from 'lucide-react';

const MitigationSimulator = ({ onSimulate }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const methods = [
        { id: 'reweighing', name: 'Reweighing', description: 'Adjusts weights of the training samples to balance representation.', icon: <RotateCcw size={18} /> },
        { id: 'eq_odds', name: 'Equalized Odds', description: 'Ensures equal true positive and false positive rates across groups.', icon: <ShieldCheck size={18} /> },
        { id: 'adversarial', name: 'Adversarial Debiasing', description: 'Uses adversarial networks to minimize model reliance on protected features.', icon: <Zap size={18} /> },
    ];

    const handleSimulate = () => {
        if (!selectedMethod) return;
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
            if (onSimulate) onSimulate(selectedMethod);
        }, 3000);
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.5rem', fontFamily: 'JetBrains Mono' }}>BIAS_MITIGATION_SIMULATOR</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {methods.map((m) => (
                    <motion.div
                        key={m.id}
                        whileHover={{ x: 5 }}
                        onClick={() => setSelectedMethod(m.id)}
                        style={{
                            padding: '1.25rem',
                            background: selectedMethod === m.id ? 'rgba(34, 211, 238, 0.1)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${selectedMethod === m.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '1rem'
                        }}
                    >
                        <div style={{ color: selectedMethod === m.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                            {m.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: selectedMethod === m.id ? 'var(--accent-primary)' : '#fff' }}>{m.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{m.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <button
                className="btn-command"
                onClick={handleSimulate}
                disabled={!selectedMethod || isSimulating}
                style={{ width: '100%', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
            >
                {isSimulating ? (
                    <>RECALCULATING_FAIRNESS<motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity }}>...</motion.span></>
                ) : (
                    <>RUN_BIAS_FIX_SIMULATION <Play size={16} /></>
                )}
            </button>

            <AnimatePresence>
                {isSimulating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(5px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                        }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            style={{ width: '40px', height: '40px', border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}
                        />
                        <p style={{ marginTop: '1rem', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>OPTIMIZING_NEURAL_WEIGHTS</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MitigationSimulator;
