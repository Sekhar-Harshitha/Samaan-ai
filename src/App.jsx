import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import RemediationPage from './pages/RemediationPage';
import ReportPage from './pages/ReportPage';
import ModelComparisonDashboard from './pages/ModelComparisonDashboard';
import NeuralBackground from './components/NeuralBackground';
import { BiasProvider } from './context/BiasState';
import './index.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Global Error Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', background: '#05070d', color: '#fff'
        }}>
          <h1 style={{ color: '#ef4444' }}>[SYSTEM_HALT]</h1>
          <p>A critical frontend error occurred. Please refresh or contact support.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-command"
            style={{ marginTop: '2rem' }}
          >
            REBOOT_SYSTEM
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/remediation" element={<RemediationPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/comparison" element={<ModelComparisonDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <GlobalErrorBoundary>
      <BiasProvider>
        <Router>
          <div className="app-container">
            <NeuralBackground />
            <Sidebar />
            <main className="main-content">
              <AnimatedRoutes />
            </main>
          </div>
        </Router>
      </BiasProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
