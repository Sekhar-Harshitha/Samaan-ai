import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Activity, ShieldCheck, Target } from 'lucide-react';
import AuditFeed from '../components/AuditFeed';
import FairnessRadar from '../components/FairnessRadar';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: '#ef4444', fontFamily: 'JetBrains Mono' }}>
                    <h2>[CRITICAL_RENDER_FAILURE]</h2>
                    <p>An unexpected error occurred in the visualization engine.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

const LandingPage = () => {
    return (
        <ErrorBoundary>
            <div className="landing-layout">
                {/* Hero Section */}
                <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '4rem', minHeight: '90vh', alignItems: 'center' }}>
                    <div className="hero-command">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', color: 'var(--accent-primary)' }}>
                                <div style={{ width: '40px', height: '1px', background: 'var(--accent-primary)' }}></div>
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', letterSpacing: '0.4em', fontWeight: '800' }}>GOVERNANCE_PROTOCOL_v4.0</span>
                            </div>

                            <h1 style={{ fontSize: '7.5rem', fontWeight: '900', lineHeight: '0.8', marginBottom: '2.5rem', textTransform: 'uppercase', letterSpacing: '-0.04em' }}>
                                Audit Your AI <br />
                                <span className="gradient-text" style={{ fontSize: '6.5rem' }}>for Fairness</span>
                            </h1>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', marginBottom: '4rem', fontFamily: 'Space Grotesk', lineHeight: '1.6', opacity: 0.8 }}>
                                Redefining algorithmic transparency. Use our futuristic investigation lab to detect, analyze, and mitigate bias in mission-critical AI models.
                            </p>

                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '4rem' }}>
                                <NavLink to="/upload" style={{ textDecoration: 'none' }}>
                                    <button className="btn-command" style={{ padding: '1.25rem 3rem', fontSize: '1rem' }}>
                                        INITIALIZE_AUDIT_SEQUENCE <ArrowRight size={22} style={{ marginLeft: '12px' }} />
                                    </button>
                                </NavLink>
                            </div>

                            <div style={{ maxWidth: '500px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
                                    <Activity size={12} /> LIVE_SYSTEM_FEED
                                </div>
                                <div className="glass-panel" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
                                    <AuditFeed />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
                    >
                        <div style={{ position: 'relative' }}>
                            <FairnessRadar size={550} />
                            {/* Decorative HUD Elements */}
                            <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '40px', height: '40px', borderLeft: '2px solid var(--accent-primary)', borderTop: '2px solid var(--accent-primary)' }} />
                            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '40px', height: '40px', borderRight: '2px solid var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)' }} />
                        </div>
                    </motion.div>
                </section>

                {/* Metrics Section */}
                <section style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel"
                        style={{ padding: '2.5rem', textAlign: 'center' }}
                    >
                        <div style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem' }}><ShieldCheck size={40} /></div>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.1em' }}>FAIRNESS_SCORE</p>
                        <div className="metric-large">89</div>
                        <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '1rem', fontWeight: '700' }}>STATUS: NOMINAL</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel"
                        style={{ padding: '2.5rem', textAlign: 'center' }}
                    >
                        <div style={{ color: '#ef4444', marginBottom: '1.5rem' }}><Target size={40} /></div>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.1em' }}>BIAS_RISK_LEVEL</p>
                        <div className="metric-large" style={{ background: 'linear-gradient(135deg, #fff 0%, #ef4444 100%)', WebkitBackgroundClip: 'text' }}>LOW</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>PARITY GAP: 4.2%</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel"
                        style={{ padding: '2.5rem', textAlign: 'center' }}
                    >
                        <div style={{ color: 'var(--accent-secondary)', marginBottom: '1.5rem' }}><Activity size={40} /></div>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.1em' }}>CONTROL_GROUPS</p>
                        <div className="metric-large" style={{ background: 'linear-gradient(135deg, #fff 0%, var(--accent-secondary) 100%)', WebkitBackgroundClip: 'text' }}>04</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>ACTIVE_MONITORING</p>
                    </motion.div>
                </section>
            </div>
        </ErrorBoundary>
    );
};


export default LandingPage;
