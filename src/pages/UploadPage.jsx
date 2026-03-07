import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { Loader2, AlertTriangle, CheckCircle, ChevronRight, Binary, Cpu, Play } from 'lucide-react';
import { useBias } from '../context/BiasContext';
import LiveAnalysisOverlay from '../components/LiveAnalysisOverlay';

// ── Drag-and-drop / click file zone ─────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const FileDropZone = ({ label, sublabel, accept, icon: Icon, accentColor, file, onFile, id }) => {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onFile(dropped);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.015 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className="glass-panel"
            style={{
                padding: '2.5rem',
                cursor: 'pointer',
                border: `1px solid ${isDragging ? accentColor : file ? accentColor : 'var(--border-color)'}`,
                boxShadow: isDragging || file ? `0 0 20px ${accentColor}33` : 'none',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Top glow bar shown when file selected */}
            {file && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                    background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                }} />
            )}

            <input
                id={id}
                ref={inputRef}
                type="file"
                accept={accept}
                style={{ display: 'none' }}
                onChange={(e) => onFile(e.target.files[0])}
            />

            <div style={{ color: accentColor, marginBottom: '1.5rem' }}>
                {file ? <CheckCircle size={32} /> : <Icon size={32} />}
            </div>

            <h3 style={{
                fontFamily: 'Space Grotesk', textTransform: 'uppercase',
                marginBottom: '0.5rem', fontSize: '1rem',
                color: file ? accentColor : 'inherit'
            }}>
                {label}
            </h3>

            {file ? (
                <div>
                    <p style={{ color: accentColor, fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', fontFamily: 'JetBrains Mono' }}>
                        ✓ {file.name}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                        {(file.size / 1024).toFixed(1)} KB — click to replace
                    </p>
                </div>
            ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '2rem' }}>
                    {sublabel}
                </p>
            )}

            {!file && (
                <button
                    type="button"
                    className="btn-command"
                    style={{ width: '100%', borderColor: accentColor, color: accentColor, pointerEvents: 'none' }}
                >
                    SELECT FILE
                </button>
            )}
        </motion.div>
    );
};

