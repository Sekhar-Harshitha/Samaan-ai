import React from 'react';
import PageWrapper from '../components/PageWrapper';
import MitigationSimulator from '../components/MitigationSimulator';

const RemediationPage = () => {
    return (
        <PageWrapper>
            <div style={{ marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '3.5rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bias <span className="gradient-text">Mitigation</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>SEQUENCE: DEBIASING_ALGORITHM_DEPLOYMENT</p>
            </div>

            <MitigationSimulator />
        </PageWrapper>
    );
};

export default RemediationPage;
