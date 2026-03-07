import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const NeuralBackground = () => {
    const nodes = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
        }));
    }, []);

    const connections = useMemo(() => {
        const lines = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < Math.min(i + 5, nodes.length); j++) {
                lines.push({ i, j });
            }
        }
        return lines;
    }, [nodes]);

    return (
        <div className="neural-container">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {connections.map((conn, idx) => (
                    <motion.line
                        key={`line-${idx}`}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0.1, 0.3, 0.1],
                            x1: nodes[conn.i] ? [nodes[conn.i].x, nodes[conn.i].x + 1, nodes[conn.i].x] : [0, 1, 0],
                            y1: nodes[conn.i] ? [nodes[conn.i].y, nodes[conn.i].y - 1, nodes[conn.i].y] : [0, -1, 0],
                            x2: nodes[conn.j] ? [nodes[conn.j].x, nodes[conn.j].x - 1, nodes[conn.j].x] : [100, 99, 100],
                            y2: nodes[conn.j] ? [nodes[conn.j].y, nodes[conn.j].y + 1, nodes[conn.j].y] : [100, 101, 100],
                        }}
                        transition={{
                            duration: 8 + Math.random() * 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        x1={nodes[conn.i]?.x || 0}
                        y1={nodes[conn.i]?.y || 0}
                        x2={nodes[conn.j]?.x || 0}
                        y2={nodes[conn.j]?.y || 0}
                        stroke="var(--accent-primary)"
                        strokeWidth="0.05"
                    />
                ))}
                {nodes.map((node) => (
                    <motion.circle
                        key={`node-${node.id}`}
                        cx={node.x}
                        cy={node.y}
                        r={node.size / 20}
                        fill="var(--accent-primary)"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0.2, 0.6, 0.2],
                            scale: [1, 1.5, 1],
                            x: [node.x, node.x + (Math.random() - 0.5) * 2, node.x],
                            y: [node.y, node.y + (Math.random() - 0.5) * 2, node.y],
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};

export default NeuralBackground;
