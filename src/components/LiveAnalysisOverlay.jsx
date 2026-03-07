import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const LiveAnalysisOverlay = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    const [streams] = useState(() =>
        [...Array(15)].map((_, i) => ({
            id: i,
            duration: 1 + Math.random() * 2,
            delay: Math.random() * 2,
            left: Math.random() * 100,
            height: Math.random() * 50 + 20
        })));

    useEffect(() => {
        // Simulate a 2.5s analysis process
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 400); // Small delay before unmounting
                    return 100;
                }
                return p + 2;
            });
        }, 40);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(5, 7, 13, 0.9)',
                backdropFilter: 'blur(10px)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'var(--accent-primary)'
            }}
        >
            <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Outer rotating ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        border: '2px dashed rgba(34, 211, 238, 0.3)',
                        borderRadius: '50%'
                    }}
                />

                {/* Middle pulsing ring */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute',
                        width: '140px',
                        height: '140px',
                        border: '2px solid rgba(34, 211, 238, 0.8)',
                        borderRadius: '50%',
                        boxShadow: '0 0 20px var(--accent-glow)'
                    }}
                />

                {/* Inner Icon */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                    <Activity size={50} color="var(--accent-primary)" />
                </motion.div>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', letterSpacing: '0.2em', marginBottom: '1rem', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>
                    Analyzing fairness metrics...
                </h2>

                {/* Progress Bar Container */}
                <div style={{ width: '300px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', margin: '0 auto' }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'var(--accent-primary)',
                        boxShadow: '0 0 10px var(--accent-primary)',
                        transition: 'width 0.1s linear'
                    }} />
                </div>

                <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
                    SCANNING_NODE_DATA
                </p>

                {/* Simulated flowing data streams (particles) in background */}
                {streams.map((s) => (
                    <motion.div
                        key={s.id}
                        animate={{
                            y: ['100vh', '-10vh'],
                            opacity: [0, 0.8, 0]
                        }}
                        transition={{
                            duration: s.duration,
                            repeat: Infinity,
                            delay: s.delay,
                            ease: "linear"
                        }}
                        style={{
                            position: 'absolute',
                            left: `${s.left}vw`,
                            bottom: 0,
                            width: '2px',
                            height: `${s.height}px`,
                            background: 'linear-gradient(to top, transparent, var(--accent-primary))',
                            zIndex: -1
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default LiveAnalysisOverlay;
