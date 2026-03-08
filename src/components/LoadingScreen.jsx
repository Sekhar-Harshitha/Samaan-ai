import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const LoadingScreen = ({ message = "INITIALIZING_SYSTEM_CORE" }) => (
    <div style={{
        height: '100vh', width: '100vw', background: '#05070d',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', zIndex: 10000, position: 'fixed', top: 0, left: 0
    }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute', width: '100%', height: '100%',
                    border: '2px dashed var(--accent-primary)', borderRadius: '50%', opacity: 0.3
                }}
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                    position: 'absolute', width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <Activity size={40} color="var(--accent-primary)" />
            </motion.div>
        </div>
        <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
                marginTop: '2rem', fontFamily: 'JetBrains Mono', fontSize: '0.8rem',
                color: 'var(--accent-primary)', letterSpacing: '0.3em'
            }}
        >
            {message}
        </motion.p>
    </div>
);

export default LoadingScreen;
