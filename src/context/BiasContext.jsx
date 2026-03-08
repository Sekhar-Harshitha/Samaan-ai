// BiasContext.jsx — global state for bias analysis results
// eslint-disable-next-line react-refresh/only-export-components
import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const BiasContext = createContext(null);

export function BiasProvider({ children }) {
    const [results, setResults] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [explainResults, setExplainResults] = useState(null);
    const [isExplainLoading, setIsExplainLoading] = useState(false);
    const [explainError, setExplainError] = useState(null);

    const [datasetAuditResult, setDatasetAuditResult] = useState(null);
    const [isDatasetLoading, setIsDatasetLoading] = useState(false);
    const [datasetError, setDatasetError] = useState(null);

    const [progress, setProgress] = useState(0);
    const [analysisMessage, setAnalysisMessage] = useState('');
    const [isLargeDataset, setIsLargeDataset] = useState(false);

    // ── Task polling ────────────────────────────────────────────────────────
    function pollTask({ jobId, onDone, onFail, isExplain = false }) {
        const INTERVAL = 2000;
        let attempts = 0;
        let lastProgress = -1;
        let stagnantCount = 0;
        const MAX = 150; // 5 minutes

        let stopped = false;

        async function check() {
            if (stopped) return;
            try {
                const { data: task } = await axios.get(`${API}/analysis-progress/${jobId}`, { timeout: 10_000 });

                if (task.status === 'completed') {
                    onDone(task.results);
                    if (!isExplain) {
                        setProgress(100);
                        setAnalysisMessage('Analysis complete!');
                        if (task.is_large) setIsLargeDataset(true);
                    }
                } else if (task.status === 'failed') {
                    onFail(task.error || 'Task failed on server.');
                } else {
                    const p = task.progress ?? 20;
                    if (!isExplain) {
                        setProgress(p);
                        if (task.message) setAnalysisMessage(task.message);
                        if (p === lastProgress) stagnantCount++;
                        else stagnantCount = 0;
                        lastProgress = p;
                        if (stagnantCount > 10) {
                            setAnalysisMessage('Still computing... this may take a moment.');
                        }
                    }
                    if (attempts < MAX) {
                        attempts++;
                        setTimeout(check, INTERVAL);
                    } else {
                        onFail('Analysis timed out after 5 minutes.');
                    }
                }
            } catch (err) {
                const msg = err.code === 'ECONNREFUSED'
                    ? 'Cannot connect to backend. Is the server running on port 8000?'
                    : null;
                if (msg) {
                    onFail(msg);
                } else if (attempts < MAX) {
                    // Transient error – retry
                    attempts++;
                    setTimeout(check, INTERVAL);
                }
            }
        }

        check();
        return () => { stopped = true; };
    }

    // ── runAnalysis ─────────────────────────────────────────────────────────
    const runAnalysis = useCallback(async (formData) => {
        setIsLoading(true);
        setIsExplainLoading(true);
        setError(null);
        setExplainError(null);
        setProgress(5);
        setAnalysisMessage('Uploading files to analysis engine...');
        setIsLargeDataset(false);
        setResults(null);
        setExplainResults(null);
        setMetadata({
            sensitive_col: formData.get('sensitive_col'),
            target_col: formData.get('target_col'),
        });

        try {
            const config = { timeout: 60_000 }; // 60s for initial upload

            const [analyzeRes, explainRes] = await Promise.allSettled([
                axios.post(`${API}/analyze`, formData, config),
                axios.post(`${API}/explain`, formData, config),
            ]);

            if (analyzeRes.status === 'fulfilled' && analyzeRes.value.data?.task_id) {
                analyzeOk = true;
                const jobId = analyzeRes.value.data.task_id;
                setAnalysisMessage('Analysis queued. Computing fairness metrics...');
                setProgress(10);
                pollTask({
                    jobId,
                    onDone: (data) => {
                        console.log("[POLLING_COMPLETE] Fairness data received.");
                        setResults(data);
                        setIsLoading(false);
                        latest_analysis_store_ref.metrics = data;
                    },
                    onFail: (msg) => {
                        console.warn("[POLLING_FAILED]", msg);
                        setError(msg);
                        setIsLoading(false);
                    },
                    isExplain: false,
                });
            } else if (analyzeRes.status === 'fulfilled') {
                console.error("[INIT_FAILED] Backend returned success without task_id.");
                setError("Protocol initiation error: System failed to generate analysis task ID.");
                setIsLoading(false);
            } else {
                const reason = analyzeRes.reason;
                const detail = reason?.response?.data?.detail
                    || (reason?.code === 'ERR_NETWORK' ? 'Cannot connect to backend (port 8000). Is the server running?' : null)
                    || reason?.message
                    || 'Failed to initiate analysis.';
                console.error("[INIT_FAILED] Analysis engine rejected request:", detail);
                setError(detail);
                setIsLoading(false);
            }

            if (explainRes.status === 'fulfilled' && explainRes.value.data?.task_id) {
                const jobId = explainRes.value.data.task_id;
                pollTask({
                    jobId,
                    onDone: (data) => { setExplainResults(data); setIsExplainLoading(false); },
                    onFail: (msg) => { setExplainError(msg); setIsExplainLoading(false); },
                    isExplain: true,
                });
            } else if (explainRes.status === 'fulfilled') {
                console.warn("[INIT_PARTIAL] Explainability task ID missing.");
                setExplainError("Explainability protocol initiation failed.");
                setIsExplainLoading(false);
            } else {
                const detail = explainRes.reason?.response?.data?.detail || explainRes.reason?.message || 'Failed to initiate explainability.';
                setExplainError(detail);
                setIsExplainLoading(false);
                // If analyze also failed, bubble up a user-friendly error
                if (!analyzeOk) {
                    setError('Backend unreachable. Please ensure the backend is running: uvicorn main:app --reload --port 8000');
                }
            }
        } catch (err) {
            const detail = err?.code === 'ERR_NETWORK'
                ? 'Backend unreachable. Ensure the server is running on port 8000.'
                : err?.message || 'Unexpected error during analysis setup.';
            setError(detail);
            setIsLoading(false);
            setIsExplainLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── runDatasetAudit ─────────────────────────────────────────────────────
    const runDatasetAudit = useCallback(async (formData) => {
        setIsDatasetLoading(true);
        setDatasetError(null);
        try {
            const { data } = await axios.post(`${API}/dataset_audit`, formData, { timeout: 120_000 });
            setDatasetAuditResult(data);
        } catch (err) {
            const detail = err?.response?.data?.detail || err?.message || 'Dataset audit failed.';
            setDatasetError(detail);
        } finally {
            setIsDatasetLoading(false);
        }
    }, []);

    // ── clearResults ────────────────────────────────────────────────────────
    const clearResults = useCallback(() => {
        setResults(null); setMetadata(null); setError(null); setIsLoading(false);
        setExplainResults(null); setExplainError(null); setIsExplainLoading(false);
        setDatasetAuditResult(null); setDatasetError(null); setIsDatasetLoading(false);
        setProgress(0); setAnalysisMessage(''); setIsLargeDataset(false);
    }, []);

    // ── generateCertificate ──────────────────────────────────────────────────
    const generateCertificate = useCallback(async () => {
        try {
            const { data } = await axios.post(`${API}/generate-certificate`, {}, {
                responseType: 'blob',
                timeout: 300_000,
            });
            const url = URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `SamaanAI_Certificate_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            return true;
        } catch (err) {
            console.error('Certificate generation failed', err);
            return false;
        }
    }, []);

    return (
        <BiasContext.Provider value={{
            results, metadata, isLoading, error,
            explainResults, isExplainLoading, explainError,
            datasetAuditResult, isDatasetLoading, datasetError,
            progress, analysisMessage, isLargeDataset,
            runAnalysis, clearResults, runDatasetAudit, generateCertificate,
        }}>
            {children}
        </BiasContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBias() {
    const ctx = useContext(BiasContext);
    if (!ctx) throw new Error('useBias must be used inside <BiasProvider>');
    return ctx;
}

// Internal ref for sharing across context (not exposed)
const latest_analysis_store_ref = {};
