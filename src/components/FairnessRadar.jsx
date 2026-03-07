import { useBias } from '../context/BiasContext';
import { motion } from 'framer-motion';

const FairnessRadar = ({ size = 550 }) => {
    const { results } = useBias();

    // Ensure size is a valid number
    const safeSize = Number(size) || 550;
    const center = safeSize / 2;
    const radius = safeSize * 0.38;

    // Default placeholder attributes if no results
    const defaultAttributes = [
        { label: 'GENDER', value: 0.8 },
        { label: 'INCOME', value: 0.65 },
        { label: 'REGION', value: 0.9 },
        { label: 'AGE', value: 0.75 },
        { label: 'ETHNICITY', value: 0.85 },
    ];

    // Map API results if they exist, otherwise use placeholders
    const validResults = results && typeof results === 'object' && Object.keys(results).length > 0;

    const attributes = validResults ? [
        { label: 'ACCURACY', value: Number(results.accuracy) || 0 },
        { label: 'DP_SCORE', value: 1 - (Number(results.demographic_parity_difference) || 0) },
        { label: 'EO_SCORE', value: 1 - (Number(results.equal_opportunity_difference) || 0) },
        { label: 'PARITY_RATIO', value: Number(results.demographic_parity_ratio) || (1 - (Number(results.demographic_parity_difference) || 0)) },
        { label: 'CONSISTENCY', value: 0.85 }
    ] : defaultAttributes;

    const getCoordinates = (index, total, value) => {
        const safeTotal = total || 1;
        const safeValue = isNaN(Number(value)) ? 0 : Number(value);
        const angle = (Math.PI * 2 * index) / safeTotal - Math.PI / 2;

        const xVal = center + radius * safeValue * Math.cos(angle);
        const yVal = center + radius * safeValue * Math.sin(angle);

        return {
            x: isNaN(xVal) ? center : xVal,
            y: isNaN(yVal) ? center : yVal,
        };
    };

    const pathData = attributes.map((p, i) => {
        const coords = getCoordinates(i, attributes.length, p.value);
        return `${i === 0 ? 'M' : 'L'} ${coords.x} ${coords.y}`;
    }).join(' ') + ' Z';

    return (
        <div style={{ position: 'relative', width: safeSize, height: safeSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Holographic Background Atmosphere */}
            <div style={{
                position: 'absolute',
                width: safeSize * 0.9,
                height: safeSize * 0.9,
                background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                opacity: 0.2,
                filter: 'blur(40px)',
                zIndex: 0
            }} />

            <svg width={safeSize} height={safeSize} style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
                <defs>
                    <radialGradient id="radar-gradient-neon">
                        <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0.1" />
                    </radialGradient>

                    <filter id="neon-glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="soft-glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Circular Radar Scanning Rings (Background) */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((tick, idx) => (
                    <motion.circle
                        key={`ring-${tick}`}
                        cx={center}
                        cy={center}
                        r={radius * tick}
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="1"
                        initial={{ opacity: 0.05 }}
                        animate={{ opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }}
                    />
                ))}

                {/* Rotating Hub Lines */}
                {[...Array(10)].map((_, i) => {
                    const angle = (i * Math.PI * 2) / 10;
                    const x2 = center + radius * Math.cos(angle);
                    const y2 = center + radius * Math.sin(angle);
                    return (
                        <line
                            key={`hub-${i}`}
                            x1={center}
                            y1={center}
                            x2={isNaN(x2) ? center : x2}
                            y2={isNaN(y2) ? center : y2}
                            stroke="var(--border-color)"
                            strokeWidth="0.5"
                            opacity="0.1"
                        />
                    );
                })}

                {/* Radar Grid (Pentagon Lines) */}
                {[0.4, 0.7, 1].map((tick) => {
                    const gridPath = attributes.map((_, i) => {
                        const coords = getCoordinates(i, attributes.length, tick);
                        return `${i === 0 ? 'M' : 'L'} ${coords.x} ${coords.y}`;
                    }).join(' ') + ' Z';
                    return (
                        <path
                            key={`grid-${tick}`}
                            d={gridPath}
                            fill="none"
                            stroke="rgba(34, 211, 238, 0.2)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    );
                })}

                {/* Scanning Beam Sweep */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: `${center}px ${center}px` }}
                >
                    <line
                        x1={center}
                        y1={center}
                        x2={center}
                        y2={center - radius * 1.1}
                        stroke="var(--accent-primary)"
                        strokeWidth="2"
                        filter="url(#neon-glow)"
                    />
                    <path
                        d={`M ${center} ${center} L ${center} ${center - (radius * 1.1 || 0)} A ${radius * 1.1 || 0} ${radius * 1.1 || 0} 0 0 1 ${center + 50} ${center - (radius * 1.05 || 0)} Z`}
                        fill="var(--accent-glow)"
                        opacity="0.2"
                    />
                </motion.g>

                {/* Main Data Polygon */}
                <motion.path
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    d={pathData}
                    fill="url(#radar-gradient-neon)"
                    stroke="var(--accent-primary)"
                    strokeWidth="3"
                    filter="url(#neon-glow)"
                    style={{ strokeLinejoin: 'round' }}
                />

                {/* Labels & Dynamic Nodes */}
                {attributes.map((p, i) => {
                    const coords = getCoordinates(i, attributes.length, 1.22);
                    const point = getCoordinates(i, attributes.length, p.value);

                    return (
                        <g key={i}>
                            {/* Connection Leg */}
                            <line
                                x1={center}
                                y1={center}
                                x2={point.x}
                                y2={point.y}
                                stroke="var(--accent-primary)"
                                strokeWidth="1"
                                opacity="0.1"
                            />

                            {/* Label */}
                            <motion.text
                                x={coords.x}
                                y={coords.y}
                                fill="#fff"
                                fontSize="12"
                                fontFamily="JetBrains Mono"
                                textAnchor="middle"
                                fontWeight="800"
                                style={{ letterSpacing: '0.1em', filter: 'drop-shadow(0 0 5px var(--accent-primary))' }}
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            >
                                {p.label}
                            </motion.text>

                            {/* Glowing Node */}
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="8"
                                fill="var(--accent-secondary)"
                                filter="url(#soft-glow)"
                                opacity="0.3"
                            />
                            <motion.circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill="var(--accent-primary)"
                                filter="url(#neon-glow)"
                                animate={{ r: [4, 7, 4], opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                            />

                            {/* Percentage Marker */}
                            <text
                                x={point.x}
                                y={point.y - 12}
                                fill="var(--accent-primary)"
                                fontSize="10"
                                fontFamily="JetBrains Mono"
                                textAnchor="middle"
                                fontWeight="700"
                            >
                                {isNaN(p.value) ? 0 : (p.value * 100).toFixed(0)}%
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Outer Orbiting Data Particles */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={`part-${i}`}
                    style={{
                        position: 'absolute',
                        width: '4px',
                        height: '4px',
                        background: 'var(--accent-secondary)',
                        borderRadius: '50%',
                        boxShadow: '0 0 10px var(--accent-secondary)',
                    }}
                    animate={{
                        rotate: 360,
                        x: [Math.cos(i) * 280, Math.cos(i + 1) * 300, Math.cos(i) * 280],
                        y: [Math.sin(i) * 280, Math.sin(i + 1) * 300, Math.sin(i) * 280],
                    }}
                    transition={{
                        duration: 15 + i * 5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default FairnessRadar;
