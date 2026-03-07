import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

/**
 * BiasContext — global state for bias analysis results.
 *
 * Provides:
 *   results      : API response object (accuracy, demographic_parity_difference, equal_opportunity_difference)
 *                  or null when no analysis has been run.
 *   isLoading    : true while the API call is in-flight.
 *   error        : error message string or null.
 *   explainResults: API response from /explain endpoint.
 *   isExplainLoading: true while /explain API call is in-flight.
 *   explainError : error message string from /explain api or null.
 *   runAnalysis  : async fn(formData: FormData) — posts to /analyze and /explain, updates state.
 *   clearResults : reset all state.
 */

const BiasContext = createContext(null);

export const BiasProvider = ({ children }) => {
    const [results, setResults] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [explainResults, setExplainResults] = useState(null);
    const [isExplainLoading, setIsExplainLoading] = useState(false);
    const [explainError, setExplainError] = useState(null);

    const runAnalysis = useCallback(async (formData) => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        setMetadata({
            sensitive_col: formData.get('sensitive_col'),
            target_col: formData.get('target_col')
        });

        setIsExplainLoading(true);
        setExplainError(null);
        setExplainResults(null);

        try {
            const analyzePromise = axios.post('http://localhost:8000/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120_000,
            });

            const explainPromise = axios.post('http://localhost:8000/explain', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120_000,
            });

            // Execute concurrently, but handle failures independently if possible, 
            // though here we await both.
            const [analyzeRes, explainRes] = await Promise.all([
                analyzePromise.catch(e => { throw { type: 'analyze', error: e } }),
                explainPromise.catch(e => { throw { type: 'explain', error: e } })
            ]);

            setResults(analyzeRes.data);
            setIsLoading(false);

            setExplainResults(explainRes.data);
            setIsExplainLoading(false);

        } catch (err) {
            if (err.type === 'analyze') {
                const detail = err.error.response?.data?.detail || err.error.message || 'Unknown error from bias analysis API.';
                setError(detail);
                setIsLoading(false);
                // If analyze fails, we should probably stop explain too or let it finish.
                setIsExplainLoading(false);
                setExplainError("Analysis failed, explainability aborted.");
            } else if (err.type === 'explain') {
                const detail = err.error.response?.data?.detail || err.error.message || 'Unknown error from explain API.';
                setExplainError(detail);
                setIsExplainLoading(false);
                // We might still have analyzeResults if we did Promise.allSettled, 
                // but with Promise.all we catch the first error. 
                // To be safe, just clear loading states.
                setIsLoading(false);
            } else {
                const detail = err.response?.data?.detail || err.message || 'Unknown error during analysis.';
                setError(detail);
                setIsLoading(false);
                setIsExplainLoading(false);
                setExplainError(detail);
            }
        }
    }, []);

    const clearResults = useCallback(() => {
        setResults(null);
        setMetadata(null);
        setError(null);
        setIsLoading(false);
        setExplainResults(null);
        setExplainError(null);
        setIsExplainLoading(false);
    }, []);

    return (
        <BiasContext.Provider value={{
            results, metadata, isLoading, error,
            explainResults, isExplainLoading, explainError,
            runAnalysis, clearResults
        }}>
            {children}
        </BiasContext.Provider>
    );
};

/** Hook for consuming BiasContext in any component. */
export const useBias = () => {
    const ctx = useContext(BiasContext);
    if (!ctx) throw new Error('useBias must be used inside <BiasProvider>');
    return ctx;
};

export default BiasContext;