// ── Text field ────────────────────────────────────────────────────────────────
const FieldInput = ({ label, sublabel, value, onChange, placeholder }) => (
    <div style={{
        background: 'rgba(255,255,255,0.02)', padding: '1.25rem 1.5rem',
        border: '1px solid var(--border-color)', borderRadius: '8px',
    }}>
        <label style={{
            display: 'block', fontSize: '0.65rem', color: 'var(--accent-primary)',
            marginBottom: '0.6rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em',
        }}>
            {label}
        </label>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: '0.75rem' }}>{sublabel}</p>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
                width: '100%', background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)', borderRadius: '6px',
                padding: '0.65rem 1rem', color: '#e2e8f0',
                fontFamily: 'JetBrains Mono', fontSize: '0.85rem', outline: 'none',
                boxSizing: 'border-box',
            }}
        />
    </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const UploadPage = () => {
    const navigate = useNavigate();
    const { runAnalysis, runDatasetAudit, isLoading, error } = useBias();

    const [modelFile, setModelFile] = useState(null);
    const [datasetFile, setDatasetFile] = useState(null);
    const [sensitiveCol, setSensitiveCol] = useState('gender');
    const [targetCol, setTargetCol] = useState('income');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const canRun = modelFile && datasetFile && !isLoading;

    const handleRun = async () => {
        if (!canRun) return;

        const formData = new FormData();
        formData.append('model_file', modelFile);
        formData.append('dataset_file', datasetFile);
        formData.append('sensitive_col', sensitiveCol.trim() || 'gender');
        formData.append('target_col', targetCol.trim() || 'income');

        setIsAnalyzing(true);
        try {
            const auditFormData = new FormData();
            auditFormData.append('dataset_file', datasetFile);

            // Run analysis and dataset audit concurrently
            await Promise.all([
                runAnalysis(formData),
                runDatasetAudit(auditFormData)
            ]);
        } catch {
            setIsAnalyzing(false);
        }
    };

    return (
        <PageWrapper>
            <AnimatePresence>
                {isAnalyzing && (
                    <LiveAnalysisOverlay onComplete={() => navigate('/dashboard')} />
                )}
            </AnimatePresence>

            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}
                >
                    <div style={{ width: '30px', height: '1px', background: 'var(--accent-primary)' }} />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', letterSpacing: '0.25em' }}>
                        PROTOCOL: MODEL_INGESTION_v2.0
                    </span>
                </motion.div>
                <h1 style={{ fontSize: '3.5rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Data <span className="gradient-text">Ingestion</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
                    Upload a trained scikit-learn model and dataset to initialize bias analysis.
                </p>
            </div>

            {/* File Upload Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <FileDropZone
                    id="model-upload"
                    label="Model Artifact"
                    sublabel="Upload a serialized scikit-learn model (.pkl)"
                    accept=".pkl"
                    icon={Binary}
                    accentColor="var(--accent-primary)"
                    file={modelFile}
                    onFile={setModelFile}
                />
                <FileDropZone
                    id="dataset-upload"
                    label="Validation Dataset"
                    sublabel="Upload a demographic dataset with features and target (.csv)"
                    accept=".csv"
                    icon={Cpu}
                    accentColor="var(--accent-secondary)"
                    file={datasetFile}
                    onFile={setDatasetFile}
                />
            </div>

            {/* Attribute Configuration */}
            <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontFamily: 'JetBrains Mono' }}>
                    ATTRIBUTE_MAPPING_MATRIX
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '2rem' }}>
                    Configure which columns in your dataset represent the protected attribute and the prediction target.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <FieldInput
                        label="SENSITIVE_ATTRIBUTE_COLUMN"
                        sublabel="The protected/demographic feature to audit for bias (e.g. gender, race, age)"
                        value={sensitiveCol}
                        onChange={setSensitiveCol}
                        placeholder="gender"
                    />
                    <FieldInput
                        label="TARGET_COLUMN"
                        sublabel="The binary outcome column your model predicts (0 or 1)"
                        value={targetCol}
                        onChange={setTargetCol}
                        placeholder="income"
                    />
                </div>
            </div>

            {/* Error display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            display: 'flex', alignItems: 'flex-start', gap: '1rem',
                            padding: '1.25rem 1.5rem', marginBottom: '1.75rem',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.4)',
                            borderRadius: '10px',
                        }}
                    >
                        <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                        <div>
                            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#ef4444', marginBottom: '0.3rem' }}>
                                ANALYSIS_FAILED
                            </p>
                            <p style={{ fontSize: '0.85rem', color: '#fca5a5' }}>{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Run Button */}
            <motion.button
                className="btn-command"
                onClick={handleRun}
                disabled={!canRun}
                whileHover={canRun ? { scale: 1.02 } : {}}
                whileTap={canRun ? { scale: 0.98 } : {}}
                style={{
                    width: '100%',
                    padding: '1.4rem',
                    fontSize: '1rem',
                    letterSpacing: '0.15em',
                    background: canRun ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
                    color: canRun ? 'var(--bg-color)' : 'var(--text-secondary)',
                    borderColor: canRun ? 'var(--accent-primary)' : 'var(--border-color)',
                    cursor: canRun ? 'pointer' : 'not-allowed',
                    opacity: canRun ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s ease',
                }}
            >
                {isLoading ? (
                    <>
                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        RUNNING AI BIAS INVESTIGATION...
                    </>
                ) : (
                    <>
                        <Play size={20} />
                        RUN BIAS ANALYSIS
                        <ChevronRight size={20} />
                    </>
                )}
            </motion.button>

            {/* Hint when files not yet selected */}
            {(!modelFile || !datasetFile) && (
                <p style={{
                    textAlign: 'center', marginTop: '1rem',
                    fontSize: '0.75rem', color: 'var(--text-secondary)',
                    fontFamily: 'JetBrains Mono', opacity: 0.6,
                }}>
                    {!modelFile && !datasetFile
                        ? '↑ Upload both a model (.pkl) and dataset (.csv) to enable analysis'
                        : !modelFile
                            ? '↑ Model file (.pkl) required'
                            : '↑ Dataset file (.csv) required'
                    }
                </p>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </PageWrapper>
    );
};

export default UploadPage;
