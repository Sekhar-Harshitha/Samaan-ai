import React from 'react';
import { motion } from 'framer-motion';

const BiasScannerOrb = ({ size = 400 }) => {
    const center = size / 2;
    const orbRadius = size * 0.15;
    const nodeDistance = size * 0.35;

    const attributes = [
        { label: 'GENDER', value: 0.85, status: 'fair' },
        { label: 'INCOME', value: 0.45, status: 'high' },
        { label: 'REGION', value: 0.92, status: 'fair' },
        { label: 'AGE', value: 0.68, status: 'moderate' },
        { label: 'ETHNICITY', value: 0.88, status: 'fair' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'fair': return '#10b981'; // Green
            case 'moderate': return '#f59e0b'; // Yellow
            case 'high': return '#ef4444'; // Red
            default: return 'var(--accent-primary)';
        }
    };

    const getNodeCoordinates = (index, total) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        return {
            x: center + nodeDistance * Math.cos(angle),
            y: center + nodeDistance * Math.sin(angle),
            angle: angle
        };
    };

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                width: size * 0.8,
                height: size * 0.8,
                background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(20px)',
                opacity: 0.5
            }} />

            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible', zIndex: 2 }}>
                <defs>
                    <radialGradient id="orbGradient">
                        <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.8" />
                        <stop offset="70%" stopColor="var(--accent-secondary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>

                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Connecting Lines */}
                {attributes.map((attr, i) => {
                    const coords = getNodeCoordinates(i, attributes.length);
                    return (
                        <motion.line
                            key={`line-${i}`}
                            x1={center}
                            y1={center}
                            x2={coords.x}
                            y2={coords.y}
                            stroke="var(--accent-primary)"
                            strokeWidth="1"
                            strokeOpacity="0.2"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.2 }}
                            transition={{ duration: 1.5, delay: i * 0.2 }}
                        />
                    );
                })}

                {/* Scanning Line */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: `${center}px ${center}px` }}
                >
                    <line
                        x1={center}
                        y1={center}
                        x2={center}
                        y2={center - nodeDistance * 1.2}
                        stroke="var(--accent-primary)"
                        strokeWidth="2"
                        filter="url(#glow)"
                    />
                    <path
                        d={`M ${center} ${center} L ${center} ${center - nodeDistance * 1.2} A ${nodeDistance * 1.2} ${nodeDistance * 1.2} 0 0 0 ${center - 40} ${center - nodeDistance * 1.1} Z`}
                        fill="url(#orbGradient)"
                        opacity="0.3"
                    />
                </motion.g>

                {/* Central Orb */}
                <motion.circle
                    cx={center}
                    cy={center}
                    r={orbRadius}
                    fill="url(#orbGradient)"
                    filter="url(#glow)"
                    animate={{
                        r: [orbRadius, orbRadius * 1.1, orbRadius],
                        opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Internal UI Ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={orbRadius * 1.4}
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.3"
                />

                {/* Demographic Nodes */}
                {attributes.map((attr, i) => {
                    const coords = getNodeCoordinates(i, attributes.length);
                    const color = getStatusColor(attr.status);

                    return (
                        <g key={`node-${i}`}>
                            {/* Node Glow */}
                            <motion.circle
                                cx={coords.x}
                                cy={coords.y}
                                r="12"
                                fill={color}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            />

                            {/* Main Node */}
                            <motion.circle
                                cx={coords.x}
                                cy={coords.y}
                                r="6"
                                fill={color}
                                filter="url(#glow)"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, delay: i * 0.2 }}
                            />

                            {/* Label */}
                            <text
                                x={coords.x}
                                y={coords.y + 25}
                                fill="var(--text-secondary)"
                                fontSize="10"
                                fontFamily="JetBrains Mono"
                                textAnchor="middle"
                                fontWeight="700"
                                opacity="0.8"
                            >
                                {attr.label}
                            </text>

                            {/* Value Hint */}
                            <text
                                x={coords.x}
                                y={coords.y - 15}
                                fill={color}
                                fontSize="8"
                                fontFamily="JetBrains Mono"
                                textAnchor="middle"
                                fontWeight="700"
                            >
                                {(attr.value * 100).toFixed(0)}%
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Orbiting Particles */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    style={{
                        position: 'absolute',
                        width: '4px',
                        height: '4px',
                        background: 'var(--accent-primary)',
                        borderRadius: '50%',
                        boxShadow: '0 0 10px var(--accent-primary)',
                    }}
                    animate={{
                        rotate: 360,
                        x: [Math.cos(i) * 100, Math.cos(i + 2) * 120, Math.cos(i) * 100],
                        y: [Math.sin(i) * 100, Math.sin(i + 2) * 120, Math.sin(i) * 100],
                    }}
                    transition={{
                        duration: 10 + i * 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default BiasScannerOrb;
