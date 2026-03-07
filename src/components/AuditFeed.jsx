import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AuditFeed = () => {
    const [logs, setLogs] = useState([
        "Initialising AI Governance Core...",
        "System check: OPTIMAL",
        "Security Protocol: ACTIVE"
    ]);

    const phrases = [
        "Analyzing dataset for structural imbalance...",
        "Detecting protected attributes in neural layers...",
        "Evaluating demographic parity coefficients...",
        "Checking intersectional bias vectors...",
        "Heuristic scanning: Disparate impact detected",
        "Calculating fairness metrics (95% confidence)...",
        "Scanning income-based classification weights...",
        "Identifying high-risk demographic clusters...",
        "Measuring statistical parity gap: +14.2%",
        "Generating initial bias investigation report..."
    ];

    const scrollRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setLogs(prev => {
                const next = [...prev, phrases[Math.floor(Math.random() * phrases.length)]];
                if (next.length > 8) return next.slice(1);
                return next;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="terminal-feed" ref={scrollRef} style={{ height: '180px', overflowY: 'hidden' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                LIVE_AUDIT_STREAM_v4.2.0
            </div>
            {logs.map((log, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ marginBottom: '0.25rem' }}
                >
                    <span style={{ color: 'var(--text-secondary)' }}>[{new Date().toLocaleTimeString()}]</span> {log}
                </motion.div>
            ))}
            <div className="terminal-cursor"></div>
        </div>
    );
};

export default AuditFeed;
