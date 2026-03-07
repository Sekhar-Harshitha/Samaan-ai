import React, { useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import { FileCode, Download, Database, Activity, FileText } from 'lucide-react';

const ReportPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Default form data
    const [formData, setFormData] = useState({
        model_summary: 'Random Forest Classifier trained to predict binary income classes.',
        dataset_description: 'Adult Census Income Dataset featuring age, education, and occupation.',
        bias_findings: 'Detected a selection rate disparity historically favoring the privileged demographic.',
        affected_groups: 'Female individuals exhibited a False Negative Rate 12% higher than Male counterparts.',
        mitigation_results: 'Applied Fairlearn ExponentiatedGradient which reduced Demographic Parity Difference by 85%.',
        final_fairness_score: '0.96',
        acc: '0.84',
        dpd: '0.04',
        eod: '0.02'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDownload = async () => {
        setLoading(true);
        setError('');

        const payload = {
            model_summary: formData.model_summary,
            dataset_description: formData.dataset_description,
            bias_findings: formData.bias_findings,
            affected_groups: formData.affected_groups,
            mitigation_results: formData.mitigation_results,
            final_fairness_score: parseFloat(formData.final_fairness_score) || 0,
            fairness_metrics: {
                accuracy: parseFloat(formData.acc) || 0,
                dpd: parseFloat(formData.dpd) || 0,
                eod: parseFloat(formData.eod) || 0
            }
        };

        try {
            const response = await fetch('http://localhost:8000/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF Report');
            }

            // Create a blob from the PDF stream
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SamaanAI_Audit_Report_${new Date().getTime()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            setError(err.message || 'Error connecting to the report generator.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3.5rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Audit <span className="gradient-text">Manifest</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>SEQUENCE: COMPLIANCE_REPORT_GENERATION</p>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.2rem', letterSpacing: '0.1em', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText className="text-accent" /> REPORT_PARAMETERS
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>MODEL SUMMARY</label>
                        <textarea
                            name="model_summary"
                            value={formData.model_summary}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', minHeight: '60px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>DATASET DESCRIPTION</label>
                        <textarea
                            name="dataset_description"
                            value={formData.dataset_description}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', minHeight: '60px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>BIAS FINDINGS</label>
                        <textarea
                            name="bias_findings"
                            value={formData.bias_findings}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', minHeight: '60px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>AFFECTED DEMOGRAPHIC GROUPS</label>
                        <textarea
                            name="affected_groups"
                            value={formData.affected_groups}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', minHeight: '60px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>ACCURACY</label>
                            <input
                                type="text"
                                name="acc"
                                value={formData.acc}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>DPD</label>
                            <input
                                type="text"
                                name="dpd"
                                value={formData.dpd}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>EOD</label>
                            <input
                                type="text"
                                name="eod"
                                value={formData.eod}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>MITIGATION RESULTS</label>
                        <textarea
                            name="mitigation_results"
                            value={formData.mitigation_results}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)', minHeight: '60px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>FINAL FAIRNESS SCORE</label>
                        <input
                            name="final_fairness_score"
                            value={formData.final_fairness_score}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '1rem', background: 'rgba(34, 211, 238, 0.1)', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)', fontWeight: 'bold' }}
                        />
                    </div>
                </div>

                {error && <div style={{ color: 'var(--alert-error)', marginTop: '2rem' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
                    <button
                        className="btn-command"
                        onClick={handleDownload}
                        disabled={loading}
                        style={{ width: '100%', background: 'var(--accent-primary)', color: 'var(--bg-color)', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {loading ? <Activity size={18} className="animate-pulse" /> : <><Download size={18} style={{ marginRight: '10px' }} /> GENERATE_PDF_MANIFEST</>}
                    </button>
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
