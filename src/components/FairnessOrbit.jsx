import React from 'react';
import { motion } from 'framer-motion';

const FairnessOrbit = ({ size = 500 }) => {
    const center = size / 2;
    const coreRadius = 40;
    const orbitRadius = size * 0.35;

    const attributes = [
        { label: 'GENDER', value: 85, status: 'fair' },
        { label: 'INCOME', value: 45, status: 'high' },
        { label: 'AGE', value: 68, status: 'moderate' },
        { label: 'REGION', value: 92, status: 'fair' },
        { label: 'ETHNICITY', value: 88, status: 'fair' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'fair': return '#10b981'; // Green
            case 'moderate': return '#f59e0b'; // Yellow
            case 'high': return '#ef4444'; // Red
            default: return 'var(--accent-primary)';
        }
    };

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Center Core */}
            <div style={{
                position: 'absolute',
                width: coreRadius * 2,
                height: coreRadius * 2,
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                boxShadow: '0 0 40px var(--accent-glow)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <motion.div
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        width: '60%',
                        height: '60%',
                        borderRadius: '50%',
                        background: '#fff',
                        filter: 'blur(10px)',
                    }}
                />
            </div>

            {/* Orbit System */}
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible', zIndex: 1 }}>
                <defs>
                    <filter id="subtle-glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Orbit Line */}
                <circle
                    cx={center}
                    cy={center}
                    r={orbitRadius}
                    fill="none"
                    stroke="var(--border-color)"
                    strokeWidth="1"
                    opacity="0.2"
                />

                {/* Rotating Container for Nodes */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: `${center}px ${center}px` }}
                >
                    {attributes.map((attr, i) => {
                        const angle = (Math.PI * 2 * i) / attributes.length;
                        const x = center + orbitRadius * Math.cos(angle);
                        const y = center + orbitRadius * Math.sin(angle);
                        const color = getStatusColor(attr.status);

                        return (
                            <g key={`orbit-node-${i}`}>
                                {/* Node Background Glass */}
                                <rect
                                    x={x - 45}
                                    y={y - 25}
                                    width="90"
                                    height="50"
                                    rx="8"
                                    fill="rgba(13, 17, 23, 0.6)"
                                    stroke="rgba(255,255,255,0.05)"
                                    style={{ backdropFilter: 'blur(10px)' }}
                                />

                                {/* Attribute Label */}
                                <text
                                    x={x}
                                    y={y - 5}
                                    fill="var(--text-secondary)"
                                    fontSize="8"
                                    fontFamily="JetBrains Mono"
                                    textAnchor="middle"
                                    fontWeight="700"
                                    letterSpacing="0.1em"
                                >
                                    {attr.label}
                                </text>

                                {/* Percentage */}
                                <text
                                    x={x}
                                    y={y + 12}
                                    fill="var(--text-primary)"
                                    fontSize="12"
                                    fontFamily="Space Grotesk"
                                    textAnchor="middle"
                                    fontWeight="700"
                                >
                                    {attr.value}%
                                </text>

                                {/* Status Dot */}
                                <circle
                                    cx={x - 30}
                                    cy={y + 8}
                                    r="3"
                                    fill={color}
                                    filter="url(#subtle-glow)"
                                />

                                {/* Counter-rotation for text to keep it upright */}
                                {/* Note: SVG nested rotation is complex, keeping it simple for now or using absolute positioning if needed. 
                                    However, a slow orbit rotation where nodes don't flip is often better for "minimal" feel.
                                    We'll keep the text rotating with the orbit but slowly.
                                */}
                            </g>
                        );
                    })}
                </motion.g>
            </svg>

            {/* Subtle Pulse Rings */}
            {[1, 1.5, 2].map((scale, i) => (
                <motion.div
                    key={`pulse-${i}`}
                    style={{
                        position: 'absolute',
                        width: coreRadius * 2,
                        height: coreRadius * 2,
                        borderRadius: '50%',
                        border: '1px solid var(--accent-primary)',
                        zIndex: 0,
                    }}
                    animate={{
                        scale: [1, scale * 3],
                        opacity: [0.3, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: i * 1,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    );
};

export default FairnessOrbit;
