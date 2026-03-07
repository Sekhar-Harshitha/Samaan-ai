import React from 'react';
import { motion } from 'framer-motion';

const AIJusticeScale = ({ size = 500 }) => {
    const center = size / 2;
    const beamWidth = size * 0.7;
    const coreRadius = 35;
    const plateWidth = 120;
    const plateHeight = 8;

    // Bias tilt angle (positive for right-heavy, negative for left-heavy)
    const tiltAngle = 8;

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Holographic Background Atmosphere */}
            <div style={{
                position: 'absolute',
                width: size * 0.9,
                height: size * 0.9,
                background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                opacity: 0.3,
                filter: 'blur(30px)',
                zIndex: 0
            }} />

            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible', zIndex: 1 }}>
                <defs>
                    <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="var(--accent-primary)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                    </linearGradient>

                    <radialGradient id="plateGlow">
                        <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>

                    <filter id="hologram-glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Floating Animation Wrapper for the whole scale */}
                <motion.g
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Tilting Group */}
                    <motion.g
                        animate={{ rotate: [tiltAngle - 1, tiltAngle + 1, tiltAngle - 1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: `${center}px ${center}px` }}
                    >
                        {/* Balance Beam */}
                        <motion.rect
                            x={center - beamWidth / 2}
                            y={center - 1}
                            width={beamWidth}
                            height="2"
                            fill="url(#beamGradient)"
                            filter="url(#hologram-glow)"
                        />

                        {/* Connection Lines to Plates */}
                        {/* Left Plate String */}
                        <line
                            x1={center - beamWidth / 2}
                            y1={center}
                            x2={center - beamWidth / 2}
                            y2={center + 80}
                            stroke="var(--accent-primary)"
                            strokeWidth="0.5"
                            opacity="0.3"
                        />
                        {/* Right Plate String */}
                        <line
                            x1={center + beamWidth / 2}
                            y1={center}
                            x2={center + beamWidth / 2}
                            y2={center + 80}
                            stroke="var(--accent-primary)"
                            strokeWidth="0.5"
                            opacity="0.3"
                        />

                        {/* Left Scale Plate */}
                        <g transform={`translate(${center - beamWidth / 2 - plateWidth / 2}, ${center + 80})`}>
                            <rect width={plateWidth} height={plateHeight} rx="2" fill="rgba(34, 211, 238, 0.1)" stroke="var(--accent-primary)" strokeWidth="0.5" style={{ backdropFilter: 'blur(10px)' }} />
                            <ellipse cx={plateWidth / 2} cy={plateHeight / 2} rx={plateWidth / 2 + 20} ry="15" fill="url(#plateGlow)" opacity="0.3" />
                            <text x={plateWidth / 2} y={plateHeight + 25} fill="var(--text-secondary)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="700">GROUP_A: FAIR</text>
                            <text x={plateWidth / 2} y={plateHeight + 40} fill="#10b981" fontSize="11" fontFamily="Space Grotesk" textAnchor="middle" fontWeight="800">92%</text>
                        </g>

                        {/* Right Scale Plate */}
                        <g transform={`translate(${center + beamWidth / 2 - plateWidth / 2}, ${center + 80})`}>
                            <rect width={plateWidth} height={plateHeight} rx="2" fill="rgba(168, 85, 247, 0.1)" stroke="var(--accent-secondary)" strokeWidth="0.5" style={{ backdropFilter: 'blur(10px)' }} />
                            <ellipse cx={plateWidth / 2} cy={plateHeight / 2} rx={plateWidth / 2 + 20} ry="15" fill="radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" opacity="0.3" />
                            <text x={plateWidth / 2} y={plateHeight + 25} fill="var(--text-secondary)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="700">GROUP_B: BIASED</text>
                            <text x={plateWidth / 2} y={plateHeight + 40} fill="#ef4444" fontSize="11" fontFamily="Space Grotesk" textAnchor="middle" fontWeight="800">45%</text>
                        </g>
                    </motion.g>

                    {/* Static Center AI Core (Hovering above the beam hinge) */}
                    <g transform={`translate(${center}, ${center})`}>
                        {/* Core Glow */}
                        <circle r={coreRadius + 15} fill="var(--accent-glow)" opacity="0.4" filter="blur(15px)" />

                        {/* Main Core */}
                        <circle r={coreRadius} fill="rgba(13, 17, 23, 0.8)" stroke="var(--accent-primary)" strokeWidth="1" />

                        {/* Inner Pulsing Detail */}
                        <motion.circle
                            r={coreRadius * 0.6}
                            fill="url(#beamGradient)"
                            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />

                        {/* Decorative UI Bits around Core */}
                        {[...Array(8)].map((_, i) => (
                            <motion.line
                                key={i}
                                x1="0" y1={-coreRadius - 5} x2="0" y2={-coreRadius - 12}
                                stroke="var(--accent-primary)"
                                strokeWidth="2"
                                transform={`rotate(${i * 45})`}
                                initial={{ opacity: 0.2 }}
                                animate={{ opacity: [0.2, 0.6, 0.2] }}
                                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                            />
                        ))}
                    </g>
                </motion.g>

                {/* Particle Field */}
                {[...Array(15)].map((_, i) => (
                    <motion.circle
                        key={`p-${i}`}
                        r={Math.random() * 1.5}
                        fill="var(--accent-primary)"
                        opacity={Math.random()}
                        initial={{
                            cx: Math.random() * size,
                            cy: Math.random() * size
                        }}
                        animate={{
                            y: [0, -50],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};

export default AIJusticeScale;
